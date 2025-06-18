import { useEffect, useState } from "react";
import axios from "axios";
import HeroBanner from "../components/HeroBanner";
import { FaThumbsUp } from "react-icons/fa";

export default function Interview() {
  const [experiences, setExperiences] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All Companies");
  const [sortBy, setSortBy] = useState("latest");
  const [searchText, setSearchText] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/interview?sort=${sortBy}`);
      const data = res.data;
      setExperiences(data);

      const uniqueCompanies = [...new Set(data.map((item) => item.company.trim()))];
      setCompanies(uniqueCompanies);
    } catch (error) {
      console.error("Error fetching experiences:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sortBy]);

  const filteredExperiences = experiences.filter((exp) => {
    const matchesCompany =
      activeFilter === "All Companies" || exp.company === activeFilter;

    const matchesSearch = exp.company
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesDifficulty =
      difficultyFilter === "All" ||
      (exp.difficulty &&
        exp.difficulty.toLowerCase() === difficultyFilter.toLowerCase());

    return matchesCompany && matchesSearch && matchesDifficulty;
  });

  return (
    <div>
      <HeroBanner
        title="Interview Experiences"
        subtitle="Browse interview experiences shared by candidates across top companies."
      />

      <div className="px-4 max-w-6xl mx-auto py-8">
        <h2 className="text-2xl font-semibold text-blue-900 mb-1">Experiences</h2>
        <p className="text-sm text-blue-700 mb-5">
          Real experiences from real candidates
        </p>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by company name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full p-2.5 mb-5 rounded-lg border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["All Companies", ...companies].map((comp) => (
            <button
              key={comp}
              onClick={() => setActiveFilter(comp)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                activeFilter === comp
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              {comp}
            </button>
          ))}
        </div>

        {/* Sort and Difficulty Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          {/* Sort Dropdown */}
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

          {/* Difficulty Filter */}
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

        {/* Experience Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredExperiences.length > 0 ? (
            filteredExperiences.map((exp, i) => (
              <div
                key={exp._id}
                className="relative bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Upvote Button */}
                <button
                  onClick={async () => {
                    try {
                      const res = await axios.patch(
                        `http://localhost:5000/interview/${exp._id}/upvote`
                      );
                      const updated = [...experiences];
                      updated[i].upvotes = res.data.upvotes;
                      setExperiences(updated);
                    } catch (err) {
                      console.error("Upvote failed", err);
                    }
                  }}
                  className="absolute top-3 right-3 flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <FaThumbsUp />
                  <span className="font-medium">{exp.upvotes || 0}</span>
                </button>

                {/* Company Name */}
                <h3 className="text-base font-semibold text-blue-900 mb-1 mt-1">
                  {exp.company}
                </h3>

                {/* Role */}
                <p className="text-sm text-blue-700 font-medium mb-1">
                  {exp.role}
                </p>

                {/* Difficulty (if present) */}
                {exp.difficulty && (
                  <p className="text-sm text-blue-500 mb-3">
                    Difficulty: {exp.difficulty}
                  </p>
                )}

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-4">
                  {exp.description}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">
              No experiences found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
