import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input.jsx";
import { validateEmail } from "../../utils/helper";
import GoogleLoginButton from '../../components/LoginWithGoogle.jsx';

const Login = ({setCurrentPage}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
     if(!validateEmail(email)){
      setError("Please enter valid email");
      return;
    }
    if(!password){
      setError("Please enter the password");
      return;
    }
    setError("");

    //Login API call
    try {
      
    } catch (error) {
       if(error.response && error.response.data.message){
        setError(error.response.data.message);
       }
       else{
        setError("Something went wrong. Please try again.")
       }
    }
    // try {
    //   // TODO: Replace with real login logic
    //   console.log("Logging in with", { email, password });

    //   // Example: Navigate to dashboard or home page
    //   navigate("/dashboard");
    // } catch (err) {
    //   setError("Login failed. Please check your credentials.");
    // }
  };

return (
  <div className="w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center items-center">
    <h3 className="text-lg font-semibold text-black">Welcome Back</h3>
    <p className="text-xs text-slate-700 mt-[5px] mb-6">
      Please enter your details to log in
    </p>

    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

    <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
      <Input
        label="Email Address"
        type="email"
        placeholder="john@example.com"
        value={email}
        onChange={({ target }) => setEmail(target.value)}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Min 8 Characters"
        value={password}
        onChange={({ target }) => setPassword(target.value)}
      />

      <button
        type="submit"
        className="btn-primary"
      >
        Login
      </button>

      <p className="text-[13px] text-slate-800 mt-3">
        Don't have an account?{" "}
        <button
          className="font-medium text-[#4F46E5] underline cursor-pointer"
          onClick={() => {
            setCurrentPage("signup");
          }}
        >
          SignUp
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
        <GoogleLoginButton />
      </div>
    </form>
  </div>
);
};

export default Login;


