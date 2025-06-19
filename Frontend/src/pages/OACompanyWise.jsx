// OACompanyWise.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";

export default function OACompanyWise() {
  const { companyName } = useParams();
  const navigate        = useNavigate();

  /* ---------- local state ---------- */
  const [raw,  setRaw]             = useState([]);   // flat array [{year,role,question,detail}]
  const [loading, setLoading]      = useState(true);
  const [error,   setError]        = useState(null);

  const [roleFilter, setRoleFilter] = useState("All"); // All | Internship | Placement
  const [openYear,     setOpenYear]     = useState(null);
  const [openQuestion, setOpenQuestion] = useState({});

  /* ---------- fetch once per company ---------- */
  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/oa/${encodeURIComponent(companyName)}`)
      .then((res) => {
        setRaw(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => setError(err.message ?? "Something went wrong"))
      .finally(() => setLoading(false));
  }, [companyName]);

  /* ---------- derived data ---------- */
  const filtered = roleFilter === "All"
    ? raw
    : raw.filter((q) => q.role === roleFilter);

  const questionsByYear = filtered.reduce((acc, cur) => {
    acc[cur.year] ??= [];
    acc[cur.year].push(cur);
    return acc;
  }, {});                       // { 2024:[…], 2023:[…] }

  /* ---------- dropdown toggles ---------- */
  const toggleYear = (year) => {
    setOpenYear((prev) => (prev === year ? null : year));
    setOpenQuestion({});                 // collapse inner list on year change
  };
  const toggleQuestion = (year, idx) => {
    setOpenQuestion((prev) => ({
      ...prev,
      [`${year}-${idx}`]: !prev[`${year}-${idx}`],
    }));
  };

  /* ---------- UI ---------- */
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-blue-800 mb-2">
        {companyName}&nbsp;–&nbsp;OA Questions
      </h1>

      {/* Role filter pills */}
      <div className="flex gap-2 mb-6">
        {["All", "Internship", "Placement"].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              roleFilter === r
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : Object.keys(questionsByYear).length === 0 ? (
        <p className="text-gray-500">
          No questions available for this company
          {roleFilter !== "All" ? ` (${roleFilter.toLowerCase()})` : ""}.
        </p>
      ) : (
        Object.entries(questionsByYear)
          .sort((a, b) => b[0] - a[0])             // newest year first
          .map(([year, questions]) => (
            <div
              key={year}
              className="border border-gray-200 rounded-xl mb-4"
            >
              {/* Year header */}
              <button
                onClick={() => toggleYear(year)}
                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition"
              >
                <span className="text-lg font-medium text-blue-700">
                  {year}
                </span>
                {openYear === year ? (
                  <ChevronDown className="h-5 w-5 text-blue-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-blue-500" />
                )}
              </button>

              {/* Question list */}
              {openYear === year && (
                <ul className="px-6 pb-4 space-y-2">
                  {questions.map((q, i) => {
                    const key    = `${year}-${i}`;
                    const isOpen = openQuestion[key];
                    const badge  =
                      q.role === "Internship"
                        ? "bg-green-100 text-green-700"
                        : "bg-purple-100 text-purple-700";

                    return (
                      <li
                        key={i}
                        className="border border-gray-100 rounded-lg"
                      >
                        <button
                          onClick={() => toggleQuestion(year, i)}
                          className="w-full flex items-start justify-between text-left px-4 py-3 hover:bg-gray-50"
                        >
                          <span className="flex flex-col gap-0.5">
                            <span>
                              <span className="text-blue-600 font-semibold mr-2">
                                {i + 1}.
                              </span>
                              {q.question}
                            </span>
                            {/* role badge */}
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge}`}
                            >
                              {q.role}
                            </span>
                          </span>

                          {isOpen ? (
                            <ChevronDown className="h-5 w-5 text-blue-500 mt-1" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-blue-500 mt-1" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="px-6 pb-3 text-sm text-gray-700">
                            {q.detail}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))
      )}
    </div>
  );
}
