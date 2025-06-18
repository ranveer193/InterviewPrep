import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { FaThumbsUp, FaCalendar, FaUser, FaBuilding, FaClock, FaCode, FaGraduationCap } from "react-icons/fa";

export default function ExperienceDetail() {
  const { id } = useParams();
  const [experience, setExperience] = useState(null);
  const [expandedRound, setExpandedRound] = useState(null);
  const [upvotes, setUpvotes] = useState(0);
  const [isUpvoted, setIsUpvoted] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/interview/${id}`)
      .then((res) => {
        setExperience(res.data);
        setUpvotes(res.data.upvotes || 0);
      })
      .catch(() => setExperience(undefined));
  }, [id]);

  const handleUpvote = async () => {
    if (isUpvoted) return;
    try {
      const res = await axios.patch(`http://localhost:5000/interview/${id}/upvote`);
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

  if (experience === null)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-blue-600 text-lg">Loading...</div>
      </div>
    );
  if (experience === undefined)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">Experience not found.</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Experiences
        </Link>

        {/* Header Card */}
        <div className="bg-white border border-blue-200 rounded-2xl p-8 shadow-sm mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FaBuilding className="text-blue-500 text-2xl" />
                <h1 className="text-3xl font-bold text-blue-900">
                  {experience.company}
                </h1>
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                {experience.roleApplied || experience.role}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FaUser className="text-gray-400" />
                  <span>{experience.name}</span>
                </div>
                {experience.experience && (
                  <div className="flex items-center gap-1">
                    <FaGraduationCap className="text-gray-400" />
                    <span>{experience.experience}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <FaCalendar className="text-gray-400" />
                  <span>{experience?.createdAt?.slice(0, 10)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              {experience.difficulty && (
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${getDifficultyColor(experience.difficulty)}`}>
                  {experience.difficulty}
                </span>
              )}
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
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <FaClock className="text-blue-500 text-xl" />
              </div>
              <div className="text-2xl font-bold text-blue-900">{experience.rounds?.length ?? 0}</div>
              <div className="text-sm text-gray-600">Total Rounds</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <FaCode className="text-green-500 text-xl" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {experience.rounds?.reduce((sum, r) => sum + (r.codingProblems ?? 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Coding Problems</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">
                {experience.mode || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Interview Mode</div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex flex-wrap gap-2">
            {experience.timeline && (
              <span className="text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                Timeline: {experience.timeline}
              </span>
            )}
            {experience.applicationMode && (
              <span className="text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {experience.applicationMode}
              </span>
            )}
            {experience.salary && (
              <span className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
                {experience.salary}
              </span>
            )}
            {experience.linkedin && (
              <a 
                href={experience.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
              >
                LinkedIn Profile
              </a>
            )}
          </div>
        </div>

        {/* Interview Rounds */}
        {experience.rounds && experience.rounds.length > 0 && (
          <div className="bg-white border border-blue-200 rounded-2xl p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Interview Rounds</h2>
            
            <div className="space-y-4">
              {experience.rounds.map((r, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => setExpandedRound(expandedRound === idx ? null : idx)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-blue-900">{r.name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        {r.duration && (
                          <span className="flex items-center gap-1">
                            <FaClock className="w-3 h-3" />
                            {r.duration} min
                          </span>
                        )}
                        {r.mode && (
                          <span className="flex items-center gap-1">
                            <FaBuilding className="w-3 h-3" />
                            {r.mode}
                          </span>
                        )}
                        {r.codingProblems && (
                          <span className="flex items-center gap-1">
                            <FaCode className="w-3 h-3" />
                            {r.codingProblems} problems
                          </span>
                        )}
                      </div>
                    </div>
                    {expandedRound === idx ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                  </button>

                  {expandedRound === idx && (
                    <div className="px-6 pb-4 text-sm text-gray-700 leading-relaxed">
                      {r.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Experience */}
        <div className="bg-white border border-blue-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Overall Experience</h2>

          {experience.content && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Experience Summary</h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {experience.content}
              </div>
            </div>
          )}

          {experience.preparationTips?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Preparation Tips</h3>
              <ul className="space-y-2">
                {experience.preparationTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <span className="text-blue-500 font-bold mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {experience.generalAdvice?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">General Advice</h3>
              <ul className="space-y-2">
                {experience.generalAdvice.map((adv, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <span className="text-blue-500 font-bold mt-1">•</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
