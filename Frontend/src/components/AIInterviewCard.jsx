import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Play, Clock, Users } from "lucide-react";

export default function AIInterviewCard({ company }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleStartInterview = () => {
    if (company) {
      // If company is provided, navigate directly to that company's interview
      navigate(`/ai-interview/${encodeURIComponent(company)}`);
    } else {
      // If no company is provided, navigate to company selection
      navigate('/ai-interview');
    }
  };

  return (
    <div 
      className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleStartInterview}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              AI Video Interview
            </h3>
            <p className="text-sm text-gray-600">
              {company ? `Practice with ${company} questions` : 'Practice with company-specific questions'}
            </p>
          </div>
        </div>
        
        <div className={`transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
          <Play className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>2 questions • 5 min max per answer</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>Video + Audio recording</span>
        </div>
        
        <div className="bg-blue-100 rounded-lg p-3">
          <p className="text-xs text-blue-800 font-medium">
            💡 Get instant feedback on your responses
          </p>
        </div>
      </div>

      <button 
        className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
        onClick={(e) => {
          e.stopPropagation();
          handleStartInterview();
        }}
      >
        {company ? `Start ${company} Interview` : 'Start AI Interview'}
      </button>
    </div>
  );
} 