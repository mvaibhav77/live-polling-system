import React from "react";
import Pill from "../common/Pill";

const KickedOut: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className=" p-8 max-w-3xl w-full text-center">
        <div className="mb-6">
          {/* Intervue badge */}
          <div className="flex justify-center mb-6">
            <Pill />
          </div>

          <h1 className="text-4xl font-medium text-gray-900 ">
            You've been Kicked out !
          </h1>

          <p className="text-gray-600 leading-relaxed">
            Looks like the teacher had removed you from the poll system. Please
            try again sometime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KickedOut;
