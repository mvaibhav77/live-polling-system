import { useNavigate } from "react-router-dom";
import { usePollCreation } from "../hooks/usePollCreation";
import { useGetPollStatusQuery } from "../store/api/pollApi";
import QuestionInput from "../components/QuestionInput";
import PollOptionsEditor from "../components/PollOptionsEditor";
import Pill from "../components/Pill";
import Button from "../components/Button";

function CreatePoll() {
  const navigate = useNavigate();

  // Get current poll status to determine if this is the first question
  const { data: pollStatus } = useGetPollStatusQuery();
  const totalQuestionsAsked = pollStatus?.stats?.totalQuestionsAsked || 0;
  const isFirstQuestion = totalQuestionsAsked === 0;

  const {
    question,
    timeLimit,
    options,
    validationErrors,
    isLoading,
    setQuestion,
    setTimeLimit,
    handleOptionChange,
    handleCorrectAnswerChange,
    addMoreOption,
    deleteOption,
    handleSubmit,
    isFormValid,
  } = usePollCreation();

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
                    questions, and monitor your students' responses in
                    real-time.
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
          <Button onClick={handleSubmit} disabled={isLoading || !isFormValid()}>
            {isLoading ? "Starting Poll..." : "Start Poll"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CreatePoll;
