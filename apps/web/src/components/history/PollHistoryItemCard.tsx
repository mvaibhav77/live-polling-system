import React from "react";
import PollQuestionCard from "../poll/PollQuestionCard";
import PollStatsCard from "../poll/PollStatsCard";
import type { PollHistoryItem } from "../../store/slices/pollSlice";

interface PollHistoryItemCardProps {
  poll: PollHistoryItem;
  index: number;
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const PollHistoryItemCard: React.FC<PollHistoryItemCardProps> = ({
  poll,
  index,
}) => {
  const getResponseRate = (totalResponses: number, totalStudents: number) => {
    return totalStudents > 0
      ? Math.round((totalResponses / totalStudents) * 100)
      : 0;
  };

  const totalResponses = Object.values(poll.responses || {}).reduce(
    (total, count) => total + (count as number),
    0
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Poll Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Question {index}
          </h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span>{formatDateTime(poll.createdAt)}</span>
            <span>
              Response Rate:{" "}
              {getResponseRate(totalResponses, poll.totalParticipants || 0)}% (
              {totalResponses}/{poll.totalParticipants || 0})
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Completed
          </span>
        </div>
      </div>

      {/* Poll Question Card */}
      <PollQuestionCard
        poll={{
          pollId: poll.id,
          question: poll.question,
          options: poll.options,
          status: "ended" as const,
        }}
        pollResults={poll.responses || {}}
        showResults={true}
        isInteractive={false}
        showPercentages={true}
        showVoteCounts={true}
        className="mb-4"
      />

      {/* Poll Statistics */}
      <PollStatsCard
        responses={poll.responses}
        totalParticipants={poll.totalParticipants}
      />
    </div>
  );
};

export default PollHistoryItemCard;
