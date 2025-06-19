import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import OAQuestionForm from "../components/OAQuestionForm"

export default function SubmitOAQuestion() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const anonParam = params.get("anon");
  const isAnonymous = anonParam === "true" ? true : anonParam === "false" ? false : null;

  useEffect(() => {
    if (isAnonymous === null) {
      navigate("/");
    }
  }, [isAnonymous, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center px-4 py-12">
      {isAnonymous !== null && (
        <div className="w-full max-w-4xl animate-fadeInUp">
          {/* 🔙 Back button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-sm text-blue-600 hover:underline font-medium"
          >
            ← Back to Home page
          </button>

          <h2 className="text-3xl font-bold text-center mb-8 text-blue-600">
             OA Questions
          </h2>

          <OAQuestionForm isAnonymous={isAnonymous} />
        </div>
      )}
    </div>
  );
} 