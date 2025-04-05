"use client";

type TextSectionProps = {
  title: string;
  content: string;
  isRaw?: boolean;
  children?: React.ReactNode;
};

export default function TextSection({
  title,
  content,
  isRaw = false,
  children,
}: TextSectionProps) {
  return (
    <div className="w-full max-w-3xl mb-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        {children}
      </div>
      <div
        className={`p-4 border rounded-lg ${
          isRaw
            ? "bg-gray-50 dark:bg-gray-800/50 min-h-[100px]"
            : "bg-white dark:bg-gray-900 min-h-[200px]"
        }`}
      >
        {isRaw ? (
          content
        ) : (
          <div
            dangerouslySetInnerHTML={{
              __html: content.replace(/\n/g, "<br>"),
            }}
          />
        )}
      </div>
    </div>
  );
}
