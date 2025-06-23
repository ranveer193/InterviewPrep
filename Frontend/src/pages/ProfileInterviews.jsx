import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ProfileInterviews() {
  const [rows, setRows]   = useState([]);
  const [loading, setLoading] = useState(true);

  /* fetch list */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/mockInterview/my");
        setRows(data.interviews || []);
      } catch (err) {
        toast.error("Failed to fetch interviews.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* delete */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this interview?")) return;
    try {
      await api.delete(`/mockInterview/${id}`);
      setRows(prev => prev.filter(iv => iv._id !== id));
      toast.success("Interview deleted");
    } catch (err) {
      toast.error("Delete failed");
      console.error(err);
    }
  };

  /* render */
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">My Mock Interviews</h1>

      {loading ? (
        <p className="text-gray-600">Loading interviews…</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-500 italic">No mock interviews yet.</p>
      ) : (
        rows.map(iv => {
          const ratings   = iv.questions.map(q => q.rating).filter(r => r != null);
          const avgRating = ratings.length
            ? (ratings.reduce((a,b)=>a+b,0) / ratings.length).toFixed(1)
            : null;

          return (
            <div
              key={iv._id}
              className="border rounded-lg p-4 shadow-sm space-y-3 bg-white hover:shadow-md transition"
            >
              {/* header */}
              <div className="flex justify-between text-sm text-gray-500">
                <span>{iv.company ?? "Interview"}</span>
                <span>{new Date(iv.createdAt).toLocaleString()}</span>
              </div>

              {/* avg rating */}
              <div className="text-sm text-gray-700">
                Avg. Rating: {avgRating || "⏳ waiting…"}
              </div>

              {/* actions */}
              <div className="flex items-center gap-4 mt-2">
                <Link
                  to={`/mockinterview/${iv._id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Full Summary →
                </Link>

                <button
                  onClick={() => handleDelete(iv._id)}
                  className="text-red-600 text-xs hover:underline"
                >
                  Delete
                </button>
              </div>

              {/* per-question status */}
              {iv.questions.map((q,i) => (
                <div key={i} className="pt-3 border-t text-sm space-y-1">
                  <p className="font-medium flex items-center gap-2">
                    Q{i+1}:
                    {q.summary ? (
                      <>
                        <span className="text-green-600">✅</span>
                        <span className="line-clamp-1">{q.summary}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-yellow-600 animate-pulse">⏳</span>
                        <span className="text-gray-500">Summary in progress…</span>
                      </>
                    )}
                  </p>
                  {q.rating != null && (
                    <p className="text-gray-600">
                      Rating: <strong>{q.rating}</strong>/5
                    </p>
                  )}
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
