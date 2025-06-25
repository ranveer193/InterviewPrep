import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInterviewGoal } from "../hooks/useInterviewGoal";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function InterviewGoal() {
  const { id } = useParams();               // present when editing
  const navigate = useNavigate();

  // ✅ latest hook – returns single goal doc + CRUD helpers
  const { getGoal, saveGoal, updateGoal, saving } = useInterviewGoal();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [loadingGoal, setLoadingGoal] = useState(!!id); // only true if editing
  const hasReset = useRef(false);

  /* -------------------------------------------------- */
  /* Load goal details when editing                     */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const goal = await getGoal(id);     // ⬅️  returns single object
        if (goal && !hasReset.current) {
          reset({
            company: goal.company,
            role: goal.role ?? "",
            targetDate: goal.targetDate?.split("T")[0] ?? "",
          });
          hasReset.current = true;
        }
      } catch {
        toast.error("Failed to load interview goal");
      } finally {
        setLoadingGoal(false);
      }
    })();
  }, [id, getGoal, reset]);

  /* -------------------------------------------------- */
  /* Submit                                             */
  /* -------------------------------------------------- */
  const onSubmit = async (values) => {
    if (!values.company || !values.targetDate) {
      toast.error("Company and interview date are required.");
      return;
    }

    const payload = {
      ...values,
      targetDate: new Date(values.targetDate).toISOString(),
    };

    try {
      if (id) {
        await updateGoal(id, payload);
        toast.success("Interview goal updated!");
      } else {
        await saveGoal(payload);
        toast.success("Interview goal saved!");
      }
      navigate("/profile");
    } catch {
      toast.error("Failed to save goal. Please try again.");
    }
  };

  /* -------------------------------------------------- */
  /* UI                                                 */
  /* -------------------------------------------------- */
  if (loadingGoal) return <div className="mt-10 text-center">Loading goal…</div>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl"
      >
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          {id ? "Update Your Interview Goal" : "Schedule an Interview Goal"}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Company */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Company
            </label>
            <input
              {...register("company", { required: true })}
              className={`w-full rounded-xl border px-3 py-2 outline-none ${
                errors.company ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g. Amazon"
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Role (optional)
            </label>
            <input
              {...register("role")}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none"
              placeholder="e.g. SDE-1"
            />
          </div>

          {/* Interview date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Interview Date
            </label>
            <input
              {...register("targetDate", { required: true })}
              type="date"
              className={`w-full rounded-xl border px-3 py-2 outline-none ${
                errors.targetDate ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={saving}      // 🆕 clear name
            className="mt-4 w-full rounded-xl bg-indigo-600 py-3 text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {id ? "Update Goal" : "Save Goal"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}