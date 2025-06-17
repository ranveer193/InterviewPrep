import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">InterviewPrep</Link>
        <div className="flex space-x-4">
          <Link to="/" className="hover:text-blue-400">Experiences</Link>
          <Link to="/submit" className="hover:text-blue-400">Submit</Link>
          <Link to="/admin" className="hover:text-blue-400">Admin</Link>
        </div>
      </div>
    </nav>
  );
}
