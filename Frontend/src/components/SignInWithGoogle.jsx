import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import googleSignupImg from "../assets/google_signin.png";
import { auth } from "../firebase";

export default function GoogleSignUpButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user?.email;

      if (!email.endsWith("@nitkkr.ac.in")) {
        await signOut(auth);
        toast.error("Only nitkkr.ac.in emails are allowed", {
          position: "top-center",
          autoClose: 2500,
        });
        setLoading(false);
        return;
      }

      toast.success("Signed up successfully!", {
        position: "top-center",
        autoClose: 2000,
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.error("Error signing up with Google:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-center",
        autoClose: 2000,
      });
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Signing you in...</p>
        </div>
      ) : (
        <div
          onClick={handleGoogleSignup}
          className="w-[200px] h-[50px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200"
        >
          <img
            src={googleSignupImg}
            alt="Sign up with Google"
            className="h-full w-auto"
          />
        </div>
      )}
    </>
  );
}
