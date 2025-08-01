import { useStudentSession } from "../hooks/useStudentSession";
import WaitingArea from "../components/WaitingArea";
import StudentPollInterface from "../components/StudentPollInterface";

const PollArea = () => {
  const {
    student,
    pollStatus,
    pollResultsData,
    hasSubmitted,
    isSubmitting,
    isInitializing,
    handleSubmitAnswer,
  } = useStudentSession();

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

  // Show waiting area if no poll exists
  if (!pollStatus?.poll) {
    return <WaitingArea studentName={student.name} pollStatus={pollStatus} />;
  }

  // Determine if results should be shown
  const showResults =
    hasSubmitted ||
    pollStatus.poll.status === "ended" ||
    pollStatus.poll.status !== "active";

  // Calculate current question number based on total questions asked
  const currentQuestionNumber = pollStatus.stats?.totalQuestionsAsked || 1;

  return (
    <StudentPollInterface
      poll={{
        ...pollStatus.poll,
        questionNumber: currentQuestionNumber,
      }}
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
