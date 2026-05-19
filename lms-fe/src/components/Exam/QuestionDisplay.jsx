import React from "react";
import AudioPlayer from "./AudioPlayer";
import AnswerOptions from "./AnswerOptions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const QuestionDisplay = ({
  part,
  questionData,
  userAnswers,
  onAnswer,
  handleNext,
}) => {
  const audioSrc = questionData.mediaFiles?.audio || questionData.audio || "";

  const inferSharedImage = (listQuestion = [], fallbackImage = null) => {
    const imageList = listQuestion
      .map((q) => q?.mediaFiles?.image)
      .filter(Boolean);

    if (imageList.length === 0) return fallbackImage || null;

    const freqMap = imageList.reduce((acc, img) => {
      acc[img] = (acc[img] || 0) + 1;
      return acc;
    }, {});

    const [mostFrequentImage, count] = Object.entries(freqMap).sort(
      (a, b) => b[1] - a[1]
    )[0];

    if (count > 1) return mostFrequentImage;

    return fallbackImage || null;
  };

  if (part === 1) {
    const idQuestion = questionData.questionNumber;
    const image = questionData.mediaFiles?.image;

    return (
      <div className="w-full h-full flex flex-col gap-6 p-4 lg:p-5">
        {audioSrc ? (
          <div className="hidden">
            <AudioPlayer
              audioSrc={audioSrc}
              autoPlay={true}
              handleNext={handleNext}
              part={part}
            />
          </div>
        ) : (
          <p className="text-red-600 font-semibold text-md">
            Không có âm thanh
          </p>
        )}
        <div className="w-full h-full flex flex-col lg:flex-row gap-8 lg:gap-10 mx-2 lg:mx-3">
          <div className="w-full h-full max-h-[55vh] lg:max-h-[75vh] lg:w-1/2 border-2 border-gray-300 p-3 lg:p-4 rounded-lg">
            <img
              src={image}
              alt="Question"
              className="mb-4 w-full h-full object-contain"
            />
          </div>
          <div key={idQuestion} className="w-full h-full lg:w-1/2">
            <p className="text-md font-bold mb-2 flex items-center gap-1.5">
              <FontAwesomeIcon
                icon="fa-regular fa-bookmark"
                style={{ color: "#25B379" }}
              />{" "}
              {parseInt(idQuestion) + 1}.
            </p>
            <AnswerOptions
              options={["A", "B", "C", "D"]}
              selected={userAnswers[idQuestion] || ""}
              onChange={(answer) => onAnswer(idQuestion, answer)}
            />
          </div>
        </div>
      </div>
    );
  } else if (part === 2) {
    const idQuestion = questionData.questionNumber;

    return (
      <div className="w-full h-full py-4 lg:py-5 px-4 lg:px-6">
        {audioSrc ? (
          <div className="hidden">
            <AudioPlayer
              audioSrc={audioSrc}
              autoPlay={true}
              handleNext={handleNext}
              part={part}
            />
          </div>
        ) : (
          <p className="text-red-600 font-semibold text-md">
            Không có âm thanh
          </p>
        )}
        <div key={idQuestion} className="mb-3">
          <p className="text-md font-bold mb-2 flex items-center gap-1.5">
            <FontAwesomeIcon
              icon="fa-regular fa-bookmark"
              style={{ color: "#25B379" }}
            />{" "}
            {parseInt(idQuestion) + 1}.
          </p>
          <AnswerOptions
            options={["A", "B", "C"]}
            selected={userAnswers[idQuestion] || ""}
            onChange={(answer) => onAnswer(idQuestion, answer)}
          />
        </div>
      </div>
    );
  } else if (part === 3 || part === 4) {
    const groupImage = questionData.image;
    const groupAudioSrc = questionData.audio;
    const transformedListQuestion = questionData.listQuestion?.map((q) => ({
      idQuestion: q.questionNumber,
      questionText: q.questionText,
      answerA: q.options[0],
      answerB: q.options[1],
      answerC: q.options[2],
      answerD: q.options[3],
      questionImage: q.mediaFiles?.image || null,
    }));

    return (
      <div className="w-full h-full p-4 lg:p-5 flex flex-col gap-4">
        {groupAudioSrc ? (
          <div className="hidden">
            <AudioPlayer
              audioSrc={groupAudioSrc}
              autoPlay={true}
              handleNext={handleNext}
              part={part}
            />
          </div>
        ) : (
          <p className="text-red-600 font-semibold text-md">
            Không có âm thanh
          </p>
        )}
        {groupImage ? (
          <div className="w-full h-full flex flex-col lg:flex-row xl:flex-row gap-8 lg:gap-10 max-h-[75vh]">
            <div className="w-full lg:w-1/2 xl:w-1/2 h-full max-h-[70vh] lg:max-h-[75vh] flex items-center p-2 justify-center border-2 border-gray-300 rounded-lg">
              <img
                src={groupImage}
                alt="Question"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="w-full lg:w-1/2 xl:w-1/2 flex flex-col px-2 max-h-[70vh] lg:max-h-[75vh] overflow-y-auto lg:px-3">
              {transformedListQuestion?.map((q) => {
                const currentAnswerChar = userAnswers[q.idQuestion] || "";
                let selectedValueForOptions = "";
                if (currentAnswerChar === "A")
                  selectedValueForOptions = q.answerA;
                else if (currentAnswerChar === "B")
                  selectedValueForOptions = q.answerB;
                else if (currentAnswerChar === "C")
                  selectedValueForOptions = q.answerC;
                else if (currentAnswerChar === "D")
                  selectedValueForOptions = q.answerD;
                return (
                  <div key={q.idQuestion} className="mb-3">
                    {q.questionImage ? (
                      <div className="w-full mb-2 border border-gray-300 rounded-lg p-2">
                        <img
                          src={q.questionImage}
                          alt={`Question ${parseInt(q.idQuestion) + 1}`}
                          className="w-full h-auto object-contain max-h-[260px]"
                        />
                      </div>
                    ) : null}
                    <p className="text-md font-bold mb-2 flex items-center gap-1.5">
                      <FontAwesomeIcon
                        icon="fa-regular fa-bookmark"
                        style={{ color: "#25B379" }}
                      />
                      {parseInt(q.idQuestion) + 1}. {q.questionText}
                    </p>
                    <AnswerOptions
                      options={[
                        q.answerA,
                        q.answerB,
                        q.answerC,
                        q.answerD,
                      ].filter(Boolean)}
                      selected={selectedValueForOptions}
                      onChange={(answer) => onAnswer(q.idQuestion, answer)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col px-2">
            {transformedListQuestion?.map((q) => {
              const currentAnswerChar = userAnswers[q.idQuestion] || "";
              let selectedValueForOptions = "";
              if (currentAnswerChar === "A")
                selectedValueForOptions = q.answerA;
              else if (currentAnswerChar === "B")
                selectedValueForOptions = q.answerB;
              else if (currentAnswerChar === "C")
                selectedValueForOptions = q.answerC;
              else if (currentAnswerChar === "D")
                selectedValueForOptions = q.answerD;
              return (
                <div key={q.idQuestion} className="mb-3">
                  {q.questionImage ? (
                    <div className="w-full mb-2 border border-gray-300 rounded-lg p-2">
                      <img
                        src={q.questionImage}
                        alt={`Question ${parseInt(q.idQuestion) + 1}`}
                        className="w-full h-auto object-contain max-h-[260px]"
                      />
                    </div>
                  ) : null}
                  <p className="text-md font-bold mb-2 flex items-center gap-1.5">
                    <FontAwesomeIcon
                      icon="fa-regular fa-bookmark"
                      style={{ color: "#25B379" }}
                    />
                    {parseInt(q.idQuestion) + 1}. {q.questionText}
                  </p>
                  <AnswerOptions
                    options={[
                      q.answerA,
                      q.answerB,
                      q.answerC,
                      q.answerD,
                    ].filter(Boolean)}
                    selected={selectedValueForOptions}
                    onChange={(answer) => onAnswer(q.idQuestion, answer)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  } else if (part === 5) {
    const idQuestion = questionData.questionNumber;
    const text = questionData.questionText;
    const [answerA, answerB, answerC, answerD] = questionData.options;
    const image = questionData.mediaFiles?.image;

    const currentAnswerChar = userAnswers[idQuestion] || "";
    let selectedValueForOptions = "";
    if (currentAnswerChar === "A") selectedValueForOptions = answerA;
    else if (currentAnswerChar === "B") selectedValueForOptions = answerB;
    else if (currentAnswerChar === "C") selectedValueForOptions = answerC;
    else if (currentAnswerChar === "D") selectedValueForOptions = answerD;

    return (
      <div className="h-full flex flex-col mx-3 lg:mx-4 p-3 lg:p-4">
        {image ? (
          <div className="w-full mb-4 border-2 border-gray-300 p-3 rounded-lg max-h-[45vh] flex items-center justify-center">
            <img src={image} alt="Question" className="w-full h-full object-contain" />
          </div>
        ) : null}
        <p className="w-full text-md font-bold mb-2 flex items-center gap-2.5 lg:gap-1.5">
          <FontAwesomeIcon
            icon="fa-regular fa-bookmark"
            style={{ color: "#25B379" }}
          />
          {parseInt(idQuestion) + 1}. {text}
        </p>
        <AnswerOptions
          options={[answerA, answerB, answerC, answerD].filter(Boolean)}
          selected={selectedValueForOptions}
          onChange={(answer) => onAnswer(idQuestion, answer)}
        />
      </div>
    );
  } else if (part === 6) {
    const sharedPassageImage = inferSharedImage(
      questionData.listQuestion,
      questionData.image
    );

    const transformedListQuestion = questionData.listQuestion?.map((q) => ({
      idQuestion: q.questionNumber,
      questionText: "",
      answerA: q.options[0],
      answerB: q.options[1],
      answerC: q.options[2],
      answerD: q.options[3],
      questionImage:
        q.mediaFiles?.image && q.mediaFiles?.image !== sharedPassageImage
          ? q.mediaFiles.image
          : null,
    }));
    const passageText = questionData.questionText;
    const passageImage = sharedPassageImage;
    const questionRange = transformedListQuestion?.length
      ? `${parseInt(transformedListQuestion[0].idQuestion) + 1} - ${
          parseInt(
            transformedListQuestion[transformedListQuestion.length - 1]
              .idQuestion
          ) + 1
        }`
      : "";

    return (
      <div className="w-full max-h-screen flex flex-col px-2">
        <h2 className="text-lg lg:text-lg font-semibold mb-2">
          Questions {questionRange} refer to the following text.
        </h2>
        <div className="w-full flex flex-col lg:flex-row xl:flex-row gap-4 lg:gap-5 max-h-[75vh]">
          <div className="w-full lg:w-2/3 xl:w-2/3 mb-4 lg:mb-6 p-3 lg:p-4 border-2 border-gray-300 bg-gray-50 rounded-lg hide-scrollbar overflow-y-auto max-h-[65vh] lg:max-h-[75vh]">
            {passageImage ? (
              <img src={passageImage} alt="Passage" className="w-full h-auto object-contain" />
            ) : (
              <p className="whitespace-pre-line text-md">{passageText}</p>
            )}
          </div>
          <div className="w-full lg:w-1/3 xl:w-1/3 flex flex-col mx-2 lg:mx-3 overflow-y-auto max-h-[70vh] lg:max-h-[75vh]">
            {transformedListQuestion?.map((q) => {
              const currentAnswerChar = userAnswers[q.idQuestion] || "";
              let selectedValueForOptions = "";
              if (currentAnswerChar === "A")
                selectedValueForOptions = q.answerA;
              else if (currentAnswerChar === "B")
                selectedValueForOptions = q.answerB;
              else if (currentAnswerChar === "C")
                selectedValueForOptions = q.answerC;
              else if (currentAnswerChar === "D")
                selectedValueForOptions = q.answerD;
              return (
                <div key={q.idQuestion} className="mb-3">
                  {q.questionImage ? (
                    <div className="w-full mb-2 border border-gray-300 rounded-lg p-2">
                      <img
                        src={q.questionImage}
                        alt={`Question ${parseInt(q.idQuestion) + 1}`}
                        className="w-full h-auto object-contain max-h-[220px]"
                      />
                    </div>
                  ) : null}
                  <p className="text-md font-bold mb-2 flex items-center gap-1.5">
                    <FontAwesomeIcon
                      icon="fa-regular fa-bookmark"
                      style={{ color: "#25B379" }}
                    />
                    {parseInt(q.idQuestion) + 1}.
                  </p>
                  <AnswerOptions
                    options={[
                      q.answerA,
                      q.answerB,
                      q.answerC,
                      q.answerD,
                    ].filter(Boolean)}
                    selected={selectedValueForOptions}
                    onChange={(answer) => onAnswer(q.idQuestion, answer)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  } else if (part === 7) {
    const sharedPassageImage = inferSharedImage(
      questionData.listQuestion,
      questionData.image
    );

    const transformedListQuestion = questionData.listQuestion?.map((q) => ({
      idQuestion: q.questionNumber,
      questionText: q.questionText,
      answerA: q.options[0],
      answerB: q.options[1],
      answerC: q.options[2],
      answerD: q.options[3],
      questionImage:
        q.mediaFiles?.image && q.mediaFiles?.image !== sharedPassageImage
          ? q.mediaFiles.image
          : null,
    }));
    const passageText = questionData.questionText;
    const passageImage = sharedPassageImage;
    const questionRange = transformedListQuestion?.length
      ? `${parseInt(transformedListQuestion[0].idQuestion) + 1} - ${
          parseInt(
            transformedListQuestion[transformedListQuestion.length - 1]
              .idQuestion
          ) + 1
        }`
      : "";

    return (
      <div className="w-full max-h-screen flex flex-col px-2">
        <h2 className="text-lg lg:text-lg font-semibold mb-2">
          Questions {questionRange} refer to the following text.
        </h2>
        <div className="w-full flex flex-col lg:flex-row xl:flex-row gap-4 lg:gap-5 max-h-[75vh]">
          <div className="w-full lg:w-2/3 xl:w-2/3 mb-4 lg:mb-6 p-3 lg:p-4 border-2 border-gray-300 bg-gray-50 rounded-lg hide-scrollbar overflow-y-auto max-h-[65vh] lg:max-h-[75vh]">
            {passageImage ? (
              <img src={passageImage} alt="Passage" className="w-full h-auto object-contain" />
            ) : (
              <p className="whitespace-pre-line text-md">{passageText}</p>
            )}
          </div>
          <div className="w-full lg:w-1/3 xl:w-1/3 flex flex-col mx-2 lg:mx-3 overflow-y-auto max-h-[70vh] lg:max-h-[75vh]">
            {transformedListQuestion?.map((q) => {
              const currentAnswerChar = userAnswers[q.idQuestion] || "";
              let selectedValueForOptions = "";
              if (currentAnswerChar === "A")
                selectedValueForOptions = q.answerA;
              else if (currentAnswerChar === "B")
                selectedValueForOptions = q.answerB;
              else if (currentAnswerChar === "C")
                selectedValueForOptions = q.answerC;
              else if (currentAnswerChar === "D")
                selectedValueForOptions = q.answerD;
              return (
                <div key={q.idQuestion} className="mb-3">
                  {q.questionImage ? (
                    <div className="w-full mb-2 border border-gray-300 rounded-lg p-2">
                      <img
                        src={q.questionImage}
                        alt={`Question ${parseInt(q.idQuestion) + 1}`}
                        className="w-full h-auto object-contain max-h-[220px]"
                      />
                    </div>
                  ) : null}
                  <p className="text-md font-bold mb-2 flex items-center gap-1.5">
                    <FontAwesomeIcon
                      icon="fa-regular fa-bookmark"
                      style={{ color: "#25B379" }}
                    />
                    {parseInt(q.idQuestion) + 1}. {q.questionText}
                  </p>
                  <AnswerOptions
                    options={[
                      q.answerA,
                      q.answerB,
                      q.answerC,
                      q.answerD,
                    ].filter(Boolean)}
                    selected={selectedValueForOptions}
                    onChange={(answer) => onAnswer(q.idQuestion, answer)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  return <p className="text-red-600 text-md">Phần không hợp lệ: {part}</p>;
};

export default QuestionDisplay;
