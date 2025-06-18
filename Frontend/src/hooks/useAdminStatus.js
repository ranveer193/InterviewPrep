import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";

export default function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await getIdTokenResult(user, true);
        setIsAdmin(!!token.claims.admin);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { isAdmin, loading };
}
