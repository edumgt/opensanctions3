"use client";
import React, { useState, useEffect, useMemo } from "react";

interface SanctionRecord {
  entity_id: string;
  schema?: string;
  name: string;
  alias?: string;
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

interface Pagination {
  total: number;
  page: number;
  totalPages: number;
}

export default function SanctionsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SanctionRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<SanctionRecord | null>(null);
  const LIMIT = 10;

  // ✅ 토스트 자동 제거
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ✅ 서버 검색
  const fetchData = async (pageNum = 1) => {
    if (query.trim().length < 3) {
      setToast("3글자 이상 입력하세요");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/sanctions?q=${encodeURIComponent(query)}&page=${pageNum}&limit=${LIMIT}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setResults(data.data);
      setPagination(data.pagination);
      setSearched(true);
      setSelectedRecord(null);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setToast("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 페이지 이동 시 fetch
  useEffect(() => {
    if (query.trim().length >= 3) fetchData(page);
  }, [page]);

  // ✅ Topic 카운트 계산
  const topicCounts = useMemo(() => {
    const acc: Record<string, number> = {};
    results.forEach((r) => (r.topics || []).forEach((t) => (acc[t] = (acc[t] || 0) + 1)));
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [results]);

  // ✅ Topic 필터링 적용
  const filteredResults = useMemo(() => {
    if (!selectedTopic) return results;
    return results.filter((r) => (r.topics || []).includes(selectedTopic));
  }, [results, selectedTopic]);

  const toUrl = (u?: string) => (u ? (/^https?:\/\//i.test(u) ? u : `https://${u}`) : "");
  const hostOf = (u?: string) => {
    try {
      return new URL(toUrl(u)).host;
    } catch {
      return u || "";
    }
  };

  // ✅ 페이지네이션
  const renderPagination = () => {
    if (!pagination) return null;
    const { page: current, totalPages } = pagination;
    const safeTotal = Math.max(totalPages, 1);
    const pages = [];
    for (let i = Math.max(1, current - 2); i <= Math.min(safeTotal, current + 2); i++)
      pages.push(i);

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={current <= 1 || loading}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          ◀ Prev
        </button>
        {pages.map((num) => (
          <button
            key={num}
            onClick={() => setPage(num)}
            disabled={num === current}
            className={`px-3 py-1 border rounded ${
              num === current ? "bg-blue-600 text-white" : "hover:bg-blue-50"
            }`}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(safeTotal, p + 1))}
          disabled={current >= safeTotal || loading}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Next ▶
        </button>
      </div>
    );
  };

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* 🔔 Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded shadow-md">
          {toast}
        </div>
      )}

      {/* 🔍 검색 영역 */}
      <section className="bg-[#2156d4] py-6 text-center">
        <h1 className="text-white text-2xl font-bold mb-4">Search SanctionLab.</h1>
        <div className="flex justify-center px-4">
          <div className="flex w-full max-w-2xl bg-white rounded-md overflow-hidden shadow-md">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData(1)}
              placeholder="Search by name or entity..."
              className="flex-grow px-3 py-2 text-gray-900 font-semibold focus:outline-none"
              style={{ imeMode: "inactive" }}
            />
            <button
              onClick={() => {
                setPage(1);
                fetchData(1);
              }}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 font-semibold"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </section>

      {/* 🧩 본문 */}
      <div className="flex flex-col md:flex-row flex-grow">
        {/* 왼쪽: 목록 or 상세보기 */}
        <div className="w-full md:w-3/5 p-6 overflow-y-auto">
          {/* ✅ 상세보기 모드 */}
          {selectedRecord ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedRecord.name}
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {(selectedRecord.topics || []).map((t) => (
                  <span
                    key={t}
                    className="bg-yellow-200 text-gray-800 text-sm px-2 py-1 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <table className="w-full text-sm border-t border-gray-200">
                <tbody>
                  {[
                    ["Entity ID", selectedRecord.entity_id],
                    ["Schema", selectedRecord.schema],
                    ["Alias", selectedRecord.alias],
                    ["Birth date", selectedRecord.birth_date],
                    ["Gender", selectedRecord.gender],
                    ["Nationality", selectedRecord.nationality],
                    ["Country", selectedRecord.country],
                    ["Address", selectedRecord.address],
                    ["Passport number", selectedRecord.passport_number],
                    ["ID number", selectedRecord.id_number],
                    [
                      "Source URL",
                      selectedRecord.source_url ? (
                        <a
                          href={toUrl(selectedRecord.source_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {hostOf(selectedRecord.source_url)}
                        </a>
                      ) : (
                        "-"
                      ),
                    ],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td className="py-2 font-medium w-40 text-gray-600">{label}</td>
                      <td className="py-2 text-gray-800 break-words">{value || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              {/* ✅ 목록 보기 */}
              {searched && filteredResults.length === 0 && !loading && (
                <p className="text-center text-red-500 font-medium">No results found.</p>
              )}

              <ul className="divide-y divide-gray-200">
                {filteredResults.map((r) => (
                  <li
                    key={r.entity_id}
                    onClick={() => {
                      setSelectedRecord(r);
                      setQuery(""); // ✅ 클릭 시 검색어 초기화
                    }}
                    className="py-4 px-2 hover:bg-gray-50 cursor-pointer transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <span className="font-bold text-blue-700">{r.name}</span>
                      <span className="text-sm text-gray-500">{r.country || "-"}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1 text-sm text-gray-700">
                      {(r.topics || []).slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 bg-yellow-200 rounded border border-yellow-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>

              {renderPagination()}
            </>
          )}
        </div>

        {/* ✅ 오른쪽 Topic 필터 패널 (항상 유지) */}
        <aside className="w-full md:w-2/5 border-l border-gray-200 p-6 bg-gray-50">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Topics</h2>
          <div className="space-y-2 overflow-y-auto max-h-[80vh] pr-2">
            {topicCounts.length === 0 ? (
              <p className="text-gray-400 text-sm">No topics available</p>
            ) : (
              topicCounts.map(([topic, count]) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                  className={`w-full flex justify-between items-center text-left px-3 py-2 rounded-md transition ${
                    selectedTopic === topic
                      ? "bg-blue-600 text-white"
                      : "bg-white hover:bg-blue-50 text-gray-800"
                  }`}
                >
                  <span className="font-medium">{topic}</span>
                  <span className="text-sm opacity-70">{count}</span>
                </button>
              ))
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
