// src/components/PostPreferenceForm.jsx
import { useState } from "react";

export default function PostPreferenceForm({ onConfirm }) {
  const [selected, setSelected] = useState("user");

  return (
    <div className="w-full sm:w-[400px] p-6 animate-fadeInUp">
      <h2 className="text-lg font-semibold text-center text-blue-600 mb-4">
        Choose Posting Preference
      </h2>

      {/* With Name */}
      <div
        onClick={() => setSelected("user")}
        className={`cursor-pointer rounded-lg border p-4 mb-3 transition-all ${
          selected === "user"
            ? "border-blue-600 bg-indigo-50"
            : "border-gray-300"
        }`}
      >
        <p className="font-medium text-blue-600">Post with your name</p>
        <ul className="text-sm text-gray-600 mt-1 list-disc pl-4">
          <li>Your profile will be visible</li>
          <li>LinkedIn link available</li>
          <li>Network-building benefits</li>
        </ul>
      </div>

      {/* Anonymous */}
      <div
        onClick={() => setSelected("anonymous")}
        className={`cursor-pointer rounded-lg border p-4 mb-4 transition-all ${
          selected === "anonymous"
            ? "border-blue-600 bg-indigo-50"
            : "border-gray-300"
        }`}
      >
        <p className="font-medium text-blue-600">Post anonymously</p>
        <ul className="text-sm text-gray-600 mt-1 list-disc pl-4">
          <li>Your identity will stay private</li>
          <li>No personal details shared</li>
        </ul>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={() => onConfirm(selected === "anonymous")}
          className="btn-primary w-full"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
