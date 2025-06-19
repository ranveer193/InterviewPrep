// OAquestions.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

export default function OAquestions() {
  const [companyList, setCompanyList]   = useState([]);   // always array
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const [searchText, setSearchText]     = useState("");
  const [activeFilter, setActiveFilter] = useState("All Companies");

  const navigate = useNavigate();

  /* ---------- fetch companies once ---------- */
  useEffect(() => {
    axios
      .get("http://localhost:5000/oa/companies")
      .then((res) => {
        const arr = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.companies)
          ? res.data.companies
          : [];
        setCompanyList(arr);
      })
      .catch((err) => setError(err.message ?? "Something went wrong"))
      .finally(() => setLoading(false));
  }, []);

  /* ---------- derived list ---------- */
  const filteredCompanies = (companyList || []).filter((c) => {
    const matchesSearch  = c.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter  = activeFilter === "All Companies" || c === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleCardClick = (company) =>
    navigate(`/oa/${encodeURIComponent(company)}`);

  /* ---------- UI ---------- */
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-blue-800 mb-4 text-center">
        OA Questions by Company
      </h1>

      {/* search box */}
      <div className="relative mb-5">
        <input
          type="text"
          placeholder="Search by company name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full p-4 pl-12 rounded-full border border-blue-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all duration-200"
        />
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["All Companies", ...companyList].map((comp) => (
          <button
            key={comp}
            onClick={() => setActiveFilter(comp)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              activeFilter === comp
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            {comp}
          </button>
        ))}
      </div>

      {/* company cards */}
      {loading ? (
        <p className="text-center text-gray-500">Loading…</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <div
                key={company}
                onClick={() => handleCardClick(company)}
                className="cursor-pointer border border-blue-200 rounded-xl p-6 shadow hover:shadow-lg transition-all bg-white"
              >
                <h2 className="text-xl font-semibold text-blue-700 mb-1">
                  {company}
                </h2>
                <p className="text-sm text-gray-600">
                  Click to view OA questions for {company}
                </p>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No companies found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
