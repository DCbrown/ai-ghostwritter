"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  transcribeSpeech,
  transformText,
  textToSpeech,
} from "@/app/lib/openai";
import BackButton from "@/app/components/BackButton";
import Footer from "@/app/components/Footer";
import RecordButton from "@/app/components/RecordButton";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import TextSection from "@/app/components/TextSection";
import TextActions from "@/app/components/TextActions";
import ReadAloudButton from "@/app/components/ReadAloudButton";

// Main content component that uses useSearchParams - must be wrapped in Suspense
function RecordPageContent() {
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
  // States for read aloud functionality
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isIntentionalStop, setIsIntentionalStop] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Function to entirely stop audio playback
  const stopAudioPlayback = () => {
    if (audioPlayerRef.current) {
      // Mark this as an intentional stop to prevent error messages
      setIsIntentionalStop(true);
      const audio = audioPlayerRef.current;

      // Hard pause
      audio.pause();

      // Reset all properties
      audio.currentTime = 0;
      audio.volume = 0;

      // Empty source
      audio.src = "";

      // Force browser to update
      audio.load();

      // Update state
      setIsPlaying(false);
      setIsProcessingSpeech(false);

      // Clear URL if exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      // Clear reference
      audioPlayerRef.current = null;

      // Reset error if it was caused by audio playback
      if (error?.includes("Error playing audio")) {
        setError(null);
      }
    }
  };

  // Function to navigate back to the previous screen
  const handleGoBack = () => {
    // First stop recording if active
    if (recording) {
      stopRecording();
    }

    // Then forcefully stop audio playback
    stopAudioPlayback();

    // Only navigate after cleanup
    setTimeout(() => {
      router.push("/");
    }, 50);
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
      setIsProcessingSpeech(true);
      setIsIntentionalStop(false);

      // Stop any existing audio first
      stopAudioPlayback();

      // Generate new speech
      const audioBuffer = await textToSpeech(transformedText);
      const blob = new Blob([audioBuffer], { type: "audio/mp3" });

      // Create new URL
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Create new audio element
      const audio = new Audio(url);

      // Set up simple event handlers
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => {
        setIsPlaying(false);
        // Don't clear audio reference here to allow replay
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setIsProcessingSpeech(false);
        if (!isIntentionalStop) {
          setError("Error playing audio. Please try again.");
        }
      };

      // Store reference
      audioPlayerRef.current = audio;

      // Play when ready
      audio.oncanplaythrough = () => {
        setIsProcessingSpeech(false);
        audio.play().catch((err) => {
          console.error("Error playing audio:", err);
          setIsPlaying(false);
          setIsProcessingSpeech(false);
          if (!isIntentionalStop) {
            setError("Error playing audio. Please try again.");
          }
        });
      };

      // Set timeout for loading
      setTimeout(() => {
        if (isProcessingSpeech && !isIntentionalStop) {
          setIsProcessingSpeech(false);
          setError("Audio loading timed out. Please try again.");
        }
      }, 10000);
    } catch (err) {
      setIsProcessingSpeech(false);
      setIsPlaying(false);
      if (!isIntentionalStop) {
        setError("Error generating speech. Please try again.");
      }
      console.error("Text-to-speech error:", err);
    }
  };

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      stopAudioPlayback();
    };
  }, []);

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl relative mb-6">
        <BackButton onClick={handleGoBack} />
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
        {!transcribing && !transforming && (
          <RecordButton
            isRecording={recording}
            onClick={recording ? stopRecording : startRecording}
          />
        )}

        {(transcribing || transforming) && (
          <LoadingSpinner
            message={
              transcribing
                ? "Transcribing your speech..."
                : "Transforming your text..."
            }
          />
        )}

        {error && <div className="mt-4 text-red-500 text-center">{error}</div>}
      </div>

      {rawText && (
        <TextSection title="Raw Transcription" content={rawText} isRaw={true} />
      )}

      {transformedText && (
        <TextSection title="Transformed Text" content={transformedText}>
          <div className="flex items-center gap-2">
            <ReadAloudButton
              isProcessing={isProcessingSpeech}
              isPlaying={isPlaying}
              onClick={readAloud}
            />
            {isPlaying && (
              <button
                onClick={stopAudioPlayback}
                className="flex items-center gap-1 text-sm border rounded-full px-3 py-1 text-red-500 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-red-700"
              >
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
                  <rect x="6" y="4" width="12" height="16" rx="2"></rect>
                </svg>
                <span>Stop</span>
              </button>
            )}
          </div>
        </TextSection>
      )}

      {transformedText && <TextActions text={transformedText} />}

      <Footer />
    </div>
  );
}

// Wrapper component that provides Suspense boundary
export default function RecordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      }
    >
      <RecordPageContent />
    </Suspense>
  );
}
