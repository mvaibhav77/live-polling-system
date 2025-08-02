// Main socket middleware export
export { socketMiddleware, socketActions } from "../socketMiddleware";

// Individual modules for direct imports if needed
export { connectSocket, disconnectSocket, getSocket } from "./connection";
export { setupPollEventHandlers } from "./pollEvents";
export { setupStudentEventHandlers } from "./studentEvents";
export { setupChatEventHandlers } from "./chatEvents";
export { setupTeacherEventHandlers } from "./teacherEvents";
export { handleOutgoingActions } from "./actionHandlers";
