import { Server, Socket } from "socket.io";
import { pollSessionManager } from "../services/pollSessionManager";
import { setupTeacherEvents } from "./teacherEvents";
import { setupStudentEvents } from "./studentEvents";

export function setupSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Basic connection established
    socket.emit("connected", { socketId: socket.id });

    // Setup teacher events
    setupTeacherEvents(io, socket);

    // Setup student events
    setupStudentEvents(io, socket);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);

      // Remove student if they were connected
      const student = pollSessionManager.getStudentBySocketId(socket.id);
      if (student) {
        pollSessionManager.removeStudent(student.id);
        // Broadcast student left to everyone
        io.emit("student-left", {
          studentId: student.id,
          studentName: student.name,
          stats: pollSessionManager.getStats(),
        });
      }
    });
  });
}
