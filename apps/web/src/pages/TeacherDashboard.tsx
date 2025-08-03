import React, { useEffect } from "react";
import PollQuestionCard from "../components/poll/PollQuestionCard";
import PollHeader from "../components/poll/PollHeader";
import PollActions from "../components/teacher/PollActions";
import NoPollState from "../components/teacher/NoPollState";
import DashboardHeader from "../components/teacher/DashboardHeader";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { ChatModal } from "../components/chat";
import { useWebSocket, useTeacher } from "../hooks/useWebSocket";
import { useTeacherPollTimer } from "../hooks/useTeacherPollTimer";

const TeacherDashboard: React.FC = () => {
  const { connect, isConnected } = useWebSocket();
  const {
    currentPoll,
    pollResults,
    // pollStats,
    // students,
    error,
    joinAsTeacher,
    endPoll,
  } = useTeacher();

  // Timer state for real-time updates
  const { timeRemaining } = useTeacherPollTimer({
    poll: currentPoll,
  });

  // Connect to WebSocket and join as teacher
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [connect, isConnected]);

  useEffect(() => {
    if (isConnected) {
      joinAsTeacher();
    }
  }, [isConnected, joinAsTeacher]);

  // Calculate time left (fallback for non-active polls)
  const getTimeLeft = () => {
    return timeRemaining;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndPoll = () => {
    endPoll();
  };

  if (!isConnected) {
    return <LoadingState loadingText="Connecting to server..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Error loading poll data"
        message={error}
        onRetry={() => window.location.reload()}
        retryText="Refresh Page"
      />
    );
  }

  return (
    <div className="min-h-screen md:py-16 md:px-[15vw] p-4">
      <div className="w-full max-w-3xl mx-auto h-full">
        <DashboardHeader />

        {currentPoll ? (
          <div className="flex items-center justify-center md:min-h-[calc(100vh-15rem)]">
            <div className="space-y-2 w-full">
              <PollHeader
                isActive={currentPoll.status === "active"}
                timeLeft={getTimeLeft()}
                formatTime={formatTime}
                questionNumber={currentPoll.questionNumber}
              />

              <PollQuestionCard
                poll={currentPoll}
                pollResults={pollResults}
                showResults={true}
                isInteractive={false}
                showPercentages={true}
                showVoteCounts={true}
              />

              <PollActions
                status={currentPoll.status}
                isEndingPoll={false}
                onEndPoll={handleEndPoll}
              />

              {/* Show real-time stats */}
              {/* {pollStats && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Live Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Connected Students:</span>
                      <span className="ml-2 font-semibold">
                        {pollStats.studentsCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Responses:</span>
                      <span className="ml-2 font-semibold">
                        {pollStats.responsesCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Questions Asked:</span>
                      <span className="ml-2 font-semibold">
                        {pollStats.totalQuestionsAsked}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Session Students:</span>
                      <span className="ml-2 font-semibold">
                        {pollStats.sessionStudentsCount}
                      </span>
                    </div>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        ) : (
          <NoPollState />
        )}
      </div>

      {/* Chat Modal */}
      <ChatModal isTeacher={true} />
    </div>
  );
};

export default TeacherDashboard;
