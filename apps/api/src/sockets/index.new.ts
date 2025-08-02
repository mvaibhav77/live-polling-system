import { Server, Socket } from "socket.io";
import { pollSessionManager } from "../services/pollSessionManager";
import { sanitizeStats, sanitizePoll } from "./utils/sanitizers";
import {
  setupTeacherHandlers,
  setupStudentHandlers,
  setupChatHandlers,
  setupConnectionHandlers,
} from "./handlers";

export function setupSocketHandlers(io: Server) {
  // Set up callback for automatic poll endings (timer expiration, all students answered)
  pollSessionManager.setOnPollEndedCallback((results) => {
    console.log("🔔 Poll ended automatically, notifying all clients");
    const currentPoll = pollSessionManager.getCurrentPoll();
    const stats = pollSessionManager.getStats();

    io.emit("poll-ended", {
      results,
      poll: sanitizePoll(currentPoll),
      stats: sanitizeStats(stats),
    });
  });

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Setup all event handlers for this socket
    setupConnectionHandlers(io, socket);
    setupTeacherHandlers(io, socket);
    setupStudentHandlers(io, socket);
    setupChatHandlers(io, socket);
  });
}
