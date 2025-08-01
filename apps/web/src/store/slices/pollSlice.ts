import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../utils/api";

export interface Poll {
  id: string;
  question: string;
  options: string[];
  type: "multipleChoice" | "poll";
  correctAnswer?: number;
  isActive: boolean;
  results: Record<string, number>;
  questionNumber?: number;
  timeLimit?: number;
  timeRemaining?: number;
  totalQuestions?: number;
}

export interface PollState {
  currentPoll: Poll | null;
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
  hasAnswered: boolean;
  selectedAnswer: number | null;
}

const initialState: PollState = {
  currentPoll: null,
  isLoading: false,
  error: null,
  sessionId: null,
  hasAnswered: false,
  selectedAnswer: null,
};

// Async thunks for API calls
export const joinPoll = createAsyncThunk(
  "poll/joinPoll",
  async (studentName: string) => {
    return await api.joinPoll(studentName);
  }
);

export const submitAnswer = createAsyncThunk(
  "poll/submitAnswer",
  async ({
    studentId,
    optionIndex,
  }: {
    studentId: string;
    optionIndex: number;
  }) => {
    return await api.submitAnswer(studentId, optionIndex);
  }
);

export const getPollStatus = createAsyncThunk(
  "poll/getPollStatus",
  async () => {
    return await api.getPollStatus();
  }
);

const pollSlice = createSlice({
  name: "poll",
  initialState,
  reducers: {
    setPoll: (state, action: PayloadAction<Poll>) => {
      state.currentPoll = action.payload;
      state.hasAnswered = false;
      state.selectedAnswer = null;
      state.error = null;
    },
    updatePollResults: (
      state,
      action: PayloadAction<Record<string, number>>
    ) => {
      if (state.currentPoll) {
        state.currentPoll.results = action.payload;
      }
    },
    setSelectedAnswer: (state, action: PayloadAction<number>) => {
      state.selectedAnswer = action.payload;
    },
    setHasAnswered: (state, action: PayloadAction<boolean>) => {
      state.hasAnswered = action.payload;
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      if (state.currentPoll) {
        state.currentPoll.timeRemaining = action.payload;
      }
    },
    clearPoll: (state) => {
      state.currentPoll = null;
      state.hasAnswered = false;
      state.selectedAnswer = null;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(joinPoll.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinPoll.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.poll) {
          state.currentPoll = action.payload.poll;
        }
        if (action.payload.student) {
          // Store student info if needed
          state.sessionId = action.payload.student.id;
        }
      })
      .addCase(joinPoll.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to join poll";
      })
      .addCase(submitAnswer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitAnswer.fulfilled, (state) => {
        state.isLoading = false;
        state.hasAnswered = true;
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to submit answer";
      })
      .addCase(getPollStatus.fulfilled, (state, action) => {
        if (action.payload.poll) {
          state.currentPoll = action.payload.poll;
        }
      });
  },
});

export const {
  setPoll,
  updatePollResults,
  setSelectedAnswer,
  setHasAnswered,
  setSessionId,
  updateTimeRemaining,
  clearPoll,
  setError,
  clearError,
} = pollSlice.actions;

export default pollSlice.reducer;
