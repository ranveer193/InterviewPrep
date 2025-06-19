import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    
    <div className=" flex flex-col items-center justify-center ">
      <div className="relative flex flex-col items-center">
        {/* Decorative SVG or Emoji */}
        <div className="mb-4 mt-6">
          <svg width="64" height="64" fill="none" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="32" fill="#4F46E5" fillOpacity="0.1" />
            <path d="M24 40c0-4 8-4 8 0" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="26" cy="28" r="2" fill="#4F46E5"/>
            <circle cx="38" cy="28" r="2" fill="#4F46E5"/>
          </svg>
        </div>
        <h1 className="text-7xl font-extrabold text-indigo-700 mb-2 drop-shadow-lg">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md text-center">
          Oops! The page you are looking for doesn&apos;t exist or has been moved.<br />
          Let&apos;s get you back to safety.
        </p>
        <Link to="/" className="btn-small inline-block px-8 py-3 text-lg font-medium rounded-lg shadow hover:shadow-indigo-200 transition-all">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}