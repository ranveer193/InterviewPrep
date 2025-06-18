import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import HeroBanner from "../components/HeroBanner";
import ExperienceCard from "../components/ExperienceCard";
import { FaArrowLeft, FaUsers, FaThumbsUp, FaChartLine } from "react-icons/fa";

export default function CompanyDetail() {
  const { companyName } = useParams();
  const [experiences, setExperiences] = useState([]);
  const [companyStats, setCompanyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const fetchCompanyExperiences = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/interview?company=${encodeURIComponent(companyName)}&sort=${sortBy}`);
      const data = res.data;
      setExperiences(data);

      // Calculate company stats
      if (data.length > 0) {
        const totalUpvotes = data.reduce((sum, exp) => sum + (exp.upvotes || 0), 0);
        const averageUpvotes = totalUpvotes / data.length;
        const roles = [...new Set(data.map(exp => exp.roleApplied || exp.role).filter(Boolean))];
        const difficulties = [...new Set(data.map(exp => exp.difficulty).filter(Boolean))];

        setCompanyStats({
          company: companyName,
          experienceCount: data.length,
          totalUpvotes,
          averageUpvotes,
          roles,
          difficulties
        });
      }
    } catch (error) {
      console.error("Error fetching company experiences:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyExperiences();
  }, [companyName, sortBy]);

  const filteredExperiences = experiences.filter((exp) => {
    return difficultyFilter === "All" || 
           (exp.difficulty && exp.difficulty.toLowerCase() === difficultyFilter.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-blue-600 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <HeroBanner
        title={`${companyName} Interview Experiences`}
        subtitle={`Browse all interview experiences shared by candidates at ${companyName}`}
      />

      <div className="px-4 max-w-6xl mx-auto py-8">
        {/* Back Button */}
        <Link 
          to="/interview" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <FaArrowLeft />
          Back to All Companies
        </Link>

        {/* Company Stats */}
        {companyStats && (
          <div className="bg-white border border-blue-200 rounded-2xl p-6 mb-8 shadow-sm">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">{companyStats.company}</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <FaUsers className="text-blue-500 text-2xl" />
                </div>
                <div className="text-3xl font-bold text-blue-900">{companyStats.experienceCount}</div>
                <div className="text-sm text-gray-500">Total Experiences</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <FaChartLine className="text-green-500 text-2xl" />
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {companyStats.averageUpvotes.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Average Upvotes</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <FaThumbsUp className="text-orange-500 text-2xl" />
                </div>
                <div className="text-3xl font-bold text-orange-600">{companyStats.totalUpvotes}</div>
                <div className="text-sm text-gray-500">Total Upvotes</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{companyStats.roles.length}</div>
                <div className="text-sm text-gray-500">Different Roles</div>
              </div>
            </div>

            {/* Roles and Difficulties */}
            <div className="flex flex-wrap gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Roles:</h4>
                <div className="flex flex-wrap gap-1">
                  {companyStats.roles.map((role, index) => (
                    <span key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Difficulties:</h4>
                <div className="flex flex-wrap gap-1">
                  {companyStats.difficulties.map((diff, index) => (
                    <span 
                      key={index}
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        diff.toLowerCase() === 'easy' ? 'text-green-600 bg-green-100' :
                        diff.toLowerCase() === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                        'text-red-600 bg-red-100'
                      }`}
                    >
                      {diff}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h3 className="text-xl font-semibold text-blue-900">
            Experiences ({filteredExperiences.length})
          </h3>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-blue-800 font-medium">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="latest">Latest</option>
                <option value="upvotes">Most Upvoted</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-blue-800 font-medium">Difficulty:</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Experience Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredExperiences.length > 0 ? (
            filteredExperiences.map((exp) => (
              <ExperienceCard key={exp._id} exp={exp} />
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">
              No experiences found for the selected filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 