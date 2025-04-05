"use client";

type LoadingSpinnerProps = {
  message?: string;
  size?: "small" | "medium";
};

export default function LoadingSpinner({
  message,
  size = "medium",
}: LoadingSpinnerProps) {
  const spinnerSize = size === "small" ? "h-4 w-4" : "h-8 w-8";
  const borderSize = size === "small" ? "border-2" : "border-4";

  return (
    <div className="text-center">
      <div
        className={`inline-block ${spinnerSize} animate-spin rounded-full ${borderSize} border-solid border-current border-r-transparent mb-2`}
      ></div>
      {message && <p>{message}</p>}
    </div>
  );
}
