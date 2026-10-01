import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  Printer,
  RotateCcw,
  Volume2,
  Sparkles,
  ThumbsUp,
  AlertCircle,
  Copy,
  Check,
  TrendingUp,
  Mic,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import ReactMarkdown from "react-markdown";
import api from "../services/api";

function parseAiOutput(raw) {
  if (!raw) return { summary: "", feedback: "", isPending: true };

  const defaultMsgs = [
    "baseline scoring",
    "__processing__"
  ];
  if (defaultMsgs.some(msg => raw.includes(msg))) {
    return { summary: "", feedback: "", isPending: true };
  }

  // Handle markdown markers like **Summary:** or ### Summary
  const summaryMatch = raw.match(/(?:\*\*|##+)?\s*Summary:?\s*(?:\*\*)?([\s\S]*?)(?=(?:\*\*|##+)?\s*Feedback:?|$)/i);
  const feedbackMatch = raw.match(/(?:\*\*|##+)?\s*Feedback:?\s*(?:\*\*)?([\s\S]*?)$/i);

  let summary = summaryMatch ? summaryMatch[1].trim() : "";
  let feedback = feedbackMatch ? feedbackMatch[1].trim() : "";

  if (!summary && !feedback) {
    feedback = raw.trim(); // If no tags found, assume the whole text is feedback
  }

  return { summary, feedback, isPending: false };
}

function getHireDecision(avgRating) {
  if (avgRating >= 4.5) {
    return {
      title: "Strong Hire",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
      description: "Exceptional clarity, strong technical depth, and confident communication.",
    };
  }
  if (avgRating >= 3.8) {
    return {
      title: "Clear Hire",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-700",
      description: "Solid technical foundations with good delivery and relevance.",
    };
  }
  if (avgRating >= 3.0) {
    return {
      title: "Leaning Hire / Potential",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-700",
      description: "Good effort with promising answers, but needs sharper structure and fewer fillers.",
    };
  }
  return {
    title: "Needs Further Preparation",
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-300 dark:border-red-700",
    description: "Focus on articulating core principles clearly and pacing responses methodically.",
  };
}

export default function InterviewSummaryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [openTranscript, setOpenTranscript] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/mockInterview/${id}`);
        setData(res.data.interview);
      } catch (err) {
        toast.error("Failed to load interview report.");
        console.error(err);
        navigate("/profile/interviews");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const copyTranscript = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success("Transcript copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleTranscript = (idx) => {
    setOpenTranscript((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <span className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Generating Comprehensive Interview Report…
        </p>
      </div>
    );
  }

  if (!data) return null;

  const questions = data.questions || [];
  const ratings = questions.map((q) => q.rating).filter((r) => r != null);
  const avgRating = ratings.length
    ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
    : 0;

  const decision = getHireDecision(avgRating);

  // Aggregate Voice Coach Stats
  const voiceStats = questions.map((q) => q.analysis?.voiceCoach).filter(Boolean);
  const avgWpm = voiceStats.length
    ? Math.round(
        voiceStats.reduce((acc, v) => acc + (v.avgWordsPerMinute || 0), 0) /
          voiceStats.length
      )
    : 130;
  const totalFillers = voiceStats.reduce(
    (acc, v) => acc + (v.fillerWords?.total || 0),
    0
  );
  const totalWordsSpoken = voiceStats.reduce(
    (acc, v) => acc + (v.totalWords || 0),
    0
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <button
          onClick={() => navigate("/profile/interviews")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Interview History
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>

          <Link
            to="/ai-interview"
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Practice Another Interview
          </Link>
        </div>
      </div>

      {/* Hero Performance Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 text-white p-8 md:p-12 shadow-2xl border border-white/10">
        {/* Decorative background blur blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-3xl animate-blob1" />
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-3xl animate-blob2" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          {/* Left: Metadata & Decision */}
          <div className="space-y-6 max-w-xl">
            <div className="flex items-center gap-3">
              <span className="bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-sm">
                {data.company || "Technical"} Track
              </span>
              <span className="text-sm font-medium text-blue-200/60 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {new Date(data.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200 animate-text-shine">Performance</span> Report
            </h1>

            <div className="flex flex-wrap items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${decision.badgeColor.replace('bg-', 'bg-').replace('border-', 'border-').replace('text-', 'bg-')}`}>
                  <Award className={`w-6 h-6 ${decision.badgeColor.split(' ').find(c => c.startsWith('text-'))}`} />
                </div>
                <div>
                  <div className="text-xs text-blue-200/70 font-semibold uppercase tracking-wider mb-0.5">Recommendation</div>
                  <div className={`text-base font-bold ${decision.badgeColor.split(' ').find(c => c.startsWith('text-'))}`}>{decision.title}</div>
                </div>
              </div>
              <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
              <p className="text-sm text-blue-100/80 font-medium flex-1">
                {decision.description}
              </p>
            </div>
          </div>

          {/* Right: Circular Score Gauge */}
          <div className="flex flex-col items-center justify-center bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-inner">
            <div className="w-32 h-32 relative">
              <CircularProgressbar
                value={(avgRating / 5) * 100}
                text={`${avgRating}`}
                styles={buildStyles({
                  pathColor: "url(#scoreGradient)",
                  trailColor: "rgba(255,255,255,0.05)",
                  textColor: "#ffffff",
                  textSize: "24px",
                  pathTransitionDuration: 1.5,
                })}
              />
              <svg style={{ height: 0, width: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#67e8f9" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-1">
                Overall Score
              </div>
              <div className="text-xs text-blue-300/80 font-medium">
                {Math.round((avgRating / 5) * 100)}% Proficiency
              </div>
            </div>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="relative z-10 mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 transition-transform hover:-translate-y-1">
            <div className="text-[10px] text-blue-200/70 uppercase font-bold tracking-widest mb-1">Questions</div>
            <div className="text-2xl font-black text-white">{questions.length}</div>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 transition-transform hover:-translate-y-1">
            <div className="text-[10px] text-blue-200/70 uppercase font-bold tracking-widest mb-1">Avg Pace</div>
            <div className="text-2xl font-black text-white">{avgWpm} <span className="text-sm font-medium text-blue-200/50">WPM</span></div>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 transition-transform hover:-translate-y-1">
            <div className="text-[10px] text-blue-200/70 uppercase font-bold tracking-widest mb-1">Filler Words</div>
            <div className="text-2xl font-black text-white">{totalFillers}</div>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 transition-transform hover:-translate-y-1">
            <div className="text-[10px] text-blue-200/70 uppercase font-bold tracking-widest mb-1">Words Spoken</div>
            <div className="text-2xl font-black text-white">{totalWordsSpoken}</div>
          </div>
        </div>
      </div>

      {/* Detailed Per-Question Evaluation */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Detailed Question Evaluations
          </h2>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {questions.length} questions evaluated
          </span>
        </div>

        {questions.map((q, idx) => {
          const { summary, feedback, isPending } = parseAiOutput(q.summary);
          const voice = q.analysis?.voiceCoach;
          const isTranscriptOpen = !!openTranscript[idx];

          return (
            <div
              key={idx}
              className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-700/60 overflow-hidden p-6 md:p-8 space-y-7 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
            >
              {/* Top color bar depending on score */}
              <div className={`absolute top-0 left-0 w-full h-1.5 ${q.rating >= 4 ? 'bg-emerald-500' : q.rating >= 3 ? 'bg-amber-400' : 'bg-red-500'}`} />

              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black flex items-center justify-center text-lg shadow-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-0.5">
                      Question Category
                    </span>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {q.category || "General Technical"}
                    </span>
                  </div>
                </div>

                {q.rating != null && (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">
                      AI Score
                    </span>
                    <div className="flex items-baseline gap-1 bg-gray-50 dark:bg-gray-900/50 px-3 py-1 rounded-xl border border-gray-200/60 dark:border-gray-700/50">
                      <span className="text-lg font-black text-gray-900 dark:text-white">
                        {q.rating}
                      </span>
                      <span className="text-xs font-bold text-gray-400">/ 5.0</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Question Text */}
              <div className="relative pl-5 border-l-4 border-indigo-200 dark:border-indigo-900 py-1">
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 leading-snug">
                  {q.text}
                </p>
              </div>

              {/* AI Summary & Feedback */}
              {!isPending ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Summary */}
                  {summary && (
                    <div className={`${feedback ? '' : 'md:col-span-2'} bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 space-y-2`}>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" />
                        Candidate Answer Summary
                      </h4>
                      <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mb-1 [&>strong]:text-gray-900 dark:[&>strong]:text-gray-100">
                        <ReactMarkdown>{summary}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Right: Feedback & Improvement */}
                  {feedback && (
                    <div className={`${summary ? '' : 'md:col-span-2'} bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-5 space-y-2`}>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" />
                        AI Evaluation & Key Feedback
                      </h4>
                      <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mb-1 [&>strong]:text-gray-900 dark:[&>strong]:text-gray-100">
                        <ReactMarkdown>{feedback}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl text-sm text-gray-500 italic">
                  AI feedback is being compiled or completed with standard scoring.
                </div>
              )}

              {/* Delivery Analytics (Voice Coach) */}
              {voice && (
                <div className="bg-slate-50/50 dark:bg-gray-800/40 border border-slate-200/60 dark:border-gray-700/60 rounded-3xl p-6 md:p-8 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-700 pb-4">
                    <h4 className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      Communication Coach
                    </h4>
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Fluency</span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {voice.fluency || "Good"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                      <span className="text-gray-400 dark:text-gray-500 block text-[10px] uppercase font-bold tracking-wider mb-1">Pace</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-black text-gray-900 dark:text-gray-100 text-xl">{voice.avgWordsPerMinute || 0}</span>
                        <span className="text-xs font-semibold text-gray-400">WPM</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 mt-3 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(((voice.avgWordsPerMinute || 0) / 200) * 100, 100)}%` }}></div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                      <span className="text-gray-400 dark:text-gray-500 block text-[10px] uppercase font-bold tracking-wider mb-1">Fillers</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-black text-gray-900 dark:text-gray-100 text-xl">{voice.fillerWords?.total || 0}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 mt-3 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${(voice.fillerWords?.total || 0) > 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(((voice.fillerWords?.total || 0) / 10) * 100, 100)}%` }}></div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                      <span className="text-gray-400 dark:text-gray-500 block text-[10px] uppercase font-bold tracking-wider mb-1">Tone</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-gray-900 dark:text-gray-100 text-lg capitalize">{voice.tone || "Neutral"}</span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                      <span className="text-gray-400 dark:text-gray-500 block text-[10px] uppercase font-bold tracking-wider mb-1">Sentence Variety</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-black text-gray-900 dark:text-gray-100 text-xl">{voice.sentenceVariety || 0}</span>
                        <span className="text-xs font-semibold text-gray-400">/ 10</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 mt-3 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${((voice.sentenceVariety || 0) / 10) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {voice.suggestions && voice.suggestions.length > 0 && (
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <strong className="text-gray-900 dark:text-gray-100 block mb-1">Coach Recommendations</strong>
                        <ul className="list-disc pl-4 space-y-0.5 marker:text-amber-400">
                          {voice.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Expandable Full Transcript */}
              {q.transcription && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => toggleTranscript(idx)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50/70 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-750 transition text-xs font-bold text-gray-700 dark:text-gray-300"
                  >
                    <span className="flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-blue-600" />
                      View Spoken Response Transcript
                    </span>
                    {isTranscriptOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {isTranscriptOpen && (
                    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 space-y-3">
                      <div className="flex justify-end">
                        <button
                          onClick={() => copyTranscript(q.transcription, idx)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 transition"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Transcript
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-mono whitespace-pre-wrap bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
                        {q.transcription}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
