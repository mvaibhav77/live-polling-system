import React, { useState } from "react";
import { Link } from "react-router-dom";
import TeacherPollInterface from "../components/TeacherPollInterface";
import Button from "../components/Button";

// Mock data for demonstration
const mockCurrentPoll = {
  pollId: "poll-current",
  questionNumber: 1,
  question: "What is your favorite programming language?",
  options: ["JavaScript", "Python", "Java", "C++"],
  timeLimit: 60,
  startTime: Date.now() - 30000, // Started 30 seconds ago
  status: "active" as const,
};

const mockPollResults = {
  "0": 5,
  "1": 8,
  "2": 3,
  "3": 2,
};

const mockStats = {
  totalStudents: 20,
  answeredStudents: 18,
  totalResponses: 18,
};

const TeacherDashboard: React.FC = () => {
  const [currentPoll, setCurrentPoll] = useState<{
    pollId: string;
    questionNumber: number;
    question: string;
    options: string[];
    timeLimit: number;
    startTime: number;
    status: "waiting" | "active" | "ended";
  }>(mockCurrentPoll);
  const [pollResults] = useState(mockPollResults);
  const [stats] = useState(mockStats);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const handleStartPoll = async () => {
    setIsStarting(true);
    // Simulate API call
    setTimeout(() => {
      setCurrentPoll((prev) => ({
        ...prev,
        status: "active",
        startTime: Date.now(),
      }));
      setIsStarting(false);
    }, 1000);
  };

  const handleEndPoll = async () => {
    setIsEnding(true);
    // Simulate API call
    setTimeout(() => {
      setCurrentPoll((prev) => ({
        ...prev,
        status: "ended",
      }));
      setIsEnding(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Teacher Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <Link to="/history">
                <Button variant="secondary" className="border-gray-300">
                  View History
                </Button>
              </Link>
              <Button className="bg-primary hover:bg-primary-dark">
                Create New Poll
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <TeacherPollInterface
          poll={currentPoll}
          pollResults={pollResults}
          stats={stats}
          onStartPoll={handleStartPoll}
          onEndPoll={handleEndPoll}
          isStarting={isStarting}
          isEnding={isEnding}
        />
      </main>
    </div>
  );
};

export default TeacherDashboard;
