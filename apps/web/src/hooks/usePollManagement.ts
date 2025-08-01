import {
  useGetPollStatusQuery,
  useGetPollResultsQuery,
  useEndPollMutation,
} from "../store/api/pollApi";

export const usePollManagement = () => {
  // API queries with polling for real-time updates
  const {
    data: pollStatusData,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
    error: pollStatusError,
  } = useGetPollStatusQuery(undefined, {
    pollingInterval: 2000, // Poll every 2 seconds for real-time updates
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { data: pollResultsData } = useGetPollResultsQuery(undefined, {
    skip: !pollStatusData?.poll,
    pollingInterval: pollStatusData?.poll ? 2000 : undefined, // Poll when there's a poll
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [endPoll, { isLoading: isEndingPoll }] = useEndPollMutation();

  const currentPoll = pollStatusData?.poll || null;
  const pollResults = pollResultsData?.results || {};
  const pollStats = pollStatusData?.stats || null;

  const handleEndPoll = async () => {
    try {
      await endPoll().unwrap();
      refetchStatus();
    } catch (error) {
      console.error("Failed to end poll:", error);
    }
  };

  const handleTimerEnd = () => {
    // Auto-end poll when timer reaches 0
    endPoll()
      .then(() => refetchStatus())
      .catch(console.error);
  };

  return {
    currentPoll,
    pollResults,
    pollStats,
    isLoadingStatus,
    isEndingPoll,
    handleEndPoll,
    handleTimerEnd,
    pollStatusError,
  };
};
