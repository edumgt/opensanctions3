import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "db",
  port: 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "dev",
});

// ✅ 상세 필드 포함 인터페이스
interface SanctionRecord {
  entity_id: string;
  name: string;
  birth_date?: string;
  place_of_birth?: string;
  nationality?: string;
  country?: string;
  id_number?: string;
  passport_number?: string;
  authority?: string;
  source_url?: string;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase() || "";

  if (!q) return NextResponse.json([]);

  const client = await pool.connect();
  try {
    const sql = `
      SELECT
        e.entity_id,
        MAX(CASE WHEN s.prop = 'name' THEN s.value END) AS name,
        MAX(CASE WHEN s.prop = 'birthDate' THEN s.original_value END) AS birth_date,
        MAX(CASE WHEN s.prop = 'birthPlace' THEN s.value END) AS place_of_birth,
        MAX(CASE WHEN s.prop = 'nationality' THEN s.value END) AS nationality,
        MAX(CASE WHEN s.prop = 'country' THEN s.value END) AS country,
        MAX(CASE WHEN s.prop = 'id' THEN s.value END) AS id_number,
        MAX(CASE WHEN s.prop = 'passportNumber' THEN s.value END) AS passport_number,
        MAX(CASE WHEN s.prop = 'authority' THEN s.value END) AS authority,
        MAX(CASE WHEN s.prop = 'sourceUrl' THEN s.value END) AS source_url
      FROM statement s
      JOIN statement e ON e.entity_id = s.entity_id
      WHERE LOWER(s.value) LIKE $1
         OR LOWER(e.value) LIKE $1
      GROUP BY e.entity_id
      ORDER BY name
      LIMIT 50;
    `;

    const result = await client.query(sql, [`%${q}%`]);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("❌ Sanction query error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
