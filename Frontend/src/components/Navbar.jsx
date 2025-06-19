import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Modal from "./Modal";
import Login from "../pages/Auth/Login";
import SignUp from "../pages/Auth/SignUp";
import PostPreferenceForm from "./PostPreferenceModal";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import useAdminStatus from "../hooks/useAdminStatus";
import { FaUserCircle } from "react-icons/fa"; // user icon

export default function Navbar() {
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");
  const [user, setUser] = useState(null);
  const { isAdmin, loading } = useAdminStatus();

  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  /* Track auth state */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (cur) => setUser(cur ?? null));
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully", { autoClose: 1500 });
      navigate(location.pathname);
    } catch {
      toast.error("Logout failed. Try again.");
    }
  };

  const handlePostConfirm = (anonymous) => {
    setShowPreferenceModal(false);
    navigate(`/submit?anon=${anonymous}`);
  };

  const openAuth = (initialPage = "login") => {
    setCurrentPage(initialPage);
    setOpenAuthModal(true);
  };

  const handleAuthSuccess = () => setOpenAuthModal(false);

  const isSubmitPage = location.pathname === "/submit";
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      <nav className="bg-gray-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            InterviewPrep
          </Link>

          <div className="flex space-x-4 items-center">
            <Link to="/" className="hover:text-blue-400">Home</Link>
            <Link to="/interview" className="hover:text-blue-400">Experiences</Link>
            <Link to="/interview/company-wise" className="hover:text-blue-400">Company-wise</Link>

            {!isSubmitPage && !isAdminPage && (
              <button
                onClick={() => (user ? setShowPreferenceModal(true) : openAuth("login"))}
                className="hover:text-blue-400"
              >
                Share Experience
              </button>
            )}

            {!loading && isAdmin && (
              <Link to="/admin" className="hover:text-blue-400">Admin</Link>
            )}

            {user ? (
              <>
                {/* Logout first, then user icon / name */}
                <button
                  onClick={handleLogout}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded"
                >
                  Logout
                </button>

                <span className="flex items-center gap-2 text-sm font-medium text-blue-300">
                  <FaUserCircle className="text-lg" />
                  {user.displayName?.split(' ')[0] || 'User'}
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
          <Login setCurrentPage={setCurrentPage} onSuccess={handleAuthSuccess} />
        ) : (
          <SignUp setCurrentPage={setCurrentPage} onSuccess={handleAuthSuccess} />
        )}
      </Modal>

      {/* Post Preference Modal */}
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
