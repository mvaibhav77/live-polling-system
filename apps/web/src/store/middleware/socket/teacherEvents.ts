import type { Socket } from "socket.io-client";
import type { AppDispatch } from "../../store";
import { setPoll, setError, type Poll } from "../../slices/pollSlice";
import { setLastMessage } from "../../slices/socketSlice";

export const setupTeacherEventHandlers = (
  socket: Socket,
  dispatch: AppDispatch
) => {
  socket.on("poll-create-success", (data: { poll: Poll }) => {
    console.log("✅ Poll create success:", data);
    dispatch(setPoll(data.poll));
    dispatch(
      setLastMessage({
        type: "poll-create-success",
        payload: data,
        timestamp: Date.now(),
      })
    );
  });

  socket.on("poll-create-error", (data: { message: string }) => {
    console.log("❌ Poll create error:", data);
    dispatch(setError(data.message));
  });
};
