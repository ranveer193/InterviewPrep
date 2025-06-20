// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} InterviewPrep. All rights reserved.</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="/" className="hover:text-blue-400 text-sm">Home</a>
          <a href="/Interview" className="hover:text-blue-400 text-sm">Experiences</a>
          <a href="/Submit" className="hover:text-blue-400 text-sm">Share</a>
          <a href="/oa" className="hover:text-blue-400 text-sm">OA Questions</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
