import { Play, RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function VideoPreviewModal({ blob, open, onClose, onSubmit, loading }) {
  if (!open || !blob) return null;

  const url = URL.createObjectURL(blob);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-3xl relative animate-fade-in">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg"
          onClick={onClose}
          disabled={loading}
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4 text-blue-700">
          Review Your Answer
        </h2>

        <video
          src={url}
          controls
          className="w-full rounded-lg aspect-video mb-4"
        />

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="loader-mini inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting…
              </div>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Submit Final Answer
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <RotateCcw className="w-4 h-4" />
            Record Again
          </button>
        </div>
      </div>
    </div>
  );
}
