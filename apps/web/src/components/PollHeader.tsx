import React from "react";
import Timer from "../assets/timer.svg";

interface PollHeaderProps {
  isActive: boolean;
  timeLeft: number;
  formatTime: (seconds: number) => string;
}

const PollHeader: React.FC<PollHeaderProps> = ({
  isActive,
  timeLeft,
  formatTime,
}) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Question</h1>

      {/* Timer (only show when poll is active) */}
      {isActive && (
        <div className="flex items-center gap-2">
          <img src={Timer} alt="Timer" width={15} height={15} />
          <span className="text-red-500 font-mono pt-0.5 font-medium">
            {formatTime(timeLeft)}
          </span>
        </div>
      )}
    </div>
  );
};

export default PollHeader;
