import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useAppSelector } from "../../store/hooks";
import type { ChatMessage } from "../../store/slices/pollSlice";

interface ChatTabProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  isConnected: boolean;
}

const ChatTab: React.FC<ChatTabProps> = React.memo(
  ({ messages, onSendMessage, onClearChat, isConnected }) => {
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { currentStudent } = useAppSelector((state) => state.poll);

    // Determine if current user is teacher (no currentStudent means teacher)
    const isTeacher = !currentStudent;

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && isConnected) {
          onSendMessage(newMessage);
          setNewMessage("");
        }
      },
      [newMessage, isConnected, onSendMessage]
    );

    const handleClearChat = useCallback(() => {
      // Use requestAnimationFrame to avoid blocking the UI
      requestAnimationFrame(() => {
        if (
          window.confirm("Are you sure you want to clear all chat messages?")
        ) {
          onClearChat();
        }
      });
    }, [onClearChat]);

    const formatTime = useCallback((timestamp: number) => {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }, []);

    // Memoize rendered messages to prevent unnecessary re-renders
    const renderedMessages = useMemo(() => {
      return messages.map((message, index) => {
        const isCurrentUser =
          (message.senderType === "student" &&
            message.senderName === currentStudent?.name) ||
          (message.senderType === "teacher" && isTeacher);

        if (message.senderType === "system") {
          return (
            <div
              key={`${message.id}-${message.timestamp}-${index}`}
              className="flex justify-center my-3"
            >
              <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full max-w-xs text-center">
                {message.message}
              </div>
            </div>
          );
        }

        return (
          <div
            key={`${message.id}-${message.timestamp}-${index}`}
            className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}
          >
            {!isCurrentUser && (
              <div className="flex-shrink-0 mr-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                    message.senderType === "teacher"
                      ? "bg-red-500"
                      : "bg-foreground"
                  }`}
                >
                  {message.senderName.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            <div
              className={`max-w-xs lg:max-w-md ${isCurrentUser ? "order-1" : "order-2"}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl text-sm ${
                  isCurrentUser
                    ? "bg-primary text-white rounded-br-md"
                    : message.senderType === "teacher"
                      ? "bg-red-100 text-red-900 rounded-bl-md"
                      : "bg-gray-100 text-gray-900 rounded-bl-md"
                }`}
              >
                {message.message}
              </div>

              <div
                className={`mt-1 text-xs text-gray-500 ${isCurrentUser ? "text-right" : "text-left"}`}
              >
                {!isCurrentUser && (
                  <span className="font-medium mr-2">{message.senderName}</span>
                )}
                {formatTime(message.timestamp)}
              </div>
            </div>

            {isCurrentUser && (
              <div className="flex-shrink-0 ml-3 order-2">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-medium text-white">
                  {message.senderName.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        );
      });
    }, [messages, formatTime, currentStudent, isTeacher]);
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-foreground text-sm py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-1">{renderedMessages}</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {/* Teacher Controls */}
          {isTeacher && messages.length > 0 && (
            <div className="mb-3">
              <button
                onClick={handleClearChat}
                disabled={!isConnected}
                className="text-xs text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Clear Chat
              </button>
            </div>
          )}

          {/* Message Input */}
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  isConnected ? "Type a message..." : "Connecting..."
                }
                disabled={!isConnected}
                maxLength={500}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all pr-16"
              />

              {/* Character Count */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {newMessage.length}/500
              </div>
            </div>

            <button
              type="submit"
              disabled={!isConnected || !newMessage.trim()}
              className="flex-shrink-0 w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors disabled:cursor-not-allowed"
              title="Send message"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    );
  }
);

ChatTab.displayName = "ChatTab";

export default ChatTab;
