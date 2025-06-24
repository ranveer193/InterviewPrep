import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";

import Modal from "./Modal";
import Login from "../pages/Auth/Login";
import SignUp from "../pages/Auth/SignUp";
import PostPreferenceForm from "./PostPreferenceModal";

import useAdminStatus from "../hooks/useAdminStatus";
import { useAuth } from "../context/AuthContext";

/* Dummy theme toggle — wire to your own context */
const toggleTheme = () => document.documentElement.classList.toggle("dark");

export default function Navbar() {
  /* ─── local ui state ─── */
  const [authModal, setAuthModal] = useState({ open: false, page: "login" });
  const [prefModal, setPrefModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  /* ─── hooks ─── */
  const { user, logout } = useAuth();
  const { isAdmin } = useAdminStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (p) => location.pathname === p;

  /* click-outside for profile panel */
  useEffect(() => {
    const onClick = (e) => {
      if (!profileRef.current?.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  /* logout */
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out", { autoClose: 1500 });
      setProfileOpen(false);
      setMobileOpen(false);
    } catch {
      toast.error("Logout failed");
    }
  };

  /* auth modal open helper */
  const openAuth = (page = "login") => setAuthModal({ open: true, page });

  /* main nav links */
  const links = [
    { to: "/", label: "Home" },
    { to: "/interview", label: "Experiences" },
    { to: "/oa", label: "OA PYQs" },
    { to: "/interview/company-wise", label: "Company-wise" },
    { to: "/ai-interview", label: "AI Interview" },
    { to: "/resume-analyzer", label: "Analyze Resume" },
  ];

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="bg-gray-900 text-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          {/* brand */}
          <Link to="/" className="text-2xl font-bold">InterviewPrep</Link>

          {/* burger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden">
            {mobileOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>

          {/* desktop links */}
          <ul className="hidden md:flex items-center gap-6">
            {links.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`transition-colors ${isActive(to) ? "text-blue-400 font-semibold" : "hover:text-blue-400"}`}
                >
                  {label}
                </Link>
              </li>
            ))}

            {/* share experience */}
            {user && (
              <li>
                <button onClick={() => setPrefModal(true)} className="hover:text-blue-400">
                  Share Experience
                </button>
              </li>
            )}

            {/* profile / auth */}
            {user ? (
              <li ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="flex items-center gap-1 text-blue-300 hover:text-white transition-colors"
                >
                  <FaUserCircle className="text-xl" />
                  {(user.displayName || user.email).split(" ")[0]}
                  {isAdmin && (
                    <span className="ml-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-sm">
                      Admin
                    </span>
                  )}
                </button>

                {/* Profile dropdown */}
                {profileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl animate-[fadeIn_0.15s_ease-out]"
                    style={{ animationName: "fadeIn" }}
                  >
                    {/* blue top bar */}
                    <div className="h-1 rounded-t-lg bg-gradient-to-r from-blue-500 to-purple-500" />

                    <div className="py-2 text-gray-800 text-sm">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 10a3 3 0 110-6 3 3 0 010 6z"/><path fillRule="evenodd" d="M.458 15.041A8 8 0 1119.541 15.04a9.956 9.956 0 01-9.541 4.709 9.956 9.956 0 01-9.54-4.708z" clipRule="evenodd"/></svg>
                        Profile
                      </Link>

                      <Link
                        to="/profile/interviews"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v1h14V5a2 2 0 00-2-2H5z"/><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm4 2a1 1 0 00-1 1v3h2v-3a1 1 0 00-1-1zm5 0a1 1 0 00-1 1v3h2v-3a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                        My Interviews
                      </Link>

                      <Link
                      to="/leaderboard"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50"
                      onClick={() => setProfileOpen(false)}
                      >
                      <svg
                      className="w-5 h-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 2a1 1 0 00-1 1v1H5a1 1 0 00-1 1v2a4 4 0 003 3.874V13H5a1 1 0 100 2h10a1 1 0 100-2h-2v-2.126A4 4 0 0016 7V5a1 1 0 00-1-1h-3V3a1 1 0 00-1-1H9zM6 5h2v2a2 2 0 01-2-2zm6 2V5h2a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Leaderboard</span>
                      </Link>

                      <Link
                        to="/interview-goal"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50"
                        onClick={() => setProfileOpen(false)}
                      >
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6 2a1 1 0 00-1 1v1h10V3a1 1 0 00-1-1H6z" />
                      <path d="M4 6h12v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm3 3a1 1 0 000 2h6a1 1 0 000-2H7z" />
                      </svg>
                            Schedule Interview
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50"
                          onClick={() => setProfileOpen(false)}
                        >
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 00-1 1v2h2V3h2v2h2V3h2v2h2V3a1 1 0 00-1-1H6z"/><path fillRule="evenodd" d="M4 7a2 2 0 012-2h8a2 2 0 012 2v9a2 2 0 01-2 2h-2l-2 2-2-2H6a2 2 0 01-2-2V7zm3 2a1 1 0 100 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h5a1 1 0 100-2H7z" clipRule="evenodd"/></svg>
                          Admin Panel
                        </Link>
                      )}

                      <div className="border-t border-gray-200 my-2" />

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ) : (
              <li>
                <button
                  onClick={() => openAuth("login")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-semibold transition"
                >
                  Login / Sign Up
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-900 text-white shadow-inner px-4 py-4 space-y-4">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`block ${isActive(to) ? "text-blue-400 font-semibold" : "hover:text-blue-400"}`}
            >
              {label}
            </Link>
          ))}

          {user && (
            <button onClick={() => { setPrefModal(true); setMobileOpen(false); }} className="block text-left w-full hover:text-blue-400">
              Share Experience
            </button>
          )}

          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileOpen(false)} className="hover:text-blue-400 block">Admin</Link>
          )}

          <div className="border-t border-gray-700 pt-4">
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="block hover:text-blue-400">Profile</Link>
                <button onClick={handleLogout} className="block w-full text-left hover:text-blue-400">Logout</button>
              </>
            ) : (
              <button
                onClick={() => { openAuth("login"); setMobileOpen(false); }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-semibold"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      <Modal
        isOpen={authModal.open}
        onClose={() => setAuthModal({ ...authModal, open: false })}
        hideHeader
      >
        {authModal.page === "login" ? (
          <Login setCurrentPage={(p) => setAuthModal({ open: true, page: p })} onSuccess={() => setAuthModal({ open: false, page: "login" })} />
        ) : (
          <SignUp setCurrentPage={(p) => setAuthModal({ open: true, page: p })} onSuccess={() => setAuthModal({ open: false, page: "login" })} />
        )}
      </Modal>

      {/* SHARE PREFERENCE MODAL */}
      <Modal
        isOpen={prefModal}
        onClose={() => setPrefModal(false)}
        hideHeader
      >
        <PostPreferenceForm onConfirm={(anon) => { setPrefModal(false); navigate(`/submit?anon=${anon}`); }} />
      </Modal>
    </>
  );
}
