import { Server, Socket } from "socket.io";
import { chatService } from "../services/chatService";
import { pollSessionManager } from "../services/pollSessionManager";
import { sessionManager } from "../services/sessionManager";

export function setupChatEvents(io: Server, socket: Socket) {
  // Send chat message
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

      // Determine sender type and name
      let senderType: "teacher" | "student" = "student";
      let senderName = "Unknown";

      // Check if sender is a student
      const student = pollSessionManager.getStudentBySocketId(socket.id);
      if (student) {
        senderType = "student";
        senderName = student.name;
      } else {
        // Assume teacher if not a student
        senderType = "teacher";
        senderName = "Teacher";
      }

      // Send the message
      const chatMessage = chatService.sendMessage(
        senderType,
        senderName,
        message
      );

      // Broadcast to all connected clients
      io.emit("chat-message-received", {
        message: chatMessage,
        participants: chatService.getParticipants(),
      });

      // Confirm to sender
      socket.emit("chat-message-sent", { message: chatMessage });
    } catch (error) {
      console.error("Error sending chat message:", error);
      socket.emit("chat-error", { message: "Failed to send message" });
    }
  });

  // Get chat history
  socket.on("get-chat-history", () => {
    try {
      const messages = chatService.getRecentMessages(50);
      const participants = chatService.getParticipants();
      const stats = chatService.getChatStats();

      socket.emit("chat-history", {
        messages,
        participants,
        stats,
      });
    } catch (error) {
      console.error("Error getting chat history:", error);
      socket.emit("chat-error", { message: "Failed to get chat history" });
    }
  });

  // Get participants list
  socket.on("get-participants", () => {
    try {
      const participants = chatService.getParticipants();
      socket.emit("participants-list", { participants });
    } catch (error) {
      console.error("Error getting participants:", error);
      socket.emit("chat-error", { message: "Failed to get participants" });
    }
  });

  // Teacher kicks student
  socket.on("kick-student", (data: { studentId: string; reason?: string }) => {
    try {
      const { studentId, reason = "Removed by teacher" } = data;

      // Only allow teachers to kick students
      const student = pollSessionManager.getStudentBySocketId(socket.id);
      if (student) {
        socket.emit("chat-error", {
          message: "Only teachers can remove students",
        });
        return;
      }

      // Get student info before removing
      const targetStudent = sessionManager.getStudentById(studentId);
      if (!targetStudent) {
        socket.emit("chat-error", { message: "Student not found" });
        return;
      }

      // Remove student from session and poll
      const removed = pollSessionManager.removeStudent(studentId);

      if (removed) {
        // Add system message about the kick
        const systemMessage = chatService.addSystemMessage(
          `${targetStudent.name} was removed from the session. Reason: ${reason}`
        );

        // Get updated participants
        const participants = chatService.getParticipants();
        const stats = pollSessionManager.getStats();

        // Notify the kicked student
        const kickedSocket = io.sockets.sockets.get(targetStudent.socketId);
        if (kickedSocket) {
          kickedSocket.emit("kicked-from-session", {
            reason,
            message: "You have been removed from the session by the teacher.",
          });
          kickedSocket.disconnect(true);
        }

        // Broadcast to all remaining clients
        io.emit("student-kicked", {
          studentId: targetStudent.id,
          studentName: targetStudent.name,
          reason,
          systemMessage,
          participants,
          stats,
        });

        // Confirm to teacher
        socket.emit("student-kick-success", {
          studentId,
          studentName: targetStudent.name,
          participants,
        });

        console.log(
          `👨‍🏫 Teacher kicked student: ${targetStudent.name} (${studentId}). Reason: ${reason}`
        );
      } else {
        socket.emit("chat-error", { message: "Failed to remove student" });
      }
    } catch (error) {
      console.error("Error kicking student:", error);
      socket.emit("chat-error", { message: "Failed to remove student" });
    }
  });

  // Clear chat (teacher only)
  socket.on("clear-chat", () => {
    try {
      // Only allow teachers to clear chat
      const student = pollSessionManager.getStudentBySocketId(socket.id);
      if (student) {
        socket.emit("chat-error", { message: "Only teachers can clear chat" });
        return;
      }

      chatService.clearMessages();

      // Broadcast to all clients
      io.emit("chat-cleared", {
        message: "Chat has been cleared by the teacher",
        timestamp: Date.now(),
      });

      console.log("👨‍🏫 Teacher cleared the chat");
    } catch (error) {
      console.error("Error clearing chat:", error);
      socket.emit("chat-error", { message: "Failed to clear chat" });
    }
  });
}
