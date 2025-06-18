import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input"; // adjust path if needed
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector"; // if you have it
// import { validateEmail } from "../../utils/helper";
import GoogleSigninButton from '../../components/SignInWithGoogle.jsx';

const SignUp = ({ setCurrentPage }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
   
  };

  return (
    <div className="w-[90vw] md:w-[33vw] p-5 flex flex-col justify-center">
      <h3 className="text-base font-semibold text-black mb-1">Create an Account</h3>
      <p className="text-[11px] text-slate-700 mb-2">
        Join us today by entering your details below.
      </p>

      <form onSubmit={handleSignUp} >
        {/* Optional: Profile picture upload */}
        <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
       <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
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

        {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

        <button
          type="submit"
          className="btn-primary"
        >
          Sign Up
        </button>

        <p className="text-[13px] text-slate-800 mt-3">
          Already have an account?{" "}
          <button
            type="button"
            className="font-medium text-[#4F46E5] underline cursor-pointer "
            onClick={() => setCurrentPage("login")}
          >
            Log In
          </button>
        </p>

        {/* Divider */}
      <div className="flex items-center my-4">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-2 text-sm text-gray-500">or continue with</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      {/* Google Sign-in */}
      <div className="flex justify-center">
        <GoogleSigninButton />
      </div>

      </form>
    </div>
  );
};

export default SignUp;
