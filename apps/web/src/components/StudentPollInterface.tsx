import { useState, useEffect } from "react";
import Button from "./Button";
import Timer from "../assets/timer.svg";

interface StudentPollInterfaceProps {
  poll: {
    pollId: string;
    questionNumber?: number;
    question: string;
    options: string[];
    timeLimit: number;
    startTime?: number;
    status?: "waiting" | "active" | "ended";
  };
  studentName: string;
  onSubmit: (selectedOptionIndex: number) => void;
  isSubmitting?: boolean;
  hasSubmitted?: boolean;
  pollResults?: {
    [optionIndex: string]: number;
  } | null;
  showResults?: boolean;
}

const StudentPollInterface: React.FC<StudentPollInterfaceProps> = ({
  poll,
  studentName,
  onSubmit,
  isSubmitting = false,
  hasSubmitted = false,
  pollResults = null,
  showResults = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(poll.timeLimit);
  const [localShowResults, setLocalShowResults] = useState(showResults);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

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
    setHasAutoSubmitted(false);
  }, [poll.pollId]);

  // Auto-submit when time runs out (if option is selected)
  useEffect(() => {
    if (
      timeRemaining === 0 &&
      selectedOption !== null &&
      !hasSubmitted &&
      !isSubmitting &&
      !hasAutoSubmitted
    ) {
      console.log("⏰ Time's up! Auto-submitting selected answer...");
      setHasAutoSubmitted(true);
      onSubmit(selectedOption);
    }
  }, [
    timeRemaining,
    selectedOption,
    hasSubmitted,
    isSubmitting,
    hasAutoSubmitted,
    onSubmit,
  ]);

  // Show results when poll is finished or time runs out
  useEffect(() => {
    if (
      hasSubmitted ||
      timeRemaining === 0 ||
      poll.status === "ended" ||
      showResults
    ) {
      setLocalShowResults(true);
    }
  }, [hasSubmitted, timeRemaining, poll.status, showResults]);

  // Calculate poll result percentages
  const calculateResultPercentages = () => {
    if (!pollResults) return [];

    // The pollResults might be nested under responses property or be the responses directly
    const responses = pollResults?.responses || pollResults;

    // Ensure we have a valid responses object
    if (!responses || typeof responses !== "object")
      return poll.options.map(() => 0);

    const total = Object.values(responses as Record<string, number>).reduce(
      (sum: number, count: number) => sum + count,
      0
    );
    if (total === 0) return poll.options.map(() => 0);

    return poll.options.map((_, index) => {
      const count =
        (responses as Record<string, number>)[index.toString()] || 0;
      return Math.round((count / total) * 100);
    });
  };

  const resultPercentages = calculateResultPercentages();

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="flex flex-col max-w-3xl  w-full">
        {/* Header with Question Number and Timer */}
        <div className="flex gap-12 items-center mb-6">
          <h1 className="text-2xl font-semibold">
            Question {poll.questionNumber || 1}
          </h1>
          <div className="flex items-center gap-2">
            {/* timer icon */}
            <img src={Timer} alt="Timer" width={15} height={15} />
            <span className="text-red-500 font-mono pt-0.5 font-medium">
              {localShowResults ? "00:00" : formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white flex flex-col gap-6 rounded-xl shadow-lg w-full border-1 border-primary pb-4">
          {/* Question Header */}
          <div className="bg-gradient-to-r from-foreground to-neutral-500 text-white p-4 rounded-t-lg">
            <p className="text-lg font-bold leading-relaxed">{poll.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-4 px-4 pt-2">
            {poll.options.map((option, index) => {
              const isStudentChoice = selectedOption === index;
              const percentage = resultPercentages[index] || 0;

              return (
                <div
                  key={index}
                  className={`relative p-4 border-2 rounded-lg transition-all ${
                    localShowResults
                      ? isStudentChoice
                        ? "border-primary bg-primary/10" // Highlight student's choice
                        : "border-gray-200 bg-gray-50"
                      : selectedOption === index
                        ? "border-primary bg-purple-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  } ${!localShowResults && !isDisabled ? "cursor-pointer" : ""}`}
                  onClick={() =>
                    !localShowResults && !isDisabled && setSelectedOption(index)
                  }
                >
                  {/* Background bar for results */}
                  {localShowResults && percentage > 0 && (
                    <div
                      className="absolute inset-0 bg-primary/20 rounded-lg"
                      style={{ width: `${percentage}%` }}
                    />
                  )}

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold mr-4 ${
                          localShowResults
                            ? isStudentChoice
                              ? "border-primary bg-primary text-white"
                              : "border-gray-400 bg-white text-gray-600"
                            : selectedOption === index
                              ? "border-primary bg-primary text-white"
                              : "border-gray-300 text-gray-500 bg-white"
                        }`}
                      >
                        {getOptionLabel(index)}
                      </div>
                      <span className="text-foreground text-base">
                        {option}
                      </span>
                      {localShowResults && isStudentChoice && (
                        <span className="ml-2 text-primary text-sm font-medium">
                          (Your choice)
                        </span>
                      )}
                    </div>

                    {/* Show percentage in results view */}
                    {localShowResults && (
                      <div className="text-right">
                        <span className="text-lg font-semibold text-gray-700">
                          {percentage}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status Messages */}
          {hasSubmitted && (
            <div className="mb-2 text-center">
              <p className="text-green-600 text-sm">
                Thank you, {studentName}! Your answer has been submitted.
              </p>
            </div>
          )}

          {isTimeUp && !hasSubmitted && (
            <div className="mb-2 text-center">
              <p className="text-red-600 text-sm font-medium">
                ⏰ Time's up! You can no longer submit an answer.
              </p>
            </div>
          )}

          {!hasSubmitted && !isTimeUp && selectedOption === null && (
            <div className="mb-2 text-center">
              <p className="text-gray-500 text-sm">
                Please select an option to submit your answer.
              </p>
            </div>
          )}

          {timeRemaining <= 10 && timeRemaining > 0 && !hasSubmitted && (
            <div className="mb-2 text-center">
              <p className="text-orange-600 text-sm font-medium animate-pulse">
                ⚠️ Hurry! Only {timeRemaining} second
                {timeRemaining !== 1 ? "s" : ""} left!
              </p>
            </div>
          )}
        </div>

        {/* Submit Button or Wait Message */}
        <div className="flex justify-center mt-8">
          {localShowResults ? (
            <h2 className="text-2xl font-medium text-gray-700 text-center">
              Wait for teacher to ask a new question
            </h2>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={selectedOption === null || isDisabled}
              className={`${
                selectedOption === null || isDisabled
                  ? "bg-gray-300 cursor-not-allowed"
                  : hasSubmitted
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-purple-600 hover:bg-purple-700"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPollInterface;
