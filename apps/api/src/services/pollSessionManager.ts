import {
  GlobalPollSession,
  Student,
  PollResults,
  SessionPollHistory,
} from "../types/poll";
import { v4 as uuidv4 } from "uuid";
import { sessionManager } from "./sessionManager";
import { PollHistoryService } from "./pollHistoryService";
import { chatService } from "./chatService";

class PollSessionManager {
  private currentPoll: GlobalPollSession | null = null;
  private sessionHistory: SessionPollHistory[] = []; // Store completed polls in session
  private questionSequence: number = 0; // Track intended question numbering
  private onPollEndedCallback: ((results: PollResults) => void) | null = null;

  // Set callback for when poll ends automatically
  setOnPollEndedCallback(callback: (results: PollResults) => void) {
    this.onPollEndedCallback = callback;
  }

  getCurrentPoll(): GlobalPollSession | null {
    return this.currentPoll;
  }

  // Create a new poll
  createPoll(
    question: string,
    options: string[],
    timeLimit: number = 60
  ): GlobalPollSession {
    // Save previous poll to session history if it exists and is completed
    if (this.currentPoll && this.currentPoll.status !== "ended") {
      // Force end the previous poll before creating new one
      this.endPoll();
    }

    // Get students from session manager and convert to poll students
    const sessionStudents = sessionManager.getAllStudents();
    const pollStudents = new Map<string, Student>();

    console.log(
      `📋 Transferring ${sessionStudents.length} students from session to new poll`
    );

    sessionStudents.forEach((sessionStudent) => {
      const pollStudent: Student = {
        id: sessionStudent.id,
        name: sessionStudent.name,
        socketId: sessionStudent.socketId,
        hasAnswered: false, // Reset for new poll
        joinedAt: sessionStudent.joinedAt,
      };
      pollStudents.set(sessionStudent.id, pollStudent);
      console.log(
        `👤 Added student ${sessionStudent.name} (${sessionStudent.id}) to poll`
      );
    });

    // Increment question sequence for each new poll created
    this.questionSequence++;
    const questionNumber = this.questionSequence;

    const pollId = this.generateId();
    this.currentPoll = {
      pollId,
      questionNumber: questionNumber,
      question,
      options,
      timeLimit,
      status: "waiting",
      students: pollStudents, // Keep existing students
      responses: new Map(), // Clear previous responses
      createdAt: Date.now(),
    };

    console.log(
      `📊 New poll created - Question ${questionNumber}: ${question}`
    );
    return this.currentPoll;
  }

  // Add student to session (delegates to session manager)
  addStudent(socketId: string, studentName: string): Student | null {
    const sessionStudent = sessionManager.addStudent(socketId, studentName);

    if (!sessionStudent) {
      console.log(`❌ Failed to add student ${studentName} to session`);
      return null;
    }

    console.log(
      `✅ Student ${sessionStudent.name} added to session with ID: ${sessionStudent.id}`
    );

    // Convert session student to poll student format
    const pollStudent: Student = {
      id: sessionStudent.id,
      name: sessionStudent.name,
      socketId: sessionStudent.socketId,
      hasAnswered: false,
      joinedAt: sessionStudent.joinedAt,
    };

    // If there's an active poll, add student to it
    if (this.currentPoll) {
      this.currentPoll.students.set(sessionStudent.id, pollStudent);
      console.log(
        `➕ Student ${sessionStudent.name} added to current poll (${this.currentPoll.pollId})`
      );
      console.log(`👥 Poll now has ${this.currentPoll.students.size} students`);
    } else {
      console.log(
        `ℹ️ No current poll exists, student will be added when poll is created`
      );
    }

    return pollStudent;
  }

  // Ensure all session students are in the current poll
  syncSessionStudentsWithPoll(): void {
    if (!this.currentPoll) {
      console.log("⚠️ Cannot sync students: No current poll exists");
      return;
    }

    const sessionStudents = sessionManager.getAllStudents();
    let addedCount = 0;

    sessionStudents.forEach((sessionStudent) => {
      if (!this.currentPoll!.students.has(sessionStudent.id)) {
        const pollStudent: Student = {
          id: sessionStudent.id,
          name: sessionStudent.name,
          socketId: sessionStudent.socketId,
          hasAnswered: false,
          joinedAt: sessionStudent.joinedAt,
        };
        this.currentPoll!.students.set(sessionStudent.id, pollStudent);
        addedCount++;
        console.log(`🔄 Synced student ${sessionStudent.name} to current poll`);
      }
    });

    if (addedCount > 0) {
      console.log(
        `✅ Synced ${addedCount} students to poll. Total students in poll: ${this.currentPoll.students.size}`
      );
    } else {
      console.log("ℹ️ All session students are already in the poll");
    }
  }

