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
  startTime?: number;
  endTime?: number;
  createdAt: number;
}

export interface PollStats {
  totalStudents: number;
  answeredStudents: number;
  totalResponses: number;
  sessionStudentsCount: number; // Total students in session
  totalQuestionsAsked: number; // Questions asked so far
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
  joinedAt: number;
}

export interface JoinPollResponse {
  success: boolean;
  student: Student;
  poll: Poll | null;
}

export interface JoinSessionResponse {
  success: boolean;
  student: Student;
  session: {
    sessionId: string;
    totalStudents: number;
    connectedStudents: number;
  };
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

export interface PollHistoryItem {
  id: string;
  question: string;
  options: string[];
  responses: {
    [optionIndex: string]: number;
  };
  totalParticipants: number;
  createdAt: string; // ISO date string from database
  completedAt: string; // ISO date string from database
}

export interface PollHistoryResponse {
  polls: PollHistoryItem[];
  total: number;
  message?: string;
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
      transformResponse: (response: { success: boolean; poll: Poll }) =>
        response.poll,
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

        // Extract the poll from the wrapped response
        const createData = createResult.data as {
          success: boolean;
          poll: Poll;
        };

        // Then start it
        const startResult = await fetchWithBQ({
          url: "/poll/start",
          method: "POST",
        });

        if (startResult.error) {
          return { error: startResult.error };
        }

        return { data: createData.poll };
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

    // Get poll history
    getPollHistory: builder.query<PollHistoryResponse, void>({
      query: () => "/history",
      providesTags: ["Poll"],
    }),

    // Join session as student (works regardless of poll status)
    joinSession: builder.mutation<JoinSessionResponse, JoinPollRequest>({
      query: (data) => ({
        url: "/session/join",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PollStats"],
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
  useGetPollHistoryQuery,
  useJoinSessionMutation,
  useJoinPollMutation,
  useSubmitAnswerMutation,
} = pollApi;

export default pollApi;
