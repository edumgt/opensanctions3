"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

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
  const [stats, setStats] = useState<{ entity_count: number; source_count: number } | null>(null);
  const [page, setPage] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<SanctionRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const LIMIT = 10;
  const router = useRouter();

  // ✅ Advanced 검색 관련 상태
  const [showAdvancedMenu, setShowAdvancedMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"none" | "main" | "type" | "country" | "dataset">("none");
  const [showCountryPopup, setShowCountryPopup] = useState(false);
  const [showDatasetPopup, setShowDatasetPopup] = useState(false);
  const [showTypePopup, setShowTypePopup] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);

  const [typeList, setTypeList] = useState<string[]>([]);
  const [loadingType, setLoadingType] = useState(false);
  // ✅ Type 목록 로드 함수
  const fetchTypeList = async () => {
    setLoadingType(true);
    try {
      const res = await fetch("/api/types");
      const data = await res.json();
      console.log("✅ /api/types result:", data);
      setTypeList(data.data || []);
    } catch (err) {
      console.error("❌ Failed to load types:", err);
    } finally {
      setLoadingType(false);
    }
  };


  const [countryList, setCountryList] = useState<{ code: string; name: string }[]>([]);
  const [loadingCountry, setLoadingCountry] = useState(false);
  const fetchCountryList = async () => {
    setLoadingCountry(true);
    try {
      const res = await fetch("/api/countries");
      const data = await res.json();
      console.log("✅ /api/countries result:", data);
      setCountryList(data.data || []);
    } catch (err) {
      console.error("❌ Failed to load countries:", err);
    } finally {
      setLoadingCountry(false);
    }
  };


  const [datasetList, setDatasetList] = useState<string[]>([]);
  const [loadingDataset, setLoadingDataset] = useState(false);
  const fetchDatasetList = async (code: string) => {
    setLoadingDataset(true);
    try {
      const res = await fetch(`/api/datasets?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      console.log(`✅ /api/datasets?code=${code} result:`, data);
      setDatasetList(data.data || []);
    } catch (err) {
      console.error("❌ Failed to load datasets:", err);
    } finally {
      setLoadingDataset(false);
    }
  };



  const datasets = ["US OFAC", "US FBI", "US STATE", "US DOD", "US DHS"];
  const allSelected = selectedDatasets.length === datasets.length;

  const toggleAll = () => {
    if (allSelected) setSelectedDatasets([]);
    else setSelectedDatasets([...datasets]);
  };

  const toggleDataset = (ds: string) => {
    setSelectedDatasets((prev) =>
      prev.includes(ds) ? prev.filter((d) => d !== ds) : [...prev, ds]
    );
  };

  useEffect(() => {
    fetchStatsOnly();
  }, []);

  const fetchStatsOnly = async () => {
    try {
      const res = await fetch(`/api/sanctions`);
      const data = await res.json();
      setStats(data.stats || null);
    } catch (err) {
      console.error("❌ Stats fetch error:", err);
    }
  };

  const fetchData = async (pageNum = 1) => {
    if (query.trim().length < 3) {
      setToast("3글자 이상 입력하세요");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/sanctions?q=${encodeURIComponent(query)}&page=${pageNum}&limit=${LIMIT}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResults(data.data);
      setPagination(data.pagination);
      setStats(data.stats || null);
      setSearched(true);
      setSelectedRecord(null);
      setPage(pageNum);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setToast("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searched) fetchData(page);
  }, [page]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const topicCounts = useMemo(() => {
    const acc: Record<string, number> = {};
    results.forEach((r) => (r.topics || []).forEach((t) => (acc[t] = (acc[t] || 0) + 1)));
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [results]);

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

  const renderPagination = () => {
    if (!pagination) return null;
    const { page: current, totalPages } = pagination;
    const safeTotal = Math.max(totalPages, 1);
    const pages = [];
    for (let i = Math.max(1, current - 2); i <= Math.min(safeTotal, current + 2); i++) pages.push(i);

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
            className={`px-3 py-1 border rounded ${num === current ? "bg-blue-600 text-white" : "hover:bg-blue-50"}`}
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
    <main className="min-h-screen flex flex-col bg-white relative">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded shadow-md">
          {toast}
        </div>
      )}

      {/* 🔍 검색 영역 */}
      <section className="bg-[#2156d4] py-6 text-center relative z-30">
        <h1 className="text-white text-2xl font-bold mb-4">Search SanctionLab.</h1>
        <div className="flex justify-center px-4 relative">
          {/* ✅ overflow-hidden 제거 */}
          <div className="flex w-full max-w-2xl bg-white rounded-md shadow-md overflow-visible relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData(1)}
              placeholder="Search by name or entity..."
              className="flex-grow px-3 py-2 text-gray-900 font-semibold focus:outline-none"
              style={{ imeMode: "inactive" }}
            />
            <button
              onClick={() => fetchData(1)}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 font-semibold"
            >
              {loading ? "Searching..." : "Search"}
            </button>

            {/* ✅ Advanced 버튼 */}
            <div className="relative">
              <button
                onClick={() =>
                  setActiveMenu((p) => (p === "main" ? "none" : "main"))
                }
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 font-semibold h-full rounded-r-md"
              >
                Advanced
              </button>

              {activeMenu === "main" && (
                <div className="absolute right-0 top-full mt-1 min-w-[160px] bg-white border border-gray-200 rounded-md shadow-lg z-50 text-left">
                  <button
                    onClick={() => {
                      fetchTypeList(); // ✅ Type 목록
                      setActiveMenu("type");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Type
                  </button>
                  <button
                    onClick={() => {
                      fetchCountryList(); // ✅ Country 목록 불러오기
                      setActiveMenu("country");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Country
                  </button>
                </div>
              )}



              {/* ✅ Type 클릭 후 표시되는 목록 */}
              {activeMenu === "type" && (
                <div className="absolute right-0 top-full mt-1 min-w-[220px] bg-white border rounded shadow-lg p-3 z-50">
                  {loadingType ? (
                    <div className="text-gray-500 text-center py-4 text-sm">불러오는 중...</div>
                  ) : (
                    <>
                      
                      <div className="max-h-48 overflow-y-auto border-t border-gray-100 pt-2">
                        {typeList.map((schema) => (
                          <label key={schema} className="flex items-center text-sm mb-1">
                            <input
                              type="checkbox"
                              checked={selectedDatasets.includes(schema)}
                              onChange={() => toggleDataset(schema)}
                              className="mr-2"
                            />
                            {schema}
                          </label>
                        ))}
                      </div>
                      <button
                        onClick={() => setActiveMenu("none")}
                        className="mt-3 w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700"
                      >
                        적용
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* ✅ Country 목록 (라디오 선택 1개) */}
              {activeMenu === "country" && (
                <div className="absolute right-0 top-full mt-1 min-w-[260px] bg-white border rounded shadow-lg p-3 z-50">
                  {loadingCountry ? (
                    <div className="text-gray-500 text-center py-4 text-sm">불러오는 중...</div>
                  ) : (
                    <>
                      <div className="border-b border-gray-100 pb-2 mb-2 font-semibold text-sm text-gray-600">
                        Country 선택 (1개)
                      </div>
                      <div className="max-h-48 overflow-y-auto border-t border-gray-100 pt-2">
                        {countryList.map((c) => (
                          <label
                            key={c.code}
                            className="flex items-center text-sm mb-2 cursor-pointer hover:bg-blue-50 rounded px-2 py-1"
                          >
                            <input
                              type="radio"
                              name="country"
                              value={c.code}
                              checked={selectedCountry === c.name}
                              onChange={() => {
                                setSelectedCountry(c.name);
                                fetchDatasetList(c.code); // ✅ code 기준 dataset 조회
                                setActiveMenu("dataset"); // ✅ 다음 단계로 이동
                              }}
                              className="mr-2"
                            />
                            {c.name}
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ✅ Dataset 목록 (다중 체크 가능) */}
              {activeMenu === "dataset" && (
                <div className="absolute right-0 top-full mt-1 min-w-[280px] bg-white border rounded shadow-lg p-3 z-50">
                  {loadingDataset ? (
                    <div className="text-gray-500 text-center py-4 text-sm">데이터셋 불러오는 중...</div>
                  ) : (
                    <>
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={
                            datasetList.length > 0 && selectedDatasets.length === datasetList.length
                          }
                          onChange={() => {
                            if (selectedDatasets.length === datasetList.length)
                              setSelectedDatasets([]);
                            else setSelectedDatasets(datasetList);
                          }}
                          className="mr-2"
                        />
                        <span className="font-semibold text-sm">
                          전체체크 ({selectedCountry})
                        </span>
                      </div>
                      <div className="max-h-48 overflow-y-auto border-t border-gray-100 pt-2">
                        {datasetList.map((ds) => (
                          <label key={ds} className="flex items-center text-sm mb-1">
                            <input
                              type="checkbox"
                              checked={selectedDatasets.includes(ds)}
                              onChange={() => toggleDataset(ds)}
                              className="mr-2"
                            />
                            {ds}
                          </label>
                        ))}
                      </div>
                      <button
                        onClick={() => setActiveMenu("none")}
                        className="mt-3 w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700"
                      >
                        적용
                      </button>
                    </>
                  )}
                </div>
              )}


            </div>
          </div>
        </div>
      </section>



      {/* ✅ 현황판 */}
      <div className="bg-white shadow border-t border-gray-200 py-3 text-center">
        {stats ? (
          <div className="flex justify-center gap-8 text-gray-800 font-semibold">
            <span>
              📄 엔터티 개수:{" "}
              <span className="text-blue-600">{stats.entity_count.toLocaleString()}</span>
            </span>
            <span
              className="cursor-pointer hover:text-green-700 transition"
              onClick={() => router.push("/page2")}
            >
              🗂 데이터 소스:{" "}
              <span className="text-green-600">{stats.source_count.toLocaleString()}</span>
            </span>
          </div>
        ) : (
          <div className="text-gray-400 text-sm">통계 정보를 불러오는 중...</div>
        )}
      </div>

      {/* 🧩 검색 결과 */}
      {!searched ? (
        <div className="text-center text-gray-400 py-10">
          🔍 검색어를 입력하고 “Search” 버튼을 눌러주세요.
        </div>
      ) : (
        <div className="flex flex-col md:flex-row flex-grow">
          {/* 왼쪽: 목록 or 상세 */}
          <div className="w-full md:w-3/5 p-6 overflow-y-auto">
            {selectedRecord ? (
              <>
                <h2 className="text-2xl font-bold mb-2">{selectedRecord.name}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(selectedRecord.topics || []).map((t) => (
                    <span key={t} className="bg-yellow-200 text-gray-800 text-sm px-2 py-1 rounded">
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
              </>
            ) : (
              <>
                {filteredResults.length === 0 && !loading && (
                  <p className="text-center text-red-500 font-medium">No results found.</p>
                )}
                <ul className="divide-y divide-gray-200">
                  {filteredResults.map((r) => (
                    <li
                      key={r.entity_id}
                      onClick={() => setSelectedRecord(r)}
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

          {/* 오른쪽: Topics */}
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
      )}
    </main>
  );
}
