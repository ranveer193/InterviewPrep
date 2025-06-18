import { FaThumbsUp, FaCalendar, FaUser, FaBuilding } from "react-icons/fa";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function ExperienceCard({ exp }) {
  const [upvotes, setUpvotes] = useState(exp.upvotes);
  const [isUpvoted, setIsUpvoted] = useState(false);

  const handleUpvote = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isUpvoted) return;
    try {
      const res = await axios.patch(`http://localhost:5000/interview/${exp._id}/upvote`);
      setUpvotes(res.data.upvotes);
      setIsUpvoted(true);
    } catch (err) {
      console.error("Failed to upvote", err);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Link to={`/interview/${exp._id}`} className="block">
      <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
        {/* Header with Company and Difficulty */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaBuilding className="text-blue-500 text-lg" />
            <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
              {exp.company}
            </span>
          </div>
          
          {exp.difficulty && (
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${getDifficultyColor(exp.difficulty)}`}>
              {exp.difficulty}
            </span>
          )}
        </div>

        {/* Role and User Info */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-blue-900 mb-2">{exp.roleApplied || exp.role}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <FaUser className="text-gray-400" />
              <span>{exp.name}</span>
            </div>
            {exp.experience && (
              <div className="flex items-center gap-1">
                <FaCalendar className="text-gray-400" />
                <span>{exp.experience}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {exp.description || exp.content?.slice(0, 150) || "No description available."}
          </p>
        </div>

        {/* Additional Info */}
        <div className="flex flex-wrap gap-2 mb-4">
          {exp.mode && (
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              {exp.mode}
            </span>
          )}
          {exp.applicationMode && (
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              {exp.applicationMode}
            </span>
          )}
          {exp.salary && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {exp.salary}
            </span>
          )}
        </div>

        {/* Upvotes and Action */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
              isUpvoted 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            } disabled:opacity-50`}
            disabled={isUpvoted}
          >
            <FaThumbsUp className={isUpvoted ? 'text-green-600' : 'text-blue-600'} />
            {upvotes} {upvotes === 1 ? 'upvote' : 'upvotes'}
          </button>

          <span className="text-xs text-blue-500 group-hover:text-blue-700 transition-colors">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
