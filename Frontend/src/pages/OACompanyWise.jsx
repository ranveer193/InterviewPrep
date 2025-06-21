// OACompanyWise.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
//import AIInterviewCard from "../components/AIInterviewCard";

export default function OACompanyWise() {
  const { companyName } = useParams();
  const navigate = useNavigate();

  /* ---------- state ---------- */
  const [raw, setRaw] = useState([]);                // [{year,role,question,detail,difficulty}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [roleFilter, setRoleFilter] = useState("All");         // Internship | Placement | All
  const [difficultyFilter, setDifficultyFilter] = useState("All"); // Easy | Medium | Hard | All
  const [openYear, setOpenYear] = useState(null);
  const [openQuestion, setOpenQuestion] = useState({});

  /* ---------- fetch on filter change ---------- */
  useEffect(() => {
    setLoading(true);
    const url =
      difficultyFilter === "All"
        ? `http://localhost:5000/oa/${encodeURIComponent(companyName)}`
        : `http://localhost:5000/oa/${encodeURIComponent(companyName)}?difficulty=${difficultyFilter}`;

    axios
      .get(url)
      .then((res) => setRaw(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.message ?? "Something went wrong"))
      .finally(() => setLoading(false));
  }, [companyName, difficultyFilter]);

  /* ---------- derived ---------- */
  const filtered = raw.filter((q) =>
    roleFilter === "All" ? true : q.role === roleFilter
  );

  const questionsByYear = filtered.reduce((acc, cur) => {
    acc[cur.year] ??= [];
    acc[cur.year].push(cur);
    return acc;
  }, {}); // { 2025:[…], 2024:[…] }

  /* ---------- helpers ---------- */
  const toggleYear = (year) => {
    setOpenYear((prev) => (prev === year ? null : year));
    setOpenQuestion({});
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
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-blue-800 mb-4">
        {companyName}&nbsp;–&nbsp;OA Questions
      </h1>

      {/* AI Interview Card - Prominently displayed
      <div className="mb-8">
        <AIInterviewCard company={companyName} />
      </div> */}

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
      {/* Filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-6">
        {/* Role */}
        <div>
          {/* <label className="block text-sm font-semibold text-gray-700 mb-1">
            Filter by Role
          </label> */}
          <div className="flex gap-2">
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
        </div>

        {/* Difficulty */}
        <div>
          {/* <label className="block text-sm font-semibold text-gray-700 mb-1">
            Filter by Difficulty
          </label> */}
          <div className="flex gap-2">
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  difficultyFilter === d
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
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
          .sort((a, b) => b[0] - a[0]) // newest year first
          .map(([year, questions]) => (
            <div key={year} className="border border-gray-200 rounded-xl mb-4">
              {/* Year header */}
              <button
                onClick={() => toggleYear(year)}
                className="w-full flex items-center justify-between text-left px-6 py-4 hover:bg-blue-50 transition"
              >
                <span className="text-lg font-medium text-blue-700">{year}</span>
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
                    const key = `${year}-${i}`;
                    const isOpen = openQuestion[key];

                    const roleBadge =
                      q.role === "Internship"
                        ? "bg-green-100 text-green-700"
                        : "bg-purple-100 text-purple-700";
                    const diffBadge = {
                      Easy: "bg-teal-100 text-teal-700",
                      Medium: "bg-yellow-100 text-yellow-700",
                      Hard: "bg-red-100 text-red-700",
                    }[q.difficulty] || "bg-gray-100 text-gray-700";

                    return (
                      <li key={i} className="border border-gray-100 rounded-lg">
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

                            {/* badges */}
                            <span className="flex gap-2 mt-1">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge}`}
                              >
                                {q.role}
                              </span>
                              {q.difficulty && (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${diffBadge}`}
                                >
                                  {q.difficulty}
                                </span>
                              )}
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
