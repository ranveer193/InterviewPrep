import { useEffect, useState } from "react";
import axios from "axios";
import HeroBanner from "../components/HeroBanner";
import ExperienceCard from "../components/ExperienceCard";
import SearchFilters from "../components/FilterTabs";
import DifficultyFilter from "../components/DifficultyFilter";

export default function Home() {
  const [experiences, setExperiences] = useState([]);
  const [filter, setFilter] = useState({ company: "", role: "", difficulty: "" });
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    const fetchExperiences = async () => {
      const params = new URLSearchParams();
      if (filter.company) params.append("company", filter.company);
      if (filter.role) params.append("role", filter.role);
      if (filter.difficulty) params.append("difficulty", filter.difficulty);
      params.append("sort", sortBy);

      try {
        const res = await axios.get(`http://localhost:5000/interview?${params.toString()}`);
        setExperiences(res.data);
      } catch (err) {
        console.error("Failed to fetch experiences", err);
      }
    };
    fetchExperiences();
  }, [filter, sortBy]);

  return (
    <div>
      <HeroBanner />
      <div className="px-4 max-w-6xl mx-auto">
        {/* Company & role search */}
        <SearchFilters setFilter={setFilter} />

        {/* NEW difficulty pills */}
        <DifficultyFilter current={filter.difficulty} setFilter={setFilter} />

        {/* Sort dropdown */}
        <div className="flex justify-end my-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md"
          >
            <option value="latest">Sort by: Latest</option>
            <option value="upvotes">Sort by: Upvotes</option>
          </select>
        </div>

        {/* Experience grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {experiences.length ? (
            experiences.map((exp) => <ExperienceCard key={exp._id} exp={exp} />)
          ) : (
            <p className="text-center text-gray-500 col-span-full">No experiences found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
