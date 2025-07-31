import { configureStore } from "@reduxjs/toolkit";
import pollReducer from "./slices/pollSlice";
import studentReducer from "./slices/studentSlice";
import teacherReducer from "./slices/teacherSlice";
import socketReducer from "./slices/socketSlice";
import { socketMiddleware } from "./middleware/socketMiddleware";

const store = configureStore({
  reducer: {
    poll: pollReducer,
    student: studentReducer,
    teacher: teacherReducer,
    socket: socketReducer,
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
