import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FinalScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/profile#interviews");
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">
        🎉 Interview Submitted!
      </h1>

      <p className="text-gray-700 max-w-xl">
        Your responses have been uploaded and are now being analyzed by our AI system.
        <br />
        <strong>You may close this tab or continue browsing.</strong> You’ll get a notification
        once your summaries are ready.
      </p>

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Go to Home
        </button>
        <button
          onClick={() => navigate("/profile#interviews")}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
        >
          View My Interviews
        </button>
      </div>
    </div>
  );
}
