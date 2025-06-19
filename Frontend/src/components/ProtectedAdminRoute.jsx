import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import useAdminStatus from "../hooks/useAdminStatus";

export default function AdminRoute({ children }) {
  const [user, authLoading] = useAuthState(auth);
  const { isAdmin, loading: adminLoading } = useAdminStatus();

  if (authLoading || adminLoading) {
    return <div className="p-6 text-center">Checking access...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
