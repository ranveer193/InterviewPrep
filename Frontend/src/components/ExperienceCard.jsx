export default function ExperienceCard({ exp }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4 border border-gray-200">
      <h3 className="text-xl font-semibold text-indigo-700">{exp.company} - {exp.role}</h3>
      <p className="text-sm text-gray-500 mb-1">By: {exp.name}</p>
      <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded mb-2">
        Difficulty: {exp.difficulty}
      </span>
      <p className="text-gray-800 whitespace-pre-line">{exp.content}</p>
    </div>
  );
}
