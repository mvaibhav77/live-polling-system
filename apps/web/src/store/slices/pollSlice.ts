import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

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
  async (pollId: string) => {
    const response = await fetch(`/api/polls/${pollId}/join`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to join poll");
    }
    return response.json();
  }
);

export const submitAnswer = createAsyncThunk(
  "poll/submitAnswer",
  async ({ pollId, answer }: { pollId: string; answer: number }) => {
    const response = await fetch(`/api/polls/${pollId}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answer }),
    });
    if (!response.ok) {
      throw new Error("Failed to submit answer");
    }
    return response.json();
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
        state.currentPoll = action.payload.poll;
        state.sessionId = action.payload.sessionId;
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
