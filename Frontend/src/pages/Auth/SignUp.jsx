import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input"; 
import GoogleSigninButton from '../../components/SignInWithGoogle.jsx';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase";
import { toast } from "react-toastify";
import { isAllowedEmail, allowedDomain } from "../../utils/allowedDomain";

const SignUp = ({ setCurrentPage }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isAllowedEmail(email)) {
      toast.error(`Only ${allowedDomain} emails are allowed`, { position: "top-center", autoClose: 2500 });
      setLoading(false);
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      if (fullName) {
        await updateProfile(cred.user, { displayName: fullName });
      }

      toast.success("Signup successful! Please verify your email.", {
        position: "top-center",
        autoClose: 2000,
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 1300);
    } catch (err) {
      console.log(err.code, err.message);
      if (err.code === "auth/email-already-in-use") {
        toast.error("Email already registered. Try logging in.", {position: "top-center", autoClose: 2500 });
      } else if (err.code === "auth/weak-password") {
        toast.error("Password should be at least 6 characters.", { position: "top-center", autoClose: 2500 });
      } else {
        toast.error("Signup failed. Try again.", { position: "top-center", autoClose: 2500 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[90vw] md:w-[33vw] p-5 flex flex-col justify-center">
      {loading ? (
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Signing you in...</p>
        </div>
      ) : (
        <>
          <h3 className="text-base font-semibold text-black mb-1">Create an Account</h3>
          <p className="text-[11px] text-slate-700 mb-2">
            Join us today by entering your details below.
          </p>

          <form onSubmit={handleEmailSignup}>
            <div className="grid grid-cols-1 gap-2">
              <Input
                value={fullName}
                onChange={({ target }) => setFullName(target.value)}
                label="Full Name"
                placeholder="John"
                type="text"
              />
              <Input
                value={email}
                onChange={({ target }) => setEmail(target.value)}
                label="Email Address"
                placeholder="john@example.com"
                type="email"
              />
              <Input
                value={password}
                onChange={({ target }) => setPassword(target.value)}
                label="Password"
                placeholder="Min 8 Characters"
                type="password"
              />
            </div>

            <button type="submit" className="btn-primary mt-3">
              Sign Up
            </button>

            <p className="text-[13px] text-slate-800 mt-3">
              Already have an account?{" "}
              <button
                type="button"
                className="font-medium text-[#4F46E5] underline cursor-pointer"
                onClick={() => setCurrentPage("login")}
              >
                Log In
              </button>
            </p>

            <div className="flex items-center my-4">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-2 text-sm text-gray-500">or continue with</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <div className="flex justify-center">
              <GoogleSigninButton />
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default SignUp;
