import { useAppDispatch, useAppSelector } from "../store/hooks";
import { socketActions } from "../store/middleware/socketMiddleware";
import { useCallback, useEffect } from "react";
import {
  setPollHistory,
  setLoading,
  setError,
} from "../store/slices/pollSlice";
import { pollHistoryService } from "../services/pollHistoryService";
import type { RootState } from "../store/store";

// WebSocket-based hooks for real-time functionality
export const useWebSocket = () => {
  const dispatch = useAppDispatch();
  const isConnected = useAppSelector((state) => state.socket.isConnected);

  const connect = useCallback(() => {
    dispatch(socketActions.connect());
  }, [dispatch]);

  const disconnect = useCallback(() => {
    dispatch(socketActions.disconnect());
  }, [dispatch]);

  return { connect, disconnect, isConnected };
};

// Teacher hooks
export const useTeacher = () => {
  const dispatch = useAppDispatch();
  const { currentPoll, pollResults, pollStats, students, error } =
    useAppSelector((state: RootState) => state.poll);

  const joinAsTeacher = useCallback(() => {
    dispatch(socketActions.joinTeacher());
  }, [dispatch]);

  const createPoll = useCallback(
    (question: string, options: string[], timeLimit: number = 60) => {
      dispatch(socketActions.createPoll(question, options, timeLimit));
    },
    [dispatch]
  );

  const startPoll = useCallback(() => {
    dispatch(socketActions.startPoll());
  }, [dispatch]);

  const endPoll = useCallback(() => {
    dispatch(socketActions.endPoll());
  }, [dispatch]);

  const getResults = useCallback(() => {
    dispatch(socketActions.getResults());
  }, [dispatch]);

  return {
    currentPoll,
    pollResults,
    pollStats,
    students,
    error,
    joinAsTeacher,
    createPoll,
    startPoll,
    endPoll,
    getResults,
  };
};

// Student hooks
export const useStudent = () => {
  const dispatch = useAppDispatch();
  const { currentPoll, currentStudent, error } = useAppSelector(
    (state: RootState) => state.poll
  );

  const joinAsStudent = useCallback(
    (studentName: string) => {
      dispatch(socketActions.joinStudent(studentName));
    },
    [dispatch]
  );

  const submitAnswer = useCallback(
    (optionIndex: number) => {
      dispatch(socketActions.submitAnswer(optionIndex));
    },
    [dispatch]
  );

  const getPollStatus = useCallback(() => {
    dispatch(socketActions.getPollStatus());
  }, [dispatch]);

  return {
    currentPoll,
    currentStudent,
    error,
    joinAsStudent,
    submitAnswer,
    getPollStatus,
  };
};

// Chat hooks
export const useChat = () => {
  const dispatch = useAppDispatch();
  const { chatMessages, chatParticipants, error } = useAppSelector(
    (state: RootState) => state.poll
  );

  const sendMessage = useCallback(
    (message: string) => {
      dispatch(socketActions.sendChatMessage(message));
    },
    [dispatch]
  );

  const getChatHistory = useCallback(() => {
    dispatch(socketActions.getChatHistory());
  }, [dispatch]);

  const kickStudent = useCallback(
    (studentId: string, reason?: string) => {
      dispatch(socketActions.kickStudent(studentId, reason));
    },
    [dispatch]
  );

  const clearChat = useCallback(() => {
    dispatch(socketActions.clearChat());
  }, [dispatch]);

  return {
    chatMessages,
    chatParticipants,
    error,
    sendMessage,
    getChatHistory,
    kickStudent,
    clearChat,
  };
};

// Poll history hook (REST API - the only remaining REST endpoint)
export const usePollHistory = () => {
  const dispatch = useAppDispatch();
  const { pollHistory, isLoading, error } = useAppSelector(
    (state: RootState) => state.poll
  );

  const fetchPollHistory = useCallback(
    async (limit?: number) => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));
        const response = await pollHistoryService.getPollHistory(limit);
        dispatch(setPollHistory(response.polls));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch poll history";
        dispatch(setError(errorMessage));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  useEffect(() => {
    fetchPollHistory();
  }, [fetchPollHistory]);

  return {
    pollHistory,
    isLoading,
    error,
    refetch: fetchPollHistory,
  };
};

// Combined hook for convenience
export const usePoll = () => {
  const dispatch = useAppDispatch();
  const pollState = useAppSelector((state: RootState) => state.poll);
  const socketState = useAppSelector((state) => state.socket);

  return {
    ...pollState,
    isConnected: socketState.isConnected,
    connectionError: socketState.connectionError,
    dispatch,
  };
};
