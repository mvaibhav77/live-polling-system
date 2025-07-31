import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface SocketMessage {
  type: string;
  payload?: unknown;
  timestamp?: number;
}

export interface SocketState {
  isConnected: boolean;
  connectionError: string | null;
  lastMessage: SocketMessage | null;
  room: string | null;
  reconnectAttempts: number;
  isReconnecting: boolean;
}

const initialState: SocketState = {
  isConnected: false,
  connectionError: null,
  lastMessage: null,
  room: null,
  reconnectAttempts: 0,
  isReconnecting: false,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (action.payload) {
        state.connectionError = null;
        state.reconnectAttempts = 0;
        state.isReconnecting = false;
      }
    },
    setConnectionError: (state, action: PayloadAction<string>) => {
      state.connectionError = action.payload;
      state.isConnected = false;
    },
    setLastMessage: (state, action: PayloadAction<SocketMessage>) => {
      state.lastMessage = action.payload;
    },
    setRoom: (state, action: PayloadAction<string | null>) => {
      state.room = action.payload;
    },
    incrementReconnectAttempts: (state) => {
      state.reconnectAttempts += 1;
    },
    setReconnecting: (state, action: PayloadAction<boolean>) => {
      state.isReconnecting = action.payload;
    },
    resetReconnectAttempts: (state) => {
      state.reconnectAttempts = 0;
      state.isReconnecting = false;
    },
    clearConnectionError: (state) => {
      state.connectionError = null;
    },
    resetSocket: (state) => {
      state.isConnected = false;
      state.connectionError = null;
      state.lastMessage = null;
      state.room = null;
      state.reconnectAttempts = 0;
      state.isReconnecting = false;
    },
  },
});

export const {
  setConnected,
  setConnectionError,
  setLastMessage,
  setRoom,
  incrementReconnectAttempts,
  setReconnecting,
  resetReconnectAttempts,
  clearConnectionError,
  resetSocket,
} = socketSlice.actions;

export default socketSlice.reducer;