  // Start the current poll
  startPoll(): boolean {
    if (!this.currentPoll || this.currentPoll.status !== "waiting") {
      return false;
    }

    this.currentPoll.status = "active";
    this.currentPoll.startTime = Date.now();

    // Notify session manager about current poll
    sessionManager.setCurrentPoll(this.currentPoll.pollId);

    // Set timer to auto-end poll
    this.currentPoll.timer = setTimeout(() => {
      this.endPoll();
    }, this.currentPoll.timeLimit * 1000);

    console.log(`▶️ Poll started: ${this.currentPoll.question}`);
    return true;
  }

  // End the current poll
  endPoll(): boolean {
    if (!this.currentPoll || this.currentPoll.status !== "active") {
      return false;
    }

    this.currentPoll.status = "ended";
    this.currentPoll.endTime = Date.now();

    // Clear timer
    if (this.currentPoll.timer) {
      clearTimeout(this.currentPoll.timer);
      this.currentPoll.timer = undefined;
    }

    // Get results before notifying session manager
    const results = this.getPollResults();

    // Notify session manager that poll ended
    sessionManager.setCurrentPoll(null);

    // Call the callback to notify socket layer (for timer-based endings)
    if (this.onPollEndedCallback && results) {
      this.onPollEndedCallback(results);
    }

    // Save the completed poll to both session history and persistent storage
    this.savePollToSessionHistory().catch((error) =>
      console.error("Error saving completed poll:", error)
    );

    console.log(`⏹️ Poll ended: ${this.currentPoll.question}`);
    return true;
  }

  // Submit a response from a student
  submitResponse(studentId: string, optionIndex: number): boolean {
    console.log(
      `🔍 Submit attempt: studentId=${studentId}, optionIndex=${optionIndex}`
    );

    // Ensure all session students are in the current poll before processing submission
    this.syncSessionStudentsWithPoll();

    if (!this.currentPoll) {
      console.log("❌ Submit failed: No current poll exists");
      return false;
    }

    console.log(
      `📊 Current poll status: ${this.currentPoll.status}, pollId: ${this.currentPoll.pollId}`
    );
    console.log(`👥 Students in poll: ${this.currentPoll.students.size}`);
    console.log(`📝 Poll options count: ${this.currentPoll.options.length}`);

    if (this.currentPoll.status !== "active") {
      console.log(
        `❌ Submit failed: Poll is not active (status: ${this.currentPoll.status})`
      );
      return false;
    }

    if (optionIndex < 0 || optionIndex >= this.currentPoll.options.length) {
      console.log(
        `❌ Submit failed: Invalid option index ${optionIndex} (valid range: 0-${this.currentPoll.options.length - 1})`
      );
      return false;
    }

    const student = this.currentPoll.students.get(studentId);
    console.log(
      `👤 Student lookup result: ${student ? `found (${student.name})` : "not found"}`
    );

    if (!student) {
      console.log(`❌ Submit failed: Student ${studentId} not found in poll`);
      console.log(
        `👥 Available students:`,
        Array.from(this.currentPoll.students.keys())
      );
      return false;
    }

    if (student.hasAnswered) {
      console.log(
        `❌ Submit failed: Student ${student.name} has already answered`
      );
      return false;
    }

    // Record response
    this.currentPoll.responses.set(studentId, optionIndex);
    student.hasAnswered = true;

    console.log(
      `✅ Response recorded: ${student.name} selected option ${optionIndex}`
    );

    // Check if all students have answered
    if (this.allStudentsAnswered()) {
      console.log("🎉 All students have answered, ending poll");
      this.endPoll();
    }

    return true;
  }

  // Check if all students have answered
  allStudentsAnswered(): boolean {
    if (!this.currentPoll) return false;

    const totalStudents = this.currentPoll.students.size;
    const totalResponses = this.currentPoll.responses.size;

    return totalStudents > 0 && totalStudents === totalResponses;
  }

  // Get poll results
  getPollResults(): PollResults | null {
    if (!this.currentPoll) {
      return null;
    }

    const responseCounts: Record<string, number> = {};

    // Initialize all options with 0
    this.currentPoll.options.forEach((_, index) => {
      responseCounts[index.toString()] = 0;
    });

    // Count responses
    this.currentPoll.responses.forEach((optionIndex) => {
      responseCounts[optionIndex.toString()]++;
    });

    return {
      pollId: this.currentPoll.pollId,
      questionNumber: this.currentPoll.questionNumber,
      question: this.currentPoll.question,
      options: this.currentPoll.options,
      responses: responseCounts,
      totalStudents: this.currentPoll.students.size,
      totalResponses: this.currentPoll.responses.size,
    };
  }

