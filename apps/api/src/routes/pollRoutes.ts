import { Router, Request, Response } from "express";
import { Server } from "socket.io";
import { pollSessionManager } from "../services/pollSessionManager";
import { sessionManager } from "../services/sessionManager";
import { CreatePollRequest, JoinPollRequest } from "../types/poll";

export default function createPollRoutes(io: Server) {
  const router = Router();

  // Get current poll status
  router.get("/poll", (req: Request, res: Response) => {
    try {
      const currentPoll = pollSessionManager.getCurrentPoll();
      const stats = pollSessionManager.getStats();

      res.json({
        poll: currentPoll
          ? {
              pollId: currentPoll.pollId,
              question: currentPoll.question,
              options: currentPoll.options,
              status: currentPoll.status,
              timeLimit: currentPoll.timeLimit,
              startTime: currentPoll.startTime,
              endTime: currentPoll.endTime,
              createdAt: currentPoll.createdAt,
            }
          : null,
        stats,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to get poll status",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Create a new poll
  router.post("/poll", (req: Request, res: Response) => {
    try {
      const { question, options, timeLimit = 60 }: CreatePollRequest = req.body;

      if (!question || !options || options.length < 2) {
        return res.status(400).json({
          error: "Invalid poll data. Question and at least 2 options required.",
        });
      }

      const poll = pollSessionManager.createPoll(question, options, timeLimit);

      res.status(201).json({
        success: true,
        poll: {
          pollId: poll.pollId,
          question: poll.question,
          options: poll.options,
          status: poll.status,
          timeLimit: poll.timeLimit,
          createdAt: poll.createdAt,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to create poll",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Start the current poll
  router.post("/poll/start", (req: Request, res: Response) => {
    try {
      const success = pollSessionManager.startPoll();

      if (success) {
        const currentPoll = pollSessionManager.getCurrentPoll();
        res.json({
          success: true,
          message: "Poll started successfully",
          poll: {
            pollId: currentPoll?.pollId,
            status: currentPoll?.status,
            startTime: currentPoll?.startTime,
            timeLimit: currentPoll?.timeLimit,
          },
        });
      } else {
        res.status(400).json({
          error: "Cannot start poll. Poll may not exist or already be active.",
        });
      }
    } catch (error) {
      res.status(500).json({
        error: "Failed to start poll",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // End the current poll
  router.post("/poll/end", (req: Request, res: Response) => {
    try {
      const success = pollSessionManager.endPoll();

      if (success) {
        const results = pollSessionManager.getPollResults();
        res.json({
          success: true,
          message: "Poll ended successfully",
          results,
        });
      } else {
        res.status(400).json({
          error: "Cannot end poll. Poll may not be active.",
        });
      }
    } catch (error) {
      res.status(500).json({
        error: "Failed to end poll",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Get poll results
  router.get("/poll/results", (req: Request, res: Response) => {
    try {
      const results = pollSessionManager.getPollResults();
      const stats = pollSessionManager.getStats();

      if (results) {
        res.json({
          results,
          stats,
        });
      } else {
        res.status(404).json({
          error: "No active poll found",
        });
      }
    } catch (error) {
      res.status(500).json({
        error: "Failed to get poll results",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Join session as student (works regardless of poll status)
  router.post("/session/join", (req: Request, res: Response) => {
    try {
      const { studentName }: JoinPollRequest = req.body;

      if (!studentName || studentName.trim().length === 0) {
        return res.status(400).json({
          error: "Student name is required",
        });
      }

      // For REST API, we'll use a placeholder socket ID
      const socketId = `rest-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const sessionStudent = sessionManager.addStudent(
        socketId,
        studentName.trim()
      );

      if (sessionStudent) {
        const currentPoll = pollSessionManager.getCurrentPoll();
        const sessionStats = sessionManager.getSessionStats();

        res.status(201).json({
          success: true,
          student: {
            id: sessionStudent.id,
            name: sessionStudent.name,
            hasAnswered: false,
          },
          session: {
            sessionId: sessionStats.sessionId,
            totalStudents: sessionStats.totalStudents,
            connectedStudents: sessionStats.connectedStudents,
          },
          poll: currentPoll
            ? {
                pollId: currentPoll.pollId,
                question: currentPoll.question,
                options: currentPoll.options,
                status: currentPoll.status,
                timeLimit: currentPoll.timeLimit,
                startTime: currentPoll.startTime,
              }
            : null,
        });
      } else {
        res.status(400).json({
          error: "Cannot join session. Name may already be taken.",
        });
      }
    } catch (error) {
      res.status(500).json({
        error: "Failed to join session",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Join poll as student (alternative to socket)
  router.post("/poll/join", (req: Request, res: Response) => {
    try {
      const { studentName }: JoinPollRequest = req.body;

      if (!studentName || studentName.trim().length === 0) {
        return res.status(400).json({
          error: "Student name is required",
        });
      }

      // For REST API, we'll use a placeholder socket ID
      const socketId = `rest-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const student = pollSessionManager.addStudent(
        socketId,
        studentName.trim()
      );

      if (student) {
        const currentPoll = pollSessionManager.getCurrentPoll();
        res.status(201).json({
          success: true,
          student: {
            id: student.id,
            name: student.name,
            hasAnswered: student.hasAnswered,
          },
          poll: currentPoll
            ? {
                pollId: currentPoll.pollId,
                question: currentPoll.question,
                options: currentPoll.options,
                status: currentPoll.status,
                timeLimit: currentPoll.timeLimit,
                startTime: currentPoll.startTime,
              }
            : null,
        });
      } else {
        res.status(400).json({
          error:
            "Cannot join poll. Name may be taken or no active poll exists.",
        });
      }
    } catch (error) {
      res.status(500).json({
        error: "Failed to join poll",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Submit response (alternative to socket)
  router.post("/poll/submit", (req: Request, res: Response) => {
    try {
      const {
        studentId,
        optionIndex,
      }: { studentId: string; optionIndex: number } = req.body;

      if (!studentId || optionIndex === undefined) {
        return res.status(400).json({
          error: "Student ID and option index are required",
        });
      }

      const success = pollSessionManager.submitResponse(studentId, optionIndex);

      if (success) {
        const results = pollSessionManager.getPollResults();
        const stats = pollSessionManager.getStats();

        // Emit WebSocket event for real-time updates to teacher dashboard
        io.emit("response-received", {
          studentId,
          optionIndex,
          results,
          stats,
        });

        res.json({
          success: true,
          message: "Response submitted successfully",
          results,
          stats,
        });
      } else {
        // Get more specific error information
        const currentPoll = pollSessionManager.getCurrentPoll();

        if (!currentPoll) {
          res.status(400).json({
            error:
              "No active poll exists. Please wait for the teacher to start a new poll.",
            code: "NO_ACTIVE_POLL",
          });
        } else if (currentPoll.status !== "active") {
          res.status(400).json({
            error: `Poll is not active (status: ${currentPoll.status}). Cannot submit responses.`,
            code: "POLL_NOT_ACTIVE",
          });
        } else if (
          optionIndex < 0 ||
          optionIndex >= currentPoll.options.length
        ) {
          res.status(400).json({
            error: `Invalid option index ${optionIndex}. Valid range is 0-${currentPoll.options.length - 1}.`,
            code: "INVALID_OPTION",
          });
        } else if (!currentPoll.students.has(studentId)) {
          res.status(400).json({
            error:
              "Student ID not found in current poll. Please rejoin the session.",
            code: "STUDENT_NOT_FOUND",
            studentId: studentId,
          });
        } else {
          const student = currentPoll.students.get(studentId);
          if (student?.hasAnswered) {
            res.status(400).json({
              error: "You have already submitted an answer for this poll.",
              code: "ALREADY_ANSWERED",
            });
          } else {
            res.status(400).json({
              error: "Cannot submit response. Unknown error occurred.",
              code: "UNKNOWN_ERROR",
            });
          }
        }
      }
    } catch (error) {
      res.status(500).json({
        error: "Failed to submit response",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Get poll statistics
  router.get("/poll/stats", (req: Request, res: Response) => {
    try {
      const stats = pollSessionManager.getStats();
      res.json({ stats });
    } catch (error) {
      res.status(500).json({
        error: "Failed to get statistics",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return router;
}
