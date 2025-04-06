// Client-side API functions
// These functions communicate with the server-side API routes

export async function transcribeSpeech(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  formData.append("model", "whisper-1");

  try {
    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      return data.result;
    } else {
      // More specific error handling with useful error messages
      const errorMessage = data.error || "Failed to transcribe speech";
      console.error("Transcription error:", errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error instanceof Error) {
      // Rethrow the error with its original message
      throw error;
    }
    // For unknown errors
    throw new Error("An unexpected error occurred during transcription");
  }
}

export async function transformText(
  text: string,
  style: string,
  persona: string | null
): Promise<string> {
  try {
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "transform",
        data: { text, style, persona },
      }),
    });

    // Safely handle response - ensure it's valid JSON
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      throw new Error("Invalid response format from server");
    }

    if (response.ok) {
      return data.result;
    } else {
      // More specific error handling with useful error messages
      const errorMessage = data.error || "Failed to transform text";
      console.error("Text transformation error:", errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error instanceof Error) {
      // Rethrow the error with its original message
      throw error;
    }
    // For unknown errors
    throw new Error("An unexpected error occurred during text transformation");
  }
}

export async function textToSpeech(text: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "textToSpeech",
        data: { input: text },
      }),
    });

    // Safely handle response - ensure it's valid JSON
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      throw new Error("Invalid response format from server");
    }

    if (response.ok) {
      // Convert base64 back to ArrayBuffer
      const binaryString = atob(data.result);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    } else {
      // More specific error handling with useful error messages
      const errorMessage = data.error || "Failed to generate speech";
      console.error("Text-to-speech error:", errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error instanceof Error) {
      // Rethrow the error with its original message
      throw error;
    }
    // For unknown errors
    throw new Error("An unexpected error occurred during speech generation");
  }
}
