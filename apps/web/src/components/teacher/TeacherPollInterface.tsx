import React, { useState, useEffect } from "react";
import Button from "../common/Button";
import PollQuestionCard from "../poll/PollQuestionCard";

interface TeacherPollInterfaceProps {
  poll?: {
    pollId: string;
    questionNumber?: number;
    question: string;
    options: string[];
    timeLimit: number;
    startTime?: number;
    status: "waiting" | "active" | "ended";
  } | null;
  pollResults?: {
    [optionIndex: string]: number;
  } | null;
  stats?: {
    totalStudents: number;
    answeredStudents: number;
    totalResponses: number;
  };
  onStartPoll?: () => void;
  onEndPoll?: () => void;
  isStarting?: boolean;
  isEnding?: boolean;
}

const TeacherPollInterface: React.FC<TeacherPollInterfaceProps> = ({
  poll,
  pollResults,
  stats,
  onStartPoll,
  onEndPoll,
  isStarting = false,
  isEnding = false,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Real-time timer countdown
  useEffect(() => {
    if (!poll?.startTime || poll.status !== "active") {
      setTimeRemaining(poll?.timeLimit || 0);
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
  }, [poll?.startTime, poll?.timeLimit, poll?.status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getResponseRate = () => {
    if (!stats?.totalStudents) return 0;
    return Math.round((stats.answeredStudents / stats.totalStudents) * 100);
  };

  const isTimeUp = timeRemaining <= 0;
  const showResults = poll?.status === "ended" || isTimeUp;

  if (!poll) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            No Active Poll
          </h2>
          <p className="text-gray-600 mb-8">
            Create a new poll to start engaging with your students
          </p>
          <Button
            onClick={() => {
              /* Navigate to create poll */
            }}
            className="bg-primary hover:bg-primary-dark"
          >
            Create New Poll
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Question Number and Status */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          Question {poll.questionNumber || 1}
        </h1>
        <div className="flex items-center gap-4">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              poll.status === "waiting"
                ? "bg-yellow-100 text-yellow-800"
                : poll.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {poll.status === "waiting"
              ? "Ready to Start"
              : poll.status === "active"
                ? "Active"
                : "Ended"}
          </span>

          {/* Timer */}
          {poll.status === "active" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Time:</span>
              <span
                className={`font-mono font-medium ${
                  timeRemaining <= 10 ? "text-red-500" : "text-gray-700"
                }`}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Poll Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-primary">
            {stats?.totalStudents || 0}
          </div>
          <div className="text-sm text-gray-600">Connected Students</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-primary">
            {stats?.answeredStudents || 0}
          </div>
          <div className="text-sm text-gray-600">Responses</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-primary">
            {getResponseRate()}%
          </div>
          <div className="text-sm text-gray-600">Response Rate</div>
        </div>
      </div>

      {/* Poll Question Card */}
      <PollQuestionCard
        poll={poll}
        pollResults={pollResults}
        showResults={showResults}
        isInteractive={false}
        showPercentages={true}
        showVoteCounts={true}
        className="mb-6"
      />

      {/* Control Buttons */}
      <div className="flex justify-center gap-4">
        {poll.status === "waiting" && (
          <Button
            onClick={onStartPoll}
            disabled={isStarting}
            className="bg-green-600 hover:bg-green-700 px-8 py-3"
          >
            {isStarting ? "Starting..." : "Start Poll"}
          </Button>
        )}

        {poll.status === "active" && (
          <Button
            onClick={onEndPoll}
            disabled={isEnding}
            className="bg-red-600 hover:bg-red-700 px-8 py-3"
          >
            {isEnding ? "Ending..." : "End Poll"}
          </Button>
        )}

        {poll.status === "ended" && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Poll has ended. Ready for the next question?
            </p>
            <Button
              onClick={() => {
                /* Navigate to create new poll */
              }}
              className="bg-primary hover:bg-primary-dark px-8 py-3"
            >
              Create Next Poll
            </Button>
          </div>
        )}
      </div>

      {/* Live Response Indicator */}
      {poll.status === "active" && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live - Students are responding
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPollInterface;
