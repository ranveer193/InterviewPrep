import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import { CheckCircle } from "lucide-react";

/* ---- helper: nice rank medal ---- */
const medal = (i) =>
  ["🥇", "🥈", "🥉"][i] ?? `${i + 1}.`;

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  /* fetch once */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/mockInterview/leaderboard/top");
        setRows(data.leaderboard || []);
      } catch {
        toast.error("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* copy-to-clipboard */
  const copy = (txt) => {
    navigator.clipboard.writeText(txt);
    toast.success("User ID copied");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-800">Leaderboard</h1>

      {loading ? (
        <p className="text-gray-600">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="italic text-gray-500">No ranked data yet.</p>
      ) : (
        <ol className="space-y-4">
          {rows.map((u, i) => (
            <li
              key={u._id}
              className="flex items-center gap-4 bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition"
            >
              {/* rank medal */}
              <span className="text-2xl w-7">{medal(i)}</span>

              {/* user block */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-medium text-gray-800 truncate cursor-pointer hover:underline"
                  title="Click to copy UID"
                  onClick={() => copy(u._id)}
                >
                  {u._id}
                </p>

                {/* progress bar */}
                <div className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-2 bg-purple-600 rounded-full transition-all"
                    style={{ width: `${(u.avgRating / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* rating */}
              <span className="text-sm flex items-center gap-1 text-gray-700">
                <CheckCircle size={14} className="text-green-600" />
                {u.avgRating.toFixed(2)}/5
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
