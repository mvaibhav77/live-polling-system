import type { Socket } from "socket.io-client";

export const handleOutgoingActions = (
  socket: Socket | null,
  action: { type: string; payload?: unknown }
) => {
  if (!socket?.connected) return false;

  switch (action.type) {
    // Student actions
    case "socket/joinStudent":
      console.log("🚀 Emitting student-join:", action.payload);
      socket.emit("student-join", action.payload);
      return true;

    case "socket/submitAnswer":
      console.log("🚀 Emitting submit-response:", action.payload);
      socket.emit("submit-response", action.payload);
      return true;

    // Teacher actions
    case "socket/joinTeacher":
      console.log("🚀 Emitting teacher-join");
      socket.emit("teacher-join");
      return true;

    case "socket/createPoll":
      console.log("🚀 Emitting create-poll:", action.payload);
      socket.emit("create-poll", action.payload);
      return true;

    case "socket/startPoll":
      console.log("🚀 Emitting start-poll");
      socket.emit("start-poll");
      return true;

    case "socket/endPoll":
      console.log("🚀 Emitting end-poll");
      socket.emit("end-poll");
      return true;

    case "socket/getPollStatus":
      console.log("🚀 Emitting get-poll-status");
      socket.emit("get-poll-status");
      return true;

    case "socket/getResults":
      console.log("🚀 Emitting get-results");
      socket.emit("get-results");
      return true;

    // Chat actions
    case "socket/sendChatMessage":
      console.log("🚀 Emitting send-chat-message:", action.payload);
      socket.emit("send-chat-message", action.payload);
      return true;

    case "socket/getChatHistory":
      console.log("🚀 Emitting get-chat-history");
      socket.emit("get-chat-history");
      return true;

    case "socket/kickStudent":
      console.log("🚀 Emitting kick-student:", action.payload);
      socket.emit("kick-student", action.payload);
      return true;

    case "socket/clearChat":
      console.log("🚀 Emitting clear-chat");
      socket.emit("clear-chat");
      return true;

    default:
      return false;
  }
};
