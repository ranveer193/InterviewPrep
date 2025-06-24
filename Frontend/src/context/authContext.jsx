import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getAuth,
  onIdTokenChanged,          // ✅ listen for *token* changes, not just user
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

/* ------------------------------------------------------------------ */
/* Blueprint                                                          */
/* ------------------------------------------------------------------ */
const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  getToken: async () => null,
});

/* ------------------------------------------------------------------ */
/* Provider                                                           */
/* ------------------------------------------------------------------ */
export function AuthProvider({ children }) {
  const auth = getAuth();                 // reuse one instance
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until first token loads

  /* Subscribe to token changes (fires on sign-in AND token refresh) */
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, (u) => {
      setUser(u);                         // u is null when signed-out
      setLoading(false);
    });
    return () => unsub();
  }, [auth]);

  /* ------------------------------------ */
  /* Auth helpers (memoised)              */
  /* ------------------------------------ */
  const login = useCallback(
    (email, password) => signInWithEmailAndPassword(auth, email, password),
    [auth]
  );

  const signup = useCallback(
    async (fullName, email, password) => {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (fullName) await updateProfile(cred.user, { displayName: fullName });
    },
    [auth]
  );

  const logout = useCallback(() => signOut(auth), [auth]);

  /** Always returns a fresh ID token (or null if signed-out) */
  const getToken = useCallback(() => user?.getIdToken(), [user]);

  /* ------------------------------------ */
  /* Context value                        */
  /* ------------------------------------ */
  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ------------------------------------------------------------------ */
export const useAuth = () => useContext(AuthContext);
