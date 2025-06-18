import { FaThumbsUp } from "react-icons/fa";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function ExperienceCard({ exp }) {
  const [upvotes, setUpvotes] = useState(exp.upvotes);
  const [isUpvoted, setIsUpvoted] = useState(false);

  const handleUpvote = async (e) => {
    e.stopPropagation(); 
    e.preventDefault(); 

    if (isUpvoted) return;
    try {
      const res = await axios.patch(`http://localhost:5000/interview/${exp._id}/upvote`);
      setUpvotes(res.data.upvotes);
      setIsUpvoted(true); 
    } catch (err) {
      console.error("Failed to upvote", err);
    }
  };

  return (
    <Link to={`/interview/${exp._id}`} className="block">
      <div className="bg-gradient-to-br from-indigo-700 to-purple-800 p-4 rounded-lg text-white shadow-lg hover:shadow-2xl transition duration-300">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{exp.company} | {exp.role}</h3>
            <div className="flex gap-2 text-sm mt-1 flex-wrap">
              <span className="bg-white/10 px-2 py-1 rounded">{exp.difficulty}</span>
              <span className="bg-white/10 px-2 py-1 rounded">
                {exp.content?.slice(0, 50)}...
              </span>
            </div>
          </div>
          <button
            onClick={handleUpvote}
            className="flex items-center gap-1 text-sm bg-white/10 px-2 py-1 rounded hover:bg-gray-600 disabled:opacity-50"
            disabled={isUpvoted}
          >
            <FaThumbsUp /> {upvotes}
          </button>
        </div>
      </div>
    </Link>
  );
}
