"use client";
import React, { useState } from "react";

// ✅ 백엔드에서 오는 데이터 타입 정의
interface SanctionRecord {
  name: string;
  country?: string;
  authority?: string;
  start_date?: string;
  source_url?: string;
}

export default function SanctionsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SanctionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchData = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/sanctions?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Failed to fetch sanctions");
      const data: SanctionRecord[] = await res.json();
      setResults(data);
      setSearched(true);
    } catch (error) {
      console.error("❌ Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">제재 대상 검색</h1>

      {/* 검색창 */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="기업명 또는 국가를 입력하세요"
          className="border border-gray-300 px-4 py-2 rounded-lg flex-grow focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={fetchData}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "검색 중..." : "검색"}
        </button>
      </div>

      {/* 결과 */}
      {!searched ? (
        <p className="text-gray-500">검색어를 입력 후 “검색”을 클릭하세요.</p>
      ) : results.length === 0 ? (
        <p className="text-red-500">검색 결과가 없습니다.</p>
      ) : (
        <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">이름</th>
              <th className="px-4 py-2 text-left">국가</th>
              <th className="px-4 py-2 text-left">기관</th>
              <th className="px-4 py-2 text-left">시작일</th>
              <th className="px-4 py-2 text-left">출처</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{r.name}</td>
                <td className="px-4 py-2">{r.country || "-"}</td>
                <td className="px-4 py-2">{r.authority || "-"}</td>
                <td className="px-4 py-2">{r.start_date || "-"}</td>
                <td className="px-4 py-2">
                  {r.source_url ? (
                    <a
                      href={r.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      보기
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
