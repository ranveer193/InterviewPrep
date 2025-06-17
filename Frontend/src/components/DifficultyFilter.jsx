const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function DifficultyFilter({ current, setFilter }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <span className="self-center text-sm font-medium text-gray-600 mr-2">
        Difficulty:
      </span>
      {DIFFICULTIES.map((d) => (
        <button
          key={d}
          onClick={() => setFilter((prev) => ({ ...prev, difficulty: prev.difficulty === d ? "" : d }))}
          className={`px-3 py-1 rounded border ${
            current === d
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          } text-sm transition`}
        >
          {d}
        </button>
      ))}
    </div>
  );
}
