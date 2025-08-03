import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import type { RootState } from "../store/store";
import { useStudent, useWebSocket } from "./useWebSocket";
import { resetAnswerState } from "../store/slices/studentUISlice";

export const useStudentSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get student from studentUI slice
  const student = useSelector(
    (state: RootState) => state.studentUI.currentStudent
  );

  // Use server's hasAnswered status instead of local hasSubmitted
  const hasSubmitted = student.hasAnswered;

  // Get poll results from poll slice
  const pollResults = useSelector((state: RootState) => state.poll.pollResults);

  // Use WebSocket hooks
  const { connect, disconnect, isConnected } = useWebSocket();
  const { currentPoll, error, joinAsStudent, submitAnswer } = useStudent();

  // Connect to WebSocket when student session starts
  useEffect(() => {
    if (student.hasJoined && student.name && !isConnected) {
      console.log(
        "🔌 Student connecting to WebSocket for real-time updates:",
        student.name
      );
      connect();
    }
  }, [student.hasJoined, student.name, isConnected, connect]);

  // Join as student when connected
  useEffect(() => {
    if (isConnected && student.hasJoined && student.name) {
      joinAsStudent(student.name);
    }
  }, [isConnected, student.hasJoined, student.name, joinAsStudent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Initialize and check student state after a brief delay to allow persistence to load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Reset hasAnswered when poll changes (let server handle this)
  useEffect(() => {
    if (currentPoll?.pollId) {
      // Reset the local state when a new poll arrives
      dispatch(resetAnswerState());
    }
  }, [currentPoll?.pollId, dispatch]);

  // Handle WebSocket errors
  useEffect(() => {
    if (error) {
      console.error("WebSocket error:", error);
      // Could add error handling UI here
    }
  }, [error]);

  // Submit answer handler
  const handleSubmitAnswer = useCallback(
    async (selectedOptionIndex: number) => {
      if (hasSubmitted || isSubmitting || !student.name || !currentPoll) {
        console.log("⚠️ Submit blocked:", {
          hasSubmitted,
          isSubmitting,
          studentName: student.name,
          pollExists: !!currentPoll,
        });
        return;
      }

      console.log("🚀 Submitting answer:", {
        studentName: student.name,
        optionIndex: selectedOptionIndex,
        pollId: currentPoll.pollId,
        pollStatus: currentPoll.status,
      });

      try {
        setIsSubmitting(true);

        // Submit via WebSocket
        submitAnswer(selectedOptionIndex);
        // Don't set hasSubmitted here - let the server update it
        // dispatch(setHasAnswered(true));

        console.log(
          `✅ Answer submitted: ${student.name} selected option ${selectedOptionIndex}: ${currentPoll.options[selectedOptionIndex]}`
        );
      } catch (error) {
        console.error("💥 Error submitting answer:", error);
        // Don't reset hasSubmitted on error - server will handle the state
      } finally {
        setIsSubmitting(false);
      }
    },
    [hasSubmitted, isSubmitting, student.name, currentPoll, submitAnswer]
  );

  // Handle kicked state - navigate to kicked out page
  useEffect(() => {
    if (student.isKicked) {
      console.log("Student was kicked, navigating to /kicked-out");
      navigate("/kicked-out");
    }
  }, [student.isKicked, navigate]);

  // Redirect if student hasn't joined (only after initialization and not on kicked-out page)
  useEffect(() => {
    if (
      !isInitializing &&
      (!student.hasJoined || !student.name) &&
      location.pathname !== "/kicked-out"
    ) {
      console.log(
        `Student redirect check: hasJoined=${student.hasJoined}, name=${student.name}, pathname=${location.pathname}`
      );
      console.log(
        "Student not found or hasn't joined, redirecting to /student"
      );
      navigate("/student/get-started");
    }
  }, [
    student.hasJoined,
    student.name,
    navigate,
    isInitializing,
    location.pathname,
  ]);

  // Get poll stats from poll slice for waiting area
  const pollStats = useSelector((state: RootState) => state.poll.pollStats);

  // Create compatible pollStatus object for existing components
  const pollStatus = currentPoll
    ? {
        poll: currentPoll,
        stats: {
          currentQuestionNumber: pollStats?.currentQuestionNumber || 1,
          totalQuestionsAsked: pollStats?.totalQuestionsAsked || 1,
          sessionStudentsCount: pollStats?.sessionStudentsCount || 0,
        },
      }
    : pollStats
      ? {
          poll: null,
          stats: {
            currentQuestionNumber: pollStats.currentQuestionNumber,
            totalQuestionsAsked: pollStats.totalQuestionsAsked,
            sessionStudentsCount: pollStats.sessionStudentsCount,
          },
        }
      : {
          poll: null,
          stats: {
            currentQuestionNumber: 0,
            totalQuestionsAsked: 0,
            sessionStudentsCount: 0,
          },
        };

  // Create compatible pollResultsData object
  const pollResultsData = pollResults
    ? {
        results: pollResults,
      }
    : null;

  return {
    student,
    pollStatus,
    pollResultsData,
    hasSubmitted,
    isSubmitting,
    isInitializing,
    handleSubmitAnswer,
    isConnected,
    error,
  };
};
