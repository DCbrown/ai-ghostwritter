"use client";

type ReadAloudButtonProps = {
  isProcessing: boolean;
  isPlaying: boolean;
  onClick: () => void;
};

export default function ReadAloudButton({
  isProcessing,
  isPlaying,
  onClick,
}: ReadAloudButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isProcessing || isPlaying}
      className={`flex items-center gap-1 text-sm border rounded-full px-3 py-1 
        ${
          isProcessing || isPlaying
            ? "opacity-60 cursor-not-allowed border-gray-300 dark:border-gray-700"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
    >
      {isProcessing ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
          <span>Processing...</span>
        </>
      ) : isPlaying ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
          <span>Playing...</span>
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
          <span>Read Aloud</span>
        </>
      )}
    </button>
  );
}
