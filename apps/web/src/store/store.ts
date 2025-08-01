import { configureStore } from "@reduxjs/toolkit";
import pollApi from "./api/pollApi";
import teacherUIReducer from "./slices/teacherUISlice";
import studentUIReducer from "./slices/studentUISlice";
import socketReducer from "./slices/socketSlice";
import { socketMiddleware } from "./middleware/socketMiddleware";

const store = configureStore({
  reducer: {
    // RTK Query API
    [pollApi.reducerPath]: pollApi.reducer,

    // UI state slices
    teacherUI: teacherUIReducer,
    studentUI: studentUIReducer,
    socket: socketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["socket/setLastMessage"],
        ignoredPaths: ["socket.lastMessage"],
      },
    })
      .concat(pollApi.middleware)
      .concat(socketMiddleware),
});

export { store };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
