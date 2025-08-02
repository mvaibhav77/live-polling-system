import type { Middleware } from "@reduxjs/toolkit";
import { resetSocket } from "../slices/socketSlice";
import { connectSocket, disconnectSocket, getSocket } from "./socket/connection";
import { setupPollEventHandlers } from "./socket/pollEvents";
import { setupStudentEventHandlers } from "./socket/studentEvents";
import { setupChatEventHandlers } from "./socket/chatEvents";
import { setupTeacherEventHandlers } from "./socket/teacherEvents";
import { handleOutgoingActions } from "./socket/actionHandlers";

export const socketMiddleware: Middleware =
  (store) => (next) => (action: unknown) => {
    const { dispatch, getState } = store;

    // Type guard for action
    if (typeof action !== "object" || action === null || !("type" in action)) {
      return next(action);
    }

    const typedAction = action as { type: string; payload?: unknown };

    // Handle socket connection
    if (typedAction.type === "socket/connect") {
      const socket = connectSocket(dispatch);
      
      // Setup all event handlers
      setupPollEventHandlers(socket, dispatch);
      setupStudentEventHandlers(socket, dispatch, getState);
      setupChatEventHandlers(socket, dispatch);
      setupTeacherEventHandlers(socket, dispatch);
      
      return next(action);
    }

    // Handle socket disconnect
    if (typedAction.type === "socket/disconnect") {
      disconnectSocket();
      dispatch(resetSocket());
      return next(action);
    }

    // Handle outgoing socket events
    const socket = getSocket();
    if (handleOutgoingActions(socket, typedAction)) {
      // Action was handled by socket, still pass through middleware chain
      return next(action);
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
