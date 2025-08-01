import React from "react";
import { Link } from "react-router-dom";
import { useGetPollHistoryQuery } from "../store/api/pollApi";
import Button from "../components/Button";
import StatsSummary from "../components/StatsSummary";
import PollHistoryItemCard from "../components/PollHistoryItemCard";
import { usePollHistoryStats } from "../hooks/usePollHistoryStats";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const PollHistoryPage: React.FC = () => {
  const {
    data: pollHistoryData,
    isLoading,
    error,
    refetch,
  } = useGetPollHistoryQuery();

  const pollHistory = pollHistoryData?.polls || [];
  const stats = usePollHistoryStats(pollHistory);

  if (isLoading) {
    return <LoadingState loadingText="Loading poll history..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load poll history"
        message={
          error && "status" in error
            ? `Error ${error.status}: ${error.data}`
            : "An unexpected error occurred"
        }
        onRetry={() => refetch()}
        retryText="Try Again"
      />
    );
  }

  return (
    <div className="h-screen overflow-y-scroll lg:max-w-4/5 md:max-w-5/6 mx-auto md:py-16 lg:px-[15vw] md:px-[10vw] p-4">
      <div className="flex flex-col items-center">
        {/* Header */}
        <header className="w-full pb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-5xl">
              View <span className="font-semibold">Poll History</span>
            </h1>
            <Link to="/teacher/dashboard" className="md:block hidden">
              <Button className="bg-primary hover:bg-primary-dark">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="w-full py-6">
          <div className="mx-auto">
            {/* Statistics Summary */}
            <StatsSummary {...stats} />

            {/* Poll History List */}
            <div className="space-y-8">
              {pollHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">
                    No polls found
                  </div>
                  <p className="text-gray-500">
                    Start creating polls to see history here
                  </p>
                </div>
              ) : (
                pollHistory.map((poll, index) => (
                  <PollHistoryItemCard
                    key={poll.id}
                    poll={poll}
                    index={pollHistory.length - index}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollHistoryPage;
