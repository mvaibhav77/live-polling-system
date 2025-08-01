import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PollQuestionCard from "../components/PollQuestionCard";
import Button from "../components/Button";
import {
  useGetPollStatusQuery,
  useGetPollResultsQuery,
  useEndPollMutation,
} from "../store/api/pollApi";
import Spinner from "../components/Spinner";
import View from "../assets/view.svg";
import Timer from "../assets/timer.svg";

const TeacherDashboard: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // API queries
  const {
    data: pollStatusData,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
  } = useGetPollStatusQuery();

  const { data: pollResultsData, refetch: refetchResults } =
    useGetPollResultsQuery(undefined, {
      skip: !pollStatusData?.poll || pollStatusData.poll.status !== "active",
    });

  const [endPoll, { isLoading: isEndingPoll }] = useEndPollMutation();

  const currentPoll = pollStatusData?.poll;
  const pollResults = pollResultsData?.results || {};

  const handleEndPoll = async () => {
    try {
      await endPoll().unwrap();
      refetchStatus();
    } catch (error) {
      console.error("Failed to end poll:", error);
    }
  };

  // Timer logic
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
        // Auto-end poll when timer reaches 0 - call the API directly here
        endPoll()
          .then(() => refetchStatus())
          .catch(console.error);
      }
    };

    // Update immediately
    updateTimer();

    // Set up interval
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [currentPoll, endPoll, refetchStatus]);

  // Refetch results periodically when poll is active
  useEffect(() => {
    if (currentPoll?.status === "active") {
      const interval = setInterval(() => {
        refetchResults();
        refetchStatus();
      }, 2000); // Refetch every 2 seconds

      return () => clearInterval(interval);
    }
  }, [currentPoll?.status, refetchResults, refetchStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

  return (
    <div className="min-h-screen md:py-16 md:px-[15vw] p-4">
      <div className="max-w-4xl mx-auto h-full">
        {/* View Poll History Button */}
        <div className="flex justify-end mb-8">
          <Link to="/history">
            <Button className="flex items-center gap-2">
              <img
                src={View}
                alt="View Poll History"
                className="inline-block w-6 h-6 mr-2 align-middle"
              />
              View Poll history
            </Button>
          </Link>
        </div>

        {/* Current Poll Section - Centered */}
        {currentPoll ? (
          <div className="flex items-center justify-center md:min-h-[calc(100vh-15rem)]">
            <div className="space-y-2 w-full">
              {/* Question Header */}
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Question
                </h1>

                {/* Timer (only show when poll is active) */}
                {currentPoll.status === "active" && (
                  <div className="flex items-center gap-2">
                    {/* timer icon */}
                    <img src={Timer} alt="Timer" width={15} height={15} />
                    <span className="text-red-500 font-mono pt-0.5 font-medium">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                )}
              </div>

              {/* Poll Question Card */}
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

              {/* Action Buttons */}
              <div className="flex justify-end mt-8">
                {currentPoll.status === "active" ? (
                  <Button
                    onClick={handleEndPoll}
                    disabled={isEndingPoll}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isEndingPoll ? "Ending..." : "End Poll"}
                  </Button>
                ) : currentPoll.status === "ended" ? (
                  <Link to="/teacher/create-poll">
                    <Button className="bg-primary hover:bg-primary-dark px-8">
                      + Ask a new question
                    </Button>
                  </Link>
                ) : (
                  <div className="text-center text-gray-600">
                    Poll is waiting to be started...
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // No current poll - Show create poll option (also centered)
          <div className="flex items-center justify-center md:min-h-[calc(100vh-15rem)]">
            <div className="text-center py-16">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                No Active Poll
              </h1>
              <p className="text-gray-600 mb-8">
                Create a new poll to start engaging with your students
              </p>
              <Link to="/teacher/get-started">
                <Button>+ Ask a new question</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
