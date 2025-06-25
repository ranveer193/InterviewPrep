import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getAuth,
  onIdTokenChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  /* ★ NEW ↓ */
  setPersistence,
  browserSessionPersistence,
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
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Subscribe to token changes (fires on sign-in AND token refresh) */
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [auth]);

  /* ------------------------------------ */
  /* Auth helpers                         */
  /* ------------------------------------ */
  const login = useCallback(
    (email, password) =>
      setPersistence(auth, browserSessionPersistence).then(() =>
        signInWithEmailAndPassword(auth, email, password)
      ),
    [auth]
  );

  const signup = useCallback(
    async (fullName, email, password) => {
      await setPersistence(auth, browserSessionPersistence);       /* ★ NEW */
      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (fullName) await updateProfile(cred.user, { displayName: fullName });
    },
    [auth]
  );

  const logout  = useCallback(() => signOut(auth), [auth]);
  const getToken = useCallback(() => user?.getIdToken(), [user]);

  const value = { user, loading, login, signup, logout, getToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ------------------------------------------------------------------ */
export const useAuth = () => useContext(AuthContext);
