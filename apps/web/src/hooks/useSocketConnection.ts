import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import { socketActions } from "../store/middleware/socketMiddleware";

/**
 * Hook for managing WebSocket connection lifecycle
 * Handles connection, disconnection, and reconnection logic
 */
export const useSocketConnection = () => {
  const dispatch = useDispatch();
  const connectAttempted = useRef(false);

  const socketState = useSelector((state: RootState) => state.socket);
  const { isConnected, connectionError, reconnectAttempts, isReconnecting } =
    socketState;

  // Connect socket on mount (only once)
  useEffect(() => {
    if (!connectAttempted.current) {
      console.log("🔌 Establishing WebSocket connection...");
      dispatch(socketActions.connect());
      connectAttempted.current = true;
    }

    // Cleanup on unmount
    return () => {
      if (connectAttempted.current) {
        console.log("🔌 Disconnecting WebSocket...");
        dispatch(socketActions.disconnect());
        connectAttempted.current = false;
      }
    };
  }, [dispatch]);

  // Auto-reconnect logic with exponential backoff
  useEffect(() => {
    if (
      connectionError &&
      !isConnected &&
      !isReconnecting &&
      reconnectAttempts < 3
    ) {
      const delay = Math.pow(2, reconnectAttempts) * 1000; // 1s, 2s, 4s

      console.log(
        `🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/3)`
      );

      const timer = setTimeout(() => {
        dispatch(socketActions.connect());
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [
    connectionError,
    isConnected,
    isReconnecting,
    reconnectAttempts,
    dispatch,
  ]);

  return {
    isConnected,
    connectionError,
    reconnectAttempts,
    isReconnecting,
    // Connection status for UI
    connectionStatus: isConnected
      ? "connected"
      : isReconnecting
        ? "reconnecting"
        : connectionError
          ? "error"
          : "connecting",
  };
};
