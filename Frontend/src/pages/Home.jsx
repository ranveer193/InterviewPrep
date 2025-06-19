import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ExperienceCard from "../components/ExperienceCard";
import axios from "axios";
import heroImg from "../assets/hero-img.png";
import howItWorksVideo from "../assets/how-it-works.mp4";


export default function Home() {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const res = await axios.get("http://localhost:5000/interview");
        setExperiences(res.data.slice(0, 3)); // only first 3
      } catch (err) {
        console.error("Error fetching experiences", err);
      }
    };
    fetchExperiences();
  }, []);

  return (
    <div className="text-gray-800">
      {/* Hero + About Section */}
      <section
        className="flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-12 text-white"
        style={{ background: "linear-gradient(to right, #0f172a, #000000)" }}
      >
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-5xl font-bold text-white">
            Welcome to <span className="text-blue-400">InterviewPrep</span>
          </h1>
          <p className="text-lg text-gray-300">
            InterviewPrep is a student-driven platform for sharing authentic interview experiences. Learn from real stories, discover hiring patterns, and contribute your journey to guide others.
          </p>
          <Link
            to="/login"
            className="inline-block bg-blue-400 text-black font-semibold px-6 py-2 rounded-md hover:bg-blue-900 transition"
          >
            Get Started
          </Link>
        </div>

        <div className="md:w-1/2 mt-8 md:mt-0">
          <img
            src={heroImg} 
            alt="..."
            className="w-full max-w-md mx-auto rounded-lg"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-100 bg-opacity-80 py-16 px-6 md:px-20">
        <h2 className="text-3xl font-bold text-center text-black mb-12">
          How it works
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2 space-y-6 text-black bg-gray-100 bg-opacity-80 p-6 rounded-lg shadow animate-fade-in-up">
            <div>
              <h3 className="text-xl font-semibold">Practice Interviewing</h3>
              <p>Prepare with real interview questions and answers shared by peers.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Get Helpful Feedback</h3>
              <p>See insights on difficulty, application process, salary, and more.</p>
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

      {/* Experience Cards */}
      <section className="py-16 px-6 md:px-20" style={{ background: "linear-gradient(to bottom, #0f172a, #1a1a1a)" }}>
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Real Interview Experiences
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp) => (
            <ExperienceCard key={exp._id} exp={exp} />
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 md:px-20" style={{ background: "linear-gradient(to bottom, #0f172a, #1a1a1a)" }}>
        <h2 className="text-3xl font-bold mb-12 text-white text-left">Frequently Asked Questions</h2>
        <div className="max-w-3xl text-white text-left space-y-8">
          <div>
            <h4 className="text-xl font-semibold mb-2">Who can submit experiences?</h4>
            <p>Anyone who has gone through an interview can share their journey.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-2">Are submissions moderated?</h4>
            <p>Yes, every submission is reviewed to ensure quality and relevance.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-2">Can I edit my experience later?</h4>
            <p>Currently, editing is not supported. You can delete and resubmit.</p>
          </div>
        </div>
      </section>

      {/* Animation CSS */}
      <style>
        {`
          @keyframes fade-in-up {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out both;
          }
          @keyframes drop-in {
            0% {
              opacity: 0;
              transform: translateY(-50px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-drop-in {
            animation: drop-in 0.8s ease-out both;
          }  
        `}
      </style>
    </div>
  );
}