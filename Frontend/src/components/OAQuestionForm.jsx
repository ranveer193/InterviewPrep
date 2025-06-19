import { useState } from "react";

const emptyQuestion = () => ({
  question: "",
  options: ["", "", "", ""],
  answer: "",
  explanation: ""
});

export default function OAQuestionForm({ isAnonymous }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [year, setYear] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (idx, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === idx ? { ...q, [field]: value } : q
      )
    );
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((opt, j) => (j === optIdx ? value : opt)) }
          : q
      )
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (idx) => {
    setQuestions((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!company || !role || !year) {
      setError("Company, role, and year are required.");
      return;
    }
    for (const q of questions) {
      if (!q.question) {
        setError("OA question is required for all questions.");
        return;
      }
    }
    setSubmitting(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setCompany("");
      setRole("");
      setYear("");
      setQuestions([emptyQuestion()]);
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-8">
      {error && <div className="text-red-600 font-medium">{error}</div>}
      {success && <div className="text-green-600 font-medium">OA question(s) submitted successfully!</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block font-semibold mb-1">Company <span className="text-red-500">*</span></label>
          <input
            type="text"
            className="input-box"
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="e.g. Amazon"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Role <span className="text-red-500">*</span></label>
          <input
            type="text"
            className="input-box"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="e.g. SDE, Analyst, etc."
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Year <span className="text-red-500">*</span></label>
          <input
            type="number"
            className="input-box"
            value={year}
            onChange={e => setYear(e.target.value)}
            placeholder="e.g. 2024"
            min="2000"
            max={new Date().getFullYear() + 1}
          />
        </div>
      </div>
      {questions.map((q, idx) => (
        <div key={idx} className="border-b pb-8 mb-8 relative bg-gray-50 rounded-lg p-4">
          {questions.length > 1 && (
            <button
              type="button"
              onClick={() => removeQuestion(idx)}
              className="absolute right-2 top-2 text-red-500 hover:underline text-xs"
            >
              Remove
            </button>
          )}
          <div>
            <label className="block font-semibold mb-1">OA Question <span className="text-red-500">*</span></label>
            <textarea
              className="input-box"
              value={q.question}
              onChange={e => handleChange(idx, "question", e.target.value)}
              placeholder="Paste the OA question here..."
              rows={3}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Options (optional)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {q.options.map((opt, optIdx) => (
                <input
                  key={optIdx}
                  type="text"
                  className="input-box"
                  value={opt}
                  onChange={e => handleOptionChange(idx, optIdx, e.target.value)}
                  placeholder={`Option ${optIdx + 1}`}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Answer</label>
            <input
              type="text"
              className="input-box"
              value={q.answer}
              onChange={e => handleChange(idx, "answer", e.target.value)}
              placeholder="Correct answer (optional)"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Explanation (optional)</label>
            <textarea
              className="input-box"
              value={q.explanation}
              onChange={e => handleChange(idx, "explanation", e.target.value)}
              placeholder="Explain the answer or add notes (optional)"
              rows={2}
            />
          </div>
        </div>
      ))}
      <div className="flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={addQuestion}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium mb-1 mr-1"
          style={{ minWidth: 0 }}
        >
          + Add Another Question
        </button>
        <div className="w-full flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold px-6 py-2 rounded-lg shadow transition-colors duration-200"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
      {isAnonymous && (
        <div className="text-xs text-gray-500 text-right">Submitted anonymously</div>
      )}
    </form>
  );
} 