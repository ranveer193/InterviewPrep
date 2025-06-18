import { useState } from "react";
import axios from "axios";

/* ── Step labels (progress bar) ───────────────── */
const STEPS = ["Personal Info", "Company Details", "Rounds", "Feedback"];

/* ── Dropdown options matching enum lists ─────── */
const TIMELINE_OPTIONS = ["≤ 1 week", "2 weeks", "3 weeks", "1 month", "> 1 month"];
const APPLY_OPTIONS = ["Referral", "On-Campus", "Off-Campus", "Other"]; // matches schema enum

/* ── Regex helpers ─────────────────────────────── */
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;
const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/;

/* ── Blank template (for reset) ────────────────── */
const EMPTY_FORM = {
  /* step‑0 */
  name: "",
  email: "",
  experience: "0–1 years",
  role: "",
  linkedin: "",
  /* step‑1 */
  company: "",
  roleApplied: "",
  difficulty: "",
  mode: "",
  applicationMode: "",
  timeline: "",
  salary: "",
  /* step‑2 */
  rounds: [{ name: "", duration: "", mode: "", codingProblems: 0, description: "" }],
  /* step‑3 */
  result: "",
  tips: "",
  advice: "",
  content: "",
};

export default function InterviewExperienceForm() {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(EMPTY_FORM);

  const input =
    "w-full px-4 py-2 border border-gray-300 rounded focus:outline-blue-400";

  /* ── Validation per step ────────────────────── */
  const validateStep = () => {
    const err = {};

    if (step === 0) {
      if (!form.name.trim()) err.name = "Required";
      if (!emailRegex.test(form.email)) err.email = "Invalid email";
      if (!form.linkedin.trim()) err.linkedin = "Required";
      else if (!linkedinRegex.test(form.linkedin)) err.linkedin = "Invalid LinkedIn URL";
    }

    if (step === 1) {
      if (!form.company.trim()) err.company = "Required";
      if (!form.roleApplied.trim()) err.roleApplied = "Required";
      if (!form.difficulty) err.difficulty = "Choose difficulty";
      if (!form.applicationMode) err.applicationMode = "Select source";
      if (!form.timeline) err.timeline = "Select timeline";
    }

    if (step === 2) {
      if (form.rounds.length === 0) err.rounds = "Add at least one round";
      form.rounds.forEach((r, i) => {
        if (!r.name.trim()) err[`round-${i}-name`] = "Name required";
        if (!r.description.trim()) err[`round-${i}-description`] = "Description required";
      });
    }

    if (step === 3 && !form.result.trim()) err.result = "Required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* ── Generic field setter ───────────────────── */
  const setField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  /* ── Round field setter (handles number) ────── */
  const setRoundField = (idx, key, val) => {
    const rounds = [...form.rounds];
    rounds[idx][key] = key === "codingProblems" ? Number(val) : val;
    setForm({ ...form, rounds });
  };

  const addRound = () =>
    setForm({
      ...form,
      rounds: [...form.rounds, { name: "", duration: "", mode: "", codingProblems: 0, description: "" }],
    });

  /* ── Unified form submit handler ────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // If we're NOT on the last step, just validate and move forward
    if (step < STEPS.length - 1) {
      if (validateStep()) setStep((s) => s + 1);
      return; // Stop here; don't post to backend yet
    }

    // Final step: validate once more, then post
    if (!validateStep()) return;

    const payload = {
      ...form,
      preparationTips: form.tips ? form.tips.split("\n").filter(Boolean) : [],
      generalAdvice: form.advice ? form.advice.split("\n").filter(Boolean) : [],
    };

    // remove fields not in schema
    delete payload.tips;
    delete payload.advice;
    delete payload.result; // result not defined in schema (keep if you add)

    await axios.post("http://localhost:5000/interview", payload);
    alert("Submitted!");

    // Reset form
    setForm(EMPTY_FORM);
    setStep(0);
    setErrors({});
  };

  /* ── JSX ────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 space-y-8">
      {/* step bar */}
      <div className="relative flex items-center justify-between mb-8 px-4">
        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-300" />
        <div
          className="absolute top-4 left-0 h-1 bg-blue-600 transition-all"
          style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((lbl, idx) => (
          <div key={idx} className="relative flex flex-col items-center w-1/4 z-10">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold border-2 ${
                idx < step
                  ? "bg-blue-600 text-white border-blue-600"
                  : idx === step
                  ? "bg-white text-blue-600 border-blue-600"
                  : "bg-gray-200 text-gray-500 border-gray-300"
              }`}
            >
              {idx < step ? "✓" : idx + 1}
            </div>
            <p
              className={`text-xs mt-1 ${
                idx === step ? "text-blue-600 font-semibold"
                : idx < step ? "text-blue-500"
                : "text-gray-400"
              }`}
            >
              {lbl}
            </p>
          </div>
        ))}
      </div>

      {/* STEP 0 */}
      {step === 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <input name="name" placeholder="Full Name" value={form.name} onChange={setField} className={input} />
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>
          <div>
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={setField} className={input} />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          <select name="experience" value={form.experience} onChange={setField} className={input}>
            <option>0–1 years</option><option>1–2 years</option><option>2+ years</option>
          </select>

          <input name="role" placeholder="Current Role" value={form.role} onChange={setField} className={input} />

          <input
            name="linkedin"
            type="url"
            placeholder="LinkedIn URL"
            value={form.linkedin}
            onChange={setField}
            pattern="https?://(www\.)?linkedin\.com/.*"
            required
            className={`${input} md:col-span-2`}
          />
          {errors.linkedin && <p className="text-red-500 text-xs">{errors.linkedin}</p>}
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div className="grid gap-4 md:grid-cols-2">
          <input name="company" placeholder="Company" value={form.company} onChange={setField} className={input} />
          {errors.company && <p className="text-red-500 text-xs">{errors.company}</p>}

          <input
            name="roleApplied"
            placeholder="Role Applied"
            value={form.roleApplied}
            onChange={setField}
            className={input}
          />
          {errors.roleApplied && <p className="text-red-500 text-xs">{errors.roleApplied}</p>}

          <select name="difficulty" value={form.difficulty} onChange={setField} className={input}>
            <option value="">Difficulty</option><option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
          {errors.difficulty && <p className="text-red-500 text-xs md:col-span-2">{errors.difficulty}</p>}

          <select name="mode" value={form.mode} onChange={setField} className={input}>
            <option value="">Interview Mode</option><option>Online</option><option>Offline</option>
          </select>

          <select name="applicationMode" value={form.applicationMode} onChange={setField} className={input}>
            <option value="">Applied Via</option>
            {APPLY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
          {errors.applicationMode && <p className="text-red-500 text-xs">{errors.applicationMode}</p>}

          <select name="timeline" value={form.timeline} onChange={setField} className={input}>
            <option value="">Interview Timeline</option>
            {TIMELINE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
          {errors.timeline && <p className="text-red-500 text-xs">{errors.timeline}</p>}

          <input name="salary" placeholder="Salary (e.g. 12 LPA)" value={form.salary} onChange={setField} className={input} />
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          {form.rounds.map((r, i) => (
            <div key={i} className="border border-gray-300 rounded p-4 mb-4 space-y-3">
              <h4 className="font-semibold text-blue-600">Round {i + 1}</h4>

              <input placeholder="Round Name" value={r.name} onChange={(e) => setRoundField(i, "name", e.target.value)} className={input} />
              {errors[`round-${i}-name`] && <p className="text-red-500 text-xs">{errors[`round-${i}-name`]}</p>}

              <div className="grid gap-4 md:grid-cols-2">
                <input placeholder="Duration (e.g. 45 min)" value={r.duration} onChange={(e) => setRoundField(i, "duration", e.target.value)} className={input} />
                <select value={r.mode} onChange={(e) => setRoundField(i, "mode", e.target.value)} className="bg-white text-black border rounded p-2 w-full">
                  <option value="">Select Mode</option><option>Online</option><option>Offline</option><option>Hybrid</option>
                </select>
                <input
                  type="number"
                  placeholder="Coding Problems"
                  value={r.codingProblems}
                  onChange={(e) => setRoundField(i, "codingProblems", e.target.value)}
                  className={input}
                />
              </div>

              <textarea placeholder="Description" value={r.description} onChange={(e) => setRoundField(i, "description", e.target.value)} className={`${input} h-24`} />
              {errors[`round-${i}-description`] && <p className="text-red-500 text-xs">{errors[`round-${i}-description`]}</p>}
            </div>
          ))}
          {errors.rounds && <p className="text-red-500 text-xs">{errors.rounds}</p>}
          <button type="button" onClick={addRound} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            + Add Another Round
          </button>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="grid gap-4">
          <input name="result" placeholder="Result (Selected / Rejected)" value={form.result} onChange={setField} className={input} />
          {errors.result && <p className="text-red-500 text-xs">{errors.result}</p>}

          <textarea name="content" placeholder="Additional Content (optional)" value={form.content} onChange={setField} className={`${input} h-20`} />

          <textarea name="tips" placeholder="Preparation Tips (one per line)" value={form.tips} onChange={setField} className={`${input} h-20`} />

          <textarea name="advice" placeholder="General Advice (one per line)" value={form.advice} onChange={setField} className={`${input} h-20`} />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="px-5 py-2 border rounded border-gray-400 hover:bg-gray-100">
            Back
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button type="submit" className="ml-auto px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Next
          </button>
        ) : (
          <button type="submit" className="ml-auto px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Submit
          </button>
        )}
      </div>
    </form>
  );
}