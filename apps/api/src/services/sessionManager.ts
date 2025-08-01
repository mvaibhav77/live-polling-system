import { v4 as uuidv4 } from "uuid";

// Session-level types
export interface SessionStudent {
  id: string;
  name: string;
  socketId: string;
  joinedAt: number;
  isConnected: boolean;
}

export interface LiveSession {
  sessionId: string;
  createdAt: number;
  students: Map<string, SessionStudent>;
  currentPollId: string | null;
  totalPollsCreated: number;
}

class SessionManager {
  private session: LiveSession;

  constructor() {
    this.session = {
      sessionId: uuidv4(),
      createdAt: Date.now(),
      students: new Map(),
      currentPollId: null,
      totalPollsCreated: 0,
    };
    console.log(`🎯 New session created: ${this.session.sessionId}`);
  }

  // Add student to session (works independently of polls)
  addStudent(socketId: string, studentName: string): SessionStudent | null {
    // Check if student name already exists
    for (const student of this.session.students.values()) {
      if (student.name === studentName) {
        return null; // Name already taken
      }
    }

    const studentId = uuidv4();
    const student: SessionStudent = {
      id: studentId,
      name: studentName,
      socketId,
      joinedAt: Date.now(),
      isConnected: true,
    };

    this.session.students.set(studentId, student);
    console.log(`👨‍🎓 Student joined session: ${studentName} (${studentId})`);
    return student;
  }

  // Remove student from session
  removeStudent(studentId: string): boolean {
    const student = this.session.students.get(studentId);
    if (!student) {
      return false;
    }

    this.session.students.delete(studentId);
    console.log(
      `❌ Student removed from session: ${student.name} (${studentId})`
    );
    return true;
  }

  // Get student by socket ID
  getStudentBySocketId(socketId: string): SessionStudent | null {
    for (const student of this.session.students.values()) {
      if (student.socketId === socketId) {
        return student;
      }
    }
    return null;
  }

  // Get student by ID
  getStudentById(studentId: string): SessionStudent | null {
    return this.session.students.get(studentId) || null;
  }

  // Update student connection status
  updateStudentConnection(socketId: string, isConnected: boolean): boolean {
    const student = this.getStudentBySocketId(socketId);
    if (student) {
      student.isConnected = isConnected;
      return true;
    }
    return false;
  }

  // Get all students
  getAllStudents(): SessionStudent[] {
    return Array.from(this.session.students.values());
  }

  // Get connected students only
  getConnectedStudents(): SessionStudent[] {
    return this.getAllStudents().filter((student) => student.isConnected);
  }

  // Set current poll
  setCurrentPoll(pollId: string | null): void {
    this.session.currentPollId = pollId;
    if (pollId) {
      this.session.totalPollsCreated++;
      console.log(
        `📊 Poll set as current: ${pollId} (Total polls: ${this.session.totalPollsCreated})`
      );
    }
  }

  // Get session statistics
  getSessionStats() {
    const connectedStudents = this.getConnectedStudents();
    return {
      sessionId: this.session.sessionId,
      totalStudents: this.session.students.size,
      connectedStudents: connectedStudents.length,
      currentPollId: this.session.currentPollId,
      totalPollsCreated: this.session.totalPollsCreated,
      sessionStartedAt: this.session.createdAt,
    };
  }

  // Reset session (for testing or admin purposes)
  resetSession(): void {
    this.session.students.clear();
    this.session.currentPollId = null;
    this.session.totalPollsCreated = 0;
    console.log(`🔄 Session reset: ${this.session.sessionId}`);
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
