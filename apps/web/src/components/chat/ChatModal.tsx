import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { socketActions } from "../../store/middleware/socketMiddleware";
import ChatTab from "./ChatTab";
import ParticipantsTab from "./ParticipantsTab";
import ChatIcon from "../../assets/chat.svg";

const ChatModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "participants">("chat");
  const dispatch = useAppDispatch();

  const { chatMessages, chatParticipants } = useAppSelector(
    (state) => state.poll
  );
  const isConnected = useAppSelector((state) => state.socket.isConnected);

  // Get chat history when modal opens for the first time
  useEffect(() => {
    if (isOpen && isConnected && chatMessages.length === 0) {
      dispatch(socketActions.getChatHistory());
    }
  }, [isOpen, isConnected, chatMessages.length, dispatch]);

  const handleSendMessage = (message: string) => {
    if (message.trim() && isConnected) {
      dispatch(socketActions.sendChatMessage(message.trim()));
    }
  };

  const handleKickStudent = (studentId: string, reason?: string) => {
    if (isConnected) {
      dispatch(socketActions.kickStudent(studentId, reason));
    }
  };

  const handleClearChat = () => {
    if (isConnected) {
      dispatch(socketActions.clearChat());
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Modal - positioned absolutely above the button */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 w-96 h-[500px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab("chat")}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors duration-200 ${
                  activeTab === "chat"
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab("participants")}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors duration-200 ${
                  activeTab === "participants"
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                Participants ({chatParticipants.length})
              </button>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="Close Chat"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "chat" ? (
              <ChatTab
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                onClearChat={handleClearChat}
                isConnected={isConnected}
              />
            ) : (
              <ParticipantsTab
                participants={chatParticipants}
                onKickStudent={handleKickStudent}
                isConnected={isConnected}
              />
            )}
          </div>
        </div>
      )}

      {/* Single Chat Toggle Button - always in the same position */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer bg-primary hover:bg-accent text-white rounded-full p-3 shadow-lg transition-colors duration-200"
        title={isOpen ? "Close Chat" : "Open Chat"}
      >
        <img src={ChatIcon} alt="Chat" className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ChatModal;
