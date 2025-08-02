import type { Socket } from "socket.io-client";
import type { AppDispatch } from "../../store";
import {
  addChatMessage,
  setChatMessages,
  setChatParticipants,
  setError,
  type ChatMessage,
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
};
