import type { Socket } from "socket.io-client";
import type { AppDispatch, RootState } from "../../store";
import {
  setCurrentStudent,
  addStudent,
  removeStudent,
  updateStudentAnswer,
  setPollResults,
  setPollStats,
  setError,
  type Student,
  type PollStats,
  type PollResults,
} from "../../slices/pollSlice";
import { setHasAnswered, setIsKicked } from "../../slices/studentUISlice";
import { setLastMessage } from "../../slices/socketSlice";

export const setupStudentEventHandlers = (
  socket: Socket,
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  socket.on("student-join-success", (data: { student: Student }) => {
    console.log("✅ Student join success:", data);
    dispatch(setCurrentStudent(data.student));
    dispatch(setHasAnswered(data.student.hasAnswered || false));
    dispatch(
      setLastMessage({
        type: "student-join-success",
        payload: data,
        timestamp: Date.now(),
      })
    );
  });

  socket.on("student-join-error", (data: { message: string }) => {
    console.log("❌ Student join error:", data);
    dispatch(setError(data.message));
    dispatch(
      setLastMessage({
        type: "student-join-error",
        payload: data,
        timestamp: Date.now(),
      })
    );
  });

  socket.on(
    "student-joined",
    (data: { student: Student; stats: PollStats }) => {
      console.log("👨‍🎓 Student joined:", data);
      dispatch(addStudent(data.student));
      dispatch(setPollStats(data.stats));
      dispatch(
        setLastMessage({
          type: "student-joined",
          payload: data,
          timestamp: Date.now(),
        })
      );
    }
  );

  socket.on(
    "student-left",
    (data: { studentId: string; studentName: string; stats: PollStats }) => {
      console.log("👋 Student left:", data);
      dispatch(removeStudent(data.studentId));
      dispatch(setPollStats(data.stats));
      dispatch(
        setLastMessage({
          type: "student-left",
          payload: data,
          timestamp: Date.now(),
        })
      );
    }
  );

  socket.on(
    "response-success",
    (data: { optionIndex: number; message: string }) => {
      console.log("✅ Response success:", data);
      // Update current student's answer status in both slices
      const state = getState();
      if (state.poll.currentStudent) {
        dispatch(
          updateStudentAnswer({
            studentId: state.poll.currentStudent.id,
            hasAnswered: true,
          })
        );
      }
      // Update hasAnswered in studentUI slice too
      dispatch(setHasAnswered(true));
      dispatch(
        setLastMessage({
          type: "response-success",
          payload: data,
          timestamp: Date.now(),
        })
      );
    }
  );

  socket.on("response-error", (data: { message: string }) => {
    console.log("❌ Response error:", data);
    dispatch(setError(data.message));
    dispatch(
      setLastMessage({
        type: "response-error",
        payload: data,
        timestamp: Date.now(),
      })
    );
  });

  socket.on(
    "response-received",
    (data: {
      studentId: string;
      studentName: string;
      optionIndex: number;
      results: PollResults;
      stats: PollStats;
    }) => {
      console.log("📊 Response received:", data);
      dispatch(
        updateStudentAnswer({
          studentId: data.studentId,
          hasAnswered: true,
        })
      );
      dispatch(setPollResults(data.results));
      dispatch(setPollStats(data.stats));
      dispatch(
        setLastMessage({
          type: "response-received",
          payload: data,
          timestamp: Date.now(),
        })
      );
    }
  );

  socket.on(
    "kicked-from-session",
    (data: { reason?: string; message?: string }) => {
      console.log("🚫 You have been kicked from the session:", data);

      // Set kicked flag instead of direct navigation
      dispatch(setIsKicked(true));

      dispatch(
        setLastMessage({
          type: "kicked-from-session",
          payload: data,
          timestamp: Date.now(),
        })
      );
    }
  );

  socket.on(
    "student-kicked",
    (data: { studentId: string; reason?: string; message?: string }) => {
      console.log("🚫 Student kicked:", data);

      // Check if this is the current student being kicked
      const state = getState();
      const currentStudent = state.poll.currentStudent;
      const studentUIStudent = state.studentUI.currentStudent;

      if (currentStudent && currentStudent.id === data.studentId) {
        // This student was kicked, set kicked flag
        console.log("Current student was kicked, setting kicked flag");
        dispatch(setIsKicked(true));
      } else if (studentUIStudent && studentUIStudent.id === data.studentId) {
        // This student was kicked (from studentUI slice), set kicked flag
        console.log(
          "Current student (from studentUI) was kicked, setting kicked flag"
        );
        dispatch(setIsKicked(true));
      } else {
        // Another student was kicked, remove them from the students list
        dispatch(removeStudent(data.studentId));
      }

      dispatch(
        setLastMessage({
          type: "student-kicked",
          payload: data,
          timestamp: Date.now(),
        })
      );
    }
  );
};
