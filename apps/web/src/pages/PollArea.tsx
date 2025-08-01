import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../store/store";
import { useGetPollStatusQuery } from "../store/api/pollApi";
import WaitingArea from "../components/WaitingArea";

const PollArea = () => {
  const navigate = useNavigate();
  const student = useSelector(
    (state: RootState) => state.studentUI.currentStudent
  );
 const { data: pollStatus } = useGetPollStatusQuery(undefined, {
    pollingInterval: 2000, // Poll every 2 seconds
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // Redirect if student hasn't joined
  useEffect(() => {
    if (!student.hasJoined || !student.id) {
      navigate("/student");
    }
  }, [student.hasJoined, student.id, navigate]);


  if (!pollStatus?.poll || pollStatus.poll.status !== "active") {
    return <WaitingArea studentName={student.name} pollStatus={pollStatus} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {pollStatus.poll.question}
            </h1>
            <p className="text-gray-600">
              Welcome, {student.name}! Select your answer below:
            </p>
          </div>

          <div className="space-y-3">
            {pollStatus.poll.options.map((option, index) => (
              <button
                key={index}
                className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                onClick={() => {
                  // TODO: Implement answer submission
                  console.log(`Selected option ${index}: ${option}`);
                }}
              >
                <span className="font-medium">Option {index + 1}:</span>{" "}
                {option}
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Poll Status:{" "}
              <span className="font-medium capitalize">
                {pollStatus.poll.status}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollArea;
