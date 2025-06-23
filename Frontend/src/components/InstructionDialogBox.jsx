import React from "react";
export default function InstructionDialog({ open, onClose, totalQ, current = 0 }) {
  if (!open) return null;

  const remaining = totalQ - current;

  /* ───────── dynamic text ───────── */
  const title = "Prepare for Your Next Question";
  const body =
    remaining === 1
      ? "This is your final question. You’ll have 20 seconds to read it before recording begins automatically."
      : `You have ${remaining} questions remaining in this mock interview. For each, you’ll get 20 seconds to read the question before recording starts.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-xl animate-fade-in">
        {/* header */}
        <h2 className="text-2xl font-bold text-blue-700 mb-4">{title}</h2>

        {/* dynamic body */}
        <p className="text-gray-700 text-base leading-relaxed mb-4">{body}</p>

        {/* reminders list */}
        <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
          <li>20 seconds to read the question</li>
          <li>90 seconds to answer while recording</li>
          <li>You can preview and re-record if needed</li>
          <li>Your answers will be analyzed by AI after submission</li>
        </ul>

        {/* CTA */}
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-full transition"
        >
          Got it, begin
        </button>
      </div>
    </div>
  );
}
