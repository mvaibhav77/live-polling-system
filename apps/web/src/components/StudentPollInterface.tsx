import { useState, useEffect } from "react";
import Button from "./Button";

interface StudentPollInterfaceProps {
  poll: {
    pollId: string;
    questionNumber?: number;
    question: string;
    options: string[];
    timeLimit: number;
    startTime?: number;
  };
  studentName: string;
  onSubmit: (selectedOptionIndex: number) => void;
  isSubmitting?: boolean;
  hasSubmitted?: boolean;
}

const StudentPollInterface: React.FC<StudentPollInterfaceProps> = ({
  poll,
  studentName,
  onSubmit,
  isSubmitting = false,
  hasSubmitted = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(poll.timeLimit);

  // Real-time timer countdown
  useEffect(() => {
    if (!poll.startTime) {
      setTimeRemaining(poll.timeLimit);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - poll.startTime!) / 1000);
      const remaining = Math.max(0, poll.timeLimit - elapsed);
      setTimeRemaining(remaining);
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [poll.startTime, poll.timeLimit]);

  // Reset selected option when poll changes
  useEffect(() => {
    setSelectedOption(null);
  }, [poll.pollId]);

  // Auto-submit when time runs out (if option is selected)
  useEffect(() => {
    if (
      timeRemaining === 0 &&
      selectedOption !== null &&
      !hasSubmitted &&
      !isSubmitting
    ) {
      console.log("⏰ Time's up! Auto-submitting selected answer...");
      onSubmit(selectedOption);
    }
  }, [timeRemaining, selectedOption, hasSubmitted, isSubmitting, onSubmit]);

  // Calculate time remaining (this will be enhanced with real-time updates later)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = () => {
    if (
      selectedOption !== null &&
      !hasSubmitted &&
      !isSubmitting &&
      timeRemaining > 0
    ) {
      onSubmit(selectedOption);
    }
  };

  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D, etc.
  };

  const isTimeUp = timeRemaining <= 0;
  const isDisabled = hasSubmitted || isSubmitting || isTimeUp;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header with Question Number and Timer */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h1 className="text-lg font-medium text-gray-800">
              Question {poll.questionNumber || 1}
            </h1>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  timeRemaining <= 10
                    ? "bg-red-500 animate-pulse"
                    : timeRemaining <= 30
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
              ></div>
              <span
                className={`font-mono text-sm ${
                  timeRemaining <= 10
                    ? "text-red-500 font-bold"
                    : timeRemaining <= 30
                      ? "text-yellow-600"
                      : "text-green-600"
                }`}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>

          {/* Question Text */}
          <div className="p-6">
            <div className="bg-gray-800 text-white p-4 rounded-lg mb-6">
              <p className="text-base">{poll.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {poll.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !isDisabled && setSelectedOption(index)}
                  disabled={isDisabled}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                    selectedOption === index
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${
                    isDisabled
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                        selectedOption === index
                          ? "border-purple-500 bg-purple-500 text-white"
                          : "border-gray-400 text-gray-500"
                      }`}
                    >
                      {getOptionLabel(index)}
                    </div>
                    <span className="text-gray-800">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={selectedOption === null || isDisabled}
                className={`px-8 py-3 ${
                  hasSubmitted ? "bg-green-500 hover:bg-green-500" : ""
                }`}
              >
                {isSubmitting
                  ? "Submitting..."
                  : hasSubmitted
                    ? "Submitted ✓"
                    : isTimeUp
                      ? "Time's Up!"
                      : "Submit"}
              </Button>
            </div>

            {/* Status Messages */}
            {hasSubmitted && (
              <div className="mt-4 text-center">
                <p className="text-green-600 text-sm">
                  Thank you, {studentName}! Your answer has been submitted.
                </p>
              </div>
            )}

            {isTimeUp && !hasSubmitted && (
              <div className="mt-4 text-center">
                <p className="text-red-600 text-sm font-medium">
                  ⏰ Time's up! You can no longer submit an answer.
                </p>
              </div>
            )}

            {!hasSubmitted && !isTimeUp && selectedOption === null && (
              <div className="mt-4 text-center">
                <p className="text-gray-500 text-sm">
                  Please select an option to submit your answer.
                </p>
              </div>
            )}

            {timeRemaining <= 10 && timeRemaining > 0 && !hasSubmitted && (
              <div className="mt-4 text-center">
                <p className="text-orange-600 text-sm font-medium animate-pulse">
                  ⚠️ Hurry! Only {timeRemaining} second
                  {timeRemaining !== 1 ? "s" : ""} left!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPollInterface;
