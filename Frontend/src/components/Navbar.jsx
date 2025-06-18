import { useState } from "react";
import { Link } from "react-router-dom";
import Modal from "./Modal"; // if Modal is in the same folder
import Login from "../pages/Auth/Login";
import SignUp from "../pages/Auth/SignUp";


export default function Navbar() {
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");

  return (
    <>
      <nav className="bg-gray-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">InterviewPrep</Link>
          <div className="flex space-x-4 items-center">
            <Link to="/interview" className="hover:text-blue-400">Experiences</Link>
            <Link to="/submit" className="hover:text-blue-400">Submit</Link>
            <Link to="/admin" className="hover:text-blue-400">Admin</Link>

            <button
              onClick={() => setOpenAuthModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded"
            >
              Login / Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* ✅ Modal */}
      <Modal
        isOpen={openAuthModal}
        onClose={() => {
          setOpenAuthModal(false);
          setCurrentPage("login");
        }}
        hideHeader
      >
        <div>
          {currentPage === "login" && (
            <Login setCurrentPage={setCurrentPage} />
          )}
          {currentPage === "signup" && (
            <SignUp setCurrentPage={setCurrentPage} />
          )}
        </div>
      </Modal>
    </>
  );
}
