import React from "react";

interface QuestionInputProps {
  question: string;
  timeLimit: number;
  onQuestionChange: (question: string) => void;
  onTimeLimitChange: (timeLimit: number) => void;
  validationErrors: string[];
  error?: { status?: number; data?: unknown; message?: string } | null;
}

const QuestionInput: React.FC<QuestionInputProps> = ({
  question,
  timeLimit,
  onQuestionChange,
  onTimeLimitChange,
  validationErrors,
  error,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <label className="block font-semibold text-gray-900">
          Enter your question
        </label>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{question.length}/100</span>
          <div className="relative">
            <select
              value={timeLimit}
              onChange={(e) => onTimeLimitChange(Number(e.target.value))}
              className="appearance-none bg-background border border-gray-300 px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
            >
              <option value={30}>30 seconds</option>
              <option value={60}>60 seconds</option>
              <option value={90}>90 seconds</option>
              <option value={120}>120 seconds</option>
              <option value={10000}>Testing Time</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <textarea
        value={question}
        onChange={(e) => onQuestionChange(e.target.value.slice(0, 100))}
        placeholder="What is the capital of France?"
        className="w-full h-24 max-h-[250px] p-4 border border-gray-200 bg-background resize focus:ring-2focus:border-transparent"
      />

      {/* Validation Errors */}
      {(validationErrors.length > 0 || error) && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          {validationErrors.map((err, index) => (
            <p key={index} className="text-red-600 text-sm">
              {err}
            </p>
          ))}
          {error && (
            <p className="text-red-600 text-sm">
              {"data" in error
                ? `Error: ${error.status}`
                : "message" in error
                  ? error.message || "An error occurred"
                  : "An error occurred"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionInput;
