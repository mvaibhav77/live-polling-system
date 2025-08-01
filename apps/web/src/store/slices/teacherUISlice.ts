import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Types for UI state only
export interface Student {
  id: string;
  name: string;
  hasAnswered: boolean;
  joinedAt: string;
  answer?: number;
}

export interface TeacherUIState {
  // UI state only - API data comes from RTK Query
  connectedStudents: Student[];
  currentJoinCode: string | null;
  isCreatingPoll: boolean;
  selectedStudents: string[];
  viewMode: "dashboard" | "results" | "history";
}

const initialState: TeacherUIState = {
  connectedStudents: [],
  currentJoinCode: null,
  isCreatingPoll: false,
  selectedStudents: [],
  viewMode: "dashboard",
};

const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    // Student management (for real-time updates via socket)
    setConnectedStudents: (state, action: PayloadAction<Student[]>) => {
      state.connectedStudents = action.payload;
    },

    addStudent: (state, action: PayloadAction<Student>) => {
      const existingIndex = state.connectedStudents.findIndex(
        (student) => student.id === action.payload.id
      );

      if (existingIndex >= 0) {
        state.connectedStudents[existingIndex] = action.payload;
      } else {
        state.connectedStudents.push(action.payload);
      }
    },

    removeStudent: (state, action: PayloadAction<string>) => {
      state.connectedStudents = state.connectedStudents.filter(
        (student) => student.id !== action.payload
      );
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
      const student = state.connectedStudents.find((s) => s.id === studentId);

      if (student) {
        student.hasAnswered = hasAnswered;
        if (answer !== undefined) {
          student.answer = answer;
        }
      }
    },

    // UI state management
    setIsCreatingPoll: (state, action: PayloadAction<boolean>) => {
      state.isCreatingPoll = action.payload;
    },

    setCurrentJoinCode: (state, action: PayloadAction<string | null>) => {
      state.currentJoinCode = action.payload;
    },

    setViewMode: (state, action: PayloadAction<TeacherUIState["viewMode"]>) => {
      state.viewMode = action.payload;
    },

    toggleStudentSelection: (state, action: PayloadAction<string>) => {
      const studentId = action.payload;
      const index = state.selectedStudents.indexOf(studentId);

      if (index >= 0) {
        state.selectedStudents.splice(index, 1);
      } else {
        state.selectedStudents.push(studentId);
      }
    },

    clearStudentSelection: (state) => {
      state.selectedStudents = [];
    },

    // Reset all state
    resetTeacherState: (state) => {
      state.connectedStudents = [];
      state.currentJoinCode = null;
      state.isCreatingPoll = false;
      state.selectedStudents = [];
      state.viewMode = "dashboard";
    },
  },
});

export const {
  setConnectedStudents,
  addStudent,
  removeStudent,
  updateStudentAnswer,
  setIsCreatingPoll,
  setCurrentJoinCode,
  setViewMode,
  toggleStudentSelection,
  clearStudentSelection,
  resetTeacherState,
} = teacherSlice.actions;

export default teacherSlice.reducer;
