import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import api from "../services/api";
import { 
  Calendar, 
  Trash2, 
  ChevronRight, 
  Building2, 
  Star,
  Clock,
  Loader2,
  FileText,
  BarChart
} from "lucide-react";

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
    if (!window.confirm("Delete this interview record? This action cannot be undone.")) return;
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
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            My Mock Interviews
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Review your past performance and track your progress.
          </p>
        </div>
        
        <Link
          to="/ai-interview"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition shadow-lg shadow-blue-500/30 w-fit"
        >
          Practice New Interview
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Loading your interview history...</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No interviews yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            You haven't completed any mock interviews. Start practicing to see your detailed performance analytics here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rows.map(iv => {
            const ratings   = iv.questions.map(q => q.rating).filter(r => r != null);
            const avgRating = ratings.length
              ? parseFloat((ratings.reduce((a,b)=>a+b,0) / ratings.length).toFixed(1))
              : null;
            
            const isProcessing = iv.questions.some(q => !q.summary || q.summary.includes("__processing__") || q.summary.includes("baseline scoring"));

            return (
              <div
                key={iv._id}
                className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Status indicator line */}
                <div className={`absolute top-0 left-0 w-full h-1.5 ${isProcessing ? 'bg-amber-400' : (avgRating >= 4 ? 'bg-emerald-500' : avgRating >= 3 ? 'bg-blue-500' : 'bg-red-500')}`} />

                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {iv.company ?? "General Technical"}
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(iv.createdAt).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(iv.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(iv._id)}
                      className="text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Rating / Processing Status */}
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center gap-2">
                      <BarChart className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {iv.questions.length} Questions
                      </span>
                    </div>

                    {avgRating ? (
                      <div className="flex items-center gap-1.5 bg-blue-100/50 dark:bg-blue-900/30 px-3 py-1 rounded-xl text-blue-700 dark:text-blue-300 font-bold border border-blue-200/50 dark:border-blue-800/50">
                        <Star className="w-4 h-4 fill-current text-blue-500" />
                        <span>{avgRating} <span className="text-xs text-blue-600/70 dark:text-blue-400/70">/ 5.0</span></span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-800/30">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Evaluating...
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/80">
                  <Link
                    to={`/mockinterview/${iv._id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 dark:bg-gray-700/30 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-bold transition group-hover:bg-blue-50 group-hover:text-blue-600 border border-transparent group-hover:border-blue-100 dark:group-hover:border-blue-900/30"
                  >
                    View Full Report
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
