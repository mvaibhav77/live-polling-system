import type { PollHistoryItem } from "../services/pollHistoryService";

export const usePollHistoryStats = (pollHistory: PollHistoryItem[]) => {
  const totalPolls = pollHistory.length;

  const totalResponses = pollHistory.reduce((sum, poll) => {
    const pollResponses = Object.values(poll.responses || {}).reduce(
      (total, count) => total + (count as number),
      0
    );
    return sum + pollResponses;
  }, 0);

  const averageResponseRate =
    totalPolls > 0
      ? Math.round(
          pollHistory.reduce((sum, poll) => {
            const pollResponses = Object.values(poll.responses || {}).reduce(
              (total, count) => total + (count as number),
              0
            );
            const rate =
              poll.totalParticipants > 0
                ? (pollResponses / poll.totalParticipants) * 100
                : 0;
            return sum + rate;
          }, 0) / totalPolls
        )
      : 0;

  return {
    totalPolls,
    totalResponses,
    averageResponseRate,
  };
};
