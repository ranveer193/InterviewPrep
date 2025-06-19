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
  const navigate = useNavigate();
  const location = useLocation(); // 👈 get current route

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser ?? null);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully", {
        position: "top-center",
        autoClose: 1500,
      });
      navigate("/");
    } catch (err) {
      toast.error("Logout failed. Try again.");
    }
  };

  const handlePostConfirm = (anonymous) => {
    setShowPreferenceModal(false);
    navigate(`/submit?anon=${anonymous}`);
  };

  // 👇 hide button if already on submit page
  const isSubmitPage = location.pathname === "/submit";
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      <nav className="bg-gray-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">InterviewPrep</Link>

          <div className="flex space-x-4 items-center">
            <Link to="/interview" className="hover:text-blue-400">Experiences</Link>

            {/* 👇 Hide this if already on /submit page */}
            {!isSubmitPage && !isAdminPage && (
              <button
                onClick={() => setShowPreferenceModal(true)}
                className="hover:text-blue-400"
              >
                Share Experience
              </button>
            )}

            {!loading && isAdmin && (
              <Link to="/admin" className="hover:text-blue-400">Admin</Link>
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
                onClick={() => setOpenAuthModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded"
              >
                Login / Sign Up
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
        {currentPage === "login" && <Login setCurrentPage={setCurrentPage} />}
        {currentPage === "signup" && <SignUp setCurrentPage={setCurrentPage} />}
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
