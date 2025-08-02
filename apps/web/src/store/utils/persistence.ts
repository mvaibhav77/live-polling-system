// Simple sessionStorage persistence utility for student state

export interface PersistedStudentState {
  id: string | null;
  name: string;
  hasJoined: boolean;
  sessionTimestamp?: number;
}

const STORAGE_KEY = "live-polling-student";
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

export const saveStudentToStorage = (student: PersistedStudentState): void => {
  try {
    const dataToStore = {
      ...student,
      sessionTimestamp: Date.now(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  } catch (error) {
    console.warn("Failed to save student state to sessionStorage:", error);
  }
};

export const loadStudentFromStorage = (): PersistedStudentState | null => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: PersistedStudentState = JSON.parse(stored);

    // Check if session has expired
    if (data.sessionTimestamp) {
      const now = Date.now();
      const sessionAge = now - data.sessionTimestamp;

      if (sessionAge > SESSION_TIMEOUT) {
        // Session expired, clear storage
        clearStudentFromStorage();
        return null;
      }
    }

    return data;
  } catch (error) {
    console.warn("Failed to load student state from sessionStorage:", error);
    clearStudentFromStorage(); // Clear corrupted data
    return null;
  }
};

export const clearStudentFromStorage = (): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear student state from sessionStorage:", error);
  }
};
