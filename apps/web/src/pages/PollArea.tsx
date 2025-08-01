import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../store/store";
import {
  useGetPollStatusQuery,
  useSubmitAnswerMutation,
  useGetPollResultsQuery,
} from "../store/api/pollApi";
import { resetStudentState } from "../store/slices/studentUISlice";
import WaitingArea from "../components/WaitingArea";
import StudentPollInterface from "../components/StudentPollInterface";

const PollArea = () => {
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
        navigate("/student");
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
    setHasSubmitted(false);
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
                navigate("/student");
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
      navigate("/student");
    }
  }, [student.hasJoined, student.id, navigate, isInitializing]);

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show waiting area if student has submitted or poll ended - show results instead
  if (!pollStatus?.poll) {
    return <WaitingArea studentName={student.name} pollStatus={pollStatus} />;
  }

  // Show the poll interface regardless of status if poll exists
  const showResults =
    hasSubmitted ||
    pollStatus.poll.status === "ended" ||
    pollStatus.poll.status !== "active";

  return (
    <StudentPollInterface
      poll={pollStatus.poll}
      studentName={student.name}
      onSubmit={handleSubmitAnswer}
      isSubmitting={isSubmitting}
      hasSubmitted={hasSubmitted}
      pollResults={pollResultsData?.results || null}
      showResults={showResults}
    />
  );
};

export default PollArea;
