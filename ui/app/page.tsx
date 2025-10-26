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
  const [openId, setOpenId] = useState<string | null>(null);
  const LIMIT = 10;

  // ✅ Toast 자동 제거
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
      setOpenId(null);
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

  // ✅ Topic 카운트
  const topicCounts = useMemo(() => {
    const acc: Record<string, number> = {};
    results.forEach((r) => (r.topics || []).forEach((t) => (acc[t] = (acc[t] || 0) + 1)));
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [results]);

  // ✅ topic 필터 적용된 데이터
  const filteredResults = useMemo(() => {
    if (!selectedTopic) return results;
    return results.filter((r) => (r.topics || []).includes(selectedTopic));
  }, [results, selectedTopic]);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const toUrl = (u?: string) => (u ? (/^https?:\/\//i.test(u) ? u : `https://${u}`) : "");
  const hostOf = (u?: string) => {
    try {
      return new URL(toUrl(u)).host;
    } catch {
      return u || "";
    }
  };

  // ✅ 숫자 페이지네이션 (Prev / 1 / 2 / 3 ... / Next)
  const renderPagination = () => {
    if (!pagination) return null;
    const { page: current, totalPages } = pagination;
    const safeTotal = Math.max(totalPages, 1);

    // ✅ 페이지 범위 계산 (현재 페이지 중심으로 5개 표시)
    const start = Math.max(1, current - 2);
    const end = Math.min(safeTotal, current + 2);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="flex justify-center items-center flex-wrap gap-2 mt-8">
        {/* Prev 버튼 */}
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={current <= 1 || loading}
          className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100"
        >
          ◀ Prev
        </button>

        {/* 첫 페이지로 점프 */}
        {start > 1 && (
          <>
            <button
              onClick={() => setPage(1)}
              className="px-3 py-1 border rounded hover:bg-blue-100 text-blue-700"
            >
              1
            </button>
            {start > 2 && <span className="px-2 text-gray-400">...</span>}
          </>
        )}

        {/* 페이지 번호 버튼 */}
        {pages.map((num) => (
          <button
            key={num}
            onClick={() => setPage(num)}
            disabled={num === current || loading}
            className={`px-3 py-1 border rounded ${
              num === current
                ? "bg-blue-600 text-white border-blue-600"
                : "hover:bg-blue-50 text-gray-700"
            }`}
          >
            {num}
          </button>
        ))}

        {/* 마지막 페이지로 점프 */}
        {end < safeTotal && (
          <>
            {end < safeTotal - 1 && <span className="px-2 text-gray-400">...</span>}
            <button
              onClick={() => setPage(safeTotal)}
              className="px-3 py-1 border rounded hover:bg-blue-100 text-blue-700"
            >
              {safeTotal}
            </button>
          </>
        )}

        {/* Next 버튼 */}
        <button
          onClick={() => setPage((p) => Math.min(safeTotal, p + 1))}
          disabled={current >= safeTotal || loading}
          className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100"
        >
          Next ▶
        </button>
      </div>
    );
  };

  // ✅ 렌더링
  return (
    <main className="min-h-screen flex flex-col bg-white relative">
      {/* 🚨 Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-md shadow-md text-sm font-medium z-50 animate-bounce">
          {toast}
        </div>
      )}

      {/* 🌀 로딩 */}
      {loading && (
        <div className="fixed inset-0 bg-gray-200/70 z-50 flex flex-col justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-500 mb-4"></div>
          <p className="text-gray-700 text-lg font-semibold">검색 중입니다...</p>
        </div>
      )}

      {/* 🔵 검색 영역 */}
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
              className="flex-grow px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none"
              style={{ fontSize: "1.1rem", fontWeight: "bold", imeMode: "inactive" }}
            />
            <button
              onClick={() => {
                setPage(1);
                fetchData(1);
              }}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 font-semibold text-base transition"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </section>

      {/* 🧩 결과 */}
      <div className="flex flex-col md:flex-row flex-grow w-full">
        {/* 왼쪽 카드 목록 */}
        <div className="w-full md:w-3/5 p-6 overflow-y-auto">
          {searched && filteredResults.length === 0 && !loading && (
            <p className="text-center text-red-500 font-medium">No results found.</p>
          )}

          {filteredResults.map((r) => {
            const topics = Array.from(new Set(r.topics || []));
            const rows: [string, React.ReactNode][] = [
              ["Entity ID", r.entity_id],
              ["Schema", r.schema],
              ["Name", r.name],
              ["Alias", r.alias],
              ["First name", r.first_name],
              ["Last name", r.last_name],
              ["Birth date", r.birth_date],
              ["Gender", r.gender],
              ["Nationality", r.nationality],
              ["Country", r.country],
              ["Address", r.address],
              ["Passport number", r.passport_number],
              ["ID number", r.id_number],
              [
                "Source URL",
                r.source_url ? (
                  <a
                    href={toUrl(r.source_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {hostOf(r.source_url)}
                  </a>
                ) : (
                  "-"
                ),
              ],
              [
                "Topics",
                topics.length ? (
                  <div className="flex flex-wrap gap-2">
                    {topics.map((t) => (
                      <span
                        key={t}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border border-gray-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  "-"
                ),
              ],
            ];

            return (
              <div
                key={r.entity_id}
                className="bg-white border border-gray-200 rounded-md mb-6 shadow-sm"
              >
                <button
                  onClick={() => toggleAccordion(r.entity_id)}
                  className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="text-xl font-bold text-gray-900">
                    {r.name || r.entity_id}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {openId === r.entity_id ? "▲" : "▼"}
                  </span>
                </button>

                <div
                  className={`transition-all duration-500 ease-in-out ${
                    openId === r.entity_id
                      ? "max-h-[1500px] opacity-100"
                      : "max-h-0 opacity-0"
                  } overflow-hidden px-6 pb-6`}
                >
                  <table className="w-full text-sm border-t border-gray-200 mt-3">
                    <tbody>
                      {rows.map(([label, value]) => (
                        <tr key={label} className="border-b border-gray-100">
                          <td className="py-2 font-medium w-40 text-gray-700">{label}</td>
                          <td className="py-2 text-gray-800 break-words">{value || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {renderPagination()}
        </div>

        {/* 오른쪽 Topic 필터 */}
        <aside className="w-full md:w-2/5 border-l border-gray-200 p-6 bg-gray-50">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Topics</h2>
          <div className="space-y-2 overflow-y-auto max-h-[80vh] pr-2">
            {topicCounts.length === 0 ? (
              <p className="text-gray-400 text-sm">No topics available</p>
            ) : (
              topicCounts.map(([topic, count]) => (
                <button
                  key={topic}
                  onClick={() =>
                    setSelectedTopic(selectedTopic === topic ? null : topic)
                  }
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
