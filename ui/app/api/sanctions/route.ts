import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// ✅ Docker 환경에서 Next.js 컨테이너가 DB 컨테이너에 접근할 때는 반드시 "db" 사용
const pool = new Pool({
  host: process.env.DB_HOST || "db",
  port: 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "dev",
});

// ✅ Sanction 데이터 구조 인터페이스 정의 (ESLint no-explicit-any 해결)
interface SanctionRecord {
  name: string;
  country?: string;
  authority?: string;
  start_date?: string;
  source_url?: string;
}

// ✅ GET /api/sanctions?q=samsung
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase() || "";

  // 검색어 없으면 빈 배열 반환
  if (!q) return NextResponse.json<SanctionRecord[]>([]);

  const client = await pool.connect();
  try {
    // 1️⃣ sanctions_view 가 있으면 우선 사용
    const query = `
      SELECT name, country, authority, start_date, source_url
      FROM sanctions_view
      WHERE LOWER(name) LIKE $1
         OR LOWER(authority) LIKE $1
         OR LOWER(country) LIKE $1
      ORDER BY name
      LIMIT 50;
    `;
    const result = await client.query<SanctionRecord>(query, [`%${q}%`]);

    

    return NextResponse.json(result.rows);
  } catch (err) {
    if (err instanceof Error) {
      console.error("❌ DB Query Error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    console.error("❌ Unknown DB Error:", err);
    return NextResponse.json({ error: "Unknown database error" }, { status: 500 });
  } finally {
    client.release();
  }
}
