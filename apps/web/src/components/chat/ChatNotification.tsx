import React, { useEffect, useState } from "react";
import type { ChatMessage } from "../../store/slices/pollSlice";

interface ChatNotificationProps {
  message: ChatMessage;
  onClose: () => void;
  onClick: () => void;
}

const ChatNotification: React.FC<ChatNotificationProps> = ({
  message,
  onClose,
  onClick,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setIsVisible(true), 100);

    // Auto-dismiss after 3 seconds
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 3000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [onClose]);

  const handleClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClick();
      onClose();
    }, 200);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const getSenderDisplayName = () => {
    if (message.senderType === "teacher") return "Teacher";
    if (message.senderType === "system") return "System";
    return message.senderName;
  };

  const getNotificationColor = () => {
    if (message.senderType === "teacher") return "border-red-200 bg-red-50";
    if (message.senderType === "system") return "border-gray-200 bg-gray-50";
    return "border-blue-200 bg-blue-50";
  };

  const getAvatarColor = () => {
    if (message.senderType === "teacher") return "bg-red-500";
    if (message.senderType === "system") return "bg-gray-500";
    return "bg-blue-500";
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[60] transform transition-all duration-300 ease-in-out cursor-pointer ${
        isVisible && !isExiting
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
      }`}
      onClick={handleClick}
    >
      <div
        className={`max-w-sm w-80 ${getNotificationColor()} border rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {message.senderType !== "system" && (
              <div
                className={`w-6 h-6 rounded-full ${getAvatarColor()} flex items-center justify-center text-xs font-medium text-white`}
              >
                {getSenderDisplayName().charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-gray-900">
              {message.senderType === "system" ? "📢 " : "💬 "}
              New {message.senderType === "system"
                ? "notification"
                : "message"}{" "}
              from {getSenderDisplayName()}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            title="Dismiss"
          >
            <svg
              className="w-4 h-4"
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

        {/* Message Content */}
        <div className="text-sm text-gray-700 mb-2 overflow-hidden">
          <div className="line-clamp-2">{message.message}</div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="text-blue-600 font-medium">Click to view</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
          <div
            className={`bg-blue-500 h-1 rounded-full transition-all ease-linear ${
              isVisible && !isExiting
                ? "w-0 duration-[3000ms]"
                : "w-full duration-300"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatNotification;
