"use client";

type TextActionsProps = {
  text: string;
};

export default function TextActions({ text }: TextActionsProps) {
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    const blob = new Blob([text], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ghostwriter-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-4 mt-4">
      <button
        onClick={handleCopyToClipboard}
        className="flex-1 border rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        Copy to Clipboard
      </button>
      <button
        onClick={handleDownload}
        className="flex-1 border rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        Download as Text
      </button>
    </div>
  );
}
