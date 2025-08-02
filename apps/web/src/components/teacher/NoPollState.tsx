import React from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";

const NoPollState: React.FC = () => {
  return (
    <div className="flex items-center justify-center md:min-h-[calc(100vh-15rem)]">
      <div className="text-center py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          No Active Poll
        </h1>
        <p className="text-gray-600 mb-8">
          Create a new poll to start engaging with your students
        </p>
        <Link to="/teacher/create-poll">
          <Button>+ Ask a new question</Button>
        </Link>
      </div>
    </div>
  );
};

export default NoPollState;
