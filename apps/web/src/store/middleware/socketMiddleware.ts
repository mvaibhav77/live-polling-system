import type { Middleware } from "@reduxjs/toolkit";
import { io, type Socket } from "socket.io-client";
import {
  setConnected,
  setConnectionError,
  setLastMessage,
  resetSocket,
} from "../slices/socketSlice";
import {
  setPoll,
  updatePollStatus,
  updatePollTiming,
  setPollResults,
  setPollStats,
  setCurrentStudent,
  addStudent,
  removeStudent,
  addChatMessage,
  setChatMessages,
  setChatParticipants,
  updateStudentAnswer,
  clearError,
  setError,
  type Poll,
  type Student,
  type PollResults,
  type PollStats,
  type ChatMessage,
} from "../slices/pollSlice";
import { setHasAnswered } from "../slices/studentUISlice";

let socket: Socket | null = null;

export const socketMiddleware: Middleware =
  (store) => (next) => (action: unknown) => {
    const { dispatch } = store;

    // Type guard for action
    if (typeof action !== "object" || action === null || !("type" in action)) {
      return next(action);
    }

    const typedAction = action as { type: string; payload?: unknown };

    // Handle socket connection
    if (typedAction.type === "socket/connect") {
      // Don't create new connection if already connected
      if (socket?.connected) {
        console.log("🔌 Socket already connected, skipping reconnection");
        dispatch(setConnected(true));
        return next(action);
      }

      // Clean up existing socket if it exists but isn't connected
      if (socket && !socket.connected) {
        socket.removeAllListeners();
        socket.disconnect();
      }

      const serverUrl =
        import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
      console.log("🔌 Connecting to WebSocket server:", serverUrl);

      socket = io(serverUrl, {
        transports: ["websocket", "polling"],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        // Remove forceNew to prevent unnecessary disconnections
      });

      socket.on("connect", () => {
        console.log("✅ WebSocket connected successfully");
        dispatch(setConnected(true));
        dispatch(clearError());
      });

      socket.on("disconnect", (reason) => {
        console.log("🔌 WebSocket disconnected:", reason);
        dispatch(setConnected(false));

        // Only attempt to reconnect for unexpected disconnections
        if (reason === "io server disconnect") {
          // Server-side disconnect, don't automatically reconnect
          console.log("Server disconnected us, not attempting to reconnect");
        } else if (
          reason === "transport close" ||
          reason === "transport error"
        ) {
          // Network issues, socket.io will handle reconnection automatically
          console.log("Network issue, socket.io will handle reconnection");
        }
      });

      socket.on("connect_error", (error: Error) => {
        console.error("❌ WebSocket connection error:", error.message);
        dispatch(setConnectionError(error.message));
        dispatch(setConnected(false));
      });

      socket.on("reconnect", () => {
        console.log("🔄 WebSocket reconnected successfully");
        dispatch(setConnected(true));
        dispatch(clearError());
      });

      socket.on("reconnect_error", (error: Error) => {
        console.error("❌ WebSocket reconnection error:", error.message);
        dispatch(setConnectionError(`Reconnection failed: ${error.message}`));
      });

      // =================
      // POLL EVENTS
      // =================

      socket.on("poll-created", (data: { poll: Poll; stats?: PollStats }) => {
        console.log("🔔 Poll created:", data);
        dispatch(setPoll(data.poll));
        if (data.stats) {
          dispatch(setPollStats(data.stats));
        }
        dispatch(
          setLastMessage({
            type: "poll-created",
            payload: data,
            timestamp: Date.now(),
          })
        );
      });

      socket.on(
        "poll-started",
        (data: { pollId: string; timeLimit: number; startTime: number }) => {
          console.log("🚀 Poll started:", data);
          dispatch(updatePollStatus("active"));
          dispatch(updatePollTiming({ startTime: data.startTime }));
          dispatch(
            setLastMessage({
              type: "poll-started",
              payload: data,
              timestamp: Date.now(),
            })
          );
        }
      );

      socket.on(
        "poll-ended",
        (data: {
          results: PollResults;
          poll?: Poll;
          stats?: PollStats;
          reason?: string;
        }) => {
          console.log("🏁 Poll ended:", data);

          // Update poll status and timing
          dispatch(updatePollStatus("ended"));
          dispatch(updatePollTiming({ endTime: Date.now() }));
          dispatch(setPollResults(data.results));

          // Update poll stats if provided
          if (data.stats) {
            dispatch(setPollStats(data.stats));
          }

          dispatch(
            setLastMessage({
              type: "poll-ended",
              payload: data,
              timestamp: Date.now(),
            })
          );
        }
      );

      socket.on(
        "poll-status",
        (data: { poll: Poll | null; stats: PollStats }) => {
          console.log("📊 Poll status:", data);
          if (data.poll) {
            dispatch(setPoll(data.poll));
          }
          dispatch(setPollStats(data.stats));
        }
      );

      socket.on(
        "poll-results",
        (data: { results: PollResults; stats: PollStats }) => {
          console.log("📊 Poll results:", data);
          dispatch(setPollResults(data.results));
          dispatch(setPollStats(data.stats));
        }
      );

      // =================
      // STUDENT EVENTS
      // =================

      socket.on("student-join-success", (data: { student: Student }) => {
        console.log("✅ Student join success:", data);
        dispatch(setCurrentStudent(data.student));
        dispatch(setHasAnswered(data.student.hasAnswered || false));
        dispatch(
          setLastMessage({
            type: "student-join-success",
            payload: data,
            timestamp: Date.now(),
          })
        );
      });

      socket.on("student-join-error", (data: { message: string }) => {
        console.log("❌ Student join error:", data);
        dispatch(setError(data.message));
        dispatch(
          setLastMessage({
            type: "student-join-error",
            payload: data,
            timestamp: Date.now(),
          })
        );
      });

      socket.on(
        "student-joined",
        (data: { student: Student; stats: PollStats }) => {
          console.log("👨‍🎓 Student joined:", data);
          dispatch(addStudent(data.student));
          dispatch(setPollStats(data.stats));
          dispatch(
            setLastMessage({
              type: "student-joined",
              payload: data,
              timestamp: Date.now(),
            })
          );
        }
      );

      socket.on(
        "student-left",
        (data: {
          studentId: string;
          studentName: string;
          stats: PollStats;
        }) => {
          console.log("👋 Student left:", data);
          dispatch(removeStudent(data.studentId));
          dispatch(setPollStats(data.stats));
          dispatch(
            setLastMessage({
              type: "student-left",
              payload: data,
              timestamp: Date.now(),
            })
          );
        }
      );

      socket.on("current-poll", (data: { poll: Poll }) => {
        console.log("� Current poll:", data);
        dispatch(setPoll(data.poll));
        dispatch(
          setLastMessage({
            type: "current-poll",
            payload: data,
            timestamp: Date.now(),
          })
        );
      });

      socket.on(
        "response-success",
        (data: { optionIndex: number; message: string }) => {
          console.log("✅ Response success:", data);
          // Update current student's answer status in both slices
          const state = store.getState() as {
            poll: { currentStudent: Student | null };
          };
          if (state.poll.currentStudent) {
            dispatch(
              updateStudentAnswer({
                studentId: state.poll.currentStudent.id,
                hasAnswered: true,
              })
            );
          }
          // Update hasAnswered in studentUI slice too
          dispatch(setHasAnswered(true));
          dispatch(
            setLastMessage({
              type: "response-success",
              payload: data,
              timestamp: Date.now(),
            })
          );
        }
      );

      socket.on("response-error", (data: { message: string }) => {
        console.log("❌ Response error:", data);
        dispatch(setError(data.message));
        dispatch(
          setLastMessage({
            type: "response-error",
            payload: data,
            timestamp: Date.now(),
          })
        );
      });

      socket.on(
        "response-received",
        (data: {
          studentId: string;
          studentName: string;
          optionIndex: number;
          results: PollResults;
          stats: PollStats;
        }) => {
          console.log("📊 Response received:", data);
          dispatch(
            updateStudentAnswer({
              studentId: data.studentId,
              hasAnswered: true,
            })
          );
          dispatch(setPollResults(data.results));
          dispatch(setPollStats(data.stats));
          dispatch(
            setLastMessage({
              type: "response-received",
              payload: data,
              timestamp: Date.now(),
            })
          );
        }
      );

      // =================
      // CHAT EVENTS
      // =================

      socket.on(
        "chat-message-received",
        (data: { message: ChatMessage; participants: string[] }) => {
          console.log("💬 Chat message received:", data);
          dispatch(addChatMessage(data.message));
          dispatch(setChatParticipants(data.participants));
          dispatch(
            setLastMessage({
              type: "chat-message-received",
              payload: data,
              timestamp: Date.now(),
            })
          );
        }
      );

      socket.on(
        "chat-history",
        (data: { messages: ChatMessage[]; participants: string[] }) => {
          console.log("📜 Chat history:", data);
          dispatch(setChatMessages(data.messages));
          dispatch(setChatParticipants(data.participants));
        }
      );

      socket.on(
        "chat-cleared",
        (data: { message: string; timestamp: number }) => {
          console.log("🧹 Chat cleared:", data);
          dispatch(setChatMessages([]));
          dispatch(
            setLastMessage({
              type: "chat-cleared",
              payload: data,
              timestamp: Date.now(),
            })
          );
        }
      );

      socket.on("chat-error", (data: { message: string }) => {
        console.log("❌ Chat error:", data);
        dispatch(setError(data.message));
      });

      // Teacher-specific events
      socket.on("poll-create-success", (data: { poll: Poll }) => {
        console.log("✅ Poll create success:", data);
        dispatch(setPoll(data.poll));
        dispatch(
          setLastMessage({
            type: "poll-create-success",
            payload: data,
            timestamp: Date.now(),
          })
        );
      });

      socket.on("poll-create-error", (data: { message: string }) => {
        console.log("❌ Poll create error:", data);
        dispatch(setError(data.message));
      });
    }

    // Handle socket disconnect
    if (typedAction.type === "socket/disconnect") {
      if (socket) {
        console.log("🔌 Manually disconnecting WebSocket");
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
      }
      dispatch(resetSocket());
    }

    // =================
    // OUTGOING SOCKET EVENTS
    // =================

    // Student actions
    if (typedAction.type === "socket/joinStudent") {
      const payload = typedAction.payload as { studentName: string };
      if (socket?.connected) {
        console.log("🚀 Emitting student-join:", payload);
        socket.emit("student-join", payload);
      }
    }

    if (typedAction.type === "socket/submitAnswer") {
      const payload = typedAction.payload as { optionIndex: number };
      if (socket?.connected) {
        console.log("🚀 Emitting submit-response:", payload);
        socket.emit("submit-response", payload);
      }
    }

    // Teacher actions
    if (typedAction.type === "socket/joinTeacher") {
      if (socket?.connected) {
        console.log("🚀 Emitting teacher-join");
        socket.emit("teacher-join");
      }
    }

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

    if (typedAction.type === "socket/getResults") {
      if (socket?.connected) {
        console.log("🚀 Emitting get-results");
        socket.emit("get-results");
      }
    }

    // Chat actions
    if (typedAction.type === "socket/sendChatMessage") {
      const payload = typedAction.payload as { message: string };
      if (socket?.connected) {
        console.log("🚀 Emitting send-chat-message:", payload);
        socket.emit("send-chat-message", payload);
      }
    }

    if (typedAction.type === "socket/getChatHistory") {
      if (socket?.connected) {
        console.log("🚀 Emitting get-chat-history");
        socket.emit("get-chat-history");
      }
    }

    if (typedAction.type === "socket/kickStudent") {
      const payload = typedAction.payload as {
        studentId: string;
        reason?: string;
      };
      if (socket?.connected) {
        console.log("🚀 Emitting kick-student:", payload);
        socket.emit("kick-student", payload);
      }
    }

    if (typedAction.type === "socket/clearChat") {
      if (socket?.connected) {
        console.log("🚀 Emitting clear-chat");
        socket.emit("clear-chat");
      }
    }

    return next(action);
  };

// Simplified action creators for WebSocket events
export const socketActions = {
  connect: () => ({ type: "socket/connect" as const }),
  disconnect: () => ({ type: "socket/disconnect" as const }),

  // Teacher actions
  joinTeacher: () => ({ type: "socket/joinTeacher" as const }),
  createPoll: (
    question: string,
    options: string[],
    timeLimit: number = 60
  ) => ({
    type: "socket/createPoll" as const,
    payload: { question, options, timeLimit },
  }),
  startPoll: () => ({ type: "socket/startPoll" as const }),
  endPoll: () => ({ type: "socket/endPoll" as const }),
  getResults: () => ({ type: "socket/getResults" as const }),

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

  // Chat actions
  sendChatMessage: (message: string) => ({
    type: "socket/sendChatMessage" as const,
    payload: { message },
  }),
  getChatHistory: () => ({ type: "socket/getChatHistory" as const }),
  kickStudent: (studentId: string, reason?: string) => ({
    type: "socket/kickStudent" as const,
    payload: { studentId, reason },
  }),
  clearChat: () => ({ type: "socket/clearChat" as const }),
};
