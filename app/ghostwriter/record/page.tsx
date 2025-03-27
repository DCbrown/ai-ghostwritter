"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  transcribeSpeech,
  transformText,
  textToSpeech,
} from "@/app/lib/openai";

export default function RecordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const style = searchParams.get("style") || "casual";
  const persona = searchParams.get("persona");

  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transforming, setTransforming] = useState(false);
  const [rawText, setRawText] = useState("");
  const [transformedText, setTransformedText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // New states for read aloud functionality
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Function to navigate back to the previous screen
  const handleGoBack = () => {
    // Clean up any ongoing recording or audio
    if (recording) {
      stopRecording();
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }

    // Navigate back to the home page
    router.push("/");
  };

  // Start recording function
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleTranscription;

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
      setError(null);
    } catch (err) {
      setError("Microphone access denied or not available");
      console.error("Error accessing microphone:", err);
    }
  };

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);

      // Stop all audio tracks
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  // Handle transcription after recording stops
  const handleTranscription = async () => {
    try {
      setTranscribing(true);
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      // Transcribe audio using Whisper API
      const text = await transcribeSpeech(audioBlob);
      setRawText(text);

      // Transform the text based on style and persona
      setTransforming(true);
      setTranscribing(false);
      const transformed = await transformText(text, style, persona);
      setTransformedText(transformed);
      setTransforming(false);
    } catch (err) {
      setError("Error processing your speech. Please try again.");
      setTranscribing(false);
      setTransforming(false);
      console.error("Transcription error:", err);
    }
  };

  // Read the transformed text aloud with enhanced states
  const readAloud = async () => {
    try {
      // Set processing state
      setIsProcessingSpeech(true);

      // Properly clean up any existing audio
      if (audioPlayerRef.current) {
        // Remove event listeners to prevent memory leaks
        const oldAudio = audioPlayerRef.current;
        oldAudio.removeEventListener("play", () => setIsPlaying(true));
        oldAudio.removeEventListener("ended", handleAudioEnded);
        oldAudio.removeEventListener("pause", () => setIsPlaying(false));
        oldAudio.removeEventListener("error", () => {
          setIsPlaying(false);
          setIsProcessingSpeech(false);
        });

        // Stop the audio
        oldAudio.pause();
        audioPlayerRef.current = null;

        // Add a small delay to ensure the pause is processed
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Generate new speech
      const audioBuffer = await textToSpeech(transformedText);
      const blob = new Blob([audioBuffer], { type: "audio/mp3" });

      // Clean up old URL if it exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      // Create new URL and set states
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Create and configure audio player
      const audio = new Audio();

      // Set up event listeners before setting source
      audio.addEventListener("play", () => setIsPlaying(true));
      audio.addEventListener("ended", handleAudioEnded);
      audio.addEventListener("pause", () => setIsPlaying(false));
      audio.addEventListener("error", (e) => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
        setIsProcessingSpeech(false);
        setError("Error playing audio. Please try again.");
      });

      // Set the source
      audio.src = url;
      audioPlayerRef.current = audio;

      // Wait for audio to be loaded before playing
      audio.addEventListener(
        "canplaythrough",
        () => {
          setIsProcessingSpeech(false);
          audio.play().catch((err) => {
            console.error("Error playing audio:", err);
            setIsPlaying(false);
            setIsProcessingSpeech(false);
            setError("Error playing audio. Please try again.");
          });
        },
        { once: true }
      );

      // Set a timeout in case loading takes too long
      setTimeout(() => {
        if (isProcessingSpeech) {
          setIsProcessingSpeech(false);
          setError("Audio loading timed out. Please try again.");
        }
      }, 10000);
    } catch (err) {
      setIsProcessingSpeech(false);
      setIsPlaying(false);
      setError("Error generating speech. Please try again.");
      console.error("Text-to-speech error:", err);
    }
  };

  // Update the handleAudioEnded function
  const handleAudioEnded = () => {
    setIsPlaying(false);

    // Clean up properly after playback
    if (audioPlayerRef.current) {
      const audio = audioPlayerRef.current;

      // Remove event listeners
      audio.removeEventListener("play", () => setIsPlaying(true));
      audio.removeEventListener("ended", handleAudioEnded);
      audio.removeEventListener("pause", () => setIsPlaying(false));

      // Wait before nullifying to prevent race conditions
      setTimeout(() => {
        if (audioPlayerRef.current === audio) {
          audioPlayerRef.current = null;
        }
      }, 500);
    }
  };

  // Clean up audio URL and player on component unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, [audioUrl]);

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl relative mb-6">
        <button
          onClick={handleGoBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center text-sm hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Back to Style Selection"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Back to Style Selection</span>
        </button>
        <h1 className="text-2xl font-bold text-center">AI Ghostwriter</h1>
      </div>

      <p className="mb-8 text-gray-600 dark:text-gray-300">
        Style: <span className="font-semibold capitalize">{style}</span>
        {persona && (
          <>
            {" "}
            · Persona: <span className="font-semibold">{persona}</span>
          </>
        )}
      </p>

      <div className="w-full max-w-3xl mb-8 flex flex-col items-center">
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`rounded-full w-16 h-16 flex items-center justify-center mb-4 ${
            recording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
          }`}
        >
          {recording ? (
            <span className="w-6 h-6 rounded-sm bg-white"></span>
          ) : (
            <span className="w-6 h-6 rounded-full bg-red-500"></span>
          )}
        </button>

        <p className="text-sm text-center">
          {recording
            ? "Recording... Click to stop"
            : "Click to start recording"}
        </p>

        {(transcribing || transforming) && (
          <div className="mt-4 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-2"></div>
            <p>
              {transcribing
                ? "Transcribing your speech..."
                : "Transforming your text..."}
            </p>
          </div>
        )}

        {error && <div className="mt-4 text-red-500 text-center">{error}</div>}
      </div>

      {rawText && (
        <div className="w-full max-w-3xl mb-8">
          <h2 className="text-xl font-semibold mb-2">Raw Transcription</h2>
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 min-h-[100px]">
            {rawText}
          </div>
        </div>
      )}

      {transformedText && (
        <div className="w-full max-w-3xl mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Transformed Text</h2>
            <button
              onClick={readAloud}
              disabled={isProcessingSpeech || isPlaying}
              className={`flex items-center gap-1 text-sm border rounded-full px-3 py-1 
                ${
                  isProcessingSpeech || isPlaying
                    ? "opacity-60 cursor-not-allowed border-gray-300 dark:border-gray-700"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              {isProcessingSpeech ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : isPlaying ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                  <span>Playing...</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  </svg>
                  <span>Read Aloud</span>
                </>
              )}
            </button>
          </div>
          <div className="p-4 border rounded-lg bg-white dark:bg-gray-900 min-h-[200px]">
            <div
              dangerouslySetInnerHTML={{
                __html: transformedText.replace(/\n/g, "<br>"),
              }}
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(transformedText);
              }}
              className="flex-1 border rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={() => {
                const blob = new Blob([transformedText], {
                  type: "text/plain",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `ghostwriter-${new Date()
                  .toISOString()
                  .slice(0, 10)}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex-1 border rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Download as Text
            </button>
          </div>
        </div>
      )}

      <footer className="mt-auto pt-8 pb-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Made with ❤️ by Donovan Brown
      </footer>
    </div>
  );
}
