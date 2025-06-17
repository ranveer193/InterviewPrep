import COMPANIES from '../constants/CompanyNames';

export default function SearchFilters({ setFilter }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded shadow-md mt-4">
      <select
        name="company"
        onChange={handleChange}
        className="border border-gray-300 rounded px-4 py-2 w-full md:w-1/3"
      >
        <option value="">All Companies</option>
        {COMPANIES.map((company) => (
          <option key={company} value={company}>
            {company}
          </option>
        ))}
      </select>

      <input
        type="text"
        name="role"
        onChange={handleChange}
        placeholder="Search by role (e.g., SDE Intern)"
        className="border border-gray-300 rounded px-4 py-2 w-full md:w-1/3"
      />
    </div>
  );
}
