import { useEffect, useRef, useState } from "react";
import { Mic, Square, RotateCcw, Volume2, Video } from "lucide-react";

export default function RecorderPanel({
  recording,
  maxSec = 90,
  onPreview,
  onStartManual,
  isPrep,
  prepTimer,
}) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(maxSec);
  const [liveTranscript, setLiveTranscript] = useState("");
  const liveTranscriptRef = useRef("");
  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);

  /* ───────── 1. Initialize camera stream once and persist ───────── */
  useEffect(() => {
    let mounted = true;

    async function initCamera() {
      try {
        if (streamRef.current) return;
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });

        if (!mounted) {
          userStream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = userStream;
        setStream(userStream);

        if (videoRef.current) {
          videoRef.current.srcObject = userStream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    }

    initCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Re-attach video stream if videoRef re-mounts
  useEffect(() => {
    if (videoRef.current && streamRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  /* ───────── 2. Start recording helper ───────── */
  const startRecording = async () => {
    try {
      setLiveTranscript("");
      liveTranscriptRef.current = "";
      setSecondsLeft(maxSec);

      // Ensure stream is ready
      let activeStream = streamRef.current;
      if (!activeStream || !activeStream.active) {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = activeStream;
        setStream(activeStream);
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
          await videoRef.current.play();
        }
      }

      // Initialize Web Speech API
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = "en-US";

          rec.onresult = (event) => {
            let currentText = "";
            for (let i = 0; i < event.results.length; i++) {
              currentText += event.results[i][0].transcript + " ";
            }
            const trimmed = currentText.trim();
            liveTranscriptRef.current = trimmed;
            setLiveTranscript(trimmed);
          };

          rec.onerror = (e) => {
            console.warn("Speech recognition notice:", e.error);
          };

          rec.start();
          recognitionRef.current = rec;
        } catch (speechErr) {
          console.warn("Web Speech API init failed:", speechErr);
        }
      }

      const chunks = [];
      const rec = new MediaRecorder(activeStream, { mimeType: "video/webm" });
      rec.ondataavailable = (e) => e.data && e.data.size > 0 && chunks.push(e.data);

      rec.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const durationSeconds = startTimeRef.current
          ? Math.round((Date.now() - startTimeRef.current) / 1000)
          : maxSec - secondsLeft;

        onPreview(blob, {
          transcript: liveTranscriptRef.current,
          durationSeconds,
        });
      };

      startTimeRef.current = Date.now();
      rec.start(500); // 500ms chunk slices for smooth capture
      recorderRef.current = rec;
      setIsRecording(true);
    } catch (err) {
      console.error("Recording start error:", err);
      alert("Please ensure your camera and microphone are connected and permitted.");
    }
  };

  /* ───────── 3. Stop recording helper ───────── */
  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }

    setIsRecording(false);
    // Note: Do NOT stop the camera tracks here so video preview stays smooth for the next question!
  };

  /* ───────── 4. Sync with recording prop ───────── */
  useEffect(() => {
    if (recording && !isRecording) {
      startRecording();
    } else if (!recording && isRecording) {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording]);

  /* ───────── 5. Recording countdown timer ───────── */
  useEffect(() => {
    if (!isRecording) return;

    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          stopRecording();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isRecording]);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-gray-900 dark:text-gray-100">
            {isRecording ? "Answer Recording" : isPrep ? "Camera Ready (Prep Phase)" : "Interview Camera"}
          </h3>
        </div>

        {isRecording && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold bg-red-50 dark:bg-red-900/30 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-800">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            REC {formatTimer(secondsLeft)}
          </div>
        )}
      </div>

      {/* Video stream box */}
      <div className="relative bg-gray-950 rounded-xl overflow-hidden aspect-video shadow-inner flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="object-cover w-full h-full transform scale-x-[-1]"
        />

        {/* Overlay when in Prep mode */}
        {isPrep && !isRecording && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Prep Mode: Recording starts in {prepTimer}s
          </div>
        )}

        {/* Timer badge during recording */}
        {isRecording && (
          <span className="absolute top-3 right-3 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-mono font-bold shadow-md">
            {formatTimer(secondsLeft)}
          </span>
        )}
      </div>

      {/* Live transcript indicator */}
      {isRecording && (
        <div className="bg-blue-50/70 dark:bg-gray-700/50 border border-blue-200 dark:border-gray-600 rounded-xl p-3 text-xs text-blue-900 dark:text-blue-100 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-blue-700 dark:text-blue-300">
            <Volume2 className="w-3.5 h-3.5 text-blue-600" /> Real-Time Voice Transcription:
          </div>
          <p className="italic text-gray-700 dark:text-gray-300 min-h-[1.5rem] line-clamp-2">
            {liveTranscript || "Listening to your answer... speak normally."}
          </p>
        </div>
      )}

      {/* Action Controls */}
      <div className="pt-1">
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-md"
          >
            <Square className="w-5 h-5 fill-current" /> Finish & Review Answer
          </button>
        ) : isPrep ? (
          <button
            onClick={onStartManual}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-md"
          >
            <Mic className="w-5 h-5" /> Start Recording Now (Skip {prepTimer}s Prep)
          </button>
        ) : (
          <button
            onClick={onStartManual}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-md"
          >
            <Mic className="w-5 h-5" /> Start Answer Recording
          </button>
        )}
      </div>
    </div>
  );
}
