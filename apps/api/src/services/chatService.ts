import { v4 as uuidv4 } from "uuid";
import { ChatMessage } from "../types/poll";
import { sessionManager } from "./sessionManager";

class ChatService {
  private messages: ChatMessage[] = [];
  private readonly maxMessages = 100; // Keep last 100 messages
  private lastSystemMessageTime = 0;
  private readonly systemMessageCooldown = 100; // 100ms cooldown between system messages

  // Send a chat message
  sendMessage(
    senderType: "teacher" | "student",
    senderName: string,
    message: string
  ): ChatMessage {
    const now = Date.now();
    const chatMessage: ChatMessage = {
      id: `${uuidv4()}-${now}`, // Ensure uniqueness with timestamp
      senderType,
      senderName,
      message: message.trim(),
      timestamp: now,
    };

    // Add to messages array
    this.messages.push(chatMessage);

    // Keep only the last maxMessages
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }

    console.log(`💬 Chat message from ${senderType} ${senderName}: ${message}`);
    return chatMessage;
  }

  // Get all chat messages
  getAllMessages(): ChatMessage[] {
    return [...this.messages];
  }

  // Get recent messages (last N messages)
  getRecentMessages(count: number = 50): ChatMessage[] {
    return this.messages.slice(-count);
  }

  // Clear all messages (for session reset)
  clearMessages(): void {
    this.messages = [];
    console.log("🗑️ Chat messages cleared");
  }

  // Get chat statistics
  getChatStats() {
    const totalMessages = this.messages.length;
    const teacherMessages = this.messages.filter(
      (m) => m.senderType === "teacher"
    ).length;
    const studentMessages = this.messages.filter(
      (m) => m.senderType === "student"
    ).length;

    return {
      totalMessages,
      teacherMessages,
      studentMessages,
      lastMessageAt:
        this.messages.length > 0
          ? this.messages[this.messages.length - 1].timestamp
          : null,
    };
  }

  // Add system message (for events like student joined/left/kicked)
  addSystemMessage(message: string): ChatMessage {
    const now = Date.now();

    // Prevent rapid system messages that could cause duplicate keys
    if (now - this.lastSystemMessageTime < this.systemMessageCooldown) {
      // Add a small delay to ensure uniqueness
      setTimeout(() => {
        this.lastSystemMessageTime = Date.now();
      }, this.systemMessageCooldown);
    } else {
      this.lastSystemMessageTime = now;
    }

    return this.sendMessage("teacher", "System", `📢 ${message}`);
  }

  // Get participant list with online status
  getParticipants(): string[] {
    const students = sessionManager.getAllStudents();
    const participantNames = [
      "Teacher",
      ...students.map((student) => student.name),
    ];
    return participantNames;
  }

  // Get detailed participant information (for future use)
  getDetailedParticipants() {
    const students = sessionManager.getAllStudents();
    const connectedStudents = sessionManager.getConnectedStudents();

    return {
      teacher: {
        name: "Teacher",
        isOnline: true,
        role: "teacher",
      },
      students: students.map((student) => ({
        id: student.id,
        name: student.name,
        isOnline: connectedStudents.some((cs) => cs.id === student.id),
        joinedAt: student.joinedAt,
        role: "student",
      })),
      totalParticipants: students.length + 1, // +1 for teacher
      connectedParticipants: connectedStudents.length + 1, // +1 for teacher
    };
  }
}

// Export singleton instance
export const chatService = new ChatService();
