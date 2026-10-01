import { useState, useCallback, useEffect, useRef } from "react";
import api from "../services/api";

export default function useMockInterviewSession(company, numQuestions = 2) {
  /* core state */
  const [interviewId,  setInterviewId]  = useState(null);
  const [questions,    setQuestions]    = useState([]);
  const [current,      setCurrent]      = useState(0);
  const [status,       setStatus]       = useState("idle");      // idle | uploading | done | error
  const [statusesPerQ, setStatusesPerQ] = useState([]);          // idle | processing | done | error
  const [result,       setResult]       = useState(null);

  const [movingToNext, setMovingToNext] = useState(false);       // brief transition flag

  const pollRef = useRef(null);

  /* ───────── create interview ───────── */
  useEffect(() => {
    if (!company) return;

    (async () => {
      try {
        const { data } = await api.post("/mockInterview/create", { company, numQuestions });
        setInterviewId(data.interviewId);
        setQuestions(data.questions.map((q) => q.text));
        const total = data.totalQ ?? data.questions.length;
        setStatusesPerQ(Array(total).fill("idle"));
      } catch (err) {
        console.error("[useMockInterview] create error:", err);
        setStatus("error");
      }
    })();
  }, [company]);

  /* ───────── poll /status every 2 s for responsive async updates ───────── */
  useEffect(() => {
    if (!interviewId) return;

    pollRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(`/mockInterview/${interviewId}/status`);
        const newStatuses = Array.isArray(data) ? data : data.statuses;
        if (Array.isArray(newStatuses)) setStatusesPerQ(newStatuses);
      } catch {/* ignore polling failures */ }
    }, 2000);

    return () => clearInterval(pollRef.current);
  }, [interviewId]);

  /* ───────── upload/submit an answer (Async AI processing) ───────── */
  const submitAnswer = useCallback(
    async (payload) => {
      if (!interviewId) return;

      setStatus("uploading");
      setMovingToNext(true);

      const targetIndex = current;

      // Optimistic status update to processing
      setStatusesPerQ((prev) => {
        const next = [...prev];
        next[targetIndex] = "processing";
        return next;
      });

      // Advance to next question immediately - NO LAG for the candidate!
      setCurrent((p) => p + 1);

      try {
        const blob = payload?.blob || payload;
        const transcript = payload?.transcript || "";
        const audioDurationSeconds = payload?.audioDurationSeconds || 0;

        if (blob) {
          // Send video/audio with browser transcript as fallback
          const form = new FormData();
          form.append("video", blob, `answer-${Date.now()}.webm`);
          form.append("index", targetIndex);
          form.append("questionText", questions[targetIndex] || "");
          form.append("transcript", transcript.trim());
          form.append("audioDurationSeconds", audioDurationSeconds);

          await api.post(`/mockInterview/${interviewId}/transcribe`, form, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else if (transcript.trim()) {
          // Fast transcript path
          await api.post(`/mockInterview/${interviewId}/submitAnswer`, {
            index: targetIndex,
            transcript: transcript.trim(),
            questionText: questions[targetIndex] || "",
            audioDurationSeconds,
          });
        }
      } catch (err) {
        console.error("[useMockInterview] submission error:", err);
        setStatus("error");
        setStatusesPerQ((prev) => {
          const next = [...prev];
          next[targetIndex] = "error";
          return next;
        });
      } finally {
        setStatus("idle");
        setMovingToNext(false);
      }
    },
    [interviewId, current, questions]
  );

  /* ───────── fetch summary when all Qs done ───────── */
  useEffect(() => {
    if (!interviewId || !questions.length) return;
    const allDone = statusesPerQ.length && statusesPerQ.every((s) => s === "done");
    if (!allDone || status === "done") return;

    (async () => {
      try {
        const { data } = await api.get(`/mockInterview/${interviewId}/result`);
        setResult(data.data);
        setStatus("done");
        clearInterval(pollRef.current);
      } catch (err) {
        console.error("[useMockInterview] result fetch error:", err);
        setStatus("error");
      }
    })();
  }, [statusesPerQ, status, interviewId, questions.length]);

  return {
    interviewId,
    questions,
    current,
    status,
    statusesPerQ,
    movingToNext,
    result,
    submitAnswer,
  };
}