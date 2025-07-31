import type { Middleware } from "@reduxjs/toolkit";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import {
  setConnected,
  setConnectionError,
  setLastMessage,
  setRoom,
  resetSocket,
} from "../slices/socketSlice";
import { setPoll, updatePollResults } from "../slices/pollSlice";
import type { Poll } from "../slices/pollSlice";

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

      // Poll events
      socket.on("pollStarted", (poll: unknown) => {
        dispatch(setPoll(poll as Poll));
      });

      socket.on("pollResults", (results: Record<string, number>) => {
        dispatch(updatePollResults(results));
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
};
