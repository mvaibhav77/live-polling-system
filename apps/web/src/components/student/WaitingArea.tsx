import { ChatModal } from "../chat";
import Pill from "../common/Pill";
import Spinner from "../common/Spinner";

interface WaitingAreaProps {
  studentName?: string;
  pollStatus?: {
    stats: {
      sessionStudentsCount: number;
      totalQuestionsAsked: number;
    };
  };
}

const WaitingArea: React.FC<WaitingAreaProps> = ({
  studentName,
  pollStatus,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans p-4">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-10 items-center text-center">
        {/* Top Pill */}
        <Pill />

        {/* Loading Spinner */}
        <div className="flex justify-center">
          <Spinner size="md" variant="primary" />
        </div>

        {/* Main Message */}
        <div className="text-center">
          <h2 className="text-3xl font-medium text-gray-800">
            Wait for the teacher to ask questions..
          </h2>
          {studentName && (
            <p className="text-gray-500 mt-2">
              Welcome, {studentName}! You're all set.
            </p>
          )}

          {/* Show session stats if available */}
          {pollStatus?.stats && (
            <div className="mt-4 text-sm text-gray-400">
              {pollStatus.stats.sessionStudentsCount > 0 && (
                <p>
                  {pollStatus.stats.sessionStudentsCount} student
                  {pollStatus.stats.sessionStudentsCount !== 1 ? "s" : ""}{" "}
                  waiting
                </p>
              )}
              {pollStatus.stats.totalQuestionsAsked > 0 && (
                <p>
                  Questions asked so far: {pollStatus.stats.totalQuestionsAsked}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <ChatModal />
    </div>
  );
};

export default WaitingArea;
