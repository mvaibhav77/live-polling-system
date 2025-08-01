import React from "react";
import PollQuestionCard from "../components/PollQuestionCard";
import PollHeader from "../components/PollHeader";
import PollActions from "../components/PollActions";
import NoPollState from "../components/NoPollState";
import DashboardHeader from "../components/DashboardHeader";
import Spinner from "../components/Spinner";
import { usePollManagement } from "../hooks/usePollManagement";
import { usePollTimer } from "../hooks/usePollTimer";

const TeacherDashboard: React.FC = () => {
  const {
    currentPoll,
    pollResults,
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle API errors
  if (pollStatusError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️ Error loading poll data</div>
          <p className="text-gray-600 mb-4">
            There was an issue connecting to the server. Please try refreshing
            the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Refresh Page
          </button>
        </div>
      </div>
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
              />

              <PollQuestionCard
                poll={{
                  pollId: currentPoll.pollId,
                  question: currentPoll.question,
                  options: currentPoll.options,
                  status: currentPoll.status,
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
