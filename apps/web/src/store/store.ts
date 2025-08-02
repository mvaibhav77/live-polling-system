import { configureStore } from "@reduxjs/toolkit";
import teacherUIReducer from "./slices/teacherUISlice";
import studentUIReducer from "./slices/studentUISlice";
import socketReducer from "./slices/socketSlice";
import pollReducer from "./slices/pollSlice";
import { socketMiddleware } from "./middleware/socketMiddleware";

const store = configureStore({
  reducer: {
    // UI state slices
    teacherUI: teacherUIReducer,
    studentUI: studentUIReducer,
    socket: socketReducer,
    poll: pollReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["socket/setLastMessage"],
        ignoredPaths: ["socket.lastMessage"],
      },
    }).concat(socketMiddleware),
});

export { store };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
