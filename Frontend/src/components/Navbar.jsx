import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import Modal from "./Modal";
import Login from "../pages/Auth/Login";
import SignUp from "../pages/Auth/SignUp";
import PostPreferenceForm from "./PostPreferenceModal";
import { toast } from "react-toastify";
import useAdminStatus from "../hooks/useAdminStatus";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, loading: authLoading, logout } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminStatus();

  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  /* ------------------------------------------------------------------ */
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully", { autoClose: 1500 });
      setIsMenuOpen(false);
      navigate(location.pathname);
    } catch {
      toast.error("Logout failed. Try again.");
    }
  };

  const handlePostConfirm = (anonymous) => {
    setShowPreferenceModal(false);
    navigate(`/submit?anon=${anonymous}`);
  };

  const openAuth = (which = "login") => {
    setCurrentPage(which);
    setOpenAuthModal(true);
    setIsMenuOpen(false);
  };

  const isSubmitPage = location.pathname === "/submit";
  const isAdminPage  = location.pathname.startsWith("/admin");

  const linkBase =
    "hover:text-blue-400 transition-colors whitespace-nowrap";
  /* ------------------------------------------------------------------ */

  return (
    <>
      <nav className="bg-gray-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            InterviewPrep
          </Link>

          {/* hamburger */}
          <button
            className="text-white md:hidden"
            onClick={() => setIsMenuOpen((p) => !p)}
          >
            {isMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>

          <div
            className={`${
              isMenuOpen ? "flex" : "hidden"
            } md:flex flex-col md:flex-row md:items-center gap-3 md:gap-4 absolute md:static left-0 top-16 md:top-0 w-full md:w-auto bg-gray-900 md:bg-transparent px-4 py-3 md:p-0 z-50`}
          >
            <Link to="/" className={`${linkBase} ${isActive("/") ? "text-blue-400 font-semibold" : ""}`} onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/interview" className={`${linkBase} ${isActive("/interview") ? "text-blue-400 font-semibold" : ""}`} onClick={() => setIsMenuOpen(false)}>Experiences</Link>
            <Link to="/oa" className={`${linkBase} ${isActive("/oa") ? "text-blue-400 font-semibold" : ""}`} onClick={() => setIsMenuOpen(false)}>OA PYQs</Link>
            <Link to="/interview/company-wise" className={`${linkBase} ${isActive("/interview/company-wise") ? "text-blue-400 font-semibold" : ""}`} onClick={() => setIsMenuOpen(false)}>Company‑wise</Link>


            {!isSubmitPage && !isAdminPage && (
              <button
                onClick={() => (user ? setShowPreferenceModal(true) : openAuth("login"))}
                className="hover:text-blue-400"
              >
                Share Experience
              </button>
            )}

            {!adminLoading && isAdmin && (
              <Link to="/admin" className={linkBase} onClick={() => setIsMenuOpen(false)}>Admin</Link>
            )}

            {user ? (
              <>
                <button
                  onClick={handleLogout}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded"
                >
                  Logout
                </button>
                <span className="flex items-center gap-1 text-sm font-medium text-blue-300">
                  <FaUserCircle className="text-lg" />
                  {(user.displayName || user.email).split(" ")[0] || "User"}
                </span>
              </>
            ) : (
              <button
                onClick={() => openAuth("login")}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth modal */}
      <Modal
        isOpen={openAuthModal}
        onClose={() => {
          setOpenAuthModal(false);
          setCurrentPage("login");
        }}
        hideHeader
      >
        {currentPage === "login" ? (
          <Login  setCurrentPage={setCurrentPage} onSuccess={() => setOpenAuthModal(false)} />
        ) : (
          <SignUp setCurrentPage={setCurrentPage} onSuccess={() => setOpenAuthModal(false)} />
        )}
      </Modal>

      {/* Share‑preference modal */}
      <Modal
        isOpen={showPreferenceModal}
        onClose={() => setShowPreferenceModal(false)}
        hideHeader
      >
        <PostPreferenceForm onConfirm={handlePostConfirm} />
      </Modal>
    </>
  );
}
