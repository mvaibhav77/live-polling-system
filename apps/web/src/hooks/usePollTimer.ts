import { useState, useEffect } from "react";
import type { Poll } from "../store/api/pollApi";

interface UsePollTimerProps {
  currentPoll: Poll | null;
  onTimerEnd: () => void;
}

export const usePollTimer = ({
  currentPoll,
  onTimerEnd,
}: UsePollTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (
      !currentPoll ||
      currentPoll.status !== "active" ||
      !currentPoll.startTime
    ) {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - currentPoll.startTime!) / 1000);
      const remaining = Math.max(0, currentPoll.timeLimit - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        onTimerEnd();
      }
    };

    // Update immediately
    updateTimer();

    // Set up interval
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [currentPoll, onTimerEnd]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    timeLeft,
    formatTime,
  };
};
