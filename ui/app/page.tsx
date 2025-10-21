"use client";
import React, { useState, useEffect } from "react";

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
}

export default function SanctionsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SanctionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // ✅ Toast 자동 제거
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ✅ 안전한 fetch (빈 응답 및 JSON 예외 방지)
  const fetchData = async () => {
    if (query.trim().length < 4) {
      setToast("4글자 이상 입력하세요");
      return;
    }

    setLoading(true);
    setSearched(false);

    try {
      const res = await fetch(`/api/sanctions?q=${encodeURIComponent(query)}`);

      if (!res.ok) {
        console.error("❌ HTTP Error:", res.status);
        setToast(`서버 오류 (${res.status})`);
        setResults([]);
        setSearched(true);
        return;
      }

      // ✅ text로 먼저 읽고 JSON 파싱 시도
      const text = await res.text();
      let data: SanctionRecord[] = [];

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          console.warn("⚠️ 응답이 JSON 형식이 아닙니다:", text);
          data = [];
        }
      }

      setResults(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setToast("데이터를 불러오는 중 오류가 발생했습니다.");
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = (record: SanctionRecord) => {
    const id = record.entity_id || record.name;
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
      {/* 🚨 Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-md shadow-md text-sm font-medium z-50 animate-bounce">
          {toast}
        </div>
      )}

      {/* 🔵 상단 검색 영역 */}
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
              placeholder="Search people, companies and other entities..."
              className="flex-grow px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none text-base"
              style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
            />
            <button
              onClick={fetchData}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 font-semibold text-base transition-colors duration-300"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </section>

      {/* ⏳ 로딩 스피너 */}
      {loading && (
        <div className="flex justify-center items-center flex-grow">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        </div>
      )}

      {/* 🔎 결과 목록 */}
      {!loading && (
        <div className="flex-grow w-full mx-auto mt-10 px-4">
          {searched && results.length === 0 && (
            <p className="text-center text-red-500 font-medium">
              No results found.
            </p>
          )}

          {results.map((r) => {
            const id = r.entity_id || r.name;
            const isCompany =
              (r.type || "").toLowerCase() === "company" ||
              (r.name?.toLowerCase() || "").includes("corporation") ||
              (r.name?.toLowerCase() || "").includes("ltd");

            return (
              <div
                key={id}
                className="bg-white border border-gray-200 rounded-md mb-6 shadow-sm"
              >
                <button
                  onClick={() => toggleAccordion(r)}
                  className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="text-2xl font-bold text-gray-900">
                    {r.name}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {openId === id ? "▲" : "▼"}
                  </span>
                </button>

                <div
                  className={`transition-all duration-500 ease-in-out ${
                    openId === id
                      ? "max-h-[1500px] opacity-100"
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
                            ["Name", r.name],
                            ["Country", r.country || "-"],
                            ["Address", r.address || "-"],
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
                          ].map(([label, value]) => (
                            <tr key={label} className="border-b border-gray-100">
                              <td className="py-2 font-medium w-52 text-gray-700">
                                {label}
                              </td>
                              <td className="py-2 text-gray-800 break-words">
                                {value}
                              </td>
                              <td className="text-right text-blue-600 text-xs pr-2">
                                {r.source_url ? (
                                  <a
                                    href={r.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                  >
                                    [sources]
                                  </a>
                                ) : (
                                  <span className="text-gray-300">[no source]</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <>
                      <table className="w-full text-sm border-t border-gray-200 mt-3">
                        <tbody>
                          {[
                            ["Type", "Person"],
                            ["Name", r.name],
                            ["Other name", r.other_name],
                            ["Birth date", r.birth_date],
                            ["Gender", r.gender],
                            ["Country", r.country],
                            ["Nationality", r.nationality],
                            ["First name", r.first_name],
                            ["Last name", r.last_name],
                            ["Middle name", r.middle_name],
                            ["Passport number", r.passport_number],
                            ["ID Number", r.id_number],
                            ["Source link", r.source_url || "(No link)"],
                          ].map(([label, value]) => (
                            <tr key={label} className="border-b border-gray-100">
                              <td className="py-2 font-medium w-52 text-gray-700">
                                {label}
                              </td>
                              <td className="py-2 text-gray-800 break-words">
                                {label === "Source link" && r.source_url ? (
                                  <a
                                    href={toUrl(r.source_url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {hostOf(r.source_url)}
                                  </a>
                                ) : (
                                  value || "-"
                                )}
                              </td>
                              <td className="text-right text-blue-600 text-xs pr-2">
                                {r.source_url ? (
                                  <a
                                    href={r.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                  >
                                    [sources]
                                  </a>
                                ) : (
                                  <span className="text-gray-300">[no source]</span>
                                )}
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
      )}
    </main>
  );
}
