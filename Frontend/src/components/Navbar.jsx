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

export default function Navbar() {
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");
  const [user, setUser] = useState(null);
  const { isAdmin, loading } = useAdminStatus();

  const [showPreferenceModal, setShowPreferenceModal] = useState(false);

  const [redirectAfterAuth, setRedirectAfterAuth] = useState("/"); // 👈 new
  const navigate = useNavigate();
  const location = useLocation();

  /* ═════════ Track auth state ═════════ */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (cur) => setUser(cur ?? null));
    return () => unsubscribe();
  }, []);

  /* ═════════ Helpers ═════════ */
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully", { autoClose: 1500 });
      navigate(location.pathname);           // stay on same page
    } catch {
      toast.error("Logout failed. Try again.");
    }
  };

  const handlePostConfirm = (anonymous) => {
    setShowPreferenceModal(false);
    navigate(`/submit?anon=${anonymous}`);
  };

  const openAuth = (initialPage = "login") => {
    setRedirectAfterAuth(location.pathname + location.search); // save where we are
    setCurrentPage(initialPage);
    setOpenAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setOpenAuthModal(false);
  };

  /* ═════════ Hide buttons on certain routes ═════════ */
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
            <Link to="/interview" className="hover:text-blue-400">
              Experiences
            </Link>

            {!isSubmitPage && !isAdminPage && (
              <button
                onClick={() => {
                  if (user) setShowPreferenceModal(true);
                  else openAuth("login"); // prompt login first
                }}
                className="hover:text-blue-400"
              >
                Share Experience
              </button>
            )}

            {!loading && isAdmin && (
              <Link to="/admin" className="hover:text-blue-400">
                Admin
              </Link>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded"
              >
                Logout
              </button>
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

      {/* ───── Auth Modal ───── */}
      <Modal
        isOpen={openAuthModal}
        onClose={() => {
          setOpenAuthModal(false);
          setCurrentPage("login");
        }}
        hideHeader
      >
        {currentPage === "login" && (
          <Login
            setCurrentPage={setCurrentPage}
            onSuccess={handleAuthSuccess}   // 👈 callback
          />
        )}
        {currentPage === "signup" && (
          <SignUp
            setCurrentPage={setCurrentPage}
            onSuccess={handleAuthSuccess}   // 👈 callback
          />
        )}
      </Modal>

      {/* ───── Post Preference Modal ───── */}
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
