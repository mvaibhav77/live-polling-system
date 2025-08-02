import React from "react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  retryText = "Try Again",
  className = "",
}) => {
  return (
    <div
      className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}
    >
      <div className="text-center">
        <div className="text-red-600 text-xl mb-4">⚠️ {title}</div>
        <p className="text-gray-600 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
