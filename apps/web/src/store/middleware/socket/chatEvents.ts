import type { Socket } from "socket.io-client";
import type { AppDispatch } from "../../store";
import {
  addChatMessage,
  setChatMessages,
  setChatParticipants,
  removeStudent,
  setPollStats,
  setError,
  type ChatMessage,
  type PollStats,
} from "../../slices/pollSlice";
import { setLastMessage } from "../../slices/socketSlice";

export const setupChatEventHandlers = (
  socket: Socket,
  dispatch: AppDispatch
) => {
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
      console.log("📜 Participants received:", data.participants);
      dispatch(setChatMessages(data.messages));
      dispatch(setChatParticipants(data.participants));
    }
  );

  socket.on("chat-cleared", (data: { message: string; timestamp: number }) => {
    console.log("🧹 Chat cleared:", data);
    dispatch(setChatMessages([]));
    dispatch(
      setLastMessage({
        type: "chat-cleared",
        payload: data,
        timestamp: Date.now(),
      })
    );
  });

  socket.on("chat-error", (data: { message: string }) => {
    console.log("❌ Chat error:", data);
    dispatch(setError(data.message));
  });

  // Handle participant events
  socket.on(
    "chat-participant-joined",
    (data: { systemMessage: ChatMessage; participants: string[] }) => {
      console.log("👤 Chat participant joined:", data);
      dispatch(addChatMessage(data.systemMessage));
      dispatch(setChatParticipants(data.participants));
    }
  );

  socket.on(
    "chat-participant-left",
    (data: { systemMessage: ChatMessage; participants: string[] }) => {
      console.log("👤 Chat participant left:", data);
      dispatch(addChatMessage(data.systemMessage));
      dispatch(setChatParticipants(data.participants));
    }
  );

  // Handle student kick events
  socket.on(
    "student-kicked",
    (data: {
      studentId: string;
      studentName: string;
      reason: string;
      systemMessage: ChatMessage;
      participants: string[];
      stats: PollStats;
    }) => {
      console.log("🦶 Student kicked:", data);
      dispatch(addChatMessage(data.systemMessage));
      dispatch(setChatParticipants(data.participants));
      dispatch(removeStudent(data.studentId));
      dispatch(setPollStats(data.stats));
    }
  );

  socket.on(
    "student-kick-success",
    (data: {
      studentId: string;
      studentName: string;
      participants: string[];
    }) => {
      console.log("✅ Student kick success:", data);
      dispatch(setChatParticipants(data.participants));
    }
  );

  // // Handle being kicked (for students)
  // socket.on(
  //   "kicked-from-session",
  //   (data: { reason: string; message: string }) => {
  //     console.log("🚪 Kicked from session:", data);
  //     alert(
  //       `You have been removed from the session.\nReason: ${data.reason}\n\n${data.message}`
  //     );
  //     // Redirect to home page
  //     // window.location.href = "/";
  //   }
  // );

  socket.on("chat-message-sent", (data: { message: ChatMessage }) => {
    console.log("✅ Chat message sent:", data);
    // Message already added via chat-message-received event
  });
};
