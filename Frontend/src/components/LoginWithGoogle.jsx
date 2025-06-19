import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import googleLogin from "../assets/google_login.png";

export default function GoogleSignInButton({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const email  = result.user?.email || "";

      if (!email.endsWith("@nitkkr.ac.in")) {
        await signOut(auth);
        toast.error("Only nitkkr.ac.in emails are allowed", { autoClose: 2500 });
        setLoading(false);
        return;
      }

      toast.success("Logged in successfully!", { autoClose: 2000 });

      // ⬇️ Tell parent or navigate
      if (onSuccess) onSuccess();
      else navigate("/");

    } catch (err) {
      console.error("Google Sign‑In error:", err);
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
