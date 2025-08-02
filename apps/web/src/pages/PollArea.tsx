import { useStudentSession } from "../hooks/useStudentSession";
import WaitingArea from "../components/student/WaitingArea";
import StudentPollInterface from "../components/student/StudentPollInterface";
import LoadingState from "../components/common/LoadingState";
import { ChatModal } from "../components/chat";

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
  const showResults = hasSubmitted || pollStatus.poll.status === "ended";

  return (
    <>
      <StudentPollInterface
        poll={{
          ...pollStatus.poll,
          questionNumber:
            pollStatus.poll.questionNumber ||
            pollStatus.stats?.currentQuestionNumber ||
            1,
        }}
        studentName={student.name}
        onSubmit={handleSubmitAnswer}
        isSubmitting={isSubmitting}
        hasSubmitted={hasSubmitted}
        pollResults={pollResultsData?.results || null}
        showResults={showResults}
      />

      {/* Chat Modal */}
      <ChatModal />
    </>
  );
};

export default PollArea;
