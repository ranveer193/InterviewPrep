import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminApproval = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      const res = await axios.get("http://localhost:5000/interview/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const pending = res.data.filter((exp) => !exp.approved);
      setExperiences(pending);
    } catch (err) {
      console.error("Failed to fetch pending experiences", err);
      toast.error("Failed to load pending experiences.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      await axios.patch(
        `http://localhost:5000/interview/${id}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExperiences((prev) => prev.filter((item) => item._id !== id));
      toast.success(`Experience ${action}ed successfully!`,{position:"top-center",autoClose:1500});
    } catch (err) {
      console.error(`Failed to ${action} experience`, err);
      toast.error(`Failed to ${action} experience.`,{position:"top-center",autoClose:1500});
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🛠️ Pending Interview Approvals</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : experiences.length === 0 ? (
        <p className="text-gray-500">No pending experiences.</p>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp._id}
              className="bg-white shadow p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold">{exp.name}</h2>
                <p className="text-sm text-gray-600">
                  {exp.role} at {exp.company}
                </p>
                <p className="text-xs text-gray-400">
                  Submitted: {new Date(exp.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(exp._id, "approve")}
                  className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(exp._id, "reject")}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApproval;
