import { useState } from "react";
import Button from "../components/Button";
import Pill from "../components/Pill";
import { useNavigate } from "react-router-dom";

const StudentStarter: React.FC = () => {
  const [name, setName] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (name) {
      navigate("/poll", { state: { name } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-10 items-center text-center">
        {/* Top Pill */}
        <Pill />

        <div className="w-full mx-auto flex flex-col gap-2 items-center text-center">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-5xl font-light tracking-tight">
            Let's <span className="font-medium">Get Started</span>
          </h1>

          {/* Subheading */}
          <p className="text-muted text-lg">
            If you're a student, you'll be able to{" "}
            <span className="text-black font-semibold">
              submit your answers
            </span>
            , participate in live polls, and see how your responses compare with
            your classmates
          </p>
        </div>

        {/* input for name */}
        <div className="form-group flex flex-col items-center w-full max-w-lg">
          <label htmlFor="name" className="mb-2 self-start">
            Enter your name to start:
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border text-lg border-gray-300 rounded-lg p-4 w-full"
          />

          {/* Continue Button */}
          <Button
            className="mt-12"
            onClick={handleSubmit}
            type="submit"
            disabled={!name}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentStarter;
