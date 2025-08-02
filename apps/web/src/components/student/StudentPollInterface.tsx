import React from "react";
import Button from "../common/Button";
import Timer from "../../assets/timer.svg";
import PollQuestionCard from "../poll/PollQuestionCard";
import { useStudentPollTimer } from "../../hooks/useStudentPollTimer";
import { useStudentPollState } from "../../hooks/useStudentPollState";

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
  // Use custom hooks for timer and state management
  const { timeRemaining, formattedTime, isTimeUp, isTimeWarning } =
    useStudentPollTimer({
      poll,
      hasSubmitted,
      showResults,
    });

  const {
    selectedOption,
    localShowResults,
    isDisabled,
    canSubmit,
    handleSubmit,
    handleOptionSelect,
  } = useStudentPollState({
    poll,
    timeRemaining,
    hasSubmitted,
    isSubmitting,
    showResults,
    onSubmit,
  });

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
              {localShowResults ? "00:00" : formattedTime}
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
          onOptionSelect={handleOptionSelect}
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

          {isTimeWarning && !hasSubmitted && (
            <div className="mb-2 text-center">
              <p className="text-orange-600 text-sm font-medium animate-pulse">
                ⚠️ Hurry! Only {timeRemaining} second
                {timeRemaining !== 1 ? "s" : ""} left!
              </p>
            </div>
          )}
        </div>

        {/* Submit Button or Wait Message */}
        <div className="mt-8">
          {localShowResults ? (
            <h2 className="text-2xl font-medium text-gray-700 text-center">
              Wait for teacher to ask a new question
            </h2>
          ) : (
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`${
                  !canSubmit
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPollInterface;
