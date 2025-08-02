import type { Middleware } from "@reduxjs/toolkit";
import { io, type Socket } from "socket.io-client";
import {
  setConnected,
  setConnectionError,
  setLastMessage,
  resetSocket,
} from "../slices/socketSlice";
import pollApi from "../api/pollApi";

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

      const serverUrl =
        import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
      console.log("🔌 Connecting to WebSocket server:", serverUrl);

      socket = io(serverUrl, {
        // Add explicit options to ensure proper connection
        transports: ["websocket", "polling"],
        timeout: 5000,
        forceNew: true,
      });

      socket.on("connect", () => {
        console.log("✅ WebSocket connected successfully");
        dispatch(setConnected(true));
        dispatch(
          setLastMessage({
            type: "connect",
            timestamp: Date.now(),
          })
        );
      });

      socket.on("disconnect", (reason) => {
        console.log("🔌 WebSocket disconnected:", reason);
        dispatch(setConnected(false));
      });

      socket.on("connect_error", (error: Error) => {
        console.error("❌ WebSocket connection error:", error.message);
        dispatch(setConnectionError(error.message));
        dispatch(setConnected(false));
      });

      // ===== BACKEND EVENT MAPPING =====
      // Real-time cache invalidation based on backend WebSocket events

      // Poll lifecycle events
      socket.on("poll-created", (data: unknown) => {
        console.log("🔔 Poll created:", data);
        dispatch(
          setLastMessage({
            type: "poll-created",
            payload: data,
            timestamp: Date.now(),
          })
        );
        // Invalidate poll status to fetch the new poll
        dispatch(pollApi.util.invalidateTags(["PollStatus"]));
      });

      socket.on("poll-started", (data: unknown) => {
        console.log("🚀 Poll started:", data);
        dispatch(
          setLastMessage({
            type: "poll-started",
            payload: data,
            timestamp: Date.now(),
          })
        );
        // Invalidate poll status to update poll state
        dispatch(pollApi.util.invalidateTags(["PollStatus"]));
      });

      socket.on("poll-ended", (data: unknown) => {
        console.log("🏁 Poll ended:", data);
        dispatch(
          setLastMessage({
            type: "poll-ended",
            payload: data,
            timestamp: Date.now(),
          })
        );
        // Invalidate both status and results when poll ends
        dispatch(pollApi.util.invalidateTags(["PollStatus", "PollResults"]));
      });

      // Student events
      socket.on("student-joined", (data: unknown) => {
        console.log("👨‍🎓 Student joined:", data);
        dispatch(
          setLastMessage({
            type: "student-joined",
            payload: data,
            timestamp: Date.now(),
          })
        );
        // Invalidate stats to update student counts
        dispatch(pollApi.util.invalidateTags(["PollStats", "PollStatus"]));
      });

      socket.on("student-left", (data: unknown) => {
        console.log("👋 Student left:", data);
        dispatch(
          setLastMessage({
            type: "student-left",
            payload: data,
            timestamp: Date.now(),
          })
        );
        // Invalidate stats to update student counts
        dispatch(pollApi.util.invalidateTags(["PollStats", "PollStatus"]));
      });

      // Response events
      socket.on("response-received", (data: unknown) => {
        console.log("📊 Response received:", data);
        dispatch(
          setLastMessage({
            type: "response-received",
            payload: data,
            timestamp: Date.now(),
          })
        );
        // Invalidate results, stats AND status for complete real-time updates
        console.log(
          "🔄 Invalidating cache tags: PollResults, PollStats, PollStatus"
        );
        dispatch(
          pollApi.util.invalidateTags([
            "PollResults",
            "PollStats",
            "PollStatus",
          ])
        );
      });

      // Student-specific events
      socket.on("student-join-success", (data: unknown) => {
        console.log("✅ Student join success:", data);
        dispatch(
          setLastMessage({
            type: "student-join-success",
            payload: data,
            timestamp: Date.now(),
          })
        );
      });

      socket.on("response-success", (data: unknown) => {
        console.log("✅ Response success:", data);
        dispatch(
          setLastMessage({
            type: "response-success",
            payload: data,
            timestamp: Date.now(),
          })
        );
      });

      socket.on("current-poll", (data: unknown) => {
        console.log("📋 Current poll:", data);
        dispatch(
          setLastMessage({
            type: "current-poll",
            payload: data,
            timestamp: Date.now(),
          })
        );
      });

      socket.on("poll-status-update", (data: unknown) => {
        console.log("🔄 Poll status update:", data);
        dispatch(
          setLastMessage({
            type: "poll-status-update",
            payload: data,
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

    // Handle socket room actions - Student joins session
    if (typedAction.type === "socket/joinStudent") {
      const payload = typedAction.payload as { studentName: string };
      const { studentName } = payload;
      if (socket?.connected) {
        console.log("🚀 Emitting student-join:", { studentName });
        socket.emit("student-join", { studentName });
      }
    }

    // Handle socket room actions - Teacher joins
    if (typedAction.type === "socket/joinTeacher") {
      if (socket?.connected) {
        console.log("🚀 Emitting teacher-join");
        socket.emit("teacher-join");
      }
    }

    // Handle student answer submission
    if (typedAction.type === "socket/submitAnswer") {
      const payload = typedAction.payload as { optionIndex: number };
      const { optionIndex } = payload;
      if (socket?.connected) {
        console.log("🚀 Emitting submit-response:", { optionIndex });
        socket.emit("submit-response", { optionIndex });
      }
    }

    // Handle teacher poll control actions
    if (typedAction.type === "socket/createPoll") {
      const payload = typedAction.payload as {
        question: string;
        options: string[];
        timeLimit: number;
      };
      if (socket?.connected) {
        console.log("🚀 Emitting create-poll:", payload);
        socket.emit("create-poll", payload);
      }
    }

    if (typedAction.type === "socket/startPoll") {
      if (socket?.connected) {
        console.log("🚀 Emitting start-poll");
        socket.emit("start-poll");
      }
    }

    if (typedAction.type === "socket/endPoll") {
      if (socket?.connected) {
        console.log("🚀 Emitting end-poll");
        socket.emit("end-poll");
      }
    }

    if (typedAction.type === "socket/getPollStatus") {
      if (socket?.connected) {
        console.log("🚀 Emitting get-poll-status");
        socket.emit("get-poll-status");
      }
    }

    return next(action);
  };

// Action creators for socket events
export const socketActions = {
  connect: () => ({ type: "socket/connect" as const }),
  disconnect: () => ({ type: "socket/disconnect" as const }),

  // Teacher actions
  joinTeacher: () => ({ type: "socket/joinTeacher" as const }),
  createPoll: (question: string, options: string[], timeLimit: number) => ({
    type: "socket/createPoll" as const,
    payload: { question, options, timeLimit },
  }),
  startPoll: () => ({ type: "socket/startPoll" as const }),
  endPoll: () => ({ type: "socket/endPoll" as const }),

  // Student actions
  joinStudent: (studentName: string) => ({
    type: "socket/joinStudent" as const,
    payload: { studentName },
  }),
  submitAnswer: (optionIndex: number) => ({
    type: "socket/submitAnswer" as const,
    payload: { optionIndex },
  }),
  getPollStatus: () => ({ type: "socket/getPollStatus" as const }),
};
