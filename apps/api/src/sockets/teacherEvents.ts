import { Server, Socket } from "socket.io";
import { pollSessionManager } from "../services/pollSessionManager";

export function setupTeacherEvents(io: Server, socket: Socket) {
  // Teacher joins the session
  socket.on("teacher-join", () => {
    console.log(`👨‍🏫 Teacher joined: ${socket.id}`);

    // Send current poll status to teacher
    const currentPoll = pollSessionManager.getCurrentPoll();
    socket.emit("poll-status", {
      poll: currentPoll,
      stats: pollSessionManager.getStats(),
    });
  });

  // Teacher creates a new poll
  socket.on(
    "create-poll",
    (data: { question: string; options: string[]; timeLimit?: number }) => {
      try {
        const { question, options, timeLimit = 60 } = data;

        const poll = pollSessionManager.createPoll(
          question,
          options,
          timeLimit
        );

        // Broadcast new poll to all clients
        io.emit("poll-created", {
          poll: {
            pollId: poll.pollId,
            question: poll.question,
            options: poll.options,
            timeLimit: poll.timeLimit,
            status: poll.status,
          },
        });

        socket.emit("poll-create-success", { poll });
      } catch (error) {
        socket.emit("poll-create-error", { message: "Failed to create poll" });
      }
    }
  );

  // Teacher starts the poll
  socket.on("start-poll", () => {
    try {
      const success = pollSessionManager.startPoll();

      if (success) {
        const currentPoll = pollSessionManager.getCurrentPoll();

        // Broadcast poll started to all clients
        io.emit("poll-started", {
          pollId: currentPoll?.pollId,
          timeLimit: currentPoll?.timeLimit,
          startTime: currentPoll?.startTime,
        });

        socket.emit("poll-start-success");
      } else {
        socket.emit("poll-start-error", { message: "Cannot start poll" });
      }
    } catch (error) {
      socket.emit("poll-start-error", { message: "Failed to start poll" });
    }
  });

  // Teacher ends the poll manually
  socket.on("end-poll", () => {
    try {
      const success = pollSessionManager.endPoll();

      if (success) {
        const results = pollSessionManager.getPollResults();

        // Broadcast poll ended to all clients
        io.emit("poll-ended", { results });

        socket.emit("poll-end-success", { results });
      } else {
        socket.emit("poll-end-error", { message: "Cannot end poll" });
      }
    } catch (error) {
      socket.emit("poll-end-error", { message: "Failed to end poll" });
    }
  });

  // Teacher requests current results
  socket.on("get-results", () => {
    try {
      const results = pollSessionManager.getPollResults();
      const stats = pollSessionManager.getStats();

      socket.emit("poll-results", { results, stats });
    } catch (error) {
      socket.emit("results-error", { message: "Failed to get results" });
    }
  });
}
