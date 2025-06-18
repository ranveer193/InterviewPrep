// src/routes/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import useAdminStatus from "../hooks/useAdminStatus";

export default function AdminRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  const isAdmin = useAdminStatus();

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
