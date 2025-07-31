// In-memory poll session types
export interface Student {
  id: string;
  name: string;
  socketId: string;
  hasAnswered: boolean;
  joinedAt: number;
}

export interface GlobalPollSession {
  pollId: string;
  questionNumber: number; // Question 1, Question 2, etc.
  question: string;
  options: string[];
  timeLimit: number;
  status: "waiting" | "active" | "ended";
  startTime?: number;
  endTime?: number;
  students: Map<string, Student>;
  responses: Map<string, number>; // studentId -> optionIndex
  timer?: NodeJS.Timeout;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  senderType: "teacher" | "student";
  senderName: string;
  message: string;
  timestamp: number;
}

export interface ConnectedSocket {
  role: "teacher" | "student";
  studentId?: string;
  joinedAt: number;
}

// API Request/Response types
export interface CreatePollRequest {
  question: string;
  options: string[];
  timeLimit?: number;
}

export interface JoinPollRequest {
  studentName: string;
}

export interface SubmitResponseRequest {
  optionIndex: number;
}

export interface PollResults {
  pollId: string;
  questionNumber: number;
  question: string;
  options: string[];
  responses: Record<string, number>; // optionIndex -> count
  totalStudents: number;
  totalResponses: number;
}

// Session management types
export interface SessionPollHistory {
  pollId: string;
  questionNumber: number;
  question: string;
  options: string[];
  results: PollResults;
  completedAt: number;
}
