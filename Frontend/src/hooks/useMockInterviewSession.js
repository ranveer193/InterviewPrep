import { useState, useCallback, useEffect, useRef } from "react";
import api from "../services/api";

export default function useMockInterviewSession(company) {
  /* core state */
  const [interviewId,  setInterviewId]  = useState(null);
  const [questions,    setQuestions]    = useState([]);
  const [current,      setCurrent]      = useState(0);
  const [status,       setStatus]       = useState("idle");      // idle | uploading | done | error
  const [statusesPerQ, setStatusesPerQ] = useState([]);          // idle | processing | done | error
  const [result,       setResult]       = useState(null);

  const [movingToNext, setMovingToNext] = useState(false);       // ui‑spinner flag

  const pollRef = useRef(null);

  /* ───────── create interview ───────── */
  useEffect(() => {
    if (!company) return;

    (async () => {
      try {
        const { data } = await api.post("/mockInterview/create", { company });
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

  /* ───────── poll /status every 5 s ───────── */
  useEffect(() => {
    if (!interviewId) return;

    pollRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(`/mockInterview/${interviewId}/status`);
        const newStatuses = Array.isArray(data) ? data : data.statuses;
        if (Array.isArray(newStatuses)) setStatusesPerQ(newStatuses);
      } catch {/* ignore polling failures */ }
    }, 5000);

    return () => clearInterval(pollRef.current);
  }, [interviewId]);

  /* ───────── upload an answer ───────── */
  const submitAnswer = useCallback(
    async (blob, metrics = null) => {
      if (!interviewId || !blob) return;

      setStatus("uploading");
      setMovingToNext(true);

      // optimistic status update
      setStatusesPerQ((prev) => {
        const next = [...prev];
        next[current] = "processing";
        return next;
      });

      try {
        const form = new FormData();
        form.append("video", blob, `answer-${Date.now()}.webm`);
        form.append("index",        current);
        form.append("questionText", questions[current]);
        if (metrics) form.append("metrics", JSON.stringify(metrics));

        await api.post(`/mockInterview/${interviewId}/transcribe`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // go to next question
        setCurrent((p) => p + 1);
      } catch (err) {
        console.error("[useMockInterview] upload error:", err);
        setStatus("error");
        setStatusesPerQ((prev) => {
          const next = [...prev];
          next[current] = "error";
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