import { Server, Socket } from "socket.io";
import { pollSessionManager } from "../services/pollSessionManager";
import { sessionManager } from "../services/sessionManager";

export function setupStudentEvents(io: Server, socket: Socket) {
  // Student joins the poll session
  socket.on("student-join", (data: { studentName: string }) => {
    try {
      const { studentName } = data;

      const student = pollSessionManager.addStudent(socket.id, studentName);

      if (student) {
        // Send success to the student
        socket.emit("student-join-success", {
          student: {
            id: student.id,
            name: student.name,
            hasAnswered: student.hasAnswered,
          },
        });

        // Send current poll to the student
        const currentPoll = pollSessionManager.getCurrentPoll();
        if (currentPoll) {
          socket.emit("current-poll", {
            poll: {
              pollId: currentPoll.pollId,
              question: currentPoll.question,
              options: currentPoll.options,
              status: currentPoll.status,
              timeLimit: currentPoll.timeLimit,
              startTime: currentPoll.startTime,
            },
          });
        }

        // Broadcast to teacher that student joined
        io.emit("student-joined", {
          student: {
            id: student.id,
            name: student.name,
            hasAnswered: student.hasAnswered,
          },
          stats: pollSessionManager.getStats(),
        });
      } else {
        socket.emit("student-join-error", {
          message: "Name already taken or no active poll",
        });
      }
    } catch (error) {
      socket.emit("student-join-error", {
        message: "Failed to join poll",
      });
    }
  });

  // Student submits response
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
        // Send success to student
        socket.emit("response-success", {
          optionIndex,
          message: "Response recorded successfully",
        });

        // Get updated results and stats
        const results = pollSessionManager.getPollResults();
        const stats = pollSessionManager.getStats();

        // Broadcast updated results to teacher
        io.emit("response-received", {
          studentId: student.id,
          studentName: student.name,
          optionIndex,
          results,
          stats,
        });

        // Check if poll ended (all students answered)
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
      socket.emit("response-error", {
        message: "Failed to submit response",
      });
    }
  });

  // Student requests current poll status
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
        student: student
          ? {
              id: student.id,
              name: student.name,
              hasAnswered: student.hasAnswered,
            }
          : null,
      });
    } catch (error) {
      socket.emit("status-error", { message: "Failed to get poll status" });
    }
  });

  // Handle student disconnect
  socket.on("disconnect", () => {
    try {
      const student = pollSessionManager.getStudentBySocketId(socket.id);
      if (student) {
        // Remove student from poll session
        pollSessionManager.removeStudent(student.id);

        // Also remove from session manager
        sessionManager.removeStudent(socket.id);

        // Get updated stats
        const stats = pollSessionManager.getStats();
        const sessionStats = sessionManager.getSessionStats();

        // Broadcast student left to all clients
        io.emit("student-left", {
          studentId: student.id,
          studentName: student.name,
          studentsCount: stats.studentsCount,
          connectedStudents: sessionStats.connectedStudents,
        });

        console.log(`Student disconnected: ${student.name} (${student.id})`);
      }
    } catch (error) {
      console.error("Error handling student disconnect:", error);
    }
  });
}
