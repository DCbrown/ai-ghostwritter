"use client";

type PersonaCardProps = {
  persona: string;
  isSelected: boolean;
  onClick: () => void;
};

export default function PersonaCard({
  persona,
  isSelected,
  onClick,
}: PersonaCardProps) {
  return (
    <div
      className={`border rounded-lg p-3 text-center cursor-pointer ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
      }`}
      onClick={onClick}
    >
      {persona}
    </div>
  );
}
