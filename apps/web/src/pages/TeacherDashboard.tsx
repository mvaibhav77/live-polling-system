import React from "react";
import PollQuestionCard from "../components/PollQuestionCard";
import PollHeader from "../components/PollHeader";
import PollActions from "../components/PollActions";
import NoPollState from "../components/NoPollState";
import DashboardHeader from "../components/DashboardHeader";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { usePollManagement } from "../hooks/usePollManagement";
import { usePollTimer } from "../hooks/usePollTimer";

const TeacherDashboard: React.FC = () => {
  const {
    currentPoll,
    pollResults,
    pollStats,
    isLoadingStatus,
    isEndingPoll,
    handleEndPoll,
    handleTimerEnd,
    pollStatusError,
  } = usePollManagement();

  const { timeLeft, formatTime } = usePollTimer({
    currentPoll,
    onTimerEnd: handleTimerEnd,
  });

  if (isLoadingStatus) {
    return <LoadingState loadingText="Loading dashboard..." />;
  }

  // Handle API errors
  if (pollStatusError) {
    return (
      <ErrorState
        title="Error loading poll data"
        message="There was an issue connecting to the server. Please try refreshing the page."
        onRetry={() => window.location.reload()}
        retryText="Refresh Page"
      />
    );
  }

  return (
    <div className="min-h-screen md:py-16 md:px-[15vw] p-4">
      <div className="max-w-4xl mx-auto h-full">
        <DashboardHeader />

        {currentPoll ? (
          <div className="flex items-center justify-center md:min-h-[calc(100vh-15rem)]">
            <div className="space-y-2 w-full">
              <PollHeader
                isActive={currentPoll.status === "active"}
                timeLeft={timeLeft}
                formatTime={formatTime}
                questionNumber={pollStats?.currentQuestionNumber || 1}
              />

              <PollQuestionCard
                poll={{
                  pollId: currentPoll.pollId,
                  question: currentPoll.question,
                  options: currentPoll.options,
                  status: currentPoll.status,
                  questionNumber: pollStats?.currentQuestionNumber || 1,
                }}
                pollResults={pollResults}
                showResults={true}
                isInteractive={false}
                showPercentages={true}
                showVoteCounts={true}
              />

              <PollActions
                status={currentPoll.status}
                isEndingPoll={isEndingPoll}
                onEndPoll={handleEndPoll}
              />
            </div>
          </div>
        ) : (
          <NoPollState />
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
