import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";

/**
 * OACompanyWise – shows all OA questions for a given company
 * -----------------------------------------------------------
 * UX improvements:
 *  - single unified filter bar (role + difficulty)
 *  - proper cleanup of duplicated JSX / closing tags
 *  - graceful loading / no‑data states
 *  - resets open accordions when filters change
 */
export default function OACompanyWise() {
  const { companyName } = useParams();
  const navigate = useNavigate();

  /* --------------------------- state --------------------------- */
  const [raw, setRaw] = useState([]); // original list from backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState("All"); // Internship | Placement | All
  const [difficultyFilter, setDifficultyFilter] = useState("All"); // Easy | Medium | Hard | All
  const [openYear, setOpenYear] = useState(null);
  const [openQuestion, setOpenQuestion] = useState({});

  /* --------------------------- helpers --------------------------- */
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    const url =
      difficultyFilter === "All"
        ? `http://localhost:5000/oa/${encodeURIComponent(companyName)}`
        : `http://localhost:5000/oa/${encodeURIComponent(companyName)}?difficulty=${difficultyFilter}`;
    try {
      const { data } = await axios.get(url);
      setRaw(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
      // reset open accordions when new data arrives
      setOpenYear(null);
      setOpenQuestion({});
    }
  }, [companyName, difficultyFilter]);

  /* fetch on mount & whenever filters change */
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  /* ------------------------ derived state ------------------------ */
  const filtered = raw.filter((q) =>
    roleFilter === "All" ? true : q.role === roleFilter
  );

  const questionsByYear = filtered.reduce((acc, cur) => {
    (acc[cur.year] ??= []).push(cur);
    return acc;
  }, {});

  /* --------------------------- UI --------------------------- */
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">
        {companyName} – OA Questions
      </h1>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        {/* Role pills */}
        <div className="flex gap-2 flex-wrap">
          {['All', 'Internship', 'Placement'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                roleFilter === r
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Difficulty pills */}
        <div className="flex gap-2 flex-wrap">
          {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                difficultyFilter === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-center text-gray-500">Loading…</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : Object.keys(questionsByYear).length === 0 ? (
        <p className="text-center text-gray-500">
          No questions match the selected filters.
        </p>
      ) : (
        Object.entries(questionsByYear)
          .sort((a, b) => b[0] - a[0])
          .map(([year, questions]) => (
            <div key={year} className="border border-gray-200 rounded-xl mb-4 overflow-hidden">
              {/* year header */}
              <button
                onClick={() => setOpenYear((prev) => (prev === year ? null : year))}
                className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100"
              >
                <span className="text-lg font-medium text-blue-700">{year}</span>
                {openYear === year ? (
                  <ChevronDown className="h-5 w-5 text-blue-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-blue-500" />
                )}
              </button>

              {/* questions list */}
              {openYear === year && (
                <ul className="px-6 py-4 space-y-3 bg-white">
                  {questions.map((q, i) => {
                    const key = `${year}-${i}`;
                    const isOpen = openQuestion[key];

                    const roleBadge =
                      q.role === 'Internship'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700';
                    const diffBadge = {
                      Easy: 'bg-teal-100 text-teal-700',
                      Medium: 'bg-yellow-100 text-yellow-700',
                      Hard: 'bg-red-100 text-red-700',
                    }[q.difficulty] || 'bg-gray-100 text-gray-700';

                    return (
                      <li key={i} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() =>
                            setOpenQuestion((prev) => ({
                              ...prev,
                              [key]: !prev[key],
                            }))
                          }
                          className="w-full flex items-start justify-between p-4 text-left hover:bg-gray-50"
                        >
                          <span>
                            <span className="text-blue-600 font-semibold mr-2">{i + 1}.</span>
                            {q.question}
                            <div className="flex gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge}`}>{q.role}</span>
                              {q.difficulty && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${diffBadge}`}>{q.difficulty}</span>
                              )}
                            </div>
                          </span>
                          {isOpen ? (
                            <ChevronDown className="h-5 w-5 text-blue-500 mt-1" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-blue-500 mt-1" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="px-6 pb-4 text-sm text-gray-700 whitespace-pre-wrap">
                            {q.detail || 'No additional details'}
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