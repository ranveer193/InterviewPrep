import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ResultSummary({ data, company }) {
  const navigate = useNavigate();
  if (!data) return null;

  const { transcription, analysis } = data;
  if (!analysis) return null;

  const summaryText = analysis.summary?.summary || "";  // actual summary lines
  const relevanceRating = analysis.summary?.relevance_rating || null;

  const renderKvList = (obj) =>
    obj && typeof obj === "object" ? (
      <ul className="list-disc ml-6 text-sm space-y-1">
        {Object.entries(obj).map(([k, v]) => (
          <li key={k}>
            <span className="font-medium capitalize">{k.replaceAll("_", " ")}:</span>{" "}
            {typeof v === "object" ? JSON.stringify(v) : v.toString()}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-gray-600">No data</p>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white border border-blue-200 rounded-2xl p-8 shadow-sm">

        {/* Top nav */}
        <button
          onClick={() => navigate("/ai-interview")}
          className="flex items-center gap-2 text-blue-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-6 text-center">
          Interview Summary – {company}
        </h1>

        {/* AI Summary */}
        {summaryText && (
          <div className="mb-8">
            <h2 className="font-semibold mb-2">AI Coach Feedback</h2>
            <p className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm whitespace-pre-wrap">
              {summaryText}
            </p>
            {relevanceRating && (
              <p className="mt-2 text-sm text-purple-800 font-medium">
                <span className="text-gray-700">Answer Relevance:</span> {relevanceRating} / 10
              </p>
            )}
          </div>
        )}

        {/* Transcript */}
        <div className="mb-8">
          <h2 className="font-semibold mb-2">Transcript</h2>
          <pre className="bg-gray-100 rounded-lg p-4 whitespace-pre-wrap text-xs max-h-60 overflow-y-auto">
            {transcription}
          </pre>
        </div>

        {/* Speech Metrics */}
        <div className="mb-8">
          <h2 className="font-semibold mb-2">Speech Metrics</h2>
          {renderKvList(analysis.speech)}
        </div>

        {/* Video Metrics – only if available */}
        {analysis.video && Object.keys(analysis.video).length > 0 && (
          <div className="mb-8">
            <h2 className="font-semibold mb-2">Video Metrics</h2>
            {renderKvList(analysis.video)}
          </div>
        )}

        {/* Home button */}
        <button
          onClick={() => navigate("/")}
          className="mt-4 w-full bg-green-500 text-white py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" /> Home
        </button>
      </div>
    </div>
  );
}
