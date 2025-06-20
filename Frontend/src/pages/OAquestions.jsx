import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import Modal from "../components/Modal";
import OAQuestionForm from "../components/OAQuestionForm";
import axios from "axios";

import "react-toastify/dist/ReactToastify.css";

import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import { useAuth } from "../context/AuthContext";

export default function OAquestions() {
  const [companyList, setCompanyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Companies");

  const [formOpen, setFormOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authPage, setAuthPage] = useState("login");

  const navigate = useNavigate();
  const { user } = useAuth();

  /* fetch list */
  useEffect(() => {
    axios
      .get("http://localhost:5000/oa/companies")
      .then((res) => setCompanyList(res.data))
      .catch((err) => setError(err.message ?? "Something went wrong"))
      .finally(() => setLoading(false));
  }, []);

  const handleAddClick = () => (user ? setFormOpen(true) : setAuthOpen(true));

  /* search + filter */
  const filtered = companyList.filter((c) => {
    const matchesSearch = c.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter =
      activeFilter === "All Companies" || c === activeFilter;
    return matchesSearch && matchesFilter;
  });

  /* ------------------------------------------------------------------ */
  return (
    <div className="max-w-6xl mx-auto p-6 relative">
      {/* floating add */}
      <button
        onClick={handleAddClick}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
        title="Submit OA question"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* OA form modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          axios
            .get("http://localhost:5000/oa/companies")
            .then((res) => setCompanyList(res.data))
            .catch(() => {});
        }}
      >
        <OAQuestionForm
          onClose={() => {
            setFormOpen(false);
            axios
              .get("http://localhost:5000/oa/companies")
              .then((res) => setCompanyList(res.data))
              .catch(() => {});
          }}
          isAnonymous={false}
        />
      </Modal>

      {/* login / signup modal */}
      <Modal
        isOpen={authOpen}
        onClose={() => {
          setAuthOpen(false);
          setAuthPage("login");
        }}
        hideHeader
      >
        {authPage === "login" ? (
          <Login
            setCurrentPage={setAuthPage}
            onSuccess={() => {
              setAuthOpen(false);
              setFormOpen(true);
            }}
          />
        ) : (
          <SignUp
            setCurrentPage={setAuthPage}
            onSuccess={() => {
              setAuthOpen(false);
              setFormOpen(true);
            }}
          />
        )}
      </Modal>

      {/* back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-3xl font-bold text-blue-800 mb-4 text-center">
        OA Questions by Company
      </h1>

      {/* search */}
      <div className="relative mb-5">
        <input
          className="w-full p-4 pl-12 rounded-full border border-blue-200 shadow-sm focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Search by company name…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["All Companies", ...companyList].map((c) => (
          <button
            key={c}
            onClick={() => setActiveFilter(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              activeFilter === c
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* list */}
      {loading ? (
        <p className="text-center text-gray-500">Loading…</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length ? (
            filtered.map((company) => (
              <div
                key={company}
                onClick={() =>
                  navigate(`/oa/${encodeURIComponent(company)}`)
                }
                className="cursor-pointer border border-blue-200 rounded-xl p-6 bg-white shadow hover:shadow-lg"
              >
                <h2 className="text-xl font-semibold text-blue-700">
                  {company}
                </h2>
                <p className="text-sm text-gray-600">
                  Click to view OA questions
                </p>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No companies found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
