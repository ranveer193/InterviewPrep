import { FaThumbsUp, FaUsers, FaChartLine } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function CompanyCard({ companyData }) {
  const navigate = useNavigate();
  
  const {
    company,
    experiences,
    totalUpvotes,
    averageUpvotes,
    experienceCount,
    roles
  } = companyData;

  const handleCardClick = () => {
    navigate(`/company/${encodeURIComponent(company)}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      {/* Company Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-blue-900 mb-1">{company}</h3>
          <div className="flex flex-wrap gap-1">
            {roles.slice(0, 3).map((role, index) => (
              <span key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {role}
              </span>
            ))}
            {roles.length > 3 && (
              <span className="text-xs text-gray-500">+{roles.length - 3} more</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Experience Count */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <FaUsers className="text-blue-500 text-lg" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{experienceCount}</div>
          <div className="text-xs text-gray-500">Experiences</div>
        </div>

        {/* Average Upvotes */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <FaChartLine className="text-green-500 text-lg" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {averageUpvotes.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">Avg Upvotes</div>
        </div>

        {/* Total Upvotes */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <FaThumbsUp className="text-orange-500 text-lg" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{totalUpvotes}</div>
          <div className="text-xs text-gray-500">Total Upvotes</div>
        </div>
      </div>

      {/* Preview of latest experience */}
      {experiences.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-sm text-gray-600 line-clamp-2">
            Latest: {experiences[0].content?.slice(0, 80) || experiences[0].description?.slice(0, 80) || "No description available"}...
          </p>
        </div>
      )}

      {/* Click indicator */}
      <div className="mt-3 text-center">
        <span className="text-xs text-blue-500 group-hover:text-blue-700 transition-colors">
          Click to view all experiences →
        </span>
      </div>
    </div>
  );
} 