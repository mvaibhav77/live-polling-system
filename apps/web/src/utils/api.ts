// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface CreatePollData {
  question: string;
  options: string[];
  timeLimit?: number;
}

// API utility function
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, defaultOptions);

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
};

// Specific API methods
export const api = {
  // Poll related
  createPoll: (data: CreatePollData) =>
    apiCall("/api/poll", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  startPoll: () =>
    apiCall("/api/poll/start", {
      method: "POST",
    }),

  endPoll: () =>
    apiCall("/api/poll/end", {
      method: "POST",
    }),

  joinPoll: (studentName: string) =>
    apiCall("/api/poll/join", {
      method: "POST",
      body: JSON.stringify({ studentName }),
    }),

  submitAnswer: (studentId: string, optionIndex: number) =>
    apiCall("/api/poll/submit", {
      method: "POST",
      body: JSON.stringify({ studentId, optionIndex }),
    }),

  getPollStatus: () => apiCall("/api/poll"),

  getPollResults: () => apiCall("/api/poll/results"),

  getPollStats: () => apiCall("/api/poll/stats"),
};
