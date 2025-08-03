import React, { useState } from "react";
import { useAppSelector } from "../../store/hooks";

interface ParticipantsTabProps {
  participants: string[];
  onKickStudent: (studentId: string, reason?: string) => void;
  isConnected: boolean;
  isTeacher?: boolean;
}

const ParticipantsTab: React.FC<ParticipantsTabProps> = ({
  participants,
  onKickStudent,
  isConnected,
  isTeacher: isTeacherProp,
}) => {
  const [kickingStudent, setKickingStudent] = useState<string | null>(null);
  const [kickReason, setKickReason] = useState("");

  const { currentStudent, students } = useAppSelector((state) => state.poll);

  // Determine if current user is teacher - use prop if provided, otherwise fallback to state
  const isTeacher =
    isTeacherProp !== undefined ? isTeacherProp : !currentStudent;

  const handleKickClick = (studentName: string) => {
    // Find the student ID from the students list
    const student = students.find((s) => s.name === studentName);
    if (student) {
      setKickingStudent(student.id);
      setKickReason("");
    }
  };

  const handleConfirmKick = () => {
    if (kickingStudent && kickReason.trim()) {
      onKickStudent(kickingStudent, kickReason.trim());
      setKickingStudent(null);
      setKickReason("");
    }
  };

  const handleCancelKick = () => {
    setKickingStudent(null);
    setKickReason("");
  };

  // Filter participants to separate teacher and students
  // Ensure participants is an array before filtering
  const safeParticipants = Array.isArray(participants) ? participants : [];
  const teacherParticipants = safeParticipants.filter(
    (name) => name === "Teacher"
  );
  const studentParticipants = safeParticipants.filter(
    (name) => name !== "Teacher"
  );

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Teacher Section */}
        {teacherParticipants.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Teacher</h3>
            <div className="space-y-2">
              {teacherParticipants.map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-2 bg-red-50 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-700">
                      {name}
                    </span>
                  </div>
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                    Host
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students Section */}
        {studentParticipants.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Students ({studentParticipants.length})
            </h3>
            <div className="space-y-2">
              {studentParticipants.map((name) => {
                const student = students.find((s) => s.name === name);
                const isKicking = kickingStudent === student?.id;

                return (
                  <div
                    key={name}
                    className="flex items-center justify-between p-2 bg-blue-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-accent">{name}</span>
                      {/* {student?.hasAnswered && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          Answered
                        </span>
                      )} */}
                    </div>

                    {isTeacher && student && (
                      <button
                        onClick={() => handleKickClick(name)}
                        disabled={!isConnected || isKicking}
                        className="cursor-pointer text-xs text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {safeParticipants.length === 0 && (
          <div className="text-center text-gray-500 text-sm">
            No participants yet.
          </div>
        )}
      </div>

      {/* Kick Confirmation Modal */}
      {kickingStudent && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">
              Remove Student
            </div>
            <div className="text-xs text-gray-500">
              Student will be disconnected and removed from the session.
            </div>
            <input
              type="text"
              value={kickReason}
              onChange={(e) => setKickReason(e.target.value)}
              placeholder="Reason for removal (required)"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              maxLength={100}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleConfirmKick}
                disabled={!kickReason.trim() || !isConnected}
                className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Remove
              </button>
              <button
                onClick={handleCancelKick}
                className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantsTab;
