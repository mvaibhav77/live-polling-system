import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Types for WebSocket-only communication
export interface Poll {
  pollId: string;
  questionNumber?: number;
  question: string;
  options: string[];
  status: "waiting" | "active" | "ended";
  timeLimit: number;
  startTime?: number;
  endTime?: number;
  createdAt: number;
}

export interface Student {
  id: string;
  name: string;
  hasAnswered: boolean;
  joinedAt: number;
}

export interface PollResults {
  [optionIndex: string]: number;
}

export interface PollStats {
  hasPoll: boolean;
  pollStatus: string | null;
  currentQuestionNumber: number;
  studentsCount: number;
  sessionStudentsCount: number;
  responsesCount: number;
  totalQuestionsAsked: number;
  completedPolls: number;
}

export interface ChatMessage {
  id: string;
  senderType: "teacher" | "student" | "system";
  senderName: string;
  message: string;
  timestamp: number;
}

export interface PollHistoryItem {
  id: string;
  question: string;
  options: string[];
  responses: {
    [optionIndex: string]: number;
  };
  totalParticipants: number;
  createdAt: string;
  completedAt: string;
}

interface PollState {
  // Current poll data
  currentPoll: Poll | null;
  pollResults: PollResults | null;
  pollStats: PollStats | null;

  // Student data
  currentStudent: Student | null;
  students: Student[];

  // Chat data
  chatMessages: ChatMessage[];
  chatParticipants: string[];

  // Poll history (from REST API)
  pollHistory: PollHistoryItem[];

  // Loading states
  isLoading: boolean;
  error: string | null;
}

const initialState: PollState = {
  currentPoll: null,
  pollResults: null,
  pollStats: null,
  currentStudent: null,
  students: [],
  chatMessages: [],
  chatParticipants: [],
  pollHistory: [],
  isLoading: false,
  error: null,
};

const pollSlice = createSlice({
  name: "poll",
  initialState,
  reducers: {
    // Poll actions
    setPoll: (state, action: PayloadAction<Poll>) => {
      state.currentPoll = action.payload;
      // Clear previous poll results when new poll is set
      state.pollResults = null;
      state.error = null;
    },

    clearPoll: (state) => {
      state.currentPoll = null;
      state.pollResults = null;
    },

    updatePollStatus: (state, action: PayloadAction<Poll["status"]>) => {
      if (state.currentPoll) {
        state.currentPoll.status = action.payload;
      }
    },

    updatePollTiming: (
      state,
      action: PayloadAction<{ startTime?: number; endTime?: number }>
    ) => {
      if (state.currentPoll) {
        if (action.payload.startTime !== undefined) {
          state.currentPoll.startTime = action.payload.startTime;
        }
        if (action.payload.endTime !== undefined) {
          state.currentPoll.endTime = action.payload.endTime;
        }
      }
    },

    setPollResults: (state, action: PayloadAction<PollResults>) => {
      state.pollResults = action.payload;
    },

    setPollStats: (state, action: PayloadAction<PollStats>) => {
      state.pollStats = action.payload;
    },

    // Student actions
    setCurrentStudent: (state, action: PayloadAction<Student>) => {
      state.currentStudent = action.payload;
    },

    clearCurrentStudent: (state) => {
      state.currentStudent = null;
    },

    updateStudentAnswer: (
      state,
      action: PayloadAction<{ studentId: string; hasAnswered: boolean }>
    ) => {
      if (
        state.currentStudent &&
        state.currentStudent.id === action.payload.studentId
      ) {
        state.currentStudent.hasAnswered = action.payload.hasAnswered;
      }

      const student = state.students.find(
        (s) => s.id === action.payload.studentId
      );
      if (student) {
        student.hasAnswered = action.payload.hasAnswered;
      }
    },

    setStudents: (state, action: PayloadAction<Student[]>) => {
      state.students = action.payload;
    },

    addStudent: (state, action: PayloadAction<Student>) => {
      const existingIndex = state.students.findIndex(
        (s) => s.id === action.payload.id
      );
      if (existingIndex >= 0) {
        state.students[existingIndex] = action.payload;
      } else {
        state.students.push(action.payload);
      }
    },

    removeStudent: (state, action: PayloadAction<string>) => {
      state.students = state.students.filter((s) => s.id !== action.payload);
    },

    // Chat actions
    addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.chatMessages.push(action.payload);
    },

    setChatMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.chatMessages = action.payload;
    },

    clearChatMessages: (state) => {
      state.chatMessages = [];
    },

    setChatParticipants: (state, action: PayloadAction<string[]>) => {
      state.chatParticipants = action.payload;
    },

    // Poll history (REST API data)
    setPollHistory: (state, action: PayloadAction<PollHistoryItem[]>) => {
      state.pollHistory = action.payload;
    },

    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Reset entire state
    resetPollState: () => initialState,
  },
});

export const {
  setPoll,
  clearPoll,
  updatePollStatus,
  updatePollTiming,
  setPollResults,
  setPollStats,
  setCurrentStudent,
  clearCurrentStudent,
  updateStudentAnswer,
  setStudents,
  addStudent,
  removeStudent,
  addChatMessage,
  setChatMessages,
  clearChatMessages,
  setChatParticipants,
  setPollHistory,
  setLoading,
  setError,
  clearError,
  resetPollState,
} = pollSlice.actions;

export default pollSlice.reducer;
