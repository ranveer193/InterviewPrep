import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
} from "date-fns";
import { BsFillAlarmFill } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";

import { useAuth } from "../context/authContext";
import { useInterviewGoal } from "../hooks/useInterviewGoal";

/**
 * Renders a mini “up-coming interview” countdown.
 *
 * Props:
 *  • iconOnly  – show only the floating bell (used on Home hero)
 *  • compact   – small inline bar (e.g. navbar)
 */
export default function CountdownWidget({ iconOnly = false, compact = false }) {
  /* ------------------------------------------------------------------ */
  /* Global state                                                       */
  /* ------------------------------------------------------------------ */
  const { user, loading: authLoading } = useAuth();
  const {
    goal: goals,
    loading: goalLoading,
    removeGoal,                // still provided by the hook
  } = useInterviewGoal();

  /* Local UI state */
  const [dismissed, setDismissed] = useState(false);
  const [askDelete, setAskDelete] = useState(null);

  /* ------------------------------------------------------------------ */
  /* Guard clauses                                                      */
  /* ------------------------------------------------------------------ */
  if (
    authLoading ||               // Firebase still initialising
    !user ||                     // not logged-in
    goalLoading ||               // goal list still loading
    !goals?.length ||            // no goals at all
    dismissed                    // user hid the widget
  )
    return null;

  /* Filter & sort upcoming goals */
  const upcoming = goals
    .map((g) => ({ ...g, target: new Date(g.targetDate) }))
    .filter((g) => g.target > Date.now())
    .sort((a, b) => a.target - b.target);

  if (!upcoming.length) return null;

  /* ------------------------------------------------------------------ */
  /* 1. Icon-only badge                                                 */
  /* ------------------------------------------------------------------ */
  if (iconOnly) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Link
          to="/profile"
          className="relative flex h-14 w-14 items-center justify-center
                     rounded-full bg-blue-600 text-white shadow-lg
                     transition-transform hover:scale-105"
        >
          <BsFillAlarmFill className="text-2xl" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center
                           justify-center rounded-full bg-yellow-400
                           text-xs font-bold text-gray-900">
            {upcoming.length}
          </span>
        </Link>
      </motion.div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* 2. Compact inline bar                                              */
  /* ------------------------------------------------------------------ */
  if (compact) {
    const soon = upcoming[0];
    const days = differenceInDays(soon.target, Date.now());
    const hours = differenceInHours(soon.target, Date.now()) % 24;
    const minutes = differenceInMinutes(soon.target, Date.now()) % 60;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between rounded-xl bg-blue-600
                   px-4 py-3 text-white shadow"
      >
        <div className="flex items-center gap-3">
          <BsFillAlarmFill className="text-yellow-300" />
          <span className="font-medium">
            {days}d&nbsp;{hours}h&nbsp;{minutes}m
          </span>
        </div>

        <Link
          to="/profile"
          className="text-xs underline hover:text-yellow-200"
        >
          Details
        </Link>

        <button
          onClick={() => setDismissed(true)}
          className="ml-3 text-white/70 hover:text-white"
        >
          <IoClose />
        </button>
      </motion.div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* 3. Full list (dash-board view)                                     */
  /* ------------------------------------------------------------------ */
  const handleDelete = async (id) => {
    await removeGoal(id);
    toast.info("Interview goal removed");
    setAskDelete(null);
  };

  return (
    <div className="grid gap-6">
      {upcoming.map((goal) => {
        const { target } = goal;
        const days = differenceInDays(target, Date.now());
        const hours = differenceInHours(target, Date.now()) % 24;
        const minutes = differenceInMinutes(target, Date.now()) % 60;

        return (
          <motion.div
            key={goal._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl
                       bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700
                       p-6 text-white shadow-xl"
          >
            {/* Decorative blobs */}
            <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full
                            bg-blue-400 opacity-20 blur-2xl" />
            <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full
                            bg-purple-500 opacity-20 blur-2xl" />

            {/* Delete icon */}
            <button
              onClick={() => setAskDelete(goal._id)}
              className="absolute right-4 top-4 text-xl text-white/70 hover:text-white"
            >
              <IoClose />
            </button>

            {/* Delete confirmation dialog */}
            {askDelete === goal._id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center
                           bg-black/40 backdrop-blur-sm"
              >
                <div className="w-80 rounded-2xl bg-white/90 px-6 py-8
                                shadow-xl ring-1 ring-white/10">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center
                                  justify-center rounded-full bg-red-100">
                    <IoClose className="text-2xl text-red-600" />
                  </div>
                  <h3 className="mb-2 text-center text-lg font-semibold
                                 text-gray-800">
                    Delete this countdown?
                  </h3>
                  <p className="mb-6 text-center text-sm text-gray-600">
                    This will remove your interview goal permanently.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleDelete(goal._id)}
                      className="rounded-lg bg-red-600 px-5 py-2 text-sm
                                 font-medium text-white shadow transition
                                 hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setAskDelete(null)}
                      className="rounded-lg bg-white/80 px-5 py-2 text-sm
                                 font-medium text-gray-700 shadow transition
                                 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Main content */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/80">
                  📅 Upcoming Interview
                </p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
                  {goal.company}
                  {goal.role && (
                    <span className="text-white/80"> · {goal.role}</span>
                  )}
                </h2>
              </div>

              <Link
                to={`/interview-goal/${goal._id}`}
                className="rounded-full bg-white/10 px-3 py-1 text-xs
                           font-semibold text-white transition hover:bg-white/20"
              >
                Edit
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-4 text-xl font-bold">
              <BsFillAlarmFill className="animate-pulse text-yellow-300" />
              <div>
                ⏳ {days}d&nbsp;{hours}h&nbsp;{minutes}m&nbsp;left
              </div>
            </div>

            <p className="mt-1 text-sm text-white/70">
              Target&nbsp;Date:&nbsp;
              <span className="font-medium">{format(target, "dd MMM yyyy")}</span>
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
