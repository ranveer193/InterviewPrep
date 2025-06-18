import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import googleLogin from '../assets/google_login.png';
import { useState } from 'react';

export default function GoogleSignInButton() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
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

      if (result.user) {
        toast.success('Logged in successfully!', {
          position: 'top-center',
          autoClose: 2000,
        });

        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      toast.error('Something went wrong. Try again!', {
        position: 'top-center',
        autoClose: 2000,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div
        onClick={handleGoogleLogin}
        className={`w-[200px] h-[50px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 ${
          isLoading ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        <img
          src={googleLogin}
          alt="Sign in with Google"
          className="h-full w-auto"
        />
      </div>

      {isLoading && (
        <p className="mt-4 text-sm text-slate-600 animate-pulse">Logging you in...</p>
      )}
    </div>
  );
}