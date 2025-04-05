// Client-side API functions
// These functions communicate with the server-side API routes

export async function transcribeSpeech(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  formData.append("model", "whisper-1");

  const response = await fetch("/api/transcribe", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (response.ok) {
    return data.result;
  } else {
    throw new Error(data.error || "Failed to transcribe speech");
  }
}

export async function transformText(
  text: string,
  style: string,
  persona: string | null
): Promise<string> {
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

  const data = await response.json();

  if (response.ok) {
    return data.result;
  } else {
    throw new Error(data.error || "Failed to transform text");
  }
}

export async function textToSpeech(text: string): Promise<ArrayBuffer> {
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

  const data = await response.json();

  if (response.ok) {
    // Convert base64 back to ArrayBuffer
    const binaryString = atob(data.result);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } else {
    throw new Error(data.error || "Failed to generate speech");
  }
}
