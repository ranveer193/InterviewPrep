import googleLogin from '../assets/google_login.png';

export default function GoogleSignInButton({ onClick }) {
  return (
    <div
      // onClick={onClick}
      className="w-[200px] h-[50px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200"
    >
      <img
        src={googleLogin}
        alt="Sign in with Google"
        className="h-full w-auto"
      />
    </div>
  );
}
