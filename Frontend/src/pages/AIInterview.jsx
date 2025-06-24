import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import CompanyPicker from "../components/CompanyPicker";
import QuestionCard from "../components/QuestionCard";
import RecorderPanel from "../components/RecorderPanel";
import VideoPreviewModal from "../components/VideoPreviewModal";
import InstructionDialog from "../components/InstructionDialogBox";
import Modal from "../components/Modal";
import Login from "../pages/Auth/Login";
import SignUp from "../pages/Auth/SignUp";
import useMockInterviewSession from "../hooks/useMockInterviewSession";

const READ_SEC   = 20;
const ANSWER_SEC = 90;

export default function AIInterviewPage() {
  /* ───────── routing + auth ───────── */
  const { company } = useParams();
  const decodedCompany = company ? decodeURIComponent(company) : null;
  const { user } = useAuth();
  const navigate   = useNavigate();

  /* ───────── auth modal ───────── */
  const [authOpen, setAuthOpen] = useState(false);
  const [authPage, setAuthPage] = useState("login");
  const openAuth = (p = "login") => {
    setAuthPage(p);
    setAuthOpen(true);
  };

  /* ───────── interview session ───────── */
  const session = useMockInterviewSession(
    decodedCompany && user ? decodedCompany : null
  );

  /* ───────── local ui state ───────── */
  const [previewBlob,    setPreviewBlob]    = useState(null);
  const [previewMetrics, setPreviewMetrics] = useState(null);

  const [showInstr,  setShowInstr]  = useState(true); // instruction dialog
  const [readTimer,  setReadTimer]  = useState(READ_SEC);
  const [recording,  setRecording]  = useState(false);

  const prevQRef = useRef(-1);

  /* ───────── reset per-question ui ───────── */
  useEffect(() => {
    if (
      session.current < session.questions.length &&
      session.current !== prevQRef.current
    ) {
      prevQRef.current = session.current;
      setShowInstr(true);      // show instructions again
    }
  }, [session.current, session.questions.length]);

  /* ───────── countdown → recording ───────── */
  useEffect(() => {
    if (showInstr) {
      setReadTimer(READ_SEC);
      setRecording(false);
      return; // wait for user to close dialog
    }

    const id = setInterval(() => {
      setReadTimer((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setRecording(true); // auto-start recording
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [showInstr]);

  /* ───────── navigate once summary ready ───────── */
  useEffect(() => {
    if (session.status === "done") {
      navigate("/profile/interviews");
    }
  }, [session.status, navigate]);

  /* ───────── early states ───────── */
  if (!decodedCompany) return <CompanyPicker />;

  if (!user) {
    return (
      <>
        <div className="max-w-lg mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4 text-blue-800">
            {decodedCompany} Mock Interview
          </h1>
          <p className="mb-8 text-gray-700">
            Please log in or sign up to start your AI-powered mock interview.
          </p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full shadow-md transition"
            onClick={() => openAuth("login")}
          >
            Login / Sign up
          </button>
        </div>

        <Modal
          isOpen={authOpen}
          onClose={() => {
            setAuthOpen(false);
            setAuthPage("login");
          }}
          hideHeader
        >
          {authPage === "login" ? (
            <Login setCurrentPage={setAuthPage} onSuccess={() => setAuthOpen(false)} />
          ) : (
            <SignUp setCurrentPage={setAuthPage} onSuccess={() => setAuthOpen(false)} />
          )}
        </Modal>
      </>
    );
  }

  if (session.status === "error") {
    return (
      <div className="text-center py-20 text-red-600">
        Something went wrong while contacting the server.
        <br />
        Please try again later.
      </div>
    );
  }

  if (session.questions.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-gray-600">
        Loading questions…
      </div>
    );
  }

  /* ───────── after last upload, wait for summary ───────── */
  if (session.current >= session.questions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <span className="loader mb-4" />
        <h2 className="text-2xl font-semibold text-blue-700">
          Interview submitted!
        </h2>
        <p className="text-gray-600">
          Our AI is analysing your answers.
          <br />
          You’ll be redirected when the summary is ready.
        </p>
      </div>
    );
  }

  /* ───────── main render ───────── */
  const currentQ = session.questions[session.current];

  return (
    <>
      {/* instruction dialog */}
      <InstructionDialog
      open={showInstr}
      onClose={() => setShowInstr(false)}
      totalQ={session.questions.length}
      current={session.current}
      />  

      {/* inter-question overlay */}
      {session.movingToNext && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
          <span className="loader" />
          <p className="text-lg font-medium text-gray-700">
            Processing your answer…
          </p>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuestionCard
          question={currentQ}
          index={session.current}
          total={session.questions.length}
          readTimer={recording ? 0 : readTimer}
        />

        <RecorderPanel
          recording={recording}
          maxSec={ANSWER_SEC}
          onPreview={(blob, metrics) => {
            setRecording(false);
            setPreviewBlob(blob);
            setPreviewMetrics(metrics);
          }}
        />
      </div>

      <VideoPreviewModal
        blob={previewBlob}
        open={!!previewBlob}
        onClose={() => {
          setPreviewBlob(null);
          setPreviewMetrics(null);
        }}
        onSubmit={() => {
          session.submitAnswer(previewBlob, previewMetrics);
          setPreviewBlob(null);
          setPreviewMetrics(null);
        }}
        loading={session.status === "uploading"}
      />
    </>
  );
}

/* ───────── loader css (Tailwind) ───────── */
const loaderStyle = `
@layer utilities {
  .loader {
    @apply relative h-12 w-12;
  }
  .loader::before,
  .loader::after {
    content: "";
    @apply absolute inset-0 rounded-full border-4 border-blue-600;
    border-top-color: transparent;
    animation: spin 0.8s linear infinite;
  }
  .loader::after {
    @apply border-2 border-blue-400;
    border-top-color: transparent;
    animation-direction: reverse;
  }
  @keyframes spin {
    to { transform: rotate(360deg) }
  }
}`;

if (typeof document !== "undefined" && !document.getElementById("spinner-style")) {
  const style = document.createElement("style");
  style.id = "spinner-style";
  style.textContent = loaderStyle;
  document.head.appendChild(style);
}