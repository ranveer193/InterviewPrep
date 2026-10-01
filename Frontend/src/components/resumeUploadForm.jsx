import { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
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
import {
  FileText,
  Sparkles,
  Layers,
  Copy,
  Check,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Cpu,
  Award,
  BookOpen,
  User,
  ShieldCheck,
  Eye,
} from "lucide-react";
import "react-circular-progressbar/dist/styles.css";

const SECTION_ICONS = {
  summary: User,
  education: GraduationCap,
  experience: Briefcase,
  projects: FolderGit2,
  skills: Cpu,
  certifications: Award,
  coursework: BookOpen,
  leadership: ShieldCheck,
  achievements: Award,
  contact_info: User,
  general: FileText,
};

function formatSectionTitle(key) {
  if (!key) return "General";
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ResumeUploadForm() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [parsedResume, setParsedResume] = useState(null);
  const [activeTab, setActiveTab] = useState("analysis"); // "analysis" | "parsed"
  const [selectedSectionKey, setSelectedSectionKey] = useState("all");
  const [showRawText, setShowRawText] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    if ((result.length || parsedResume) && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [result, parsedResume]);

  const clearAll = () => {
    setFile(null);
    setResult([]);
    setParsedResume(null);
    setActiveTab("analysis");
    setSelectedSectionKey("all");
    setShowRawText(false);
  };

  const handleUpload = async () => {
    if (!file || loading) return;
    setLoading(true);
    toast.info("Analyzing resume…");

    const fd = new FormData();
    fd.append("resume", file);

    try {
      const res = await api.post("/analyze-resume-pdf", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data?.analysis || []);
      setParsedResume(res.data?.parsedResume || null);
      toast.success("Analysis complete!");
    } catch (err) {
      console.error("Resume analysis error:", err);
      toast.error(err.response?.data?.error || "Server error while analyzing.");
    }
    setLoading(false);
  };

  const copyRawText = () => {
    if (!parsedResume?.rawText) return;
    navigator.clipboard.writeText(parsedResume.rawText);
    setCopied(true);
    toast.success("Extracted text copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // ── overall score & verdict ───────────────────────────────────────────
  const overall =
    result.length > 0
      ? Math.round(
          result.reduce((s, r) => s + (Number(r.score) || 0), 0) / result.length
        )
      : 0;

  const verdict =
    overall >= 8
      ? "Excellent"
      : overall >= 6
      ? "Good"
      : overall >= 4
      ? "Average"
      : "Needs Work";

  const badgeClasses = (score) => {
    if (score >= 8) return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    if (score >= 6) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
    if (score >= 4) return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
  };

  const parsedSectionEntries = parsedResume?.sections
    ? Object.entries(parsedResume.sections)
    : [];

  const filteredSections =
    selectedSectionKey === "all"
      ? parsedSectionEntries
      : parsedSectionEntries.filter(([k]) => k === selectedSectionKey);

  // ── render component ──────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-4xl space-y-10">
      {/* Upload Hero */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800" />
        <div className="relative p-8 md:p-10 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Upload Your Resume <span className="text-blue-600 dark:text-blue-400">(PDF)</span>
          </h2>

          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-blue-300/80 dark:border-gray-600 rounded-xl p-8 cursor-pointer hover:bg-blue-50/40 dark:hover:bg-gray-700/40 transition">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <svg
              className="h-12 w-12 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5V13a4 4 0 014-4h.5M7 9V5.5a.5.5 0 01.5-.5H13m4 0h-.5a.5.5 0 00-.5.5V9m-6 0V5m0 0L10.5 3M11 5l1.5-2"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {file ? file.name : "Click or drag to select your resume PDF (Max 2MB)"}
            </span>
          </label>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-sm"
            >
              {loading && (
                <svg
                  className="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8v4"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {loading ? "Analyzing Resume & Parsing Sections…" : "Analyze & Parse Resume"}
            </button>
            {(result.length > 0 || parsedResume) && (
              <button
                onClick={clearAll}
                className="rounded-xl border border-blue-600 py-3 px-5 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 transition"
              >
                Upload Another
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results & Parsed Resume Navigation */}
      {(result.length > 0 || parsedResume) && (
        <section ref={resultsRef} className="space-y-8">
          {/* Top Switcher Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 gap-4">
            <button
              onClick={() => setActiveTab("analysis")}
              className={`pb-3 px-2 font-semibold text-base flex items-center gap-2 border-b-2 transition ${
                activeTab === "analysis"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Sparkles className="w-5 h-5" />
              AI Feedback & Score ({result.length} Sections)
            </button>
            <button
              onClick={() => setActiveTab("parsed")}
              className={`pb-3 px-2 font-semibold text-base flex items-center gap-2 border-b-2 transition ${
                activeTab === "parsed"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Layers className="w-5 h-5" />
              Parsed Resume ({parsedSectionEntries.length} Sections Extracted)
            </button>
          </div>

          {/* TAB 1: AI Feedback & Scores */}
          {activeTab === "analysis" && result.length > 0 && (
            <div className="space-y-8 animate-fade-in">
              {/* Overall card */}
              <article className="flex items-center gap-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 ring-1 ring-blue-200 p-6 dark:from-gray-800 dark:to-gray-850 dark:ring-gray-750">
                <div className="w-20 h-20 flex-shrink-0">
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
                  <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                    Overall Resume Score: {overall}/10
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses(
                        overall
                      )}`}
                    >
                      {verdict}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Based on clarity, impact, and relevance across all sections
                    </span>
                  </div>
                </div>
              </article>

              {/* Section cards */}
              <div className="grid grid-cols-1 gap-6">
                {result.map((section, idx) => {
                  const data = Object.entries(section.criteria || {}).map(
                    ([k, v]) => ({
                      name: k[0].toUpperCase() + k.slice(1),
                      value: Number(v) || 0,
                    })
                  );

                  const Icon = SECTION_ICONS[section.section] || FileText;

                  return (
                    <article
                      key={section.section}
                      className="rounded-2xl bg-white dark:bg-gray-800 shadow ring-1 ring-gray-100 dark:ring-gray-750 p-6 space-y-5 transition duration-200 hover:shadow-md"
                    >
                      {/* Header */}
                      <header className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400">
                            <Icon className="w-5 h-5" />
                          </div>
                          <h3 className="text-xl font-bold capitalize tracking-wide text-blue-900 dark:text-blue-200">
                            {formatSectionTitle(section.section)}
                          </h3>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClasses(
                            section.score
                          )}`}
                        >
                          {section.score}/10
                        </span>
                      </header>

                      {/* Bar gauge chart */}
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
                            <XAxis type="number" domain={[0, 10]} hide />
                            <YAxis
                              type="category"
                              dataKey="name"
                              width={80}
                              tick={{ fontSize: 12, fill: "#1e3a8a" }}
                            />
                            <Tooltip
                              cursor={{ fill: "rgba(59,130,246,0.08)" }}
                              contentStyle={{ fontSize: "12px" }}
                            />
                            <defs>
                              <linearGradient
                                id={`grad-${idx}`}
                                x1="0"
                                y1="0"
                                x2="1"
                                y2="0"
                              >
                                <stop offset="0%" stopColor="#93c5fd" />
                                <stop offset="100%" stopColor="#2563eb" />
                              </linearGradient>
                            </defs>
                            <Bar
                              dataKey="value"
                              fill={`url(#grad-${idx})`}
                              radius={[6, 6, 6, 6]}
                              barSize={16}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Suggestions */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                          Recommendations & Improvements
                        </h4>
                        <ul className="space-y-2">
                          {section.suggestions?.map((s, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 bg-blue-50/60 dark:bg-gray-700/40 p-2.5 rounded-lg text-sm text-gray-800 dark:text-gray-200"
                            >
                              <span className="text-blue-600 dark:text-blue-400 mt-0.5 font-bold">
                                •
                              </span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Parsed Resume View */}
          {activeTab === "parsed" && (
            <div className="space-y-6 animate-fade-in">
              {/* Quick filter pills */}
              <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-1">
                  Filter by Section:
                </span>
                <button
                  onClick={() => setSelectedSectionKey("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedSectionKey === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  All ({parsedSectionEntries.length})
                </button>
                {parsedSectionEntries.map(([k]) => {
                  const Icon = SECTION_ICONS[k] || FileText;
                  return (
                    <button
                      key={k}
                      onClick={() => setSelectedSectionKey(k)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                        selectedSectionKey === k
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {formatSectionTitle(k)}
                    </button>
                  );
                })}
              </div>

              {/* Parsed Section Cards */}
              <div className="space-y-4">
                {filteredSections.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    No section text found for this filter.
                  </div>
                ) : (
                  filteredSections.map(([key, content]) => {
                    const Icon = SECTION_ICONS[key] || FileText;
                    return (
                      <div
                        key={key}
                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2.5">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400">
                              <Icon className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                              {formatSectionTitle(key)}
                            </h3>
                          </div>
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                            {content.split(/\r?\n/).filter(Boolean).length} lines
                          </span>
                        </div>

                        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed font-sans bg-gray-50/50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                          {content}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Raw Extracted Text Viewer */}
              {parsedResume?.rawText && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-gray-500" />
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">
                        Full Extracted Text
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyRawText}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Text
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setShowRawText(!showRawText)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {showRawText ? "Hide Full Text" : "View Full Text"}
                      </button>
                    </div>
                  </div>

                  {showRawText && (
                    <pre className="p-4 bg-gray-900 text-gray-100 rounded-xl text-xs overflow-x-auto max-h-96 whitespace-pre-wrap font-mono">
                      {parsedResume.rawText}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}