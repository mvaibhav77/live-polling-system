import React from "react";

interface PollStatsCardProps {
  responses: Record<string, number>;
  totalParticipants: number;
}

const PollStatsCard: React.FC<PollStatsCardProps> = ({
  responses,
  totalParticipants,
}) => {
  const getResponseRate = (totalResponses: number, totalStudents: number) => {
    return totalStudents > 0
      ? Math.round((totalResponses / totalStudents) * 100)
      : 0;
  };

  const getMostPopularOption = () => {
    if (!responses || Object.keys(responses).length === 0) return "No data";

    const mostPopularIndex = Object.entries(responses).reduce(
      (max, [index, count]) =>
        (count as number) > ((responses[max] as number) || 0) ? index : max,
      "0"
    );
    return `${mostPopularIndex} (${String.fromCharCode(65 + parseInt(mostPopularIndex))})`;
  };

  const getLeastPopularOption = () => {
    if (!responses || Object.keys(responses).length === 0) return "No data";

    const leastPopularIndex = Object.entries(responses).reduce(
      (min, [index, count]) =>
        (count as number) < ((responses[min] as number) || Infinity)
          ? index
          : min,
      "0"
    );
    return `${leastPopularIndex} (${String.fromCharCode(65 + parseInt(leastPopularIndex))})`;
  };

  const totalVotes = Object.values(responses || {}).reduce(
    (total, count) => total + (count as number),
    0
  );

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-2">Quick Stats</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Most Popular:</span>
          <div className="font-medium">{getMostPopularOption()}</div>
        </div>
        <div>
          <span className="text-gray-500">Least Popular:</span>
          <div className="font-medium">{getLeastPopularOption()}</div>
        </div>
        <div>
          <span className="text-gray-500">Total Votes:</span>
          <div className="font-medium">{totalVotes}</div>
        </div>
        <div>
          <span className="text-gray-500">Participation:</span>
          <div className="font-medium">
            {getResponseRate(totalVotes, totalParticipants)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollStatsCard;
