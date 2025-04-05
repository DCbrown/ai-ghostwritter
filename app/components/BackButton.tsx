"use client";

type BackButtonProps = {
  onClick: () => void;
  label?: string;
};

export default function BackButton({
  onClick,
  label = "Back to Style Selection",
}: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center text-sm hover:text-gray-600 dark:hover:text-gray-300"
      aria-label={label}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-1"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
