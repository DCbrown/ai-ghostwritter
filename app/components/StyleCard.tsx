"use client";

type StyleCardProps = {
  style: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
};

export default function StyleCard({
  style,
  description,
  isSelected,
  onClick,
}: StyleCardProps) {
  return (
    <div
      className={`border rounded-lg p-6 cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
      }`}
      onClick={onClick}
    >
      <h2 className="text-xl font-semibold capitalize mb-2">{style}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
