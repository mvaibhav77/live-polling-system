import { Server, Socket } from "socket.io";
import { pollSessionManager } from "../../services/pollSessionManager";
import { chatService } from "../../services/chatService";
import {
  sanitizeStats,
  sanitizePoll,
  sanitizeStudent,
} from "../utils/sanitizers";

export function setupStudentHandlers(io: Server, socket: Socket) {
  // Student joins
  socket.on("student-join", (data: { studentName: string }) => {
    try {
      const { studentName } = data;
      const student = pollSessionManager.addStudent(socket.id, studentName);

      if (student) {
        socket.emit("student-join-success", {
          student: sanitizeStudent(student),
        });

        const currentPoll = pollSessionManager.getCurrentPoll();
        if (currentPoll) {
          socket.emit("current-poll", {
            poll: sanitizePoll(currentPoll),
          });
        }

        io.emit("student-joined", {
          student: sanitizeStudent(student),
          stats: sanitizeStats(pollSessionManager.getStats()),
        });

        const systemMessage = chatService.addSystemMessage(
          `${studentName} joined the session`
        );
        io.emit("chat-participant-joined", {
          systemMessage,
          participants: chatService.getParticipants(),
        });
      } else {
        socket.emit("student-join-error", {
          message: "Name already taken or no active poll",
        });
      }
    } catch (error) {
      socket.emit("student-join-error", { message: "Failed to join poll" });
    }
  });

  // Submit response
  socket.on("submit-response", (data: { optionIndex: number }) => {
    try {
      const { optionIndex } = data;
      const student = pollSessionManager.getStudentBySocketId(socket.id);

      if (!student) {
        socket.emit("response-error", { message: "Student not found" });
        return;
      }

      const success = pollSessionManager.submitResponse(
        student.id,
        optionIndex
      );

      if (success) {
        socket.emit("response-success", {
          optionIndex,
          message: "Response recorded successfully",
        });

        const results = pollSessionManager.getPollResults();
        const stats = pollSessionManager.getStats();

        io.emit("response-received", {
          studentId: student.id,
          studentName: student.name,
          optionIndex,
          results,
          stats: sanitizeStats(stats),
        });

        const currentPoll = pollSessionManager.getCurrentPoll();
        if (currentPoll?.status === "ended") {
          io.emit("poll-ended", {
            results,
            reason: "All students answered",
          });
        }
      } else {
        socket.emit("response-error", {
          message:
            "Cannot submit response. Poll may be inactive or you already answered.",
        });
      }
    } catch (error) {
      socket.emit("response-error", { message: "Failed to submit response" });
    }
  });

  // Get poll status
  socket.on("get-poll-status", () => {
    try {
      const currentPoll = pollSessionManager.getCurrentPoll();
      const student = pollSessionManager.getStudentBySocketId(socket.id);

      socket.emit("poll-status-update", {
        poll: currentPoll
          ? {
              pollId: currentPoll.pollId,
              question: currentPoll.question,
              options: currentPoll.options,
              status: currentPoll.status,
              timeLimit: currentPoll.timeLimit,
              startTime: currentPoll.startTime,
              endTime: currentPoll.endTime,
            }
          : null,
        student: sanitizeStudent(student),
      });
    } catch (error) {
      socket.emit("status-error", { message: "Failed to get poll status" });
    }
  });
}
