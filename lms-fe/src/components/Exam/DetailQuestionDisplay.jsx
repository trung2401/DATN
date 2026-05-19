import React, { useState } from "react";
import AudioPlayer from "./AudioPlayer";
import DetailAnswerOptions from "./DetailAnswerOptions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DetailQuestionDisplay = ({
  part,
  questionData,
  userAnswer,
  correctAnswer,
}) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const toggleTranscript = () => {
    setShowTranscript(!showTranscript);
  };
  const audioSrc = questionData.audio || "";
  const renderAnswerOptions = () => (
    <DetailAnswerOptions
      options={questionData.options}
      userAnswer={userAnswer}
      correctAnswer={correctAnswer}
    />
  );

  const renderTranscriptToggle = () =>
    questionData.transcript && (
      <div className="mt-4">
        <button
          onClick={toggleTranscript}
          className="w-full flex justify-between items-center text-left text-gray-800 font-semibold cursor-pointer p-2 rounded-md hover:bg-gray-100"
        >
          <span>Giải thích đáp án</span>
          <FontAwesomeIcon
            icon="fa-solid fa-caret-down"
            className={`transform transition-transform duration-300 ${
              showTranscript ? "rotate-180" : ""
            }`}
          />
        </button>
        {showTranscript && (
          <div className="p-3 rounded-lg mt-2 border border-gray-200 text-sm text-gray-800 whitespace-pre-line">
            {questionData.transcript}
          </div>
        )}
      </div>
    );

  if (part === 1) {
    return (
      <div className="w-full h-full flex flex-col lg:flex-row gap-6 px-2 lg:px-3 overflow-x-hidden">
        <div className="w-full lg:w-4/6 flex flex-col gap-2 border-2 border-gray-300 p-3 rounded-lg">
          {audioSrc && <AudioPlayer audioSrc={audioSrc} autoPlay={false} />}
          <p className="text-gray-600 text-center">
            Refer to the following conversation
          </p>
          <div className="w-full border-2 border-gray-300 p-3 rounded-lg">
            <img
              src={questionData.image || ""}
              alt="Question"
              className="w-full max-h-[300px] object-contain rounded-lg shadow-md"
            />
          </div>
        </div>

        <div className="w-full lg:w-2/6 flex flex-col gap-2">
          <p className="text-md font-bold mb-2 flex items-center gap-1.5">
            <FontAwesomeIcon
              icon="fa-regular fa-bookmark"
              style={{ color: "#25B379" }}
            />
            {parseInt(questionData.idQuestion) + 1}.
          </p>
          {renderAnswerOptions()}
          {renderTranscriptToggle()}
        </div>
      </div>
    );
  }

  if (part === 2) {
    return (
      <div className="w-full max-w-xl mx-auto flex flex-col gap-2">
        {audioSrc && <AudioPlayer audioSrc={audioSrc} autoPlay={false} />}
        <p className="text-md font-bold mb-2 flex items-center gap-1.5">
          <FontAwesomeIcon
            icon="fa-regular fa-bookmark"
            style={{ color: "#25B379" }}
          />
          {parseInt(questionData.idQuestion) + 1}. {questionData.questionText}
        </p>
        {renderAnswerOptions()}
        {renderTranscriptToggle()}
      </div>
    );
  }

  if (part === 3 || part === 4) {
    return (
      <div className="w-full p-4 flex flex-col gap-4">
        {questionData.image ? (
          <div className="w-full flex gap-4">
            <div className="w-full flex flex-col items-center justify-center gap-2">
              {audioSrc && <AudioPlayer audioSrc={audioSrc} autoPlay={false} />}
              <p className="text-gray-600 text-center">
                Refer to the following conversation
              </p>
              <div className="w-full flex items-center p-2 justify-center border border-gray-300 rounded-lg bg-gray-50">
                <img
                  src={questionData.image}
                  alt="Question Graphic"
                  className="max-h-48 w-auto object-contain"
                />
              </div>
            </div>
            <div className="w-full flex flex-col justify-center">
              <p className="text-md font-bold mb-2 flex items-center gap-1.5">
                <FontAwesomeIcon
                  icon="fa-regular fa-bookmark"
                  style={{ color: "#25B379" }}
                />
                {parseInt(questionData.idQuestion) + 1}.{" "}
                {questionData.questionText}
              </p>
              {renderAnswerOptions()}
              {renderTranscriptToggle()}
            </div>
          </div>
        ) : (
          <div className="w-full mx-auto max-w-2xl flex flex-col justify-center gap-2">
            {audioSrc && <AudioPlayer audioSrc={audioSrc} autoPlay={false} />}
            <p className="text-md font-bold mb-2 flex items-center gap-1.5">
              <FontAwesomeIcon
                icon="fa-regular fa-bookmark"
                style={{ color: "#25B379" }}
              />
              {parseInt(questionData.idQuestion) + 1}.{" "}
              {questionData.questionText}
            </p>
            {renderAnswerOptions()}
            {renderTranscriptToggle()}
          </div>
        )}
      </div>
    );
  }

  if (part === 5) {
    return (
      <div className="w-full flex flex-col gap-1 p-4">
        <p className="text-md font-bold mb-2 flex items-center gap-1.5">
          <FontAwesomeIcon
            icon="fa-regular fa-bookmark"
            style={{ color: "#25B379" }}
          />
          {parseInt(questionData.idQuestion) + 1}. {questionData.questionText}
        </p>
        {renderAnswerOptions()}
      </div>
    );
  }

  if (part === 6 || part === 7) {
    return (
      <div className="w-full flex flex-col lg:flex-row p-4 gap-4">
        <div className="w-full lg:w-2/3 h-full flex items-center justify-center p-3 border border-gray-300 rounded-lg bg-gray-50 overflow-auto">
          {questionData.image ? (
            <img
              src={questionData.image}
              alt="Passage"
              className="w-full max-h-[420px] object-contain rounded-lg"
            />
          ) : (
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {questionData.passageText}
            </div>
          )}
        </div>
        <div className="w-full lg:w-1/3 flex flex-col gap-2">
          <p className="text-md font-bold mb-2 flex items-center gap-1.5">
            <FontAwesomeIcon
              icon="fa-regular fa-bookmark"
              style={{ color: "#25B379" }}
            />
            {questionData.idQuestion + 1}. {questionData.questionText}
          </p>
          {renderAnswerOptions()}
          {renderTranscriptToggle()}
        </div>
      </div>
    );
  }

};

export default DetailQuestionDisplay;
