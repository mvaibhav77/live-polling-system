import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Button from "../components/Button";
import Pill from "../components/Pill";
import { useJoinSessionMutation } from "../store/api/pollApi";
import {
  setStudentInfo,
  setIsJoining,
  resetStudentState,
} from "../store/slices/studentUISlice";
import type { RootState } from "../store/store";

const StudentStarter: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get current student state
  const student = useSelector(
    (state: RootState) => state.studentUI.currentStudent
  );

  // RTK Query hooks
  const [joinSession, { isLoading: isJoiningPoll }] = useJoinSessionMutation();

  // Check if student is already logged in and redirect
  useEffect(() => {
    if (student.hasJoined && student.id && student.name) {
      navigate("/poll");
    }
  }, [student.hasJoined, student.id, student.name, navigate]);

  const handleStartNewSession = () => {
    dispatch(resetStudentState());
    setName("");
    setError("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    try {
      setError("");
      dispatch(setIsJoining(true));

      // Join the session using RTK Query
      const result = await joinSession({ studentName: name.trim() }).unwrap();

      // Update Redux state with student info
      dispatch(
        setStudentInfo({
          id: result.student.id,
          name: result.student.name,
        })
      );

      // Navigate to poll area
      navigate("/poll");
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === "object" && "data" in err
          ? (err.data as { error?: string })?.error
          : "Failed to join poll. Please try again.";
      setError(errorMessage || "Failed to join poll. Please try again.");
    } finally {
      dispatch(setIsJoining(false));
    }
  };

  useEffect(() => {
    // Clear error when name changes
    if (error && name.trim()) {
      setError("");
    }
  }, [name, error]);

  // Show "already logged in" state if student has joined
  if (student.hasJoined && student.id && student.name) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans p-4">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-10 items-center text-center">
          <Pill />

          <div className="w-full mx-auto flex flex-col gap-4 items-center text-center">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight">
              Welcome Back, <span className="font-medium">{student.name}</span>!
            </h1>

            <p className="text-muted text-lg">
              You're already logged into the polling session. You can continue
              to the poll area or start a new session.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button onClick={() => navigate("/poll")} className="px-8">
              Continue to Poll
            </Button>
            <Button
              onClick={handleStartNewSession}
              variant="secondary"
              className="px-8"
            >
              Start New Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-10 items-center text-center">
        {/* Top Pill */}
        <Pill />

        <div className="w-full mx-auto flex flex-col gap-2 items-center text-center">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-5xl font-light tracking-tight">
            Let's <span className="font-medium">Get Started</span>
          </h1>

          {/* Subheading */}
          <p className="text-muted text-lg">
            If you're a student, you'll be able to{" "}
            <span className="text-black font-semibold">
              submit your answers
            </span>
            , participate in live polls, and see how your responses compare with
            your classmates
          </p>
        </div>

        {/* input for name */}
        <div className="form-group flex flex-col items-center w-full max-w-lg">
          <label htmlFor="name" className="mb-2 self-start">
            Enter your name to start:
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border text-lg border-gray-300 rounded-lg p-4 w-full"
            disabled={isJoiningPoll}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />

          {/* Error Message */}
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm w-full">
              {error}
            </div>
          )}

          {/* Continue Button */}
          <Button
            className="mt-6"
            onClick={handleSubmit}
            type="submit"
            disabled={!name.trim() || isJoiningPoll}
          >
            {isJoiningPoll ? "Joining..." : "Join Poll"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentStarter;
