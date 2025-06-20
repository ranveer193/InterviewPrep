import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

/* ------------------------------------------------------------------ */
/* Context blueprint */
const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

/* ------------------------------------------------------------------ */
/* Provider */
export function AuthProvider({ children }) {
  const auth = getAuth(); // reuse one instance

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* listen for changes */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [auth]);

  /* helpers wrapped in useCallback for referential stability */
  const login = useCallback(
    (email, password) => signInWithEmailAndPassword(auth, email, password),
    [auth]
  );

  const signup = useCallback(
    async (fullName, email, password) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (fullName) await updateProfile(cred.user, { displayName: fullName });
    },
    [auth]
  );

  const logout = useCallback(() => signOut(auth), [auth]);

  /* expose values */
  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
export const useAuth = () => useContext(AuthContext);
