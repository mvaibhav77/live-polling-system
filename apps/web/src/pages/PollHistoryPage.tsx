import React from "react";
import { Link } from "react-router-dom";
import { useGetPollHistoryQuery } from "../store/api/pollApi";
import Button from "../components/Button";
import StatsSummary from "../components/StatsSummary";
import PollHistoryItemCard from "../components/PollHistoryItemCard";
import { usePollHistoryStats } from "../hooks/usePollHistoryStats";
import Spinner from "../components/Spinner";

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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-600">Loading poll history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">
            Failed to load poll history
          </div>
          <p className="text-gray-600 mb-4">
            {error && "status" in error
              ? `Error ${error.status}: ${error.data}`
              : "An unexpected error occurred"}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-scroll max-w-4/5 mx-auto md:py-16 md:px-[15vw] p-4">
      <div className="flex flex-col items-center">
        {/* Header */}
        <header className="w-full py-4">
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
