import React from "react";
import Button from "../common/Button";

interface PollOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface PollOptionsEditorProps {
  options: PollOption[];
  onOptionChange: (id: string, text: string) => void;
  onCorrectAnswerChange: (id: string, isCorrect: boolean) => void;
  onAddOption: () => void;
  onDeleteOption: (id: string) => void;
}

const PollOptionsEditor: React.FC<PollOptionsEditorProps> = ({
  options,
  onOptionChange,
  onCorrectAnswerChange,
  onAddOption,
  onDeleteOption,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">Edit Options</h3>
        <h3 className="font-semibold text-gray-900">Is It Correct?</h3>
      </div>

      <div className="options">
        {options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-4 p-1.5">
            <div className="flex items-center gap-3 flex-1">
              {/* Numbered Circle with Delete Functionality */}
              <button
                onClick={() => onDeleteOption(option.id)}
                disabled={options.length <= 2}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 group ${
                  options.length <= 2
                    ? "bg-primary text-white cursor-not-allowed"
                    : "bg-primary text-white hover:bg-red-500 cursor-pointer"
                }`}
              >
                <span
                  className={`transition-all duration-200 ${
                    options.length <= 2 ? "block" : "group-hover:hidden"
                  }`}
                >
                  {index + 1}
                </span>
                {options.length > 2 && (
                  <svg
                    className="w-4 h-4 hidden group-hover:block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
              <input
                type="text"
                value={option.text}
                onChange={(e) => onOptionChange(option.id, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-4 py-3 bg-background"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name={`correct-${option.id}`}
                      checked={option.isCorrect}
                      onChange={() => onCorrectAnswerChange(option.id, true)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        option.isCorrect
                          ? "border-primary bg-primary"
                          : "border-gray-300 bg-white hover:border-primary"
                      }`}
                    >
                      {option.isCorrect && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name={`correct-${option.id}`}
                      checked={!option.isCorrect}
                      onChange={() => onCorrectAnswerChange(option.id, false)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        !option.isCorrect
                          ? "border-gray-400 bg-gray-400"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      {!option.isCorrect && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">No</span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button onClick={onAddOption} variant="secondary">
          + Add More option
        </Button>
      </div>
    </div>
  );
};

export default PollOptionsEditor;
