import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DetailAnswerOptions = React.memo(
  ({ options, userAnswer, correctAnswer }) => {
    if (!options || options.length === 0) {
      return <p className="text-gray-500 mt-4">Không có tùy chọn đáp án.</p>;
    }

    const getOptionLetter = (option) => {
      if (option.length === 1 && /[A-D]/.test(option)) {
        return option;
      }
      return option.split(".")[0].trim();
    };

    const isCorrectOverall = userAnswer === correctAnswer;

    return (
      <div className="space-y-2">
        {options.map((option, index) => {
          let style = "border-gray-300 bg-gray-100";
          let icon = null;

          const optionLetter = getOptionLetter(option);
          const isThisTheCorrectAnswer = optionLetter === correctAnswer;
          const isThisTheUserAnswer = optionLetter === userAnswer;

          if (isThisTheCorrectAnswer) {
            style = "border-green-500 bg-green-600";
            icon = (
              <FontAwesomeIcon
                icon="fa-solid fa-check"
                style={{ color: "white" }}
                size="md"
              />
            );
          } else if (isThisTheUserAnswer && !isCorrectOverall) {
            style = "border-red-500 bg-red-600";
            icon = (
              <FontAwesomeIcon
                icon="fa-solid fa-xmark"
                style={{ color: "white" }}
                size="md"
              />
            );
          }

          return (
            <div key={index} className="flex w-full items-center gap-3">
              <span
                className={`flex w-5 h-5 p-2 items-center justify-center rounded-sm border-2 transition-all ${style}`}
              >
                {icon}
              </span>
              <span className="flex flex-wrap">{option}</span>
            </div>
          );
        })}
      </div>
    );
  }
);

export default DetailAnswerOptions;
