import React from "react";
import Spinner from "./Spinner";

interface LoadingStateProps {
  loadingText?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  loadingText = "Loading...",
  size = "lg",
  className = "",
}) => {
  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}
    >
      <div className="flex flex-col items-center gap-6">
        <Spinner size={size} />
        <p className="text-gray-600">{loadingText}</p>
      </div>
    </div>
  );
};

export default LoadingState;
