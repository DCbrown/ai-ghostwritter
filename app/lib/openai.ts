import OpenAI from "openai";

// Initialize OpenAI client with the dangerous flag
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Be careful with this in production!
});

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

function getSystemPrompt(style: string, persona: string | null): string {
  let prompt = `You are an expert writer specializing in ${style} writing. `;

  switch (style) {
    case "formal":
      prompt +=
        "Write in a professional, structured manner suitable for essays or reports.";
      break;
    case "casual":
      prompt +=
        "Write in a relaxed, conversational tone appropriate for blogs or social media.";
      break;
    case "persuasive":
      prompt +=
        "Write compelling copy designed to convince and motivate action.";
      break;
    case "creative":
      prompt +=
        "Write with imaginative flair, using descriptive language and narrative techniques.";
      break;
  }

  if (persona) {
    prompt += ` Adopt the writing style and voice of ${persona}.`;
  }

  prompt += ` Structure the text appropriately with headings, paragraphs, and bullet points as needed.
  Improve grammar and clarity. Remove redundancies and unclear phrases.`;

  return prompt;
}
