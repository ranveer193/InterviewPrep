import React from "react";
import CountdownWidget from "../components/CountdownWidget";
import { motion } from "framer-motion";

export default function Profile() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-10 px-6 md:px-10 lg:px-16"
    >
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">🎯 Your Profile</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Interview Countdown</h2>
        <CountdownWidget />
      </section>
    </motion.div>
  );
}
