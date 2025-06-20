// src/components/Footer.jsx
import React from 'react';
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} InterviewPrep. All rights reserved.</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <Link to="/" className="hover:text-blue-400 text-sm">Home</Link>
          <Link to="/interview" className="hover:text-blue-400 text-sm">Experiences</Link>
          <Link to="/interview/company-wise" className="hover:text-blue-400 text-sm">Company‑wise</Link>
          <Link to="/submit?anon=false" className="hover:text-blue-400 text-sm">Share</Link>
          <Link to="/oa" className="hover:text-blue-400 text-sm">OA pyqs</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
