import { useStudentSession } from "../hooks/useStudentSession";
import WaitingArea from "../components/WaitingArea";
import StudentPollInterface from "../components/StudentPollInterface";
import LoadingState from "../components/LoadingState";

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
    return <LoadingState />;
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

  // Calculate current question number using the corrected field
  const currentQuestionNumber = pollStatus.stats?.currentQuestionNumber || 1;

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
