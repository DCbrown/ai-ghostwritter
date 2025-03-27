"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type WritingStyle = "formal" | "casual" | "persuasive" | "creative";

export default function Home() {
  const [selectedStyle, setSelectedStyle] = useState<WritingStyle | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [customPersona, setCustomPersona] = useState<string>("");
  const router = useRouter();

  const personas = {
    formal: [
      "Academic Researcher",
      "Corporate Executive",
      "Scientific Journal",
    ],
    casual: ["Friend Next Door", "Tech Blogger", "Social Media Influencer"],
    persuasive: [
      "Marketing Expert",
      "Political Speechwriter",
      "Sales Professional",
    ],
    creative: [
      "Shakespeare",
      "Hemingway",
      "Victorian Novelist",
      "Sci-Fi Author",
    ],
  };

  const handleContinue = () => {
    if (!selectedStyle) return;

    const finalPersona =
      selectedPersona === "custom" ? customPersona : selectedPersona;
    const params = new URLSearchParams({
      style: selectedStyle,
      ...(finalPersona && { persona: finalPersona }),
    });

    router.push(`/ghostwriter/record?${params.toString()}`);
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-8">AI Ghostwriter</h1>
      <p className="text-center mb-8 max-w-2xl">
        Transform your spoken words into polished, professional text with our
        AI-powered ghostwriter. Select a writing style to begin.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mb-8">
        {(["formal", "casual", "persuasive", "creative"] as WritingStyle[]).map(
          (style) => (
            <div
              key={style}
              className={`border rounded-lg p-6 cursor-pointer transition-all ${
                selectedStyle === style
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
              }`}
              onClick={() => setSelectedStyle(style)}
            >
              <h2 className="text-xl font-semibold capitalize mb-2">{style}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {style === "formal" &&
                  "Perfect for essays, reports, and academic writing"}
                {style === "casual" &&
                  "Great for blog posts, social media, and informal writing"}
                {style === "persuasive" &&
                  "Ideal for marketing, copywriting, and arguments"}
                {style === "creative" &&
                  "For storytelling, poetry, and expressive writing"}
              </p>
            </div>
          )
        )}
      </div>

      {selectedStyle && (
        <>
          <h2 className="text-xl font-semibold mb-4">
            Choose a Persona (Optional)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8 w-full max-w-3xl">
            {personas[selectedStyle].map((persona) => (
              <div
                key={persona}
                className={`border rounded-lg p-3 text-center cursor-pointer ${
                  selectedPersona === persona
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                }`}
                onClick={() => setSelectedPersona(persona)}
              >
                {persona}
              </div>
            ))}
            <div
              className={`border rounded-lg p-3 text-center cursor-pointer ${
                selectedPersona === "custom"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
              }`}
              onClick={() => setSelectedPersona("custom")}
            >
              Custom...
            </div>
          </div>

          {selectedPersona === "custom" && (
            <input
              type="text"
              value={customPersona}
              onChange={(e) => setCustomPersona(e.target.value)}
              placeholder="Enter custom persona (e.g., Sarcastic Robot)"
              className="w-full max-w-3xl p-3 border rounded-lg mb-8"
            />
          )}

          <button
            onClick={handleContinue}
            className="bg-foreground text-background rounded-full py-3 px-8 hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
          >
            Continue to Recording
          </button>
        </>
      )}

      {/* Features and Benefits Section - Now placed after the Continue button */}
      <div className="w-full max-w-3xl mt-16 mb-12">
        <h2 className="text-xl font-semibold text-center mb-8">
          Why Use AI Ghostwriter?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Feature 1 */}
          <div className="flex items-start space-x-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
            </div>
            <div>
              <h3 className="font-medium mb-1">Effortless Voice-to-Text</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Convert your spoken words into written text instantly, no typing
                needed.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start space-x-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l1.9 5.7a2 2 0 0 0 1.3 1.3L21 12l-5.7 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.7a2 2 0 0 0-1.3-1.3L3 12l5.7-1.9a2 2 0 0 0 1.3-1.3L12 3z"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-medium mb-1">AI-Powered Enhancement</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Transform casual speech into polished, professional writing with
                advanced AI.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start space-x-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="font-medium mb-1">Multiple Writing Styles</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Choose from formal, casual, persuasive, or creative styles to
                match any context.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex items-start space-x-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <h3 className="font-medium mb-1">Persona Customization</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Adopt the voice of famous authors or specialized professionals
                for unique content.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="flex items-start space-x-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
            </div>
            <div>
              <h3 className="font-medium mb-1">Text-to-Speech Playback</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Listen to your transformed text with natural-sounding voice
                synthesis.
              </p>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="flex items-start space-x-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>
            <div>
              <h3 className="font-medium mb-1">Easy Export Options</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Copy to clipboard or download as text files for seamless
                integration with other tools.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-auto pt-8 pb-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Made with ❤️ by Donovan Brown
      </footer>
    </div>
  );
}
