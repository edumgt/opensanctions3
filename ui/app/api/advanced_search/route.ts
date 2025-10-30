import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "sa.edumgt.co.kr",
  port: 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "star##!!5836",
  database: process.env.DB_NAME || "postgres",
});

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    const { query = "", filters = {}, page = 1, limit = 10 } = await req.json();
    const offset = (page - 1) * limit;

    const { selectedCountry, selectedDatasets = [], selectedTypeList = [] } = filters;

    // ✅ 동적 WHERE 조건 조합
    const where: string[] = [];
    const params: any[] = [];

    if (query && query.trim()) {
      params.push(`%${query.trim().toLowerCase()}%`);
      where.push(`(LOWER(name) LIKE $${params.length} OR LOWER(alias) LIKE $${params.length} OR LOWER(entity_id) LIKE $${params.length})`);
    }

    if (selectedCountry) {
      params.push(selectedCountry);
      where.push(`country = $${params.length}`);
    }

    if (selectedDatasets.length > 0) {
      const placeholders = selectedDatasets.map((_, i) => `$${params.length + i + 1}`).join(",");
      params.push(...selectedDatasets);
      where.push(`dataset IN (${placeholders})`);
    }

    if (selectedTypeList.length > 0) {
      const placeholders = selectedTypeList.map((_, i) => `$${params.length + i + 1}`).join(",");
      params.push(...selectedTypeList);
      where.push(`schema IN (${placeholders})`);
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    // ✅ 통계 (항상 포함)
    const statsSql = `
      SELECT
        (SELECT COUNT(*) FROM public.entity_flattened) AS entity_count,
        (SELECT COUNT(DISTINCT dataset) FROM public.entity_flattened WHERE dataset IS NOT NULL) AS source_count;
    `;
    const statsRes = await client.query(statsSql);
    const stats = statsRes.rows[0];

    // ✅ 검색 쿼리
    const countSql = `SELECT COUNT(*) AS total FROM public.entity_flattened ${whereSql}`;
    const dataSql = `
      SELECT
        entity_id, schema, name, alias, first_name, last_name,
        birth_date, gender, nationality, country, address,
        passport_number, id_number, source_url,
        CASE
          WHEN topics IS NULL OR trim(topics::text) = '' THEN ARRAY[]::text[]
          WHEN left(topics::text, 1) = '{' AND right(topics::text, 1) = '}' THEN topics::text[]
          ELSE string_to_array(replace(topics::text, '"', ''), ',')
        END AS topics
      FROM public.entity_flattened
      ${whereSql}
      ORDER BY name
      LIMIT ${limit} OFFSET ${offset};
    `;

    const countRes = await client.query(countSql, params);
    const total = Number(countRes.rows[0]?.total || 0);
    const totalPages = Math.ceil(total / limit);
    const dataRes = await client.query(dataSql, params);

    return NextResponse.json({
      data: dataRes.rows,
      pagination: { total, page, totalPages },
      stats,
    });
  } catch (err) {
    console.error("❌ Advanced Search Error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  } finally {
    client.release();
  }
}
