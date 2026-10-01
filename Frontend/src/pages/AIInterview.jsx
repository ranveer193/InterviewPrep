import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

import CompanyPicker from "../components/CompanyPicker";
import QuestionCard from "../components/QuestionCard";
import RecorderPanel from "../components/RecorderPanel";
import VideoPreviewModal from "../components/VideoPreviewModal";
import InstructionDialog from "../components/InstructionDialogBox";
import Modal from "../components/Modal";
import Login from "../pages/Auth/Login";
import SignUp from "../pages/Auth/SignUp";
import useMockInterviewSession from "../hooks/useMockInterviewSession";

const READ_SEC = 20;
const ANSWER_SEC = 90;

export default function AIInterviewPage() {
  /* ───────── routing + auth ───────── */
  const { company } = useParams();
  const decodedCompany = company ? decodeURIComponent(company) : null;
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = window.location;
  const numQuestions = new URLSearchParams(location.search).get("num") || 2;

  /* ───────── auth modal ───────── */
  const [authOpen, setAuthOpen] = useState(false);
  const [authPage, setAuthPage] = useState("login");
  const openAuth = (p = "login") => {
    setAuthPage(p);
    setAuthOpen(true);
  };

  /* ───────── interview session ───────── */
  const session = useMockInterviewSession(
    decodedCompany && user ? decodedCompany : null,
    Number(numQuestions)
  );

  /* ───────── per-question ui state ───────── */
  const [showInstr, setShowInstr] = useState(true); // shown once at start
  const [readTimer, setReadTimer] = useState(READ_SEC);
  const [recording, setRecording] = useState(false);
  const [previewBlob, setPreviewBlob] = useState(null);
  const [previewMetrics, setPreviewMetrics] = useState(null);
  const [transitioning, setTransitioning] = useState(false); // brief "Get Ready" between questions

  /* ───────── reset per-question timer when question index advances ───────── */
  useEffect(() => {
    if (session.questions.length > 0 && session.current < session.questions.length) {
      // Show a short transition screen so all state resets cleanly
      // before the timer effect can run
      setTransitioning(true);
      setRecording(false);
      setPreviewBlob(null);
      setPreviewMetrics(null);

      const t = setTimeout(() => {
        setReadTimer(READ_SEC);   // only set timer AFTER transitioning is shown
        setTransitioning(false);
      }, 800); // 800ms "Next Question" screen — enough for React to settle

      return () => clearTimeout(t);
    }
  }, [session.current, session.questions.length]);

  /* ───────── prep countdown timer effect ───────── */
  useEffect(() => {
    // Don't tick during instructions, preview, recording, upload, or transition
    if (showInstr || previewBlob || recording || session.status === "uploading" || transitioning) return;

    if (readTimer <= 0) {
      setRecording(true);
      return;
    }

    const timerId = setInterval(() => {
      setReadTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          setRecording(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [showInstr, previewBlob, recording, readTimer, transitioning]);

  /* ───────── navigate once summary ready ───────── */
  useEffect(() => {
    if (session.status === "done") {
      if (session.interviewId) {
        navigate(`/mockinterview/${session.interviewId}`);
      } else {
        navigate("/profile/interviews");
      }
    }
  }, [session.status, session.interviewId, navigate]);

  /* ───────── early states ───────── */
  if (!decodedCompany) return <CompanyPicker />;

  if (!user) {
    return (
      <>
        <div className="max-w-lg mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4 text-blue-800 dark:text-blue-300">
            {decodedCompany} Mock Interview
          </h1>
          <p className="mb-8 text-gray-700 dark:text-gray-300">
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
      <div className="text-center py-20 text-red-600 dark:text-red-400">
        Something went wrong while connecting to the mock interview server.
        <br />
        Please try again later.
      </div>
    );
  }

  if (session.questions.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-gray-600 dark:text-gray-400">
        Loading interview questions…
      </div>
    );
  }

  /* ───────── after last question submitted, wait for async results ───────── */
  if (session.current >= session.questions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4">
        <span className="loader mb-4" />
        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
          Interview Complete!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Our AI is evaluating your speech fluency, content delivery, and technical answers.
          <br />
          You will be redirected automatically to your detailed feedback report shortly.
        </p>
      </div>
    );
  }

  /* ───────── between-question transition screen ───────── */
  if (transitioning) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4">
        <div className="text-5xl">⏳</div>
        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
          Get Ready for Question {session.current + 1}
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Next question loading — prepare yourself!
        </p>
      </div>
    );
  }

  /* ───────── main interview screen ───────── */
  const currentQ = session.questions[session.current];

  const handleStartRecordingEarly = () => {
    setReadTimer(0);
    setRecording(true);
  };

  return (
    <>
      {/* Initial instruction dialog (shown once before Question 1) */}
      <InstructionDialog
        open={showInstr}
        onClose={() => setShowInstr(false)}
        totalQ={session.questions.length}
        current={0}
      />

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Question Card with Prep Timer */}
        <QuestionCard
          question={currentQ}
          index={session.current}
          total={session.questions.length}
          readTimer={readTimer}
          isRecording={recording}
          onStartEarly={readTimer > 0 ? handleStartRecordingEarly : null}
        />

        {/* Right: Camera Stream & Recorder Panel */}
        <RecorderPanel
          recording={recording}
          maxSec={ANSWER_SEC}
          isPrep={readTimer > 0 && !recording}
          prepTimer={readTimer}
          onStartManual={handleStartRecordingEarly}
          onPreview={(blob, metrics) => {
            setRecording(false);
            setPreviewBlob(blob);
            setPreviewMetrics(metrics);
          }}
        />
      </div>

      {/* Review Modal before submission */}
      <VideoPreviewModal
        blob={previewBlob}
        metrics={previewMetrics}
        open={!!previewBlob}
        onClose={() => {
          // Re-record option
          setPreviewBlob(null);
          setPreviewMetrics(null);
          setReadTimer(0);
          setRecording(true);
        }}
        onSubmit={(payload) => {
          session.submitAnswer(payload);
          setPreviewBlob(null);
          setPreviewMetrics(null);
          setReadTimer(READ_SEC);
          setRecording(false);
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