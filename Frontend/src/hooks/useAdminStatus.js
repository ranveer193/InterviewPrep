import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";

export default function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const tokenResult = await getIdTokenResult(user, true); // force refresh
          setIsAdmin(!!tokenResult.claims.admin);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Failed to fetch admin claims", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { isAdmin, loading };
}
