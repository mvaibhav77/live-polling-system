import { Router, Request, Response } from "express";
import { Server } from "socket.io";
import { chatService } from "../services/chatService";
import { pollSessionManager } from "../services/pollSessionManager";
import { sessionManager } from "../services/sessionManager";

export default function createChatRoutes(io: Server) {
  const router = Router();

  // Get chat history
  router.get("/chat", (req: Request, res: Response) => {
    try {
      const messages = chatService.getRecentMessages(50);
      const participants = chatService.getParticipants();
      const stats = chatService.getChatStats();

      res.json({
        success: true,
        data: {
          messages,
          participants,
          stats,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to get chat data",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Send chat message via REST
  router.post("/chat/message", (req: Request, res: Response) => {
    try {
      const {
        message,
        senderType = "student",
        senderName = "Unknown",
      } = req.body;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          error: "Message cannot be empty",
        });
      }

      if (message.trim().length > 500) {
        return res.status(400).json({
          error: "Message too long (max 500 characters)",
        });
      }

      // Send the message
      const chatMessage = chatService.sendMessage(
        senderType,
        senderName,
        message
      );

      // Broadcast to all WebSocket clients
      io.emit("chat-message-received", {
        message: chatMessage,
        participants: chatService.getParticipants(),
      });

      res.status(201).json({
        success: true,
        message: chatMessage,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to send message",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Get participants list
  router.get("/chat/participants", (req: Request, res: Response) => {
    try {
      const participants = chatService.getParticipants();

      res.json({
        success: true,
        participants,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to get participants",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Kick student (teacher only)
  router.post("/chat/kick-student", (req: Request, res: Response) => {
    try {
      const { studentId, reason = "Removed by teacher" } = req.body;

      if (!studentId) {
        return res.status(400).json({
          error: "Student ID is required",
        });
      }

      // Get student info before removing
      const targetStudent = sessionManager.getStudentById(studentId);

      if (!targetStudent) {
        return res.status(404).json({
          error: "Student not found",
        });
      }

      // Remove student from session and poll
      const removed = pollSessionManager.removeStudent(targetStudent.id);

      if (removed) {
        // Add system message about the kick
        const systemMessage = chatService.addSystemMessage(
          `${targetStudent.name} was removed from the session. Reason: ${reason}`
        );

        // Get updated participants
        const participants = chatService.getParticipants();
        const stats = pollSessionManager.getStats();

        // Notify the kicked student via WebSocket if they're connected
        const kickedSocket = io.sockets.sockets.get(targetStudent.socketId);
        if (kickedSocket) {
          kickedSocket.emit("kicked-from-session", {
            reason,
            message: "You have been removed from the session by the teacher.",
          });
          kickedSocket.disconnect(true);
        }

        // Notify via WebSocket if available
        io.emit("student-kicked", {
          studentId: targetStudent.id,
          studentName: targetStudent.name,
          reason,
          systemMessage,
          participants,
          stats,
        });

        res.json({
          success: true,
          message: "Student removed successfully",
          studentName: targetStudent.name,
          participants,
        });

        console.log(
          `👨‍🏫 REST API: Student kicked: ${targetStudent.name} (${targetStudent.id}). Reason: ${reason}`
        );
      } else {
        res.status(400).json({
          error: "Failed to remove student",
        });
      }
    } catch (error) {
      res.status(500).json({
        error: "Failed to kick student",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Clear chat (teacher only)
  router.delete("/chat", (req: Request, res: Response) => {
    try {
      chatService.clearMessages();

      // Broadcast to WebSocket clients
      io.emit("chat-cleared", {
        message: "Chat has been cleared by the teacher",
        timestamp: Date.now(),
      });

      res.json({
        success: true,
        message: "Chat cleared successfully",
      });

      console.log("👨‍🏫 REST API: Teacher cleared the chat");
    } catch (error) {
      res.status(500).json({
        error: "Failed to clear chat",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return router;
}
