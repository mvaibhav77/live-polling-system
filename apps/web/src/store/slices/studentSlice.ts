import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Student {
  id: string;
  name: string;
  hasAnswered: boolean;
  joinedAt: Date;
  answer?: number;
}

export interface StudentState {
  currentStudent: Student | null;
  isJoined: boolean;
  joinCode: string | null;
  error: string | null;
}

const initialState: StudentState = {
  currentStudent: null,
  isJoined: false,
  joinCode: null,
  error: null,
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setStudent: (state, action: PayloadAction<Student>) => {
      state.currentStudent = action.payload;
      state.isJoined = true;
      state.error = null;
    },
    updateStudentName: (state, action: PayloadAction<string>) => {
      if (state.currentStudent) {
        state.currentStudent.name = action.payload;
      }
    },
    setStudentAnswer: (state, action: PayloadAction<number>) => {
      if (state.currentStudent) {
        state.currentStudent.answer = action.payload;
        state.currentStudent.hasAnswered = true;
      }
    },
    setHasAnswered: (state, action: PayloadAction<boolean>) => {
      if (state.currentStudent) {
        state.currentStudent.hasAnswered = action.payload;
        if (!action.payload) {
          delete state.currentStudent.answer;
        }
      }
    },
    setJoinCode: (state, action: PayloadAction<string>) => {
      state.joinCode = action.payload;
    },
    setJoined: (state, action: PayloadAction<boolean>) => {
      state.isJoined = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearStudent: (state) => {
      state.currentStudent = null;
      state.isJoined = false;
      state.joinCode = null;
      state.error = null;
    },
  },
});

export const {
  setStudent,
  updateStudentName,
  setStudentAnswer,
  setHasAnswered,
  setJoinCode,
  setJoined,
  setError,
  clearError,
  clearStudent,
} = studentSlice.actions;

export default studentSlice.reducer;
