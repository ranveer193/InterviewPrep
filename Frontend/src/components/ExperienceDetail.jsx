import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ExperienceDetail() {
  const { id } = useParams();
  const [experience, setExperience] = useState(null);
  const [expandedRound, setExpandedRound] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/interview/${id}`)
      .then((res) => setExperience(res.data))
      .catch(() => setExperience(undefined));
  }, [id]);

  if (experience === null)
    return <p className="text-center py-10 text-gray-400">Loading…</p>;
  if (experience === undefined)
    return <p className="text-center py-10 text-red-400">Not found.</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-white space-y-8">
      <div className="bg-gradient-to-br from-indigo-700 to-purple-800 p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-semibold">
          {experience.company} &nbsp;|&nbsp; {experience.role}
        </h1>
        <p className="text-sm text-white/80 mt-2">
          {experience.rounds?.length ?? 0} Rounds&nbsp; • &nbsp;
          {experience.rounds?.reduce(
            (sum, r) => sum + (r.codingProblems ?? 0),
            0
          )}{" "}
          Coding Problems
        </p>
      </div>

      <div className="bg-gradient-to-br from-indigo-800 to-purple-900 p-6 rounded-xl shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold">Anonymous</p>
            <p className="text-xs text-white/70">Final‑year student</p>
          </div>
          <p className="text-xs text-white/70 sm:pt-0 pt-2">
            Posted {experience?.createdAt?.slice(0, 10)}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <span className="bg-white/10 px-3 py-1 rounded-full">
            Difficulty: {experience.difficulty}
          </span>
          {experience.timeline && (
            <span className="bg-white/10 px-3 py-1 rounded-full">
              Timeline: {experience.timeline}
            </span>
          )}
          {experience.mode && (
            <span className="bg-white/10 px-3 py-1 rounded-full">
              Mode: {experience.mode}
            </span>
          )}
          {experience.applicationMode && (
            <span className="bg-white/10 px-3 py-1 rounded-full">
              Application: {experience.applicationMode}
            </span>
          )}
          {experience.salary && (
            <span className="bg-white/10 px-3 py-1 rounded-full">
              Salary: {experience.salary}
            </span>
          )}
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Interview Rounds</h2>

        {experience.rounds?.map((r, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-indigo-700/80 to-purple-800/80 rounded-lg mb-4 overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedRound(expandedRound === idx ? null : idx)
              }
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-white/10 transition"
            >
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-white/70">
                  Duration&nbsp;{r.duration} min&nbsp;•&nbsp;Mode&nbsp;{r.mode}
                  &nbsp;•&nbsp;Problems&nbsp;{r.codingProblems}
                </p>
              </div>
              {expandedRound === idx ? <ChevronUp /> : <ChevronDown />}
            </button>

            {expandedRound === idx && (
              <div className="p-5 pt-0 text-sm text-white/90 whitespace-pre-line">
                {r.description}
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="bg-gradient-to-br from-indigo-800 to-purple-900 p-6 rounded-xl shadow-lg space-y-6">
        <h2 className="text-xl font-semibold">Overall Experience</h2>

        {experience.preparationTips?.length > 0 && (
          <div>
            <h3 className="font-medium mb-1">Preparation Tips</h3>
            <ul className="list-disc list-inside space-y-1 text-white/90">
              {experience.preparationTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {experience.generalAdvice?.length > 0 && (
          <div>
            <h3 className="font-medium mb-1">General Advice</h3>
            <ul className="list-disc list-inside space-y-1 text-white/90">
              {experience.generalAdvice.map((adv, i) => (
                <li key={i}>{adv}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
