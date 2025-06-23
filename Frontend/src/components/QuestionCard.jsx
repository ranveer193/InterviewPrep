export default function QuestionCard({ question, index, total, readTimer }) {
  return (
    <div className="relative bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
      {/* Prep timer badge */}
      {readTimer > 0 && (
        <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
          Prep {readTimer}s
        </span>
      )}

      <h2 className="text-xl font-bold mb-4">
        Question {index + 1} <span className="text-sm text-gray-500">/ {total}</span>
      </h2>

      <p className="text-gray-800 whitespace-pre-line">{question}</p>

      {/* Optional: add a subtle bottom progress bar for prep phase */}
      {readTimer > 0 && (
        <div className="h-1 mt-4 bg-blue-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-1000"
            style={{ width: `${((20 - readTimer) / 20) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
