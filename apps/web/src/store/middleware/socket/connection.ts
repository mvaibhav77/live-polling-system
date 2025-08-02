import { io, type Socket } from "socket.io-client";
import type { AppDispatch } from "../../store";
import {
  setConnected,
  setConnectionError,
  clearConnectionError,
} from "../../slices/socketSlice";

let socket: Socket | null = null;

export const getSocket = (): Socket | null => socket;

export const connectSocket = (dispatch: AppDispatch): Socket => {
  // Don't create new connection if already connected
  if (socket?.connected) {
    console.log("🔌 Socket already connected, skipping reconnection");
    dispatch(setConnected(true));
    return socket;
  }

  // Clean up existing socket if it exists but isn't connected
  if (socket && !socket.connected) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  const serverUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
  console.log("🔌 Connecting to WebSocket server:", serverUrl);

  socket = io(serverUrl, {
    transports: ["websocket", "polling"],
    timeout: 10000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Connection event handlers
  socket.on("connect", () => {
    console.log("✅ WebSocket connected successfully");
    dispatch(setConnected(true));
    dispatch(clearConnectionError());
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 WebSocket disconnected:", reason);
    dispatch(setConnected(false));

    // Only attempt to reconnect for unexpected disconnections
    if (reason === "io server disconnect") {
      console.log("Server disconnected us, not attempting to reconnect");
    } else if (reason === "transport close" || reason === "transport error") {
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
    dispatch(clearConnectionError());
  });

  socket.on("reconnect_error", (error: Error) => {
    console.error("❌ WebSocket reconnection error:", error.message);
    dispatch(setConnectionError(`Reconnection failed: ${error.message}`));
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    console.log("🔌 Manually disconnecting WebSocket");
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};
