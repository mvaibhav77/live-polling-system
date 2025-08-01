import { useState, useEffect } from "react";
import Button from "./Button";
import Timer from "../assets/timer.svg";
import PollQuestionCard from "./PollQuestionCard";

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
        <PollQuestionCard
          poll={poll}
          pollResults={pollResults}
          selectedOption={selectedOption}
          showResults={localShowResults}
          isInteractive={true}
          isStudentChoice={(index) => selectedOption === index}
          onOptionSelect={setSelectedOption}
          isDisabled={isDisabled}
          showPercentages={true}
          showStudentChoice={true}
        />

        {/* Status Messages */}
        <div className="mt-4">
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
