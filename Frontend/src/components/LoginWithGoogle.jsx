import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  /* ★ NEW ↓ */
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import googleLogin from "../assets/google_login.png";
import { isAllowedEmail, allowedDomain } from "../utils/allowedDomain";

export default function GoogleLoginButton({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      /* ★ NEW → enforce per-tab/session scope */
      await setPersistence(auth, browserSessionPersistence);

      const { user } = await signInWithPopup(auth, provider);
      const email = user?.email || "";

      if (allowedDomain && !isAllowedEmail(email)) {
        await signOut(auth);
        toast.error(`Only ${allowedDomain} emails are allowed`, { autoClose: 2500 });
        setLoading(false);
        return;
      }

      toast.success("Logged in successfully!", { autoClose: 2000 });
      onSuccess ? onSuccess() : navigate("/");

    } catch (err) {
      console.error("Google Sign-In error:", err);
      toast.error("Something went wrong. Try again!", { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className={`w-[200px] h-[50px] flex items-center justify-center hover:scale-105 transition-transform duration-200 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <img src={googleLogin} alt="Sign in with Google" className="h-full" />
      </button>

      {loading && (
        <p className="mt-4 text-sm text-slate-600 animate-pulse">
          Logging you in…
        </p>
      )}
    </div>
  );
}
