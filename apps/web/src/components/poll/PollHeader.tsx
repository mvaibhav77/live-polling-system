import React from "react";
import Timer from "../../assets/timer.svg";

interface PollHeaderProps {
  isActive: boolean;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  questionNumber?: number;
}

const PollHeader: React.FC<PollHeaderProps> = ({
  isActive,
  timeLeft,
  formatTime,
  questionNumber,
}) => {
  return (
    <div className="flex gap-12 items-center mb-6">
      <h1 className="text-2xl font-semibold">Question {questionNumber || 1}</h1>
      <div className="flex items-center gap-2">
        {/* timer icon */}
        <img src={Timer} alt="Timer" width={15} height={15} />
        <span className="text-red-500 font-mono pt-0.5 font-medium">
          {!isActive ? "00:00" : formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
};

export default PollHeader;
