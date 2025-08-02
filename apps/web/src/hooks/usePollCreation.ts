import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { useCreateAndStartPollMutation } from "../store/api/pollApi";
import { setCurrentJoinCode } from "../store/slices/teacherUISlice";
import { socketActions } from "../store/middleware/socketMiddleware";

export interface PollOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export const usePollCreation = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [createAndStartPoll, { isLoading, error }] =
    useCreateAndStartPollMutation();

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
      options.map((opt) => ({
        ...opt,
        isCorrect: opt.id === id ? isCorrect : opt.isCorrect,
      }))
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
    if (options.length <= 2) return;
    setOptions(options.filter((option) => option.id !== id));
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

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async () => {
    setValidationErrors([]);

    if (!validateForm()) {
      return;
    }

    try {
      // Connect to WebSocket first
      dispatch(socketActions.connect());
      dispatch(socketActions.joinTeacher());

      const pollData = {
        question: question.trim(),
        options: options
          .filter((opt) => opt.text.trim())
          .map((opt) => opt.text.trim()),
        timeLimit: timeLimit,
      };

      // Use both WebSocket and REST API for reliability
      // WebSocket for real-time updates, REST API for data persistence
      const result = await createAndStartPoll(pollData);

      if ("data" in result && result.data) {
        const poll = result.data;
        dispatch(setCurrentJoinCode(poll.pollId));

        // Also emit WebSocket events for real-time updates
        dispatch(
          socketActions.createPoll(
            pollData.question,
            pollData.options,
            pollData.timeLimit
          )
        );
        dispatch(socketActions.startPoll());

        navigate("/teacher/dashboard");
      } else {
        setValidationErrors(["Failed to start poll. Please try again."]);
      }
    } catch (error) {
      console.error("Failed to create and start poll:", error);
      setValidationErrors(["Failed to start poll. Please try again."]);
    }
  };

  const isFormValid = () => {
    return question.trim() && options.some((opt) => opt.text.trim());
  };

  return {
    // State
    question,
    timeLimit,
    options,
    validationErrors,
    isLoading,
    error,

    // Actions
    setQuestion,
    setTimeLimit,
    handleOptionChange,
    handleCorrectAnswerChange,
    addMoreOption,
    deleteOption,
    handleSubmit,
    isFormValid,
  };
};
