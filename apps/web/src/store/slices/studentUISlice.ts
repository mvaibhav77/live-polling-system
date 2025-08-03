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
    hasAnswered: boolean; // Track from server
    isKicked: boolean; // Track if student was kicked from session
  };

  // UI state
  selectedAnswer: number | null;
  hasSubmittedAnswer: boolean; // Keep for UI feedback, but use hasAnswered for logic
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
          hasAnswered: false, // Always reset this from server
          isKicked: false, // Always reset this on load
        }
      : {
          id: null,
          name: "",
          hasJoined: false,
          hasAnswered: false,
          isKicked: false,
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
      state.currentStudent.hasAnswered = false; // Reset server status too
    },

    // Update hasAnswered status from server
    setHasAnswered: (state, action: PayloadAction<boolean>) => {
      state.currentStudent.hasAnswered = action.payload;
    },

    // Set kicked status when student is removed
    setIsKicked: (state, action: PayloadAction<boolean>) => {
      state.currentStudent.isKicked = action.payload;
    },

    // Complete reset
    resetStudentState: (state) => {
      state.currentStudent = {
        id: null,
        name: "",
        hasJoined: false,
        hasAnswered: false,
        isKicked: false,
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
  setHasAnswered,
  setIsKicked,
  resetStudentState,
} = studentSlice.actions;

export default studentSlice.reducer;
