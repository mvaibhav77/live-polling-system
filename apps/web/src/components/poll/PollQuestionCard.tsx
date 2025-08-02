import React from "react";

interface PollQuestionCardProps {
  poll: {
    pollId: string;
    questionNumber?: number;
    question: string;
    options: string[];
    status?: "waiting" | "active" | "ended";
  };
  // Results and interaction props
  pollResults?:
    | {
        [optionIndex: string]: number;
      }
    | {
        responses: {
          [optionIndex: string]: number;
        };
      }
    | null;
  selectedOption?: number | null;
  showResults?: boolean;
  isInteractive?: boolean;
  // Student-specific props
  isStudentChoice?: (index: number) => boolean;
  onOptionSelect?: (index: number) => void;
  isDisabled?: boolean;
  // Styling props
  className?: string;
  showPercentages?: boolean;
  showStudentChoice?: boolean;
  showVoteCounts?: boolean;
}

const PollQuestionCard: React.FC<PollQuestionCardProps> = ({
  poll,
  pollResults = null,
  selectedOption = null,
  showResults = false,
  isInteractive = false,
  isStudentChoice = () => false,
  onOptionSelect,
  isDisabled = false,
  className = "",
  showPercentages = true,
  showStudentChoice = false,
  showVoteCounts = false,
}) => {
  // Calculate poll result percentages
  const calculateResultPercentages = () => {
    if (!pollResults) return [];

    // Handle different result formats
    let responses: Record<string, number>;

    if (
      pollResults &&
      typeof pollResults === "object" &&
      "responses" in pollResults
    ) {
      responses = pollResults.responses as Record<string, number>;
    } else {
      responses = pollResults as Record<string, number>;
    }

    // Ensure we have a valid responses object
    if (!responses || typeof responses !== "object")
      return poll.options.map(() => 0);

    const total = Object.values(responses).reduce(
      (sum: number, count: number) => sum + count,
      0
    );
    if (total === 0) return poll.options.map(() => 0);

    return poll.options.map((_, index) => {
      const count = responses[index.toString()] || 0;
      return Math.round((count / total) * 100);
    });
  };

  const getVoteCount = (index: number): number => {
    if (!pollResults) return 0;

    if (
      pollResults &&
      typeof pollResults === "object" &&
      "responses" in pollResults
    ) {
      return (
        (pollResults.responses as Record<string, number>)[index.toString()] || 0
      );
    } else {
      return (pollResults as Record<string, number>)[index.toString()] || 0;
    }
  };

  const resultPercentages = calculateResultPercentages();

  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D, etc.
  };

  const handleOptionClick = (index: number) => {
    if (isInteractive && !isDisabled && onOptionSelect && !showResults) {
      onOptionSelect(index);
    }
  };

  return (
    <div
      className={`bg-white flex flex-col gap-6 rounded-xl shadow-lg w-full border-1 border-primary pb-4 ${className}`}
    >
      {/* Question Header */}
      <div className="bg-gradient-to-r from-foreground to-neutral-500 text-white p-4 rounded-t-lg">
        <p className="text-lg font-bold leading-relaxed">{poll.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-4 px-4 pt-2">
        {poll.options.map((option, index) => {
          const isCurrentChoice = selectedOption === index;
          const isStudentChoiceOption = isStudentChoice(index);
          const percentage = resultPercentages[index] || 0;
          const voteCount = getVoteCount(index);

          return (
            <div
              key={index}
              className={`relative p-4 border-2 rounded-lg transition-all ${
                showResults
                  ? isStudentChoiceOption
                    ? "border-primary bg-primary/10" // Highlight student's choice
                    : "border-gray-200 bg-gray-50"
                  : isCurrentChoice
                    ? "border-primary bg-purple-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              } ${
                isInteractive && !showResults && !isDisabled
                  ? "cursor-pointer"
                  : ""
              }`}
              onClick={() => handleOptionClick(index)}
            >
              {/* Background bar for results */}
              {showResults && percentage > 0 && (
                <div
                  className="absolute inset-0 bg-primary rounded-lg transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold mr-4 transition-colors duration-500 ${
                      showResults
                        ? isStudentChoiceOption
                          ? "border-primary bg-primary text-white"
                          : percentage > 15 // Change text color if bg bar passes the circle
                            ? "border-white bg-white text-gray-800"
                            : "border-gray-400 bg-white text-gray-600"
                        : isCurrentChoice
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 text-gray-500 bg-white"
                    }`}
                  >
                    {getOptionLabel(index)}
                  </div>
                  <span
                    className={`text-lg transition-colors duration-500 ${
                      showResults && percentage > 25 // Change text color if bg bar passes the text
                        ? "text-white font-medium"
                        : "text-foreground"
                    }`}
                  >
                    {option}
                  </span>
                  {showResults &&
                    isStudentChoiceOption &&
                    showStudentChoice && (
                      <span
                        className={`ml-2 text-sm font-medium transition-colors duration-500 ${
                          percentage > 70 // Change "Your choice" text color if bg bar passes it
                            ? "text-white"
                            : "text-primary"
                        }`}
                      >
                        (Your choice)
                      </span>
                    )}
                </div>

                {/* Show percentage and/or vote counts in results view */}
                {showResults && (
                  <div className="text-right">
                    {showPercentages && (
                      <span
                        className={`text-lg font-semibold transition-colors duration-500 ${
                          percentage > 85 // Change percentage text color if bg bar is very wide
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {percentage}%
                      </span>
                    )}
                    {showVoteCounts && (
                      <div
                        className={`text-sm transition-colors duration-500 ${
                          percentage > 85 // Change vote count text color if bg bar is very wide
                            ? "text-white/90"
                            : "text-gray-500"
                        }`}
                      >
                        {voteCount} vote{voteCount !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PollQuestionCard;
