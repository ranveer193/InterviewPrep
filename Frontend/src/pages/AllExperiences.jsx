import { useEffect, useState, useCallback } from "react";
import { cachedGet } from "../services/api";
import HeroBanner from "../components/HeroBanner";
import ExperienceCard from "../components/ExperienceCard";
import SearchFilters from "../components/FilterTabs";
import DifficultyFilter from "../components/DifficultyFilter";

export default function Home() {
  const [experiences, setExperiences] = useState([]);
  const [filter, setFilter] = useState({ company: "", role: "", difficulty: "" });
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const fetchExperiences = useCallback(async () => {
    const params = new URLSearchParams();
    if (filter.company) params.append("company", filter.company);
    if (filter.role) params.append("role", filter.role);
    if (filter.difficulty) params.append("difficulty", filter.difficulty);
    params.append("sort", sortBy);
    params.append("page", page);
    params.append("limit", pageSize);

    try {
      const res = await cachedGet(`/interview?${params.toString()}`);
      setExperiences(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch experiences", err);
    }
  }, [filter, sortBy, page, pageSize]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const handlePrev = useCallback(() => setPage((p) => Math.max(p - 1, 1)), []);
  const handleNext = useCallback(() => setPage((p) => Math.min(p + 1, totalPages)), [totalPages]);
  const handlePageSizeChange = useCallback((e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  }, []);
  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, []);

  return (
    <div>
      <HeroBanner />
      <div className="px-4 max-w-6xl mx-auto">
        <SearchFilters setFilter={setFilter} />

        <DifficultyFilter current={filter.difficulty} setFilter={setFilter} />

        <div className="flex justify-end my-4">
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md"
          >
            <option value="latest">Sort by: Latest</option>
            <option value="upvotes">Sort by: Upvotes</option>
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {experiences.length ? (
            experiences.map((exp) => <ExperienceCard key={exp._id} exp={exp} />)
          ) : (
            <p className="text-center text-gray-500 col-span-full">No experiences found.</p>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
          <div>
            <label className="mr-2 font-medium">Entries per page:</label>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="border border-gray-300 rounded px-2 py-1"
            >
              {[3, 6, 9, 12].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="px-3 py-1 rounded border bg-white disabled:opacity-50"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setPage(idx + 1)}
                className={`px-3 py-1 rounded border ${
                  page === idx + 1 ? "bg-blue-500 text-white" : "bg-white"
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={handleNext}
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
