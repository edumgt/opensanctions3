import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "sa.edumgt.co.kr",
  port: 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "star##!!5836",
  database: process.env.DB_NAME || "postgres",
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase() || "";
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  if (!q)
    return NextResponse.json({
      data: [],
      pagination: { total: 0, page, totalPages: 0 },
    });

  const client = await pool.connect();
  try {
    const baseSql = `
      FROM public.entity_flattened
      WHERE (
        LOWER(name) LIKE $1::text OR
        LOWER(alias) LIKE $1::text OR
        LOWER(entity_id) LIKE $1::text OR
        LOWER(address) LIKE $1::text
      )
    `;

    const countSql = `SELECT COUNT(*) AS total ${baseSql}`;

    const dataSql = `
      SELECT
        entity_id,
        schema,
        name,
        alias,
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
        CASE
          WHEN topics IS NULL OR trim(topics::text) = '' THEN ARRAY[]::text[]
          WHEN left(topics::text, 1) = '{' AND right(topics::text, 1) = '}' THEN topics::text[]
          ELSE string_to_array(replace(topics::text, '"', ''), ',')
        END AS topics
      ${baseSql}
      ORDER BY name
      LIMIT $2::int OFFSET $3::int;
    `;

    const countParams = [`%${q}%`];
    const dataParams = [`%${q}%`, limit, offset];

    const countRes = await client.query(countSql, countParams);
    const total = Number(countRes.rows[0]?.total || 0);
    const totalPages = Math.ceil(total / limit);

    const result = await client.query(dataSql, dataParams);

    return NextResponse.json({
      data: result.rows,
      pagination: { total, page, totalPages },
    });
  } catch (err) {
    console.error("❌ Query failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  } finally {
    client.release();
  }
}
