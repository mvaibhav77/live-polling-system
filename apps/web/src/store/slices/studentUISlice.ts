import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  loadStudentFromStorage,
  saveStudentToStorage,
  clearStudentFromStorage,
} from "../utils/persistence";

// Types for student UI state
export interface StudentUIState {
  // Current student info
  currentStudent: {
    id: string | null;
    name: string;
    hasJoined: boolean;
  };

  // UI state
  selectedAnswer: number | null;
  hasSubmittedAnswer: boolean;
  joinCode: string;
  isJoining: boolean;

  // Real-time state
  pollTimeRemaining: number | null;
  showResults: boolean;
}

// Load initial state from localStorage if available
const loadInitialState = (): StudentUIState => {
  const persistedStudent = loadStudentFromStorage();

  return {
    currentStudent: persistedStudent
      ? {
          id: persistedStudent.id,
          name: persistedStudent.name,
          hasJoined: persistedStudent.hasJoined,
        }
      : {
          id: null,
          name: "",
          hasJoined: false,
        },
    selectedAnswer: null,
    hasSubmittedAnswer: false,
    joinCode: "",
    isJoining: false,
    pollTimeRemaining: null,
    showResults: false,
  };
};

const initialState: StudentUIState = loadInitialState();

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    // Student session management
    setStudentInfo: (
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) => {
      state.currentStudent.id = action.payload.id;
      state.currentStudent.name = action.payload.name;
      state.currentStudent.hasJoined = true;

      // Persist to localStorage
      saveStudentToStorage({
        id: action.payload.id,
        name: action.payload.name,
        hasJoined: true,
      });
    },

    setJoinCode: (state, action: PayloadAction<string>) => {
      state.joinCode = action.payload;
    },

    setIsJoining: (state, action: PayloadAction<boolean>) => {
      state.isJoining = action.payload;
    },

    // Answer management
    setSelectedAnswer: (state, action: PayloadAction<number | null>) => {
      state.selectedAnswer = action.payload;
    },

    setHasSubmittedAnswer: (state, action: PayloadAction<boolean>) => {
      state.hasSubmittedAnswer = action.payload;
    },

    // Real-time updates
    setPollTimeRemaining: (state, action: PayloadAction<number | null>) => {
      state.pollTimeRemaining = action.payload;
    },

    setShowResults: (state, action: PayloadAction<boolean>) => {
      state.showResults = action.payload;
    },

    // Reset for new poll
    resetAnswerState: (state) => {
      state.selectedAnswer = null;
      state.hasSubmittedAnswer = false;
      state.showResults = false;
    },

    // Complete reset
    resetStudentState: (state) => {
      state.currentStudent = {
        id: null,
        name: "",
        hasJoined: false,
      };
      state.selectedAnswer = null;
      state.hasSubmittedAnswer = false;
      state.joinCode = "";
      state.isJoining = false;
      state.pollTimeRemaining = null;
      state.showResults = false;

      // Clear from localStorage
      clearStudentFromStorage();
    },
  },
});

export const {
  setStudentInfo,
  setJoinCode,
  setIsJoining,
  setSelectedAnswer,
  setHasSubmittedAnswer,
  setPollTimeRemaining,
  setShowResults,
  resetAnswerState,
  resetStudentState,
} = studentSlice.actions;

export default studentSlice.reducer;
