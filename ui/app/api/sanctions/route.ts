// app/api/sanctions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "sa.edumgt.co.kr",
  port: 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "star##!!5836",
  database: process.env.DB_NAME || "postgres",
});

interface SanctionRecord {
  entity_id: string;
  name: string;
  alias?: string;
  type?: string; // Organization | Person
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  gender?: string;
  nationality?: string;
  country?: string;
  address?: string;
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
    // ✅ entity_flattened 테이블에서 바로 조회
    const sql = `
      SELECT
        entity_id,
        name,
        alias,
        CASE 
          WHEN LOWER(schema) = 'organization' THEN 'Organization'
          WHEN LOWER(schema) = 'person' THEN 'Person'
          ELSE 'Unknown'
        END AS type,
        first_name,
        last_name,
        birth_date,
        gender,
        nationality,
        country,
        address,
        passport_number,
        id_number,
        source_url,
        topics
      FROM public.entity_flattened
      WHERE 
        LOWER(name) LIKE $1 OR
        LOWER(alias) LIKE $1 OR
        LOWER(entity_id) LIKE $1 OR
        LOWER(address) LIKE $1
      ORDER BY name
      LIMIT $2 OFFSET $3;
    `;

    const result = await client.query(sql, [`%${q}%`, limit, offset]);

    // ✅ Pagination count
    const countResult = await client.query(
      `
      SELECT COUNT(*) AS total
      FROM public.entity_flattened
      WHERE 
        LOWER(name) LIKE $1 OR
        LOWER(alias) LIKE $1 OR
        LOWER(entity_id) LIKE $1 OR
        LOWER(address) LIKE $1;
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