  // Remove a student
  removeStudent(studentId: string): boolean {
    // Remove from session manager
    const removed = sessionManager.removeStudent(studentId);

    // Remove from current poll if it exists
    if (this.currentPoll) {
      this.currentPoll.students.delete(studentId);
      this.currentPoll.responses.delete(studentId);
    }

    return removed;
  }

  // Get student by socket ID from session
  getStudentBySocketId(socketId: string): Student | null {
    const sessionStudent = sessionManager.getStudentBySocketId(socketId);
    if (!sessionStudent) {
      return null;
    }

    // Convert to poll student format
    return {
      id: sessionStudent.id,
      name: sessionStudent.name,
      socketId: sessionStudent.socketId,
      hasAnswered: this.currentPoll?.responses.has(sessionStudent.id) || false,
      joinedAt: sessionStudent.joinedAt,
    };
  }

  // Get statistics
  getStats() {
    const sessionStats = sessionManager.getSessionStats();
    return {
      hasPoll: !!this.currentPoll,
      pollStatus: this.currentPoll?.status || null,
      currentQuestionNumber: this.currentPoll?.questionNumber || 0,
      studentsCount: this.currentPoll?.students.size || 0,
      sessionStudentsCount: sessionStats.totalStudents, // Total students in session
      responsesCount: this.currentPoll?.responses.size || 0,
      totalQuestionsAsked: this.sessionHistory.length, // Use completed polls count
      completedPolls: this.sessionHistory.length,
    };
  }

  // Get session history
  getSessionHistory(): SessionPollHistory[] {
    return this.sessionHistory;
  }

  // Save completed poll to session history and persistent storage
  private async savePollToSessionHistory(): Promise<void> {
    console.log("Trying to save completed poll to session history...");

    if (!this.currentPoll || this.currentPoll.status !== "ended") return;

    const results = this.getPollResults();
    if (results) {
      // Save to session history (for current session tracking)
      const historyEntry: SessionPollHistory = {
        pollId: this.currentPoll.pollId,
        questionNumber: this.currentPoll.questionNumber,
        question: this.currentPoll.question,
        options: this.currentPoll.options,
        results,
        completedAt: this.currentPoll.endTime || Date.now(),
      };

      this.sessionHistory.push(historyEntry);
      console.log(
        `📚 Poll saved to session history: Question ${this.currentPoll.questionNumber}`
      );

      // Also save to persistent storage (for history page)
      try {
        await PollHistoryService.savePollResult({
          question: this.currentPoll.question,
          options: this.currentPoll.options,
          responses: results.responses,
          totalParticipants: results.totalStudents,
        });
        console.log(
          `💾 Poll saved to persistent storage: Question ${this.currentPoll.questionNumber}`
        );
      } catch (error) {
        console.error("Failed to save poll to persistent storage:", error);
      }
    }
  }

  // Get poll history for the current session
  getPollHistory() {
    let historyToProcess = this.sessionHistory;

    const polls = historyToProcess.map((historyItem) => {
      const totalResponses = Object.values(
        historyItem.results.responses || {}
      ).reduce((sum, count) => sum + count, 0);

      return {
        pollId: historyItem.pollId,
        questionNumber: historyItem.questionNumber,
        question: historyItem.question,
        options: historyItem.options,
        status: "ended" as const,
        createdAt: historyItem.completedAt - 60000, // Assume 1 minute duration for now
        endedAt: historyItem.completedAt,
        startTime: historyItem.completedAt - 60000,
        timeLimit: 60, // Default time limit
        results: historyItem.results.responses || {},
        totalStudents: historyItem.results.totalStudents || 0,
        totalResponses: historyItem.results.totalResponses || totalResponses,
      };
    });

    const totalPolls = polls.length;
    const totalResponses = polls.reduce(
      (sum, poll) => sum + poll.totalResponses,
      0
    );

    const averageResponseRate =
      totalPolls > 0
        ? Math.round(
            polls.reduce((sum, poll) => {
              const rate =
                poll.totalStudents > 0
                  ? (poll.totalResponses / poll.totalStudents) * 100
                  : 0;
              return sum + rate;
            }, 0) / totalPolls
          )
        : 0;

    return {
      polls,
      totalPolls,
      totalResponses,
      averageResponseRate,
    };
  }

  // Reset entire session (for new teaching session)
  resetSession(): void {
    if (this.currentPoll?.timer) {
      clearTimeout(this.currentPoll.timer);
    }
    this.currentPoll = null;
    this.sessionHistory = [];
    this.questionSequence = 0; // Reset question numbering

    // Clear chat messages as well
    chatService.clearMessages();

    console.log("🔄 Session reset - ready for new teaching session");
  }

  // Helper method to generate IDs
  private generateId(): string {
    return uuidv4();
  }
}

// Export singleton instance
export const pollSessionManager = new PollSessionManager();
