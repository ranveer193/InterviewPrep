import { useEffect } from "react";
import { useAuth } from "../context/authContext";
import { toast } from "react-toastify";

const TOAST_ID = "login-required";          // ➜ guarantees a single toast

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      toast.error("You need to be logged in to access this page",{autoClose: 1500}, {
        toastId: TOAST_ID,                 // 👈 prevents duplicates
      });
    }
  }, [loading, user]);

  if (loading) return null;

  // Not logged in → show nothing (but stay on the same URL)
  if (!user) return (
  <div className="text-center py-20 text-gray-500">
    🔒 Please login to access this page.
  </div>
);                  // or show a friendly placeholder

  // Logged in → render the protected component
  return children;
}
