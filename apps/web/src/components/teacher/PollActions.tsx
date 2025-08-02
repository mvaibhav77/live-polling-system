import React from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";

interface PollActionsProps {
  status: "waiting" | "active" | "ended";
  isEndingPoll: boolean;
  onEndPoll: () => void;
}

const PollActions: React.FC<PollActionsProps> = ({
  status,
  isEndingPoll,
  onEndPoll,
}) => {
  return (
    <div className="flex justify-end mt-8">
      {status === "active" ? (
        <Button
          onClick={onEndPoll}
          disabled={isEndingPoll}
          className="bg-red-600 hover:bg-red-700"
        >
          {isEndingPoll ? "Ending..." : "End Poll"}
        </Button>
      ) : status === "ended" ? (
        <Link to="/teacher/create-poll">
          <Button className="bg-primary hover:bg-primary-dark px-8">
            + Ask a new question
          </Button>
        </Link>
      ) : (
        <div className="text-center text-gray-600">
          Poll is waiting to be started...
        </div>
      )}
    </div>
  );
};

export default PollActions;
