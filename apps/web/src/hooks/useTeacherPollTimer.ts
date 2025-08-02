import { useState, useEffect } from "react";

interface UseTeacherPollTimerProps {
  poll: {
    pollId: string;
    timeLimit: number;
    startTime?: number;
    status?: "waiting" | "active" | "ended";
  } | null;
}

export const useTeacherPollTimer = ({ poll }: UseTeacherPollTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(
    poll?.timeLimit || 0
  );

  // Real-time timer countdown
  useEffect(() => {
    if (!poll) {
      setTimeRemaining(0);
      return;
    }

    // Debug logging
    console.log("🔍 Teacher timer useEffect:", {
      pollId: poll.pollId,
      startTime: poll.startTime,
      timeLimit: poll.timeLimit,
      status: poll.status,
    });

    if (!poll.startTime || poll.status !== "active") {
      console.log("⏹️ Timer stopped - no startTime or poll not active");
      setTimeRemaining(poll.timeLimit);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - poll.startTime!) / 1000);
      const remaining = Math.max(0, poll.timeLimit - elapsed);
      setTimeRemaining(remaining);

      // Debug every 10 seconds
      if (elapsed % 10 === 0) {
        console.log("⏰ Teacher timer update:", {
          elapsed,
          remaining,
          timeLimit: poll.timeLimit,
        });
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [poll]);

  // Reset timer when poll changes
  useEffect(() => {
    if (poll) {
      setTimeRemaining(poll.timeLimit);
    }
  }, [poll]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
