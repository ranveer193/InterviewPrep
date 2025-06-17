import { useState } from "react";
import axios from "axios";

export default function ExperienceForm() {
  const [form, setForm] = useState({
    name: "", company: "", role: "", difficulty: "", content: ""
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/interview", form);
      alert("Experience submitted for review!");
      setForm({ name: "", company: "", role: "", difficulty: "", content: "" });
    } catch (err) {
      alert("Error submitting. Try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded-lg max-w-2xl mx-auto mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required
                 className="w-full px-3 py-2 border border-gray-300 rounded" />
        </div>
        <div>
          <label className="block font-medium mb-1">Company</label>
          <input name="company" value={form.company} onChange={handleChange} required
                 className="w-full px-3 py-2 border border-gray-300 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block font-medium mb-1">Role</label>
          <input name="role" value={form.role} onChange={handleChange} required
                 className="w-full px-3 py-2 border border-gray-300 rounded" />
        </div>
        <div>
          <label className="block font-medium mb-1">Difficulty</label>
          <select name="difficulty" value={form.difficulty} onChange={handleChange} required
                  className="w-full px-3 py-2 border border-gray-300 rounded">
            <option value="">Select...</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="block font-medium mb-1">Interview Details</label>
        <textarea name="content" value={form.content} onChange={handleChange} required
                  className="w-full px-3 py-2 border border-gray-300 rounded h-32 resize-none" />
      </div>

      <button type="submit"
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
        Submit
      </button>
    </form>
  );
}
