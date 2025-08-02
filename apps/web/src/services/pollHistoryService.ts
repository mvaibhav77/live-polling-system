// Simple fetch-based service for poll history (only REST API endpoint remaining)
export interface PollHistoryItem {
  id: string;
  question: string;
  options: string[];
  responses: {
    [optionIndex: string]: number;
  };
  totalParticipants: number;
  createdAt: string;
  completedAt: string;
}

export interface PollHistoryResponse {
  polls: PollHistoryItem[];
  total: number;
  message?: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const pollHistoryService = {
  async getPollHistory(limit?: number): Promise<PollHistoryResponse> {
    const url = limit
      ? `${API_BASE_URL}/history?limit=${limit}`
      : `${API_BASE_URL}/history`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch poll history: ${response.statusText}`);
    }

    return response.json();
  },

  async getHealthCheck(): Promise<{
    status: string;
    database: string;
    timestamp: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  },
};
