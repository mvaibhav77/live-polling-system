import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useWebSocket, useTeacher } from "../hooks/useWebSocket";
import QuestionInput from "../components/poll/QuestionInput";
import PollOptionsEditor from "../components/poll/PollOptionsEditor";
import Pill from "../components/common/Pill";
import Button from "../components/common/Button";

interface PollOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

function CreatePoll() {
  const navigate = useNavigate();
  const { connect, isConnected } = useWebSocket();
  const { currentPoll, pollStats, error, joinAsTeacher, createPoll } =
    useTeacher();

  // Form state
  const [question, setQuestion] = useState("");
  const [timeLimit, setTimeLimit] = useState(60);
  const [options, setOptions] = useState<PollOption[]>([
    { id: "1", text: "", isCorrect: false },
    { id: "2", text: "", isCorrect: false },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Connect to WebSocket and join as teacher
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [connect, isConnected]);

  useEffect(() => {
    if (isConnected) {
      joinAsTeacher();
    }
  }, [isConnected, joinAsTeacher]);

  // Navigate to dashboard when poll is created and started
  useEffect(() => {
    if (currentPoll?.status === "active") {
      navigate("/teacher/dashboard");
    }
  }, [currentPoll, navigate]);

  const totalQuestionsAsked = pollStats?.totalQuestionsAsked || 0;
  const isFirstQuestion = totalQuestionsAsked === 0;

  const handleOptionChange = (id: string, text: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, text } : opt)));
  };

  const handleCorrectAnswerChange = (id: string, isCorrect: boolean) => {
    setOptions(
      options.map((opt) => ({
        ...opt,
        isCorrect: opt.id === id ? isCorrect : false,
      }))
    );
  };

  const addMoreOption = () => {
    const newId = (options.length + 1).toString();
    setOptions([...options, { id: newId, text: "", isCorrect: false }]);
  };

  const deleteOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((opt) => opt.id !== id));
    }
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!question.trim()) {
      errors.push("Question is required");
    }

    const validOptions = options.filter((opt) => opt.text.trim());
    if (validOptions.length < 2) {
      errors.push("At least 2 options are required");
    }

    if (timeLimit < 10 || timeLimit > 300) {
      errors.push("Time limit must be between 10 and 300 seconds");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !isConnected) return;

    try {
      setIsLoading(true);

      // Create poll with only the text of options
      const optionTexts = options
        .filter((opt) => opt.text.trim())
        .map((opt) => opt.text.trim());

      // Create the poll via WebSocket
      createPoll(question.trim(), optionTexts, timeLimit);

      // Poll will be auto-started and we'll navigate via useEffect
    } catch (error) {
      console.error("Error creating poll:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      question.trim() &&
      options.filter((opt) => opt.text.trim()).length >= 2 &&
      timeLimit >= 10 &&
      timeLimit <= 300
    );
  };

  const viewHistory = () => {
    navigate("/history");
  };

  return (
    <div className="md:h-screen min-h-screen md:overflow-hidden w-full flex flex-col justify-between">
      <div className="md:pt-[8vh] md:px-[10vw] h-full h-max-[calc(100vh-8vh-88px)] overflow-y-scroll p-4 flex flex-col justify-between">
        <div className="md:max-w-3/5 w-full  flex flex-col items-stretch justify-around">
          {/* Header */}
          <div className="flex flex-col gap-6 items-start mb-8">
            <Pill />

            <div className="w-full flex flex-col gap-2">
              {isFirstQuestion ? (
                <>
                  <h1 className="text-5xl font-light tracking-tight">
                    Let's <span className="font-medium">Get Started</span>
                  </h1>
                  <p className="text-gray-600">
                    You'll have the ability to create and manage polls, ask
                    questions, and monitor your students' responses in real-time
                    via WebSocket.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-5xl font-light tracking-tight">
                    <span className="font-medium">Next Question</span>
                  </h1>
                  <p className="text-gray-600">
                    Continue engaging your students with another poll question.
                    Question #{totalQuestionsAsked + 1}
                  </p>
                </>
              )}
            </div>

            {/* Connection Status - only show when connecting */}
            {!isConnected && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">
                  Waking up the server...
                </span>
              </div>
            )}

            {/* Show errors */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Show validation errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <ul className="text-red-800 text-sm">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Question Input */}
          <QuestionInput
            question={question}
            timeLimit={timeLimit}
            onQuestionChange={setQuestion}
            onTimeLimitChange={setTimeLimit}
            validationErrors={validationErrors}
          />

          {/* Options Section */}
          <PollOptionsEditor
            options={options}
            onOptionChange={handleOptionChange}
            onCorrectAnswerChange={handleCorrectAnswerChange}
            onAddOption={addMoreOption}
            onDeleteOption={deleteOption}
          />
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="footer">
        <hr className="text-muted " />
        <div className="flex justify-between py-4 px-4 md:px-[10vw]">
          <Button variant="secondary" onClick={viewHistory}>
            View History
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !isFormValid() || !isConnected}
          >
            {isLoading ? "Creating Poll..." : "Create & Start Poll"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CreatePoll;
