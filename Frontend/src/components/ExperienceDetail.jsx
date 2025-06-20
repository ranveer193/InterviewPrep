import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import {
  FaThumbsUp,
  FaCalendar,
  FaUser,
  FaBuilding,
  FaClock,
  FaCode,
  FaGraduationCap,
  FaRegStickyNote,
} from "react-icons/fa";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";

export default function ExperienceDetail() {
  const { id } = useParams();
  const [experience, setExperience] = useState(null);
  const [expandedRound, setExpandedRound] = useState(null);
  const [upvotes, setUpvotes] = useState(0);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [user, setUser] = useState(null);

  const auth = getAuth();

  /* ─── auth track ───────────────────────── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, [auth]);

  /* ─── fetch experience ─────────────────── */
  useEffect(() => {
    axios
      .get(`http://localhost:5000/interview/${id}`)
      .then((res) => {
        const exp = res.data;
        setExperience(exp);
        setUpvotes(exp.upvotes || 0);
        setIsUpvoted(user ? exp.upvotedBy?.includes(user.uid) : false);
      })
      .catch(() => setExperience(undefined));
  }, [id, user]);

  /* ─── up‑vote toggle ───────────────────── */
  const handleUpvote = async () => {
    if (!user) {
      toast.info("Please log in to up‑vote.");
      return;
    }
    try {
      const token = await user.getIdToken();
      const res = await axios.patch(
        `http://localhost:5000/interview/${id}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUpvotes(res.data.upvotes);
      setIsUpvoted(res.data.upvoted);
      toast.success(
        res.data.upvoted ? "Thanks for your up‑vote!" : "Up‑vote removed.",
        { autoClose: 1500 }
      );
    } catch (err) {
      toast.error("Something went wrong while up‑voting.", { autoClose: 1500 });
    }
  };

  const getDifficultyColor = (d) =>
    ({
      easy: "text-green-600 bg-green-100",
      medium: "text-yellow-600 bg-yellow-100",
      hard: "text-red-600 bg-red-100",
    }[d?.toLowerCase()] || "text-gray-600 bg-gray-100");

  /* ─── loading / 404 ─────────────────────── */
  if (experience === null)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-blue-600 text-lg">Loading…</div>
      </div>
    );
  if (experience === undefined)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">Experience not found.</div>
      </div>
    );

  /* ─── MAIN ──────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back */}
        <Link
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Experiences
        </Link>

        {/* Header card */}
        <div className="bg-white border border-blue-200 rounded-2xl p-8 shadow-sm mb-8">
          <div className="flex items-start justify-between mb-6">
            {/* company & role */}
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
                <span className="flex items-center gap-1">
                  <FaUser className="text-gray-400" />
                  {experience.name}
                </span>
                {experience.experience && (
                  <span className="flex items-center gap-1">
                    <FaGraduationCap className="text-gray-400" />
                    {experience.experience}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <FaCalendar className="text-gray-400" />
                  {experience.createdAt?.slice(0, 10)}
                </span>
              </div>
            </div>

            {/* badges & up‑vote */}
            <div className="flex flex-col items-end gap-2">
              {experience.difficulty && (
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${getDifficultyColor(
                    experience.difficulty
                  )}`}
                >
                  {experience.difficulty}
                </span>
              )}
              <button
                onClick={handleUpvote}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                  isUpvoted
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                <FaThumbsUp
                  className={isUpvoted ? "text-green-600" : "text-blue-600"}
                />
                {upvotes} {upvotes === 1 ? "up‑vote" : "up‑votes"}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* rounds */}
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <FaClock className="mx-auto text-blue-500 text-xl mb-2" />
              <div className="text-2xl font-bold text-blue-900">
                {experience.rounds?.length ?? 0}
              </div>
              <div className="text-sm text-gray-600">Total Rounds</div>
            </div>
            {/* coding */}
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <FaCode className="mx-auto text-green-500 text-xl mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {experience.rounds?.reduce(
                  (sum, r) => sum + (r.codingProblems ?? 0),
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Coding Problems</div>
            </div>
            {/* mode */}
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">
                {experience.mode || "N/A"}
              </div>
              <div className="text-sm text-gray-600">Interview Mode</div>
            </div>
          </div>

          {/* extra badges */}
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
                className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100"
              >
                LinkedIn Profile
              </a>
            )}
          </div>
        </div>

        {/* SUMMARY (new) */}
        {experience.summary && (
          <div className="bg-white border border-green-200 rounded-2xl p-6 shadow-sm mb-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-green-800 mb-4">
              <FaRegStickyNote /> Quick Summary
            </h2>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
              {experience.summary}
            </div>
          </div>
        )}

        {/* Interview rounds */}
        {experience.rounds?.length > 0 && (
          <div className="bg-white border border-blue-200 rounded-2xl p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">
              Interview Rounds
            </h2>
            <div className="space-y-4">
              {experience.rounds.map((r, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() =>
                      setExpandedRound(expandedRound === idx ? null : idx)
                    }
                    className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-semibold text-blue-900">{r.name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        {r.duration && (
                          <span className="flex items-center gap-1">
                            <FaClock className="w-3 h-3" />
                            {r.duration} min
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
                    {expandedRound === idx ? (
                      <ChevronUp className="text-gray-400" />
                    ) : (
                      <ChevronDown className="text-gray-400" />
                    )}
                  </button>

                  {expandedRound === idx && (
                    <div className="px-6 pb-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {r.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full content + tips */}
        <div className="bg-white border border-blue-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">
            Detailed Experience
          </h2>

          {experience.content && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Candidate Narrative
              </h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {experience.content}
              </div>
            </div>
          )}

          {/* preparation tips */}
          {experience.preparationTips?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Preparation Tips
              </h3>
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

          {/* advice */}
          {experience.generalAdvice?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                General Advice
              </h3>
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
