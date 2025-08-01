import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import {
  createAndStartPoll,
  type Question,
} from "../store/slices/teacherSlice";
import { socketActions } from "../store/middleware/socketMiddleware";
import Pill from "../components/Pill";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

interface PollOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

function TeacherPage() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.teacher);
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [timeLimit, setTimeLimit] = useState(60);
  const [options, setOptions] = useState<PollOption[]>([
    { id: "1", text: "", isCorrect: false },
    { id: "2", text: "", isCorrect: false },
  ]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleOptionChange = (id: string, text: string) => {
    setOptions(
      options.map((option) => (option.id === id ? { ...option, text } : option))
    );
  };

  const handleCorrectAnswerChange = (id: string, isCorrect: boolean) => {
    setOptions(
      options.map((option) =>
        option.id === id ? { ...option, isCorrect } : option
      )
    );
  };

  const addMoreOption = () => {
    const newOption: PollOption = {
      id: Date.now().toString(),
      text: "",
      isCorrect: false,
    };
    setOptions([...options, newOption]);
  };

  const deleteOption = (id: string) => {
    // Don't allow deleting if there are only 2 options left
    if (options.length <= 2) return;

    setOptions(options.filter((option) => option.id !== id));
  };

  const handleSubmit = async () => {
    // Clear previous validation errors
    setValidationErrors([]);

    // Validation
    const errors: string[] = [];

    if (!question.trim()) {
      errors.push("Question is required");
    }

    const validOptions = options.filter((opt) => opt.text.trim());
    if (validOptions.length < 2) {
      errors.push("At least 2 options are required");
    }

    // const hasCorrectAnswer = options.some(
    //   (opt) => opt.isCorrect && opt.text.trim()
    // );
    // if (!hasCorrectAnswer) {
    //   errors.push("Please mark at least one option as correct");
    // }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      // Connect to socket for real-time features
      dispatch(socketActions.connect());

      // Create poll session and automatically start it
      const pollData: Question = {
        question: question.trim(),
        options: validOptions.map((opt) => opt.text.trim()),
        correctAnswer: validOptions.findIndex((opt) => opt.isCorrect),
        timeLimit: timeLimit,
      };
      const result = await dispatch(createAndStartPoll(pollData));

      if (createAndStartPoll.fulfilled.match(result)) {
        // Navigate to teacher dashboard to manage the session
        navigate("/teacher/dashboard");
      }
    } catch (error) {
      console.error("Failed to create and start poll:", error);
      setValidationErrors(["Failed to start poll. Please try again."]);
    }
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
              <h1 className="text-5xl font-light tracking-tight">
                Let's <span className="font-medium">Get Started</span>
              </h1>
              <p className="text-gray-600">
                You'll have the ability to create and manage polls, ask
                questions, and monitor your students' responses in real-time.
              </p>
            </div>
          </div>

          {/* Question Input */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block font-semibold text-gray-900">
                Enter your question
              </label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {question.length}/100
                </span>
                <div className="relative">
                  <select
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="appearance-none bg-background border border-gray-300 px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                  >
                    <option value={30}>30 seconds</option>
                    <option value={60}>60 seconds</option>
                    <option value={90}>90 seconds</option>
                    <option value={120}>120 seconds</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value.slice(0, 100))}
              placeholder="What is the capital of France?"
              className="w-full h-24 max-h-[250px] p-4 border border-gray-200 bg-background resize focus:ring-2focus:border-transparent"
            />

            {/* Validation Errors */}
            {(validationErrors.length > 0 || error) && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                {validationErrors.map((err, index) => (
                  <p key={index} className="text-red-600 text-sm">
                    {err}
                  </p>
                ))}
                {error && <p className="text-red-600 text-sm">{error}</p>}
              </div>
            )}
          </div>

          {/* Options Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Edit Options</h3>
              <h3 className="font-semibold text-gray-900">Is It Correct?</h3>
            </div>

            <div className="options">
              {options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-4 p-1.5">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Numbered Circle with Delete Functionality */}
                    <button
                      onClick={() => deleteOption(option.id)}
                      disabled={options.length <= 2}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 group ${
                        options.length <= 2
                          ? "bg-primary text-white cursor-not-allowed"
                          : "bg-primary text-white hover:bg-red-500 cursor-pointer"
                      }`}
                    >
                      <span
                        className={`transition-all duration-200 ${
                          options.length <= 2 ? "block" : "group-hover:hidden"
                        }`}
                      >
                        {index + 1}
                      </span>
                      {options.length > 2 && (
                        <svg
                          className="w-4 h-4 hidden group-hover:block"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </button>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) =>
                        handleOptionChange(option.id, e.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-4 py-3 bg-background"
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative">
                          <input
                            type="radio"
                            name={`correct-${option.id}`}
                            checked={option.isCorrect}
                            onChange={() => {
                              // Only one option can be correct
                              setOptions(
                                options.map((opt) => ({
                                  ...opt,
                                  isCorrect: opt.id === option.id,
                                }))
                              );
                            }}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              option.isCorrect
                                ? "border-primary bg-primary"
                                : "border-gray-300 bg-white hover:border-primary"
                            }`}
                          >
                            {option.isCorrect && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Yes
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative">
                          <input
                            type="radio"
                            name={`correct-${option.id}`}
                            checked={!option.isCorrect}
                            onChange={() =>
                              handleCorrectAnswerChange(option.id, false)
                            }
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              !option.isCorrect
                                ? "border-gray-400 bg-gray-400"
                                : "border-gray-300 bg-white hover:border-gray-400"
                            }`}
                          >
                            {!option.isCorrect && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          No
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button onClick={addMoreOption} variant="secondary">
                + Add More option
              </Button>
            </div>
          </div>
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
            disabled={
              isLoading ||
              !question.trim() ||
              options.every((opt) => !opt.text.trim())
            }
          >
            {isLoading ? "Starting Poll..." : "Start Poll"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TeacherPage;
