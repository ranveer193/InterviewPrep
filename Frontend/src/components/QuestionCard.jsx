import { Clock, Play, Mic, CheckCircle } from "lucide-react";

export default function QuestionCard({
  question,
  index,
  total,
  readTimer,
  isRecording,
  onStartEarly,
}) {
  const isPrep = readTimer > 0;
  const questionText = typeof question === "string" ? question : question?.text || "";
  const category = question?.category || "General";

  return (
    <div className="relative bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {category}
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Question {index + 1} of {total}
            </span>
          </div>

          {/* Status Indicator */}
          {isPrep ? (
            <span className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-sm">
              <Clock className="w-3.5 h-3.5" />
              Prep: {readTimer}s
            </span>
          ) : isRecording ? (
            <span className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              Recording Active
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <CheckCircle className="w-3.5 h-3.5" />
              Ready
            </span>
          )}
        </div>

        {/* Question Text */}
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 leading-snug">
          Question {index + 1}
        </h2>
        <p className="text-gray-800 dark:text-gray-200 text-base md:text-lg leading-relaxed whitespace-pre-line font-medium">
          {questionText}
        </p>
      </div>

      {/* Prep Phase Progress and Early Action */}
      {isPrep && (
        <div className="bg-blue-50/70 dark:bg-gray-700/40 p-4 rounded-xl border border-blue-100 dark:border-gray-600 space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-blue-900 dark:text-blue-200">
            <span>Read and formulate your response</span>
            <span className="font-bold">{readTimer}s remaining</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-blue-200/60 dark:bg-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${Math.max(0, Math.min(100, ((20 - readTimer) / 20) * 100))}%` }}
            />
          </div>

          {onStartEarly && (
            <button
              onClick={onStartEarly}
              className="w-full text-xs font-bold text-blue-700 dark:text-blue-300 hover:text-blue-800 flex items-center justify-center gap-1.5 pt-1 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Ready now? Skip prep & start recording
            </button>
          )}
        </div>
      )}

      {/* Recording Tips */}
      {isRecording && (
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <Mic className="w-3.5 h-3.5 text-blue-500" />
          <span>Speak clearly into your microphone. Finish anytime when you're done.</span>
        </div>
      )}
    </div>
  );
}
