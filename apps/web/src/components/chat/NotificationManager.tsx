import React from "react";
import { useAppSelector } from "../../store/hooks";
import ChatNotification from "./ChatNotification";
import type { ChatMessage } from "../../store/slices/pollSlice";

interface NotificationManagerProps {
  onOpenChat: () => void;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({
  onOpenChat,
}) => {
  const [notifications, setNotifications] = React.useState<ChatMessage[]>([]);
  const { chatMessages } = useAppSelector((state) => state.poll);
  const initialMessageCount = React.useRef<number>(0);
  const hasInitialized = React.useRef(false);

  // Initialize with current message count
  React.useEffect(() => {
    if (!hasInitialized.current) {
      initialMessageCount.current = chatMessages.length;
      hasInitialized.current = true;
    }
  }, [chatMessages.length]);

  // Track new messages and create notifications
  React.useEffect(() => {
    if (
      !hasInitialized.current ||
      chatMessages.length <= initialMessageCount.current
    ) {
      return;
    }

    // Get only the new messages
    const newMessages = chatMessages.slice(initialMessageCount.current);

    if (newMessages.length > 0) {
      const latestMessage = newMessages[newMessages.length - 1];

      // Add notification for the latest new message
      setNotifications((prev) => {
        // Avoid duplicate notifications
        if (prev.some((notif) => notif.id === latestMessage.id)) return prev;
        return [...prev, latestMessage];
      });

      // Update initial count to include new messages
      initialMessageCount.current = chatMessages.length;
    }
  }, [chatMessages]);

  const handleNotificationClose = (messageId: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== messageId));
  };

  const handleNotificationClick = (messageId: string) => {
    handleNotificationClose(messageId);
    onOpenChat();
  };

  return (
    <div className="fixed top-0 right-0 z-[60] pointer-events-none">
      <div className="space-y-2 p-4">
        {notifications.map((message, index) => (
          <div
            key={message.id}
            className="pointer-events-auto"
            style={{
              zIndex: 60 + notifications.length - index, // Stack notifications properly
            }}
          >
            <ChatNotification
              message={message}
              onClose={() => handleNotificationClose(message.id)}
              onClick={() => handleNotificationClick(message.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationManager;
