import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import Modal from "./Modal";
import Login from "../pages/Auth/Login";
import SignUp from "../pages/Auth/SignUp";
import PostPreferenceForm from "./PostPreferenceModal";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import useAdminStatus from "../hooks/useAdminStatus";

export default function Navbar() {
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");
  const [user, setUser] = useState(null);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAdmin, loading } = useAdminStatus();

  const navigate = useNavigate();
  const location = useLocation();

  /* track firebase user */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (cur) => setUser(cur ?? null));
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
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

  /* shared link / button styling */
  const linkBase =
    "hover:text-blue-400 transition-colors whitespace-nowrap";

  return (
    <>
      <nav className="bg-gray-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            InterviewPrep
          </Link>

          {/* mobile hamburger */}
          <button
            className="text-white md:hidden"
            onClick={() => setIsMenuOpen((p) => !p)}
          >
            {isMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>

          {/* Menu container */}
          <div
            className={`${
              isMenuOpen ? "flex" : "hidden"
            } md:flex flex-col md:flex-row md:items-center gap-3 md:gap-4 absolute md:static left-0 top-16 md:top-0 w-full md:w-auto bg-gray-900 md:bg-transparent px-4 py-3 md:p-0 z-50`}
          >
            <Link to="/" className={linkBase} onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>

            <Link
              to="/interview"
              className={linkBase}
              onClick={() => setIsMenuOpen(false)}
            >
              Experiences
            </Link>

          <Link to="/oa" className="hover:text-blue-400">
              OA PYQs
          </Link>
          
            <Link
              to="/interview/company-wise"
              className={linkBase}
              onClick={() => setIsMenuOpen(false)}
            >
              Company‑wise
            </Link>

            {!isSubmitPage && !isAdminPage && (
              <button
                className={linkBase + " text-left"}
                onClick={() =>
                  user ? setShowPreferenceModal(true) : openAuth("login")
                }
              >
                Share Experience
              </button>
            )}

            {!loading && isAdmin && (
              <Link
                to="/admin"
                className={linkBase}
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}

            {/* Auth section */}
            {user ? (
              <>
                {/* logout first (keeps order), then avatar/name */}
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
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <Modal
        isOpen={openAuthModal}
        onClose={() => {
          setOpenAuthModal(false);
          setCurrentPage("login");
        }}
        hideHeader
      >
        {currentPage === "login" ? (
          <Login setCurrentPage={setCurrentPage} onSuccess={() => setOpenAuthModal(false)} />
        ) : (
          <SignUp setCurrentPage={setCurrentPage} onSuccess={() => setOpenAuthModal(false)} />
        )}
      </Modal>

      {/* Post‑preference modal */}
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
