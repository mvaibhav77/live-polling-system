import { useState, useEffect } from "react";

interface UseStudentPollTimerProps {
  poll: {
    pollId: string;
    timeLimit: number;
    startTime?: number;
    status?: "waiting" | "active" | "ended";
  };
  hasSubmitted: boolean;
  showResults: boolean;
}

export const useStudentPollTimer = ({
  poll,
  hasSubmitted,
  showResults,
}: UseStudentPollTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(poll.timeLimit);

  // Real-time timer countdown
  useEffect(() => {
    if (!poll.startTime || hasSubmitted || showResults) {
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
  }, [poll.startTime, poll.timeLimit, poll.pollId, hasSubmitted, showResults]);

  // Reset timer when poll changes
  useEffect(() => {
    setTimeRemaining(poll.timeLimit);
  }, [poll.pollId, poll.timeLimit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isTimeUp = timeRemaining <= 0;
  const isTimeWarning = timeRemaining <= 10 && timeRemaining > 0;

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isTimeUp,
    isTimeWarning,
  };
};
