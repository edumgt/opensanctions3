// app/api/countries/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "sa.edumgt.co.kr",
  port: 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "star##!!5836",
  database: process.env.DB_NAME || "postgres",
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT code, nation_kor
      FROM public.nation_code
      WHERE nation_kor IS NOT NULL AND nation_kor <> ''
      ORDER BY nation_kor;
    `);
    client.release();

    const nations = result.rows.map((r) => ({
      code: r.code,
      name: r.nation_kor,
    }));

    console.log("✅ Nation list:", nations.length, "items");
    return NextResponse.json({ data: nations });
  } catch (err: any) {
    console.error("❌ DB error in /api/countries:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
