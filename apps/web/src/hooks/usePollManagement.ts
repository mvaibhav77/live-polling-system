import {
  useGetPollStatusQuery,
  useGetPollResultsQuery,
  useEndPollMutation,
} from "../store/api/pollApi";
import { useAppDispatch } from "../store/hooks";
import { socketActions } from "../store/middleware/socketMiddleware";
import { useEffect } from "react";

export const usePollManagement = () => {
  const dispatch = useAppDispatch();

  // Connect to WebSocket when component mounts
  useEffect(() => {
    dispatch(socketActions.connect());
    dispatch(socketActions.joinTeacher());

    // Cleanup on unmount
    return () => {
      dispatch(socketActions.disconnect());
    };
  }, [dispatch]);

  // API queries - WebSocket events will trigger cache invalidation for real-time updates
  const {
    data: pollStatusData,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
    error: pollStatusError,
  } = useGetPollStatusQuery(undefined, {
    // No polling - WebSocket handles real-time updates via cache invalidation
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { data: pollResultsData } = useGetPollResultsQuery(undefined, {
    skip: !pollStatusData?.poll,
    // No polling - WebSocket handles real-time updates via cache invalidation
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [endPoll, { isLoading: isEndingPoll }] = useEndPollMutation();

  const currentPoll = pollStatusData?.poll || null;
  const pollResults = pollResultsData?.results || {};
  const pollStats = pollStatusData?.stats || null;

  const handleEndPoll = async () => {
    try {
      // Emit WebSocket event for real-time update
      dispatch(socketActions.endPoll());

      // Also call REST API as fallback
      await endPoll().unwrap();
      refetchStatus();
    } catch (error) {
      console.error("Failed to end poll:", error);
    }
  };

  const handleTimerEnd = () => {
    // Auto-end poll when timer reaches 0
    dispatch(socketActions.endPoll());
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
