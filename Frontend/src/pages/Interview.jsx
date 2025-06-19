import { useEffect, useState } from "react";
import axios from "axios";
import HeroBanner from "../components/HeroBanner";
import CompanyCard from "../components/CompanyCard";

export default function Interview() {
  const [experiences, setExperiences] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All Companies");
  const [sortBy, setSortBy] = useState("latest");
  const [searchText, setSearchText] = useState("");
  const [page] = useState(1);
  const [limit] = useState(1000); // Increase if necessary

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        sort: sortBy,
        page,
        limit,
      }).toString();

      const res = await axios.get(`http://localhost:5000/interview?${params}`);
      const rows = Array.isArray(res.data) ? res.data : res.data.data;

      setExperiences(rows);
      setCompanies([...new Set(rows.map((item) => item.company.trim()))]);
    } catch (error) {
      console.error("Error fetching experiences:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sortBy]);

  const groupExperiencesByCompany = () => {
    const grouped = {};

    experiences.forEach((exp) => {
      const company = exp.company.trim();
      if (!grouped[company]) {
        grouped[company] = {
          company,
          experiences: [],
          totalUpvotes: 0,
          roles: new Set(),
        };
      }

      grouped[company].experiences.push(exp);
      grouped[company].totalUpvotes += exp.upvotes || 0;
      if (exp.roleApplied || exp.role) {
        grouped[company].roles.add(exp.roleApplied || exp.role);
      }
    });

    return Object.values(grouped).map((companyData) => ({
      ...companyData,
      experienceCount: companyData.experiences.length,
      averageUpvotes: companyData.totalUpvotes / companyData.experiences.length,
      roles: Array.from(companyData.roles),
    }));
  };

  const companyData = groupExperiencesByCompany();

  const filteredCompanyData = companyData.filter((company) => {
    const matchesCompany =
      activeFilter === "All Companies" || company.company === activeFilter;
    const matchesSearch = company.company
      .toLowerCase()
      .includes(searchText.toLowerCase());

    return matchesCompany && matchesSearch;
  });

  return (
    <div>
      <HeroBanner
        title="Interview Experiences"
        subtitle="From NIT KKR to top companies—real interviews, real experiences."
      />

      <div className="px-4 max-w-6xl mx-auto py-8">
        <h2 className="text-2xl font-semibold text-blue-900 mb-1">Companies</h2>
        <p className="text-sm text-blue-700 mb-5">
          Real experiences from real candidates grouped by company
        </p>

        {/* Search Input */}
        <div className="relative mb-5">
          <input
            type="text"
            placeholder="Search by company name..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full p-4 pl-12 rounded-full border border-blue-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all duration-200"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

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

        {/* Sort Filter */}
        <div className="flex items-center gap-2 mb-4">
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

        {/* Company Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanyData.length > 0 ? (
            filteredCompanyData.map((company) => (
              <CompanyCard key={company.company} companyData={company} />
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">
              No companies found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}