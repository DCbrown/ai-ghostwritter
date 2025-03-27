import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client safely on the server side
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const { action, data } = await request.json();

  try {
    switch (action) {
      case "transform":
        const { text, style, persona } = data;
        const systemPrompt = getSystemPrompt(style, persona);

        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
        });

        return NextResponse.json({
          result: completion.choices[0].message.content || "",
        });

      case "textToSpeech":
        const { input } = data;
        const speechResponse = await openai.audio.speech.create({
          model: "tts-1",
          voice: "alloy",
          input,
        });

        // Convert to ArrayBuffer and then to Base64
        const buffer = await speechResponse.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");

        return NextResponse.json({ result: base64 });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
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

  // Add this instruction to prevent explanatory text
  prompt += ` Important: Do not include any meta-commentary or explanatory text at the end such as "And there you have it!" or instructions about how to use the text. Do not include separators like "---" or explanations of what you've done. Only provide the transformed content itself.`;

  return prompt;
}
