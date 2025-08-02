import { Server, Socket } from "socket.io";
import { pollSessionManager } from "../services/pollSessionManager";
import { chatService } from "../services/chatService";
import { setupTeacherEvents } from "./teacherEvents";
import { setupStudentEvents } from "./studentEvents";
import { setupChatEvents } from "./chatEvents";

export function setupSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Basic connection established
    socket.emit("connected", { socketId: socket.id });

    // Setup teacher events
    setupTeacherEvents(io, socket);

    // Setup student events
    setupStudentEvents(io, socket);

    // Setup chat events
    setupChatEvents(io, socket);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);

      // Remove student if they were connected
      const student = pollSessionManager.getStudentBySocketId(socket.id);
      if (student) {
        pollSessionManager.removeStudent(student.id);

        // Get updated stats
        const stats = pollSessionManager.getStats();

        // Broadcast student left to everyone
        io.emit("student-left", {
          studentId: student.id,
          studentName: student.name,
          stats: stats,
        });

        // Add chat system message about student leaving
        const systemMessage = chatService.addSystemMessage(
          `${student.name} left the session`
        );

        // Broadcast chat update with updated participants
        io.emit("chat-participant-left", {
          systemMessage,
          participants: chatService.getParticipants(),
        });

        console.log(`Student disconnected: ${student.name} (${student.id})`);
      }
    });
  });
}
