import type { Middleware } from "@reduxjs/toolkit";
import { io, type Socket } from "socket.io-client";
import {
  setConnected,
  setConnectionError,
  setLastMessage,
  setRoom,
  resetSocket,
} from "../slices/socketSlice";

let socket: Socket | null = null;

export const socketMiddleware: Middleware =
  (store) => (next) => (action: unknown) => {
    const { dispatch } = store;

    // Type guard for action
    if (typeof action !== "object" || action === null || !("type" in action)) {
      return next(action);
    }

    const typedAction = action as { type: string; payload?: unknown };

    // Handle socket connection actions
    if (typedAction.type === "socket/connect") {
      if (socket?.connected) {
        socket.disconnect();
      }

      const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      socket = io(serverUrl);

      socket.on("connect", () => {
        dispatch(setConnected(true));
        dispatch(
          setLastMessage({
            type: "connect",
            timestamp: Date.now(),
          })
        );
      });

      socket.on("disconnect", () => {
        dispatch(setConnected(false));
      });

      socket.on("connect_error", (error: Error) => {
        dispatch(setConnectionError(error.message));
        dispatch(setConnected(false));
      });

      // Poll events - trigger RTK Query cache invalidation instead of direct state updates
      socket.on("pollStarted", (poll: unknown) => {
        dispatch(
          setLastMessage({
            type: "pollStarted",
            payload: poll,
            timestamp: Date.now(),
          })
        );
        // RTK Query will handle the actual poll data via automatic refetching
      });

      socket.on("pollResults", (results: Record<string, number>) => {
        dispatch(
          setLastMessage({
            type: "pollResults",
            payload: results,
            timestamp: Date.now(),
          })
        );
        // RTK Query will handle the actual results data via automatic refetching
      });

      // Student connection events for real-time UI updates
      socket.on("studentJoined", (student: unknown) => {
        dispatch(
          setLastMessage({
            type: "studentJoined",
            payload: student,
            timestamp: Date.now(),
          })
        );
      });

      socket.on("studentLeft", (studentId: string) => {
        dispatch(
          setLastMessage({
            type: "studentLeft",
            payload: { studentId },
            timestamp: Date.now(),
          })
        );
      });
    }

    // Handle socket disconnect
    if (typedAction.type === "socket/disconnect") {
      if (socket?.connected) {
        socket.disconnect();
      }
      dispatch(resetSocket());
    }

    // Handle socket room actions
    if (typedAction.type === "socket/joinRoom") {
      const payload = typedAction.payload as {
        pollId: string;
        studentName?: string;
      };
      const { pollId, studentName } = payload;
      if (socket?.connected) {
        socket.emit("joinPoll", { pollId, studentName });
        dispatch(setRoom(pollId));
      }
    }

    if (typedAction.type === "socket/submitAnswer") {
      const payload = typedAction.payload as { pollId: string; answer: number };
      const { pollId, answer } = payload;
      if (socket?.connected) {
        socket.emit("submitAnswer", { pollId, answer });
      }
    }

    // Handle teacher poll control actions
    if (typedAction.type === "socket/startPoll") {
      const payload = typedAction.payload as {
        pollId: string;
        questionIndex: number;
      };
      const { pollId, questionIndex } = payload;
      if (socket?.connected) {
        socket.emit("startPoll", { pollId, questionIndex });
      }
    }

    if (typedAction.type === "socket/endPoll") {
      const payload = typedAction.payload as { pollId: string };
      const { pollId } = payload;
      if (socket?.connected) {
        socket.emit("endPoll", { pollId });
      }
    }

    return next(action);
  };

// Action creators for socket events
export const socketActions = {
  connect: () => ({ type: "socket/connect" as const }),
  disconnect: () => ({ type: "socket/disconnect" as const }),
  joinRoom: (pollId: string, studentName?: string) => ({
    type: "socket/joinRoom" as const,
    payload: { pollId, studentName },
  }),
  submitAnswer: (pollId: string, answer: number) => ({
    type: "socket/submitAnswer" as const,
    payload: { pollId, answer },
  }),
  startPoll: (pollId: string, questionIndex: number) => ({
    type: "socket/startPoll" as const,
    payload: { pollId, questionIndex },
  }),
  endPoll: (pollId: string) => ({
    type: "socket/endPoll" as const,
    payload: { pollId },
  }),
};
