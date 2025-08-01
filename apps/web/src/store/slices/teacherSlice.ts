import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Student } from "./studentSlice";
import { api } from "../../utils/api";

export interface Question {
  id?: string;
  question: string;
  options: string[];
  correctAnswer?: number;
  timeLimit?: number;
}

export interface PollSession {
  id: string;
  title: string;
  questions: Question[];
  currentQuestionIndex: number;
  students: Student[];
  isActive: boolean;
  createdAt: Date;
  joinCode: string;
}

export interface TeacherState {
  currentSession: PollSession | null;
  isCreatingPoll: boolean;
  isLoading: boolean;
  error: string | null;
  connectedStudents: Student[];
  sessionHistory: PollSession[];
}

const initialState: TeacherState = {
  currentSession: null,
  isCreatingPoll: false,
  isLoading: false,
  error: null,
  connectedStudents: [],
  sessionHistory: [],
};

// Async thunks
export const createAndStartPoll = createAsyncThunk(
  "teacher/createAndStartPoll",
  async (questionData: Question) => {
    // First create the poll
    const pollData = {
      question: questionData.question,
      options: questionData.options,
      timeLimit: questionData.timeLimit || 60,
    };
    const createResult = await api.createPoll(pollData);

    // Then automatically start it
    await api.startPoll();

    return createResult;
  }
);

export const startPoll = createAsyncThunk("teacher/startPoll", async () => {
  return await api.startPoll();
});

export const endPoll = createAsyncThunk("teacher/endPoll", async () => {
  return await api.endPoll();
});

const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    setCurrentSession: (state, action: PayloadAction<PollSession>) => {
      state.currentSession = action.payload;
      state.error = null;
    },
    updateConnectedStudents: (state, action: PayloadAction<Student[]>) => {
      state.connectedStudents = action.payload;
      if (state.currentSession) {
        state.currentSession.students = action.payload;
      }
    },
    addStudent: (state, action: PayloadAction<Student>) => {
      state.connectedStudents.push(action.payload);
      if (state.currentSession) {
        state.currentSession.students.push(action.payload);
      }
    },
    removeStudent: (state, action: PayloadAction<string>) => {
      state.connectedStudents = state.connectedStudents.filter(
        (student) => student.id !== action.payload
      );
      if (state.currentSession) {
        state.currentSession.students = state.currentSession.students.filter(
          (student) => student.id !== action.payload
        );
      }
    },
    updateStudentAnswer: (
      state,
      action: PayloadAction<{
        studentId: string;
        hasAnswered: boolean;
        answer?: number;
      }>
    ) => {
      const { studentId, hasAnswered, answer } = action.payload;

      // Update in connectedStudents
      const studentIndex = state.connectedStudents.findIndex(
        (s) => s.id === studentId
      );
      if (studentIndex !== -1) {
        state.connectedStudents[studentIndex].hasAnswered = hasAnswered;
        if (answer !== undefined) {
          state.connectedStudents[studentIndex].answer = answer;
        }
      }

      // Update in currentSession
      if (state.currentSession) {
        const sessionStudentIndex = state.currentSession.students.findIndex(
          (s) => s.id === studentId
        );
        if (sessionStudentIndex !== -1) {
          state.currentSession.students[sessionStudentIndex].hasAnswered =
            hasAnswered;
          if (answer !== undefined) {
            state.currentSession.students[sessionStudentIndex].answer = answer;
          }
        }
      }
    },
    setCurrentQuestionIndex: (state, action: PayloadAction<number>) => {
      if (state.currentSession) {
        state.currentSession.currentQuestionIndex = action.payload;
      }
    },
    setSessionActive: (state, action: PayloadAction<boolean>) => {
      if (state.currentSession) {
        state.currentSession.isActive = action.payload;
      }
    },
    setIsCreatingPoll: (state, action: PayloadAction<boolean>) => {
      state.isCreatingPoll = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSession: (state) => {
      state.currentSession = null;
      state.connectedStudents = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAndStartPoll.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAndStartPoll.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload;
      })
      .addCase(createAndStartPoll.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to create and start poll";
      })
      .addCase(startPoll.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(startPoll.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(startPoll.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to start poll";
      })
      .addCase(endPoll.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(endPoll.fulfilled, (state) => {
        state.isLoading = false;
        if (state.currentSession) {
          state.currentSession.isActive = false;
        }
      })
      .addCase(endPoll.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to end poll";
      });
  },
});

export const {
  setCurrentSession,
  updateConnectedStudents,
  addStudent,
  removeStudent,
  updateStudentAnswer,
  setCurrentQuestionIndex,
  setSessionActive,
  setIsCreatingPoll,
  setError,
  clearError,
  clearSession,
} = teacherSlice.actions;

export default teacherSlice.reducer;
