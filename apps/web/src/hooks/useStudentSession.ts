import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../store/store";
import {
  useGetPollStatusQuery,
  useSubmitAnswerMutation,
  useGetPollResultsQuery,
} from "../store/api/pollApi";
import { resetStudentState } from "../store/slices/studentUISlice";

export const useStudentSession = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const student = useSelector(
    (state: RootState) => state.studentUI.currentStudent
  );

  const { data: pollStatus, error: pollStatusError } = useGetPollStatusQuery(
    undefined,
    {
      pollingInterval: 2000, // Poll every 2 seconds
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const [submitAnswer, { isLoading: isSubmitting }] = useSubmitAnswerMutation();

  // Fetch poll results when poll is ended or student has submitted
  const shouldFetchResults =
    hasSubmitted || pollStatus?.poll?.status === "ended";
  const { data: pollResultsData } = useGetPollResultsQuery(undefined, {
    skip: !shouldFetchResults,
    pollingInterval: shouldFetchResults ? 2000 : undefined,
  });

  // Handle API errors that might indicate invalid session
  useEffect(() => {
    if (pollStatusError && "status" in pollStatusError) {
      if (pollStatusError.status === 401 || pollStatusError.status === 403) {
        console.log("Session appears to be invalid, clearing local state");
        dispatch(resetStudentState());
        navigate("/student/get-started");
      }
    }
  }, [pollStatusError, dispatch, navigate]);

  // Initialize and check student state after a brief delay to allow persistence to load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 100); // Brief delay to ensure persistence has loaded

    return () => clearTimeout(timer);
  }, []);

  // Reset hasSubmitted when poll changes
  useEffect(() => {
    if (pollStatus?.poll?.pollId) {
      setHasSubmitted(false);
    }
  }, [pollStatus?.poll?.pollId]);

  // Submit answer handler
  const handleSubmitAnswer = useCallback(
    async (selectedOptionIndex: number) => {
      if (hasSubmitted || isSubmitting || !student.id) {
        console.log("⚠️ Submit blocked:", {
          hasSubmitted,
          isSubmitting,
          studentId: student.id,
        });
        return;
      }

      console.log("🚀 Submitting answer:", {
        studentId: student.id,
        optionIndex: selectedOptionIndex,
        studentName: student.name,
        pollId: pollStatus?.poll?.pollId,
        pollStatus: pollStatus?.poll?.status,
      });

      try {
        const result = await submitAnswer({
          studentId: student.id,
          optionIndex: selectedOptionIndex,
        });

        console.log("📥 Submit response:", result);

        if ("data" in result && result.data?.success) {
          setHasSubmitted(true);
          console.log(
            `✅ Answer submitted: ${student.name} selected option ${selectedOptionIndex}: ${pollStatus?.poll?.options[selectedOptionIndex]}`
          );
        } else if ("error" in result) {
          console.error("❌ Failed to submit answer:", result.error);

          // Check if it's a session-related error
          if (result.error && "status" in result.error) {
            const status = result.error.status;

            // Check for specific error codes that indicate student ID issues
            if (
              result.error.data &&
              typeof result.error.data === "object" &&
              "code" in result.error.data
            ) {
              const errorData = result.error.data as { code?: string };
              if (errorData.code === "STUDENT_NOT_FOUND") {
                console.log(
                  "Student ID not found in poll, clearing local state and redirecting"
                );
                dispatch(resetStudentState());
                navigate("/student/get-started");
                return;
              }
            }

            // General status code checks for session errors
            if (
              status === 400 ||
              status === 401 ||
              status === 403 ||
              status === 404
            ) {
              console.log(
                "Session error during submission (student ID invalid or session expired), clearing local state"
              );
              dispatch(resetStudentState());
              navigate("/student");
              return;
            }
          }

          // Could add error handling UI here for other errors
        }
      } catch (error) {
        console.error("💥 Error submitting answer:", error);
        // Could add error handling UI here
      }
    },
    [
      hasSubmitted,
      isSubmitting,
      student.id,
      student.name,
      submitAnswer,
      pollStatus?.poll?.options,
      pollStatus?.poll?.pollId,
      pollStatus?.poll?.status,
      dispatch,
      navigate,
    ]
  );

  // Redirect if student hasn't joined (only after initialization)
  useEffect(() => {
    if (!isInitializing && (!student.hasJoined || !student.id)) {
      console.log(
        "Student not found or hasn't joined, redirecting to /student"
      );
      navigate("/student/get-started");
    }
  }, [student.hasJoined, student.id, navigate, isInitializing]);

  return {
    student,
    pollStatus,
    pollResultsData,
    hasSubmitted,
    isSubmitting,
    isInitializing,
    handleSubmitAnswer,
  };
};
