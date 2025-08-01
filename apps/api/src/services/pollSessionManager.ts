import {
  GlobalPollSession,
  Student,
  PollResults,
  SessionPollHistory,
} from "../types/poll";
import { v4 as uuidv4 } from "uuid";
import { sessionManager } from "./sessionManager";

class PollSessionManager {
  private currentPoll: GlobalPollSession | null = null;
  private pollSequenceNumber: number = 0; // Track question numbers
  private sessionHistory: SessionPollHistory[] = []; // Store completed polls in session

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
    if (this.currentPoll && this.currentPoll.status === "ended") {
      this.savePollToSessionHistory();
    }

    // Get students from session manager and convert to poll students
    const sessionStudents = sessionManager.getAllStudents();
    const pollStudents = new Map<string, Student>();

    sessionStudents.forEach((sessionStudent) => {
      const pollStudent: Student = {
        id: sessionStudent.id,
        name: sessionStudent.name,
        socketId: sessionStudent.socketId,
        hasAnswered: false, // Reset for new poll
        joinedAt: sessionStudent.joinedAt,
      };
      pollStudents.set(sessionStudent.id, pollStudent);
    });

    // Increment sequence number for new poll
    this.pollSequenceNumber++;

    const pollId = this.generateId();
    this.currentPoll = {
      pollId,
      questionNumber: this.pollSequenceNumber,
      question,
      options,
      timeLimit,
      status: "waiting",
      students: pollStudents, // Keep existing students
      responses: new Map(), // Clear previous responses
      createdAt: Date.now(),
    };

    console.log(
      `📊 New poll created - Question ${this.pollSequenceNumber}: ${question}`
    );
    return this.currentPoll;
  }

  // Add student to session (delegates to session manager)
  addStudent(socketId: string, studentName: string): Student | null {
    const sessionStudent = sessionManager.addStudent(socketId, studentName);

    if (!sessionStudent) {
      return null;
    }

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
    }

    return pollStudent;
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

    // Notify session manager that poll ended
    sessionManager.setCurrentPoll(null);

    console.log(`⏹️ Poll ended: ${this.currentPoll.question}`);
    return true;
  }

  // Submit a response from a student
  submitResponse(studentId: string, optionIndex: number): boolean {
    if (!this.currentPoll || this.currentPoll.status !== "active") {
      return false;
    }

    if (optionIndex < 0 || optionIndex >= this.currentPoll.options.length) {
      return false;
    }

    const student = this.currentPoll.students.get(studentId);
    if (!student || student.hasAnswered) {
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
      totalQuestionsAsked: this.pollSequenceNumber,
      completedPolls: this.sessionHistory.length,
    };
  }

  // Get session history
  getSessionHistory(): SessionPollHistory[] {
    return this.sessionHistory;
  }

  // Save completed poll to session history
  private savePollToSessionHistory(): void {
    if (!this.currentPoll || this.currentPoll.status !== "ended") return;

    const results = this.getPollResults();
    if (results) {
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
    }
  }

  // Reset entire session (for new teaching session)
  resetSession(): void {
    if (this.currentPoll?.timer) {
      clearTimeout(this.currentPoll.timer);
    }
    this.currentPoll = null;
    this.pollSequenceNumber = 0;
    this.sessionHistory = [];
    console.log("🔄 Session reset - ready for new teaching session");
  }

  // Helper method to generate IDs
  private generateId(): string {
    return uuidv4();
  }
}

// Export singleton instance
export const pollSessionManager = new PollSessionManager();
