import { useState } from "react";
import Button from "../components/common/Button";
import Pill from "../components/common/Pill";
import { useNavigate } from "react-router-dom";

type SelectionCardProps = {
  title: string;
  description: string;
  onClick: () => void;
  isActive?: boolean;
};

const SelectionCard: React.FC<SelectionCardProps> = ({
  title,
  description,
  onClick: handleClick,
  isActive = false,
}) => (
  <button
    className={`w-full text-left border border-muted/20 rounded-lg px-6 py-8 hover:border-accent hover:bg-background transition-colors cursor-pointer ${isActive ? "outline-none ring-2 ring-accent" : ""}`}
    onClick={handleClick}
  >
    <h3 className="font-bold text-foreground text-xl">{title}</h3>
    <p className="text-muted mt-2">{description}</p>
  </button>
);

const HomePage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (selectedRole === "student") {
      navigate("/student/get-started");
    } else if (selectedRole === "teacher") {
      navigate("/teacher/create-poll");
    } else {
      alert("Please select a role to continue.");
    }
  };

  return (
    <div className="text-light min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 items-center text-center">
        {/* Top Pill */}
        <Pill />

        <div className="w-full mx-auto flex flex-col gap-2 items-center text-center">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-5xl font-light tracking-tight">
            Welcome to the{" "}
            <span className="font-medium">Live Polling System</span>
          </h1>

          {/* Subheading */}
          <p className="text-muted text-lg">
            Please select the role that best describes you to begin using the
            live polling system
          </p>
        </div>

        {/* Selection Cards */}
        <div className="flex flex-col md:flex-row gap-6 mt-6 w-full justify-center">
          <SelectionCard
            title="I am a Student"
            description="Participate in polls, submit your answers in real-time, and see live results after."
            onClick={() => setSelectedRole("student")}
            isActive={selectedRole === "student"}
          />
          <SelectionCard
            title="I am a Teacher"
            description="Create new polls, ask questions to your students, and view live polling results."
            onClick={() => setSelectedRole("teacher")}
            isActive={selectedRole === "teacher"}
          />
        </div>

        {/* Continue Button */}
        <Button
          className="mt-6"
          onClick={handleNavigate}
          disabled={!selectedRole}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
