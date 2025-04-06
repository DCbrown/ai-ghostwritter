import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Set a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
        signal: controller.signal,
      }
    );

    // Clear the timeout
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        // If parsing fails, use the raw text as error
        errorData = { error: errorText };
      }
      console.error("OpenAI API error response:", errorData);
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return NextResponse.json({ result: data.text });
  } catch (error) {
    console.error("Transcription error:", error);
    // Send a more specific error message based on the type of error
    let errorMessage = "Failed to transcribe audio";

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage =
          "Transcription request timed out. Please try with a shorter audio clip.";
      } else if (error.message.includes("OpenAI API")) {
        errorMessage = "OpenAI service error. Please try again later.";
      }
      console.error(error.message);
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
