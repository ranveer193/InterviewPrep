import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input.jsx";
import GoogleLoginButton from "../../components/LoginWithGoogle.jsx";
import { toast } from "react-toastify";
import { isAllowedEmail, allowedDomain } from "../../utils/allowedDomain";
import { useAuth } from "../../context/AuthContext";

export default function Login({ setCurrentPage, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isAllowedEmail(email)) {
      toast.error(`Only ${allowedDomain} accounts can log in`, {
        autoClose: 2500,
      });
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      toast.success("Logged in successfully!", { autoClose: 2000 });
      if (onSuccess) onSuccess();
      else navigate("/");
    } catch (err) {
      console.error("Login error:", err.code, err.message);
      if (err.code === "auth/invalid-credential") {
        setError("No account found. Please sign up.");
        toast.error("Invalid email or password", { autoClose: 2500 });
      } else {
        setError("Login failed. Try again.");
        toast.error("Login error", { autoClose: 2500 });
      }
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  return (
    <div className="w-[90vw] md:w-[33vw] p-7 flex flex-col items-center">
      {loading ? (
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Logging you in…</p>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-black">Log In</h3>
          <p className="text-xs text-slate-700 mb-6">
            Please enter your credentials to log in
          </p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <form
            onSubmit={handleEmailLogin}
            className="flex flex-col gap-4 w-full"
          >
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
              placeholder="Min 8 Characters"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />

            <button type="submit" className="btn-primary">
              Login
            </button>

            <p className="text-[13px] text-slate-800 mt-3">
              Don’t have an account?{" "}
              <button
                type="button"
                className="font-medium text-[#4F46E5] underline"
                onClick={() => setCurrentPage("signup")}
              >
                Sign Up
              </button>
            </p>

            {/* Divider */}
            <div className="flex items-center my-4">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-2 text-sm text-gray-500">
                or continue with
              </span>
              <hr className="flex-grow border-gray-300" />
            </div>

            {/* Google */}
            <div className="flex justify-center">
              <GoogleLoginButton onSuccess={onSuccess} />
            </div>
          </form>
        </>
      )}
    </div>
  );
}
