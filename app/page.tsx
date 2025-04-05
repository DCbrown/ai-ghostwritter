"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StyleCard from "./components/StyleCard";
import PersonaCard from "./components/PersonaCard";
import FeatureCard from "./components/FeatureCard";
import Footer from "./components/Footer";
import Icon from "./components/Icon";

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

  const styleDescriptions = {
    formal: "Perfect for essays, reports, and academic writing",
    casual: "Great for blog posts, social media, and informal writing",
    persuasive: "Ideal for marketing, copywriting, and arguments",
    creative: "For storytelling, poetry, and expressive writing",
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
            <StyleCard
              key={style}
              style={style}
              description={styleDescriptions[style]}
              isSelected={selectedStyle === style}
              onClick={() => setSelectedStyle(style)}
            />
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
              <PersonaCard
                key={persona}
                persona={persona}
                isSelected={selectedPersona === persona}
                onClick={() => setSelectedPersona(persona)}
              />
            ))}
            <PersonaCard
              persona="Custom..."
              isSelected={selectedPersona === "custom"}
              onClick={() => setSelectedPersona("custom")}
            />
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
          <FeatureCard
            title="Effortless Voice-to-Text"
            description="Convert your spoken words into written text instantly, no typing needed."
            icon={<Icon name="microphone" />}
          />

          <FeatureCard
            title="AI-Powered Enhancement"
            description="Transform casual speech into polished, professional writing with advanced AI."
            icon={<Icon name="star" />}
          />

          <FeatureCard
            title="Multiple Writing Styles"
            description="Choose from formal, casual, persuasive, or creative styles to match any context."
            icon={<Icon name="file" />}
          />

          <FeatureCard
            title="Persona Customization"
            description="Adopt the voice of famous authors or specialized professionals for unique content."
            icon={<Icon name="user" />}
          />

          <FeatureCard
            title="Text-to-Speech Playback"
            description="Listen to your transformed text with natural-sounding voice synthesis."
            icon={<Icon name="play" />}
          />

          <FeatureCard
            title="Easy Export Options"
            description="Copy to clipboard or download as text files for seamless integration with other tools."
            icon={<Icon name="download" />}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
