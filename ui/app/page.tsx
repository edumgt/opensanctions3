"use client";
import React, { useState, useEffect, useMemo } from "react";

interface SanctionRecord {
  entity_id: string;
  name: string;
  type?: string;
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
  address?: string;
  source_url?: string;
  topics?: string[];
}

export default function SanctionsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SanctionRecord[]>([]);
  const [filtered, setFiltered] = useState<SanctionRecord[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchData = async () => {
    if (query.trim().length < 3) {
      setToast("3글자 이상 입력하세요");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/sanctions?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResults(data);
      setFiltered(data);
      setSearched(true);
      setSelectedTopic(null);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setToast("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const topicCounts = useMemo(() => {
    const acc: Record<string, number> = {};
    results.forEach((r) => {
      (r.topics || []).forEach((t) => {
        acc[t] = (acc[t] || 0) + 1;
      });
    });
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [results]);

  useEffect(() => {
    if (!selectedTopic) setFiltered(results);
    else setFiltered(results.filter((r) => r.topics?.includes(selectedTopic)));
  }, [selectedTopic, results]);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const toUrl = (u?: string) =>
    u ? (/^https?:\/\//i.test(u) ? u : `https://${u}`) : "";
  const hostOf = (u?: string) => {
    try {
      return new URL(toUrl(u)).host;
    } catch {
      return u || "";
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-white relative">
      {/* 🚨 Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-md shadow-md text-sm font-medium z-50 animate-bounce">
          {toast}
        </div>
      )}

      {/* 🌀 로딩 오버레이 (옅은 회색 배경) */}
      {loading && (
        <div className="fixed inset-0 bg-gray-200/80 z-50 flex flex-col justify-center items-center transition-opacity duration-300">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-500 border-solid mb-6"></div>
          <p className="text-gray-700 text-xl font-semibold">검색 중입니다...</p>
        </div>
      )}

      {/* 🔵 검색 영역 */}
      <section className="bg-[#2156d4] py-8 text-center">
        <h1 className="text-white text-3xl font-bold mb-4">
          Search SanctionsLab
        </h1>
        <p className="text-blue-100 mb-6 text-sm md:text-base">
          Search people, companies and other entities of interest.
        </p>
        <div className="flex justify-center px-4">
          <div className="flex w-full max-w-2xl bg-white rounded-md overflow-hidden shadow-md">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
              placeholder="Search by name or entity..."
              className="flex-grow px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none"
              style={{ fontSize: "1.5rem", fontWeight: "bold" }}
            />
            <button
              onClick={fetchData}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 font-semibold text-base transition"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </section>

      {/* 🧩 본문 */}
      <div className="flex flex-col md:flex-row flex-grow w-full">
        {/* 왼쪽 결과 */}
        <div className="w-full md:w-3/5 p-6 overflow-y-auto">
          {searched && filtered.length === 0 && (
            <p className="text-center text-red-500 font-medium">
              No results found.
            </p>
          )}

          {filtered.map((r) => {
            const id = r.entity_id || r.name;
            const isCompany =
              (r.type || "").toLowerCase() === "company" ||
              (r.name?.toLowerCase() || "").includes("corp") ||
              (r.name?.toLowerCase() || "").includes("ltd");

            return (
              <div
                key={id}
                className="bg-white border border-gray-200 rounded-md mb-6 shadow-sm"
              >
                {/* 제목 */}
                <button
                  onClick={() => toggleAccordion(id)}
                  className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50"
                >
                  <div>
                    <span className="text-xl font-bold text-gray-900">
                      {r.name}
                    </span>
                    {r.topics && r.topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {r.topics.map((t) => (
                          <span
                            key={t}
                            className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-md border border-gray-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">
                    {openId === id ? "▲" : "▼"}
                  </span>
                </button>

                {/* 상세정보 */}
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    openId === id
                      ? "max-h-[1300px] opacity-100"
                      : "max-h-0 opacity-0"
                  } overflow-hidden px-6 pb-6`}
                >
                  {isCompany ? (
                    <>
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 rounded-sm">
                        <span className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                          Sanctioned entity
                        </span>
                        <p className="text-sm mt-2 text-gray-700">
                          {r.name} is subject to sanctions. See the individual
                          program listings below.
                        </p>
                      </div>

                      <table className="w-full text-sm border-t border-gray-200">
                        <tbody>
                          {[
                            ["Type", "Company"],
                            ["Entity ID", r.entity_id],
                            ["Country", r.country],
                            ["Address", r.address],
                            [
                              "Source link",
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
                              r.topics?.length ? (
                                <div className="flex flex-wrap gap-2">
                                  {r.topics.map((t) => (
                                    <span
                                      key={t}
                                      className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                "-"
                              ),
                            ],
                          ].map(([label, value]) => (
                            <tr key={label} className="border-b border-gray-100">
                              <td className="py-2 font-medium w-40 text-gray-700">
                                {label}
                              </td>
                              <td className="py-2 text-gray-800 break-words">
                                {value || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <>
                      {/* 👤 개인 Factsheet 스타일 */}
                      <table className="w-full text-sm border-t border-gray-200 mt-3">
                        <tbody>
                          {[
                            ["Type", "Person"],
                            ["Entity ID", r.entity_id],
                            ["Name", r.name],
                            ["Other name", r.other_name],
                            ["Birth date", r.birth_date],
                            ["Gender", r.gender],
                            ["Nationality", r.nationality],
                            ["Country", r.country],
                            ["First name", r.first_name],
                            ["Last name", r.last_name],
                            ["Middle name", r.middle_name],
                            ["Passport number", r.passport_number],
                            ["ID Number", r.id_number],
                            ["Address", r.address],
                            [
                              "Source link",
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
                              r.topics?.length ? (
                                <div className="flex flex-wrap gap-2">
                                  {r.topics.map((t) => (
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
                          ].map(([label, value]) => (
                            <tr key={label} className="border-b border-gray-100">
                              <td className="py-2 font-medium w-40 text-gray-700">
                                {label}
                              </td>
                              <td className="py-2 text-gray-800 break-words">
                                {value || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 오른쪽 토픽 필터 */}
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
