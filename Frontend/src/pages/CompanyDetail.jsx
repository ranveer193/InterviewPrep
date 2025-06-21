import { useEffect, useState, useCallback } from "react";
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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCompanyExperiences = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        company: companyName,
        sort: sortBy,
        page,
        limit: pageSize,
      });
      if (difficultyFilter !== "All") params.append("difficulty", difficultyFilter);

      const res = await axios.get(`http://localhost:5000/interview?${params.toString()}`);
      const rows = res.data?.data || [];
      setExperiences(rows);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching company experiences:", err);
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  }, [companyName, sortBy, page, pageSize, difficultyFilter]);

  useEffect(() => {
    fetchCompanyExperiences();
  }, [fetchCompanyExperiences]);

  useEffect(() => {
    if (!experiences.length) return setCompanyStats(null);

    const totalUpvotes = experiences.reduce((s, r) => s + (r.upvotes || 0), 0);
    const roles = [...new Set(experiences.map(r => r.roleApplied || r.role).filter(Boolean))];
    const difficulties = [...new Set(experiences.map(r => r.difficulty).filter(Boolean))];

    setCompanyStats({
      company: companyName,
      experienceCount: experiences.length,
      totalUpvotes,
      averageUpvotes: totalUpvotes / experiences.length,
      roles,
      difficulties,
    });
  }, [experiences, companyName]);

  const handleUpvote = updatedExp => {
    setExperiences(prev =>
      prev.map(e => (e._id === updatedExp._id ? updatedExp : e))
    );
  };

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
        <Link to="/interview/company-wise" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
          <FaArrowLeft /> Back to All Companies
        </Link>

        {companyStats && <StatsCard data={companyStats} />}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h3 className="text-xl font-semibold text-blue-900">
            Experiences ({experiences.length})
          </h3>

          <div className="flex items-center gap-4">
            <Select
              label="Sort by:"
              value={sortBy}
              onChange={setSortBy}
              options={{ latest: "Latest", upvotes: "Most Upvoted" }}
            />
            <Select
              label="Difficulty:"
              value={difficultyFilter}
              onChange={(val) => {
                setDifficultyFilter(val);
                setPage(1);
              }}
              options={{ All: "All", Easy: "Easy", Medium: "Medium", Hard: "Hard" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {experiences.length ? (
            experiences.map((exp) => (
              <ExperienceCard key={exp._id} exp={exp} onUpvote={handleUpvote} />
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">
              No experiences found for the selected filters.
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
          <div>
            <label className="mr-2 font-medium">Entries per page:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1"
            >
              {[3, 6, 9, 12].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border bg-white disabled:opacity-50"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded border ${page === i + 1 ? "bg-blue-500 text-white" : "bg-white"}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border bg-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ data }) {
  return (
    <div className="bg-white border border-blue-200 rounded-2xl p-6 mb-8 shadow-sm">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">{data.company}</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Stat icon={<FaUsers />} label="Total Experiences" value={data.experienceCount} />
        <Stat icon={<FaChartLine />} label="Average Upvotes" value={data.averageUpvotes.toFixed(1)} color="text-green-600" />
        <Stat icon={<FaThumbsUp />} label="Total Upvotes" value={data.totalUpvotes} color="text-orange-600" />
        <Stat label="Different Roles" value={data.roles.length} color="text-purple-600" />
      </div>
      <BadgeList title="Roles" items={data.roles} />
      <BadgeList title="Difficulties" items={data.difficulties} colorMap={{ Easy: "green", Medium: "yellow", Hard: "red" }} />
    </div>
  );
}

function Stat({ icon, label, value, color = "text-blue-900" }) {
  return (
    <div className="text-center">
      {icon && <div className={`flex justify-center mb-1 text-2xl ${color}`}>{icon}</div>}
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

function BadgeList({ title, items, color = "blue", colorMap }) {
  if (!items.length) return null;
  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}:</h4>
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => {
          const c = colorMap ? colorMap[item] || color : color;
          return (
            <span key={i} className={`text-xs font-medium px-2 py-1 rounded-full bg-${c}-50 text-${c}-600`}>
              {item}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-blue-800 font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Object.entries(options).map(([val, txt]) => (
          <option key={val} value={val}>{txt}</option>
        ))}
      </select>
    </div>
  );
}
