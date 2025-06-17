import { useEffect, useState } from "react";
import axios from "axios";
import HeroBanner from "../components/HeroBanner";
import ExperienceCard from "../components/ExperienceCard";
import SearchFilters from "../components/FilterTabs";

export default function Home() {
  const [experiences, setExperiences] = useState([]);
  const [filter, setFilter] = useState({ company: "", role: "" });

  useEffect(() => {
    const fetchExperiences = async () => {
      const params = new URLSearchParams();
      if (filter.company) params.append("company", filter.company);
      if (filter.role) params.append("role", filter.role);
      const res = await axios.get(`http://localhost:5000/interview?${params}`);
      setExperiences(res.data);
    };
    fetchExperiences();
  }, [filter]);

  return (
    <div>
      <HeroBanner />
      <div className="px-4 max-w-6xl mx-auto">
        <SearchFilters setFilter={setFilter} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {experiences.length > 0 ? (
            experiences.map((exp) => <ExperienceCard key={exp._id} exp={exp} />)
          ) : (
            <p className="text-center text-gray-500 col-span-full">No experiences found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
