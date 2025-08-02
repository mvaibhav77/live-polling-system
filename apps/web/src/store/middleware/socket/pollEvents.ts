import type { Socket } from "socket.io-client";
import type { AppDispatch } from "../../store";
import {
  setPoll,
  updatePollStatus,
  updatePollTiming,
  setPollResults,
  setPollStats,
  type Poll,
  type PollResults,
  type PollStats,
} from "../../slices/pollSlice";
import { setLastMessage } from "../../slices/socketSlice";

export const setupPollEventHandlers = (
  socket: Socket,
  dispatch: AppDispatch
) => {
  socket.on("poll-created", (data: { poll: Poll; stats?: PollStats }) => {
    console.log("🔔 Poll created:", data);
    dispatch(setPoll(data.poll));
    if (data.stats) {
      dispatch(setPollStats(data.stats));
    }
    dispatch(
      setLastMessage({
        type: "poll-created",
        payload: data,
        timestamp: Date.now(),
      })
    );
  });

  socket.on(
    "poll-started",
    (data: { pollId: string; timeLimit: number; startTime: number }) => {
      console.log("🚀 Poll started:", data);
      dispatch(updatePollStatus("active"));
      dispatch(updatePollTiming({ startTime: data.startTime }));
      dispatch(
        setLastMessage({
          type: "poll-started",
          payload: data,
          timestamp: Date.now(),
        })
      );
    }
  );

  socket.on(
    "poll-ended",
    (data: {
      results: PollResults;
      poll?: Poll;
      stats?: PollStats;
      reason?: string;
    }) => {
      console.log("🏁 Poll ended:", data);

      // Update poll status and timing
      dispatch(updatePollStatus("ended"));
      dispatch(updatePollTiming({ endTime: Date.now() }));
      dispatch(setPollResults(data.results));

      // Update poll stats if provided
      if (data.stats) {
        dispatch(setPollStats(data.stats));
      }

      dispatch(
        setLastMessage({
          type: "poll-ended",
          payload: data,
          timestamp: Date.now(),
        })
      );
    }
  );

  socket.on("poll-status", (data: { poll: Poll | null; stats: PollStats }) => {
    console.log("📊 Poll status:", data);
    if (data.poll) {
      dispatch(setPoll(data.poll));
    }
    dispatch(setPollStats(data.stats));
  });

  socket.on(
    "poll-results",
    (data: { results: PollResults; stats: PollStats }) => {
      console.log("📊 Poll results:", data);
      dispatch(setPollResults(data.results));
      dispatch(setPollStats(data.stats));
    }
  );

  socket.on("current-poll", (data: { poll: Poll }) => {
    console.log("📋 Current poll:", data);
    dispatch(setPoll(data.poll));
    dispatch(
      setLastMessage({
        type: "current-poll",
        payload: data,
        timestamp: Date.now(),
      })
    );
  });
};
