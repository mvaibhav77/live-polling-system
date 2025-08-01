import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Types
export interface CreatePollRequest {
  question: string;
  options: string[];
  timeLimit?: number;
}

export interface Poll {
  pollId: string;
  question: string;
  options: string[];
  status: "waiting" | "active" | "ended";
  timeLimit: number;
  startTime?: string;
  endTime?: string;
  createdAt: string;
}

export interface PollStats {
  totalStudents: number;
  answeredStudents: number;
  totalResponses: number;
}

export interface PollStatus {
  poll: Poll | null;
  stats: PollStats;
}

export interface JoinPollRequest {
  studentName: string;
}

export interface Student {
  id: string;
  name: string;
  hasAnswered: boolean;
  joinedAt: string;
}

export interface JoinPollResponse {
  success: boolean;
  student: Student;
  poll: Poll | null;
}

export interface SubmitAnswerRequest {
  studentId: string;
  optionIndex: number;
}

export interface PollResults {
  [optionIndex: string]: number;
}

export interface SubmitAnswerResponse {
  success: boolean;
  message: string;
  results: PollResults;
  stats: PollStats;
}

// Base API configuration
const pollApi = createApi({
  reducerPath: "pollApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  }),
  tagTypes: ["Poll", "PollStatus", "PollResults", "PollStats"],
  endpoints: (builder) => ({
    // Get current poll status
    getPollStatus: builder.query<PollStatus, void>({
      query: () => "/poll",
      providesTags: ["PollStatus"],
    }),

    // Create a new poll
    createPoll: builder.mutation<Poll, CreatePollRequest>({
      query: (pollData) => ({
        url: "/poll",
        method: "POST",
        body: pollData,
      }),
      invalidatesTags: ["PollStatus"],
    }),

    // Start the current poll
    startPoll: builder.mutation<
      { success: boolean; poll: Partial<Poll> },
      void
    >({
      query: () => ({
        url: "/poll/start",
        method: "POST",
      }),
      invalidatesTags: ["PollStatus"],
    }),

    // End the current poll
    endPoll: builder.mutation<{ success: boolean; results: PollResults }, void>(
      {
        query: () => ({
          url: "/poll/end",
          method: "POST",
        }),
        invalidatesTags: ["PollStatus", "PollResults"],
      }
    ),

    // Create and start poll (combined operation)
    createAndStartPoll: builder.mutation<Poll, CreatePollRequest>({
      queryFn: async (pollData, _queryApi, _extraOptions, fetchWithBQ) => {
        // First create the poll
        const createResult = await fetchWithBQ({
          url: "/poll",
          method: "POST",
          body: pollData,
        });

        if (createResult.error) {
          return { error: createResult.error };
        }

        // Then start it
        const startResult = await fetchWithBQ({
          url: "/poll/start",
          method: "POST",
        });

        if (startResult.error) {
          return { error: startResult.error };
        }

        return { data: createResult.data as Poll };
      },
      invalidatesTags: ["PollStatus"],
    }),

    // Get poll results
    getPollResults: builder.query<
      { results: PollResults; stats: PollStats },
      void
    >({
      query: () => "/poll/results",
      providesTags: ["PollResults"],
    }),

    // Get poll statistics
    getPollStats: builder.query<{ stats: PollStats }, void>({
      query: () => "/poll/stats",
      providesTags: ["PollStats"],
    }),

    // Join poll as student
    joinPoll: builder.mutation<JoinPollResponse, JoinPollRequest>({
      query: (data) => ({
        url: "/poll/join",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PollStats"],
    }),

    // Submit answer
    submitAnswer: builder.mutation<SubmitAnswerResponse, SubmitAnswerRequest>({
      query: (data) => ({
        url: "/poll/submit",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PollResults", "PollStats"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetPollStatusQuery,
  useCreatePollMutation,
  useStartPollMutation,
  useEndPollMutation,
  useCreateAndStartPollMutation,
  useGetPollResultsQuery,
  useGetPollStatsQuery,
  useJoinPollMutation,
  useSubmitAnswerMutation,
} = pollApi;

export default pollApi;
