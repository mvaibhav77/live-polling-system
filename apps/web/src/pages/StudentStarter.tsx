import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Button from "../components/common/Button";
import Pill from "../components/common/Pill";
import { useWebSocket, useStudent } from "../hooks/useWebSocket";
import {
  setStudentInfo,
  resetStudentState,
} from "../store/slices/studentUISlice";

const StudentStarter: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { connect, isConnected } = useWebSocket();
  const { currentStudent, error: studentError, joinAsStudent } = useStudent();

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [connect, isConnected]);

  // Handle successful student join
  useEffect(() => {
    if (currentStudent?.id && currentStudent?.name) {
      dispatch(
        setStudentInfo({
          id: currentStudent.id,
          name: currentStudent.name,
        })
      );
      navigate("/poll");
    }
  }, [currentStudent, dispatch, navigate]);

  // Handle WebSocket errors
  useEffect(() => {
    if (studentError) {
      setError(studentError);
      setIsJoining(false);
    }
  }, [studentError]);

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

    if (!isConnected) {
      setError("Not connected to server. Please wait...");
      return;
    }

    try {
      setError("");
      setIsJoining(true);

      // Join as student via WebSocket
      joinAsStudent(name.trim());

      // Navigation will happen via useEffect when currentStudent is set
    } catch {
      setError("Failed to join poll. Please try again.");
      setIsJoining(false);
    }
  };

  useEffect(() => {
    // Clear error when name changes
    if (error && name.trim()) {
      setError("");
    }
  }, [name, error]);

  // Show "already logged in" state if student has joined
  if (currentStudent?.id && currentStudent?.name) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans p-4">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-10 items-center text-center">
          <Pill />

          <div className="w-full mx-auto flex flex-col gap-4 items-center text-center">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight">
              Welcome Back,{" "}
              <span className="font-medium">{currentStudent.name}</span>!
            </h1>

            <p className="text-muted text-lg">
              You're already logged into the polling session via WebSocket. You
              can continue to the poll area or start a new session.
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
            , participate in live polls via WebSocket, and see how your
            responses compare with your classmates in real-time
          </p>

          {/* Connection Status - only show when connecting */}
          {!isConnected && (
            <div className="flex items-center gap-2 mt-4">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">
                Waking up the server...
              </span>
            </div>
          )}
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
            disabled={isJoining || !isConnected}
            onKeyDown={(e) => {
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
            disabled={!name.trim() || isJoining || !isConnected}
          >
            {isJoining ? "Joining..." : "Join Poll"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentStarter;
