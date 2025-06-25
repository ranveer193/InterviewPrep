import { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "react-circular-progressbar/dist/styles.css";

export default function ResumeUploadForm() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (result.length && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);

  const clearAll = () => {
    setFile(null);
    setResult([]);
  };

  const handleUpload = async () => {
    if (!file || loading) return;
    setLoading(true);
    toast.info("Analyzing resume…");

    const fd = new FormData();
    fd.append("resume", file);

    try {
      const r = await fetch("https://interviewprep-backend-5os4.onrender.com/analyze-resume-pdf", {
        method: "POST",
        body: fd,
      });
      const j = await r.json();
      setResult(j.analysis || []);
      toast.success("Analysis complete!");
    } catch {
      toast.error("Server error while analyzing.");
    }
    setLoading(false);
  };

  // ── overall score & verdict ───────────────────────────────────────────
  const overall =
    result.length > 0
      ? Math.round(result.reduce((s, r) => s + (Number(r.score) || 0), 0) / result.length)
      : 0;

  const verdict =
    overall >= 8 ? "Excellent" : overall >= 6 ? "Good" : overall >= 4 ? "Average" : "Needs Work";

  const badgeClasses = (score) => {
    if (score >= 8) return "bg-green-100 text-green-800 animate-pulse";
    if (score >= 6) return "bg-yellow-100 text-yellow-800 animate-pulse";
    if (score >= 4) return "bg-orange-100 text-orange-800 animate-pulse";
    return "bg-red-100 text-red-800 animate-pulse";
  };

  // ── render component ──────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-2xl space-y-10">
      {/* Upload Hero */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-gray-200">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800" />
        <div className="relative p-10 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
            Upload your resume <span className="text-blue-600">(PDF)</span>
          </h2>

          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-blue-300/60 dark:border-gray-600 rounded-xl p-8 cursor-pointer hover:bg-blue-50/40 dark:hover:bg-gray-700/40 transition">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <svg className="h-12 w-12 text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V13a4 4 0 014-4h.5M7 9V5.5a.5.5 0 01.5-.5H13m4 0h-.5a.5.5 0 00-.5.5V9m-6 0V5m0 0L10.5 3M11 5l1.5-2" />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {file ? file.name : "Click to select PDF"}
            </span>
          </label>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="flex-1 rounded-lg bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                  <path className="opacity-75" d="M4 12a8 8 0 018-8v4" strokeWidth="4" strokeLinecap="round" />
                </svg>
              )}
              {loading ? "Analyzing…" : "Analyze"}
            </button>
            {result.length > 0 && (
              <button
                onClick={clearAll}
                className="rounded-lg border border-blue-600 py-3 px-4 text-blue-600 font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 transition"
              >
                Upload Again
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {result.length > 0 && (
        <section ref={resultsRef} className="space-y-10">
          {/* Overall card */}
          <article className="flex items-center gap-6 rounded-xl bg-blue-50 ring-1 ring-blue-200 p-6 dark:bg-gray-800 dark:ring-gray-700">
            <div className="w-20 h-20">
              <CircularProgressbar
                value={overall * 10}
                text={`${overall}`}
                styles={buildStyles({
                  pathColor: "#2563eb",
                  trailColor: "#dbeafe",
                  textColor: "#1e40af",
                })}
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                Overall Score: {overall}/10
              </h3>
              <span className={`inline-block mt-2 rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses(overall)}`}>
                {verdict}
              </span>
            </div>
          </article>

          {/* Section cards */}
          {result.map((section, idx) => {
            const data = Object.entries(section.criteria).map(([k, v]) => ({
              name: k[0].toUpperCase() + k.slice(1),
              value: Number(v) || 0,
            }));

            return (
              <article
                key={section.section}
                className="rounded-xl bg-white dark:bg-gray-800 shadow ring-1 ring-gray-100 dark:ring-gray-700 p-6 space-y-6 transform transition duration-300 hover:-translate-y-1"
                style={{ animation: `fadeIn 0.4s ease ${idx * 0.08}s both` }}
              >
                {/* header */}
                <header className="flex items-center justify-between">
                  <h3 className="text-xl font-bold capitalize tracking-wide text-blue-900 dark:text-blue-200">
                    {section.section}
                  </h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClasses(section.score)}`}>
                    {section.score}/10
                  </span>
                </header>

                {/* Bar gauge chart */}
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
                      <XAxis type="number" domain={[0, 10]} hide />
                      <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12, fill: "#1e3a8a" }} />
                      <Tooltip cursor={{ fill: "rgba(59,130,246,0.08)" }} contentStyle={{ fontSize: "12px" }} />
                      <defs>
                        <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#bfdbfe" />
                          <stop offset="100%" stopColor="#2563eb" />
                        </linearGradient>
                      </defs>
                      <Bar dataKey="value" fill={`url(#grad-${idx})`} radius={[8, 8, 8, 8]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Suggestions */}
                <ul className="space-y-2 mt-2">
                  {section.suggestions.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 bg-blue-50/50 dark:bg-gray-700/40 p-2 rounded-md text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                <span className="text-blue-600 dark:text-blue-300 mt-0.5">✅</span>
                <span>{s}</span>
                </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}