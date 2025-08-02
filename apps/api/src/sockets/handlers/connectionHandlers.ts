import { Server, Socket } from "socket.io";
import { pollSessionManager } from "../../services/pollSessionManager";
import { chatService } from "../../services/chatService";
import { sanitizeStats } from "../utils/sanitizers";

export function setupConnectionHandlers(io: Server, socket: Socket) {
  // Basic connection established
  socket.emit("connected", { socketId: socket.id });

  // Disconnect handler
  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);

    const student = pollSessionManager.getStudentBySocketId(socket.id);
    if (student) {
      pollSessionManager.removeStudent(student.id);

      const stats = pollSessionManager.getStats();
      io.emit("student-left", {
        studentId: student.id,
        studentName: student.name,
        stats: sanitizeStats(stats),
      });

      const systemMessage = chatService.addSystemMessage(
        `${student.name} left the session`
      );
      io.emit("chat-participant-left", {
        systemMessage,
        participants: chatService.getParticipants(),
      });

      console.log(`Student disconnected: ${student.name} (${student.id})`);
    }
  });
}
