"use client";

type RecordButtonProps = {
  isRecording: boolean;
  onClick: () => void;
};

export default function RecordButton({
  isRecording,
  onClick,
}: RecordButtonProps) {
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onClick}
        className={`rounded-full w-16 h-16 flex items-center justify-center mb-4 ${
          isRecording
            ? "bg-red-500 hover:bg-red-600"
            : "bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
        }`}
      >
        {isRecording ? (
          <span className="w-6 h-6 rounded-sm bg-white"></span>
        ) : (
          <span className="w-6 h-6 rounded-full bg-red-500"></span>
        )}
      </button>

      <p className="text-sm text-center">
        {isRecording
          ? "Recording... Click to stop"
          : "Click to start recording"}
      </p>
    </div>
  );
}
