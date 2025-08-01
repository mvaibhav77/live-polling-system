import { useState, useEffect, useCallback } from "react";

interface UseStudentPollStateProps {
  poll: {
    pollId: string;
    status?: "waiting" | "active" | "ended";
  };
  timeRemaining: number;
  hasSubmitted: boolean;
  isSubmitting: boolean;
  showResults: boolean;
  onSubmit: (selectedOptionIndex: number) => void;
}

export const useStudentPollState = ({
  poll,
  timeRemaining,
  hasSubmitted,
  isSubmitting,
  showResults,
  onSubmit,
}: UseStudentPollStateProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [localShowResults, setLocalShowResults] = useState(showResults);

  // Reset all state when poll changes
  useEffect(() => {
    setSelectedOption(null);
    setHasAutoSubmitted(false);
    setLocalShowResults(false);
  }, [poll.pollId]);

  // Update local show results when external showResults changes
  useEffect(() => {
    setLocalShowResults(showResults);
  }, [showResults]);

  // Show results when conditions are met
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

  const handleSubmit = useCallback(() => {
    if (
      selectedOption !== null &&
      !hasSubmitted &&
      !isSubmitting &&
      timeRemaining > 0
    ) {
      onSubmit(selectedOption);
    }
  }, [selectedOption, hasSubmitted, isSubmitting, timeRemaining, onSubmit]);

  const handleOptionSelect = useCallback(
    (optionIndex: number) => {
      if (!hasSubmitted && !isSubmitting && timeRemaining > 0) {
        setSelectedOption(optionIndex);
      }
    },
    [hasSubmitted, isSubmitting, timeRemaining]
  );

  const isTimeUp = timeRemaining <= 0;
  const isDisabled = hasSubmitted || isSubmitting || isTimeUp;
  const canSubmit = selectedOption !== null && !isDisabled;

  return {
    selectedOption,
    localShowResults,
    isDisabled,
    canSubmit,
    isTimeUp,
    handleSubmit,
    handleOptionSelect,
  };
};
