"use client";

import { useState, useRef, useEffect } from "react";
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
  // States for read aloud functionality
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
        <RecordButton
          isRecording={recording}
          onClick={recording ? stopRecording : startRecording}
        />

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
          <ReadAloudButton
            isProcessing={isProcessingSpeech}
            isPlaying={isPlaying}
            onClick={readAloud}
          />
        </TextSection>
      )}

      {transformedText && <TextActions text={transformedText} />}

      <Footer />
    </div>
  );
}
