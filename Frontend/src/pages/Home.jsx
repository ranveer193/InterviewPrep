import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ExperienceCard from "../components/ExperienceCard";
import axios from "axios";
import heroImg from "../assets/hero-img.png";
import howItWorksVideo from "../assets/hero-video.mp4";
import Modal from "../components/Modal";
import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import AIInterviewCard from "../components/AIInterviewCard";
import { useAuth } from "../context/authContext";
import CountdownWidget from "../components/CountdownWidget"; // ✅ OK
import { useInterviewGoal } from "../hooks/useInterviewGoal"; // ✅ ADD THIS

export default function Home() {
  const [experiences, setExperiences] = useState([]);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");
  const { user, loading: authLoading } = useAuth(); // ✅ include auth loading
  const { goal, loading: goalLoading } = useInterviewGoal(); // ✅ load goal if needed

  useEffect(() => {
    axios
      .get("https://interviewprep-backend-5os4.onrender.com/interview?limit=3&sort=latest")
      .then((res) =>
        setExperiences(res.data.data || res.data.slice?.(0, 3) || [])
      )
      .catch((err) => console.error("Error fetching experiences", err));
  }, []);

  const handleGetStarted = () => {
    if (user) toast.info("You're already logged in ✨", { autoClose: 2000 });
    else setOpenAuthModal(true);
  };

  /* ------------------------------------------------------------------ */
  return (
    <div className="text-gray-800">
      {/* ✅ Only show CountdownWidget if user is logged in and goal is present */}
      {user && !goalLoading && goal && (
        <CountdownWidget iconOnly />
      )}

      {/* hero */}
      <section
        className="flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-6 text-white"
        style={{ background: "linear-gradient(to right, #0f172a, #000000)" }}
      >
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-5xl font-bold text-white">
            Welcome to <span className="text-blue-400">InterviewPrep</span>
          </h1>
          <p className="text-lg text-gray-300">
            A student‑driven platform for sharing authentic interview
            experiences. Learn from real stories, discover hiring patterns, and
            contribute your journey.
          </p>

          <button
            onClick={handleGetStarted}
            className="inline-block bg-blue-400 text-black font-semibold px-6 py-2 rounded-md hover:bg-blue-900 transition"
          >
            Get Started
          </button>
        </div>

        <div className="md:w-1/2 mt-8 md:mt-0">
          <img
            src={heroImg}
            alt="Interview illustration"
            className="w-full max-w-md mx-auto rounded-lg"
          />
        </div>
      </section>

      {/* how it works */}
      <section className="bg-white-300 bg-opacity-80 py-16 px-6 md:px-20">
        <h1 className="text-5xl font-bold text-center text-black mb-12">
          How it works!
        </h1>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2 space-y-6 text-white bg-black bg-opacity-80 p-14 rounded-lg shadow animate-fade-in-up">
            <div>
              <h3 className="text-xl font-semibold">Practice Interviewing</h3>
              <p>
                Prepare with real questions and answers shared by peers.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Get Helpful Feedback</h3>
              <p>
                See insights on difficulty, application process, salary, and
                more.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Improve Your Skills</h3>
              <p>Use shared experiences to refine your strategy.</p>
            </div>
          </div>

          <video className="md:w-1/2 rounded-lg shadow-lg" controls>
            <source src={howItWorksVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      {/* AI Interview Card */}
      <div className="mb-8">
        <AIInterviewCard />
      </div>
            

      {/* recent experiences */}
      <section
        className="py-16 px-6 md:px-20"
        style={{ background: "linear-gradient(to bottom, #0f172a, #1a1a1a)" }}
      >
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Recent Interview Experiences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.length ? (
            experiences.map((exp) => (
              <ExperienceCard key={exp._id} exp={exp} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-400">Loading…</p>
          )}
        </div>

        <div className="flex justify-center mt-10">
          <Link
            to="/interview"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg"
          >
            View All Experiences
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="py-16 px-6 md:px-20"
        style={{ background: "linear-gradient(to bottom, #0f172a, #1a1a1a)" }}
      >
        <h2 className="text-3xl font-bold mb-12 text-white text-left">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl text-white text-left space-y-8">
          <div>
            <h4 className="text-xl font-semibold mb-2">
              Who can submit experiences?
            </h4>
            <p>
              Anyone who has gone through an interview can share their journey.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-2">
              Are submissions moderated?
            </h4>
            <p>
              Yes, every submission is reviewed to ensure quality and relevance.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-2">
              Can I edit my experience later?
            </h4>
            <p>
              Currently, editing is not supported. You can delete and resubmit.
            </p>
          </div>
        </div>
      </section>

      {/* auth modal */}
      <Modal
        isOpen={openAuthModal}
        onClose={() => {
          setOpenAuthModal(false);
          setCurrentPage("login");
        }}
        hideHeader
      >
        {currentPage === "login" ? (
          <Login
            setCurrentPage={setCurrentPage}
            onSuccess={() => setOpenAuthModal(false)}
          />
        ) : (
          <SignUp
            setCurrentPage={setCurrentPage}
            onSuccess={() => setOpenAuthModal(false)}
          />
        )}
      </Modal>

      {/* fade‑in utility */}
      <style>{`
        @keyframes fade-in-up {
          0%   { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0);    }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out both; }
      `}</style>
    </div>
  );
}
