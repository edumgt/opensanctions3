// app/api/sanctions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "sa.edumgt.co.kr",
  port: 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "dev",
});

interface SanctionRecord {
  entity_id: string;
  name: string;
  other_name?: string;
  birth_date?: string;
  gender?: string;
  nationality?: string;
  country?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  passport_number?: string;
  id_number?: string;
  source_url?: string;
  topics?: string[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase() || "";
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  if (!q) return NextResponse.json([]);

  const client = await pool.connect();
  try {
    const sql = `
      WITH base AS (
        SELECT
          canonical_id AS entity_id,
          MAX(CASE WHEN prop = 'name' THEN value END) AS name,
          STRING_AGG(DISTINCT NULLIF(CASE WHEN prop = 'alias' THEN value END, ''), ' · ') AS other_name,
          MAX(CASE WHEN prop = 'birthDate' THEN value END) AS birth_date,
          MAX(CASE WHEN prop = 'gender' THEN value END) AS gender,
          STRING_AGG(DISTINCT NULLIF(CASE WHEN prop = 'country' THEN value END, ''), ' · ') AS country,
          STRING_AGG(DISTINCT NULLIF(CASE WHEN prop = 'nationality' THEN value END, ''), ' · ') AS nationality,
          STRING_AGG(DISTINCT NULLIF(CASE WHEN prop = 'firstName' THEN value END, ''), ' · ') AS first_name,
          STRING_AGG(DISTINCT NULLIF(CASE WHEN prop = 'lastName' THEN value END, ''), ' · ') AS last_name,
          STRING_AGG(DISTINCT NULLIF(CASE WHEN prop = 'middleName' THEN value END, ''), ' · ') AS middle_name,
          MAX(CASE WHEN prop = 'passportNumber' THEN value END) AS passport_number,
          MAX(CASE WHEN prop = 'id' THEN value END) AS id_number,
          MAX(CASE WHEN prop = 'sourceUrl' THEN value END) AS source_url
        FROM statement
        WHERE prop IN (
          'name','alias','birthDate','gender','country','nationality',
          'firstName','lastName','middleName','passportNumber','id','sourceUrl'
        )
        GROUP BY canonical_id
      ),
      topics_agg AS (
        SELECT canonical_id, ARRAY_AGG(DISTINCT value) AS topics
        FROM statement
        WHERE prop = 'topics'
        GROUP BY canonical_id
      )
      SELECT b.*, t.topics
      FROM base b
      LEFT JOIN topics_agg t ON b.entity_id = t.canonical_id
      WHERE LOWER(b.name) LIKE $1
         OR LOWER(b.other_name) LIKE $1
         OR LOWER(b.entity_id) LIKE $1
      ORDER BY b.name
      LIMIT $2 OFFSET $3;
    `;

    const result = await client.query(sql, [`%${q}%`, limit, offset]);

    // 전체 개수 계산 (페이지 수 계산용)
    const countResult = await client.query(
      `
      SELECT COUNT(*) AS total
      FROM (
        SELECT canonical_id
        FROM statement
        WHERE prop = 'name' AND LOWER(value) LIKE $1
        GROUP BY canonical_id
      ) AS sub;
    `,
      [`%${q}%`]
    );

    const total = Number(countResult.rows[0]?.total || 0);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: result.rows as SanctionRecord[],
      pagination: { total, page, totalPages },
    });
  } catch (err) {
    console.error("❌ Query failed:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
