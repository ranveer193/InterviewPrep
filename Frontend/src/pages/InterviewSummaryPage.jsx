import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import api from "../services/api";

export default function InterviewSummaryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* fetch once */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/mockInterview/${id}`);
        setData(data.interview);
      } catch {
        toast.error("Failed to fetch interview summary.");
        navigate("/profile#interviews");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  if (loading) return <div className="p-6 text-center">Loading summary…</div>;
  if (!data)   return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Interviews
      </button>

      <h1 className="text-3xl font-bold text-blue-800">
        {data.company || "Interview"} Summary
      </h1>

      {data.questions.map((q, i) => (
        <div
          key={i}
          className="border rounded-2xl p-5 shadow-md bg-white space-y-3 transition-all hover:shadow-lg"
        >
          {/* header */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Question {i + 1}</span>
            {q.rating != null && <Badge rating={q.rating} />}
          </div>

          <p className="font-semibold text-gray-800">{q.text}</p>

          {q.summary ? (
            <>
              {/* AI summary */}
              <div>
                <span className="font-semibold text-green-700">AI Summary:</span>
                <p className="text-gray-700 whitespace-pre-wrap mt-1 leading-relaxed">
                  {q.summary}
                </p>
              </div>

              {/* Rating bar */}
              <div className="space-y-1 pt-2">
                <div className="text-sm text-gray-600">
                  Rating: <span className="font-bold">{q.rating}/5</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(q.rating / 5) * 100}%`,
                      backgroundColor: getRatingColor(q.rating),
                    }}
                  />
                </div>
              </div>

              {/* Voice-coach box */}
              {q.analysis?.voiceCoach?.coachSummary && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3 text-sm text-blue-900">
                  <strong>Voice Coach Summary:</strong>
                  <pre className="whitespace-pre-wrap mt-1 text-sm">
                    {q.analysis.voiceCoach.coachSummary}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500 italic pt-2">Summary not available.</div>
          )}

          {/* Transcript accordion */}
          {q.transcription && (
            <details className="text-sm text-gray-600 pt-2">
              <summary className="cursor-pointer font-medium text-blue-600 hover:underline">
                View Transcript
              </summary>
              <pre className="whitespace-pre-wrap pt-2 text-gray-700">
                {q.transcription}
              </pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------- helpers ---------------- */
function Badge({ rating }) {
  const label =
    rating >= 4.5 ? "🌟 Excellent" :
    rating >= 3.5 ? "👍 Good"     :
    rating >= 2.5 ? "🧐 Average"  : "⚠️ Needs Work";

  return (
    <span className="text-xs font-semibold text-white px-2 py-0.5 rounded-full bg-blue-500">
      {label}
    </span>
  );
}

function getRatingColor(rating) {
  if (rating >= 4.5) return "#16a34a";
  if (rating >= 3.5) return "#3b82f6";
  if (rating >= 2.5) return "#f59e0b";
  return "#ef4444";
}
