import { Server, Socket } from "socket.io";
import { pollSessionManager } from "../../services/pollSessionManager";
import { sessionManager } from "../../services/sessionManager";
import { chatService } from "../../services/chatService";
import { sanitizeStats } from "../utils/sanitizers";

export function setupChatHandlers(io: Server, socket: Socket) {
  // Send message
  socket.on("send-chat-message", (data: { message: string }) => {
    try {
      const { message } = data;

      if (!message || message.trim().length === 0) {
        socket.emit("chat-error", { message: "Message cannot be empty" });
        return;
      }

      if (message.trim().length > 500) {
        socket.emit("chat-error", {
          message: "Message too long (max 500 characters)",
        });
        return;
      }

      let senderType: "teacher" | "student" = "student";
      let senderName = "Unknown";

      const student = pollSessionManager.getStudentBySocketId(socket.id);
      if (student) {
        senderType = "student";
        senderName = student.name;
      } else {
        senderType = "teacher";
        senderName = "Teacher";
      }

      const chatMessage = chatService.sendMessage(
        senderType,
        senderName,
        message
      );

      io.emit("chat-message-received", {
        message: chatMessage,
        participants: chatService.getParticipants(),
      });

      socket.emit("chat-message-sent", { message: chatMessage });
    } catch (error) {
      socket.emit("chat-error", { message: "Failed to send message" });
    }
  });

  // Get chat history
  socket.on("get-chat-history", () => {
    try {
      const messages = chatService.getRecentMessages(50);
      const participants = chatService.getParticipants();
      const stats = chatService.getChatStats();

      socket.emit("chat-history", { messages, participants, stats });
    } catch (error) {
      socket.emit("chat-error", { message: "Failed to get chat history" });
    }
  });

  // Kick student (teacher only)
  socket.on("kick-student", (data: { studentId: string; reason?: string }) => {
    try {
      const { studentId, reason = "Removed by teacher" } = data;

      const student = pollSessionManager.getStudentBySocketId(socket.id);
      if (student) {
        socket.emit("chat-error", {
          message: "Only teachers can remove students",
        });
        return;
      }

      const targetStudent = sessionManager.getStudentById(studentId);
      if (!targetStudent) {
        socket.emit("chat-error", { message: "Student not found" });
        return;
      }

      const removed = pollSessionManager.removeStudent(studentId);
      if (removed) {
        const systemMessage = chatService.addSystemMessage(
          `${targetStudent.name} was removed from the session. Reason: ${reason}`
        );

        const participants = chatService.getParticipants();
        const stats = pollSessionManager.getStats();

        const kickedSocket = io.sockets.sockets.get(targetStudent.socketId);
        if (kickedSocket) {
          kickedSocket.emit("kicked-from-session", {
            reason,
            message: "You have been removed from the session by the teacher.",
          });
          kickedSocket.disconnect(true);
        }

        io.emit("student-kicked", {
          studentId: targetStudent.id,
          studentName: targetStudent.name,
          reason,
          systemMessage,
          participants,
          stats,
        });

        socket.emit("student-kick-success", {
          studentId,
          studentName: targetStudent.name,
          participants,
        });
      } else {
        socket.emit("chat-error", { message: "Failed to remove student" });
      }
    } catch (error) {
      socket.emit("chat-error", { message: "Failed to remove student" });
    }
  });

  // Clear chat (teacher only)
  socket.on("clear-chat", () => {
    try {
      const student = pollSessionManager.getStudentBySocketId(socket.id);
      if (student) {
        socket.emit("chat-error", {
          message: "Only teachers can clear chat",
        });
        return;
      }

      chatService.clearMessages();
      io.emit("chat-cleared", {
        message: "Chat has been cleared by the teacher",
        timestamp: Date.now(),
      });
    } catch (error) {
      socket.emit("chat-error", { message: "Failed to clear chat" });
    }
  });
}
