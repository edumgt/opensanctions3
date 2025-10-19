"use client";
import React, { useState } from "react";

interface SanctionRecord {
  entity_id: string;
  name: string;
  other_name?: string;
  weak_alias?: string;
  birth_date?: string;
  place_of_birth?: string;
  gender?: string;
  nationality?: string;
  country?: string;
  citizenship?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  id_number?: string;
  passport_number?: string;
  unique_entity_id?: string;
  wikidata_id?: string;
  education?: string;
  address?: string;
  source_link?: string;
  authority?: string;
  last_change?: string;
  last_processed?: string;
  first_seen?: string;
  source_url?: string;
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SanctionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sanctions?q=${encodeURIComponent(query)}`);
      const data: SanctionRecord[] = await res.json();
      setResults(data);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") fetchData();
  };

  const toggleAccordion = (id: string) =>
    setOpenId(openId === id ? null : id);

  // ✅ URL helper
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
    <main className="min-h-screen flex flex-col bg-white">
      {/* 🔵 검색영역 */}
      <section className="bg-[#2156d4] py-14 text-center">
        <h1 className="text-white text-3xl font-bold mb-4">
          Search SanctionLab
        </h1>
        <p className="text-blue-100 mb-6 text-sm md:text-base">
          Search for individuals, organizations, and entities under sanctions.
        </p>

        <div className="flex justify-center px-4">
          <div className="flex w-full max-w-2xl bg-white rounded-md overflow-hidden shadow-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search people, companies and other entities..."
              className="flex-grow px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none text-base"
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

      {/* 🔍 결과 */}
      <div className="flex-grow w-full mx-auto mt-10 px-4">
        {searched && results.length === 0 && (
          <p className="text-center text-red-500 font-medium">
            No results found.
          </p>
        )}

        {results.map((r) => (
          <div
            key={r.entity_id}
            className="bg-white border border-gray-200 rounded-md mb-6 shadow-sm"
          >
            {/* 제목 */}
            <button
              onClick={() => toggleAccordion(r.entity_id)}
              className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50"
            >
              <span className="text-2xl font-bold text-gray-900">
                {r.name}
              </span>
              <span className="text-gray-400 text-sm">
                {openId === r.entity_id ? "▲" : "▼"}
              </span>
            </button>

            {/* 상세 */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                openId === r.entity_id
                  ? "max-h-[1800px] opacity-100"
                  : "max-h-0 opacity-0"
              } overflow-hidden px-6 pb-6`}
            >
              <table className="w-full text-sm border-t border-gray-200 mt-3">
                <tbody>
                  {[
                    ["Type", "Person"],
                    ["Name", r.name],
                    ["Other name", r.other_name],
                    ["Weak alias", r.weak_alias],
                    ["Birth date", r.birth_date],
                    ["Place of birth", r.place_of_birth],
                    ["Gender", r.gender],
                    ["Nationality", r.nationality],
                    ["Country", r.country],
                    ["Citizenship", r.citizenship],
                    ["First name", r.first_name],
                    ["Last name", r.last_name],
                    ["Middle name", r.middle_name],
                    ["ID Number", r.id_number],
                    ["Passport number", r.passport_number],
                    ["Unique Entity ID", r.unique_entity_id],
                    ["Wikidata ID", r.wikidata_id],
                    ["Education", r.education],
                    ["Address", r.address],
                    ["Authority", r.authority],
                    // ✅ Source link 항상 보여주기
                    ["Source link", r.source_link || "(No link)"],
                    ["Last change", r.last_change],
                    ["Last processed", r.last_processed],
                    ["First seen", r.first_seen],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-gray-100">
                      <td className="py-2 font-medium w-52 text-gray-700">
                        {label}
                      </td>
                      <td className="py-2 text-gray-800 break-words">
                        {/* ✅ Source link 클릭 가능 */}
                        {label === "Source link" && r.source_link ? (
                          <a
                            href={toUrl(r.source_link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {hostOf(r.source_link)}
                          </a>
                        ) : (
                          value || "-"
                        )}
                      </td>

                      {/* ✅ [sources] 항상 노출 */}
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
            </div>
          </div>
        ))}
      </div>

      
    </main>
  );
}
