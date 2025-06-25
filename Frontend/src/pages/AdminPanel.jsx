import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminApproval = () => {
  const [experiences, setExperiences] = useState([]);
  const [oaQuestions, setOaQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      const [interviewRes, oaRes] = await Promise.all([
        axios.get("https://interviewprep-backend-5os4.onrender.com/interview/all", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://interviewprep-backend-5os4.onrender.com/oa/all", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setExperiences(interviewRes.data.filter((exp) => !exp.approved));
      setOaQuestions(oaRes.data.filter((q) => !q.approved));
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type, id, action) => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      await axios.patch(
        `https://interviewprep-backend-5os4.onrender.com/${type}/${id}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (type === "interview") {
        setExperiences((prev) => prev.filter((item) => item._id !== id));
      } else {
        setOaQuestions((prev) => prev.filter((item) => item._id !== id));
      }

      toast.success(`${type === "interview" ? "Experience" : "OA Question"} ${action}ed successfully!`, { position: "top-center", autoClose: 1500 });
    } catch (err) {
      console.error(`Failed to ${action} ${type}`, err);
      toast.error(`Failed to ${action} ${type}.`, { position: "top-center", autoClose: 1500 });
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <section>
        <h1 className="text-2xl font-bold mb-4">🛠️ Pending Interview Approvals</h1>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : experiences.length === 0 ? (
          <p className="text-gray-500">No pending interviews.</p>
        ) : (
          <div className="grid gap-4">
            {experiences.map((exp) => (
              <div key={exp._id} className="bg-white shadow p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{exp.name}</h2>
                  <p className="text-sm text-gray-600">{exp.role} at {exp.company}</p>
                  <p className="text-xs text-gray-400">Submitted: {new Date(exp.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction("interview", exp._id, "approve")} className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition">Approve</button>
                  <button onClick={() => handleAction("interview", exp._id, "reject")} className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h1 className="text-2xl font-bold mb-4">📄 Pending OA Question Approvals</h1>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : oaQuestions.length === 0 ? (
          <p className="text-gray-500">No pending OA questions.</p>
        ) : (
          <div className="grid gap-4">
            {oaQuestions.map((q) => (
              <div key={q._id} className="bg-white shadow p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{q.question}</h2>
                  <p className="text-sm text-gray-600">{q.company}</p>
                  <p className="text-xs text-gray-400">Submitted: {new Date(q.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction("oa", q._id, "approve")} className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition">Approve</button>
                  <button onClick={() => handleAction("oa", q._id, "reject")} className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminApproval;