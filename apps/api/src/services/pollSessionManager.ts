import { GlobalPollSession, Student, PollResults } from "../types/poll";
import { v4 as uuidv4 } from "uuid";

class PollSessionManager {
  private currentPoll: GlobalPollSession | null = null;

  getCurrentPoll(): GlobalPollSession | null {
    return this.currentPoll;
  }

  // Create a new poll
  createPoll(
    question: string,
    options: string[],
    timeLimit: number = 60
  ): GlobalPollSession {
    const pollId = this.generateId();
    this.currentPoll = {
      pollId,
      question,
      options,
      timeLimit,
      status: "waiting",
      students: new Map(),
      responses: new Map(),
      createdAt: Date.now(),
    };

    console.log(`📊 New poll created: ${question}`);
    return this.currentPoll;
  }

  // Add a student to the current poll
  addStudent(socketId: string, studentName: string): Student | null {
    if (!this.currentPoll) {
      return null;
    }

    // Check if student name already exists
    for (const student of this.currentPoll.students.values()) {
      if (student.name === studentName) {
        return null; // Name already taken
      }
    }

    const studentId = this.generateId();
    const student: Student = {
      id: studentId,
      name: studentName,
      socketId,
      hasAnswered: false,
      joinedAt: Date.now(),
    };

    this.currentPoll.students.set(studentId, student);
    console.log(`👨‍🎓 Student joined: ${studentName} (${studentId})`);
    return student;
  }

  // Start the current poll
  startPoll(): boolean {
    if (!this.currentPoll || this.currentPoll.status !== "waiting") {
      return false;
    }

    this.currentPoll.status = "active";
    this.currentPoll.startTime = Date.now();

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
      question: this.currentPoll.question,
      options: this.currentPoll.options,
      responses: responseCounts,
      totalStudents: this.currentPoll.students.size,
      totalResponses: this.currentPoll.responses.size,
    };
  }

  // Remove a student
  removeStudent(studentId: string): boolean {
    if (!this.currentPoll) {
      return false;
    }

    const student = this.currentPoll.students.get(studentId);
    if (!student) {
      return false;
    }

    // Remove from students and responses
    this.currentPoll.students.delete(studentId);
    this.currentPoll.responses.delete(studentId);

    console.log(`❌ Student removed: ${student.name} (${studentId})`);
    return true;
  }

  // Get student by socket ID
  getStudentBySocketId(socketId: string): Student | null {
    if (!this.currentPoll) {
      return null;
    }

    for (const student of this.currentPoll.students.values()) {
      if (student.socketId === socketId) {
        return student;
      }
    }

    return null;
  }

  // Get statistics
  getStats() {
    return {
      hasPoll: !!this.currentPoll,
      pollStatus: this.currentPoll?.status || null,
      studentsCount: this.currentPoll?.students.size || 0,
      responsesCount: this.currentPoll?.responses.size || 0,
    };
  }

  // Helper method to generate IDs
  private generateId(): string {
    return uuidv4();
  }
}

// Export singleton instance
export const pollSessionManager = new PollSessionManager();
