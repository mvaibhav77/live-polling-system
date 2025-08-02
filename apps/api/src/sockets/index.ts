import { Server, Socket } from "socket.io";
import { pollSessionManager } from "../services/pollSessionManager";
import { sessionManager } from "../services/sessionManager";
import { chatService } from "../services/chatService";

// Utility function to sanitize stats to prevent circular references
function sanitizeStats(stats: any) {
  return {
    hasPoll: stats.hasPoll,
    pollStatus: stats.pollStatus,
    currentQuestionNumber: stats.currentQuestionNumber,
    studentsCount: stats.studentsCount,
    responsesCount: stats.responsesCount,
    totalQuestionsAsked: stats.totalQuestionsAsked,
    sessionStudentsCount: stats.sessionStudentsCount,
  };
}

// Utility function to sanitize poll data to prevent circular references
function sanitizePoll(poll: any) {
  if (!poll) return null;
  return {
    pollId: poll.pollId,
    question: poll.question,
    options: poll.options,
    timeLimit: poll.timeLimit,
    status: poll.status,
    startTime: poll.startTime,
    endTime: poll.endTime,
    questionNumber: poll.questionNumber,
    createdAt: poll.createdAt,
  };
}

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

    // Basic connection established
    socket.emit("connected", { socketId: socket.id });

    // =================
    // TEACHER EVENTS
    // =================

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

            console.log(
              "🚀 Poll created and auto-started:",
              currentPoll?.pollId
            );
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

    // =================
    // STUDENT EVENTS
    // =================

    // Student joins
    socket.on("student-join", (data: { studentName: string }) => {
      try {
        const { studentName } = data;
        const student = pollSessionManager.addStudent(socket.id, studentName);

        if (student) {
          socket.emit("student-join-success", {
            student: {
              id: student.id,
              name: student.name,
              hasAnswered: student.hasAnswered,
            },
          });

          const currentPoll = pollSessionManager.getCurrentPoll();
          if (currentPoll) {
            socket.emit("current-poll", {
              poll: sanitizePoll(currentPoll),
            });
          }

          io.emit("student-joined", {
            student: {
              id: student.id,
              name: student.name,
              hasAnswered: student.hasAnswered,
            },
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

    // =================
    // CHAT EVENTS
    // =================

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
    socket.on(
      "kick-student",
      (data: { studentId: string; reason?: string }) => {
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
                message:
                  "You have been removed from the session by the teacher.",
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
      }
    );

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

    // =================
    // DISCONNECT HANDLER
    // =================
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
  });
}
