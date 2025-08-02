import { Server, Socket } from "socket.io";
import { pollSessionManager } from "../../services/pollSessionManager";
import { sanitizeStats, sanitizePoll } from "../utils/sanitizers";

export function setupTeacherHandlers(io: Server, socket: Socket) {
  // Teacher joins the session
  socket.on("teacher-join", () => {
    console.log(`👨‍🏫 Teacher joined: ${socket.id}`);

    const currentPoll = pollSessionManager.getCurrentPoll();
    const stats = pollSessionManager.getStats();

    // Send sanitized data to prevent circular references
    socket.emit("poll-status", {
      poll: sanitizePoll(currentPoll),
      stats: sanitizeStats(stats),
    });
  });

  // Create poll (and auto-start it)
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

        // Emit poll created event
        const stats = pollSessionManager.getStats();
        io.emit("poll-created", {
          poll: {
            pollId: poll.pollId,
            question: poll.question,
            options: poll.options,
            timeLimit: poll.timeLimit,
            status: poll.status,
            questionNumber: poll.questionNumber,
          },
          stats: sanitizeStats(stats),
        });

        // Auto-start the poll immediately
        const startSuccess = pollSessionManager.startPoll();
        if (startSuccess) {
          const currentPoll = pollSessionManager.getCurrentPoll();
          io.emit("poll-started", {
            pollId: currentPoll?.pollId,
            timeLimit: currentPoll?.timeLimit,
            startTime: currentPoll?.startTime,
          });

          // Send sanitized poll data to prevent circular references
          socket.emit("poll-create-success", {
            poll: sanitizePoll(currentPoll),
            autoStarted: true,
          });

          console.log("🚀 Poll created and auto-started:", currentPoll?.pollId);
        } else {
          // Send sanitized poll data to prevent circular references
          socket.emit("poll-create-success", {
            poll: sanitizePoll(poll),
            autoStarted: false,
          });
        }
      } catch (error) {
        socket.emit("poll-create-error", {
          message: "Failed to create poll",
        });
      }
    }
  );

  // Start poll
  socket.on("start-poll", () => {
    try {
      const success = pollSessionManager.startPoll();
      if (success) {
        const currentPoll = pollSessionManager.getCurrentPoll();
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

  // End poll
  socket.on("end-poll", () => {
    try {
      const success = pollSessionManager.endPoll();
      if (success) {
        const results = pollSessionManager.getPollResults();
        const currentPoll = pollSessionManager.getCurrentPoll();
        const stats = pollSessionManager.getStats();

        // Emit to all clients with poll status update
        io.emit("poll-ended", {
          results,
          poll: sanitizePoll(currentPoll),
          stats: sanitizeStats(stats),
        });
        socket.emit("poll-end-success", { results });
      } else {
        socket.emit("poll-end-error", { message: "Cannot end poll" });
      }
    } catch (error) {
      socket.emit("poll-end-error", { message: "Failed to end poll" });
    }
  });

  // Get results
  socket.on("get-results", () => {
    try {
      const results = pollSessionManager.getPollResults();
      const stats = pollSessionManager.getStats();

      // Send sanitized data to prevent circular references
      socket.emit("poll-results", {
        results,
        stats: sanitizeStats(stats),
      });
    } catch (error) {
      socket.emit("results-error", { message: "Failed to get results" });
    }
  });
}
