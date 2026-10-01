import { CheckCircle2, RotateCcw, FileText, Send, Clock, Sparkles, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function VideoPreviewModal({
  blob,
  metrics,
  open,
  onClose,
  onSubmit,
  loading,
}) {
  const [editedTranscript, setEditedTranscript] = useState("");

  useEffect(() => {
    if (metrics?.transcript) {
      setEditedTranscript(metrics.transcript);
    } else {
      setEditedTranscript("");
    }
  }, [metrics, open]);

  if (!open) return null;

  const durationSec = metrics?.durationSeconds || 0;
  const wordCount = editedTranscript.trim()
    ? editedTranscript.trim().split(/\s+/).length
    : 0;

  const handleSubmit = () => {
    onSubmit({
      blob,
      transcript: editedTranscript,
      audioDurationSeconds: durationSec,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-2xl relative space-y-6 border border-gray-100 dark:border-gray-700">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Response Captured
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Review your response before submitting for AI analysis
              </p>
            </div>
          </div>

          <button
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg font-bold p-1 rounded-lg"
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-blue-50/70 dark:bg-gray-700/40 border border-blue-100 dark:border-gray-600 p-3 rounded-xl flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">
                Duration
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {durationSec}s
              </div>
            </div>
          </div>

          <div className="bg-blue-50/70 dark:bg-gray-700/40 border border-blue-100 dark:border-gray-600 p-3 rounded-xl flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">
                Word Count
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {wordCount} words
              </div>
            </div>
          </div>

          <div className="hidden sm:flex bg-green-50/70 dark:bg-green-900/20 border border-green-100 dark:border-green-800/40 p-3 rounded-xl items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-green-700 dark:text-green-300">
                Status
              </div>
              <div className="text-sm font-bold text-green-800 dark:text-green-300">
                Audio Ready
              </div>
            </div>
          </div>
        </div>

        {/* Transcribed Response Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" /> Transcribed Response:
            </label>
            <span className="text-xs text-gray-400">Editable before submit</span>
          </div>

          <textarea
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            placeholder="Your spoken response appears here. You can refine or correct any terms before submitting..."
            rows={5}
            className="w-full p-4 border border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition leading-relaxed"
          />

          {!editedTranscript.trim() && (
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Speech was not captured during recording. You can type your answer above, or re-record your response.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting Answer…
              </div>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Proceed to Next Question
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <RotateCcw className="w-4 h-4" />
            Retake / Re-record Answer
          </button>
        </div>
      </div>
    </div>
  );
}
