import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import googleSignupImg from "../assets/google_signin.png";
import { auth } from "../firebase";

export default function GoogleSignUpButton({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
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

      toast.success("Signed up successfully!", { autoClose: 2000 });

      // ⬇️ Tell parent or navigate
      if (onSuccess) onSuccess();
      else navigate("/");

    } catch (err) {
      console.error("Google Sign‑Up error:", err);
      toast.error("Something went wrong. Please try again.", { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <div className="flex items-center justify-center gap-2 mt-4">
      <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-600">Signing you in…</p>
    </div>
  ) : (
    <button
      onClick={handleGoogleSignup}
      className="w-[200px] h-[50px] flex items-center justify-center hover:scale-105 transition-transform duration-200"
    >
      <img src={googleSignupImg} alt="Sign up with Google" className="h-full" />
    </button>
  );
}
