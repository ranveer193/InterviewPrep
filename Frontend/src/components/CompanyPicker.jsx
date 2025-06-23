import { useNavigate } from "react-router-dom";

export default function CompanyPicker() {
  const navigate = useNavigate();
  const companies = ["Amazon", "Google", "Microsoft", "Apple", "Meta"];
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-10">Choose Company</h1>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {companies.map((c) => (
          <div
            key={c}
            onClick={() => navigate(`/ai-interview/${encodeURIComponent(c)}`)}
            className="cursor-pointer bg-white border border-blue-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all"
          >
            <h4 className="text-xl font-bold mb-2 text-gray-900">{c}</h4>
            <p className="text-sm text-gray-500 mb-4">Practice {c} OA interview</p>
            <button className="w-full bg-blue-500 text-white py-2 rounded-lg">Start Interview</button>
          </div>
        ))}
      </div>
    </div>
  );
}