import { useEffect, useRef, useState } from "react";
import { Mic, Square, RotateCcw } from "lucide-react";

export default function RecorderPanel({ recording, maxSec = 90, onPreview }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(maxSec);

  useEffect(() => {
    if (recording && !isRecording) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording]);

  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          stop();
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  const start = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(userStream);

      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
        await videoRef.current.play();
      }

      const chunks = [];
      const rec = new MediaRecorder(userStream, { mimeType: "video/webm" });
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        onPreview(blob);
      };

      rec.start();
      setRecorder(rec);
      setIsRecording(true);
      setSecondsLeft(maxSec);
    } catch (err) {
      console.error("🎥 getUserMedia error:", err);
      alert("Please allow camera & mic access, then try again.");
    }
  };

  const stop = () => {
    recorder?.stop();
    stream?.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
  };

  const reset = () => {
    if (videoRef.current) videoRef.current.srcObject = null;
    setSecondsLeft(maxSec);
  };

  useEffect(() => {
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [stream]);

  return (
    <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Mic className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold">Recording</h3>
      </div>

      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="object-cover w-full h-full"
        />
        {isRecording && (
          <span className="absolute top-2 right-2 bg-red-600 text-white px-2 py-0.5 rounded text-xs">
            {secondsLeft}s
          </span>
        )}
      </div>

      {!isRecording && (
        <button
          onClick={start}
          className="w-full bg-red-500 text-white py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <Mic className="w-5 h-5" /> Start Recording
        </button>
      )}

      {isRecording && (
        <button
          onClick={stop}
          className="w-full bg-gray-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <Square className="w-5 h-5" /> Stop
        </button>
      )}

      {!isRecording && stream && (
        <button
          onClick={reset}
          className="w-full bg-gray-500 text-white py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" /> Record Again
        </button>
      )}
    </div>
  );
}
