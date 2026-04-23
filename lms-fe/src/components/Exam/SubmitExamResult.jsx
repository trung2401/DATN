import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
const image_result = "https://pub-e860ef97c13d407c808df35aa1a698c7.r2.dev/material-web-app/6.png"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../Button";
import { Link } from "react-router-dom";
import DetailExamResult from "./DetailExamResult";
import { fetchUserInfo } from "../../redux/slice/userSlice";

const SubmitExamResult = () => {
  const [activePart, setActivePart] = useState(1);
  const [showDetailPart, setShowDetailPart] = useState(false);
  const [showDetailResultExam, setShowDetailResultExam] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    submitResult,
    submitError,
    loading: examLoading,
  } = useSelector((state) => state.exam || {});
  const { userInfo } = useSelector((state) => state.user);
  const userName = userInfo?.userName || "N/A";

  const result = submitResult;
  const timeSpent = result?.timeSpent || "N/A";
  const completedDate = result?.completedDate || "N/A";
  const listeningScore = result?.listeningScore || 0;
  const readingScore = result?.readingScore || 0;
  const totalScore = result?.totalScore || 0;
  const questionResults = result?.questionResults || [];
  const totalQuestions = result?.totalQuestions || 200;

  useEffect(() => {
    dispatch(fetchUserInfo());
  }, [dispatch]);

  const partData = questionResults.reduce(
    (acc, item) => {
      const partNumber = item.partNumber;
      if (!acc[partNumber]) {
        acc[partNumber] = [];
      }
      acc[partNumber].push({
        id: item.questionNumber + 1,
        testName: result.testName,
        correctAnswer: item.correctAnswer || "N/A",
        userAnswer: item.userAnswer || "N/A",
        part: item.partNumber,
        correct: item.isCorrect,
        questionId: item.questionId,
        questionData: {
          idQuestion: item.questionNumber,
          questionText: item.questionText || "",
          options: item.options || [],
          transcript: item.transcript || "",
          image: item.mediaFiles?.image || null,
          audio: item.mediaFiles?.audio || null,
          passageText: item.mediaFiles?.text || null,
        },
      });
      return acc;
    },
    { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }
  );

  const totalSubmittedAnswers = questionResults.filter(
    (item) =>
      item.userAnswer && item.userAnswer !== "N/A" && item.userAnswer !== ""
  ).length;
  const correctAnswers = questionResults.filter(
    (item) => item.isCorrect
  ).length;
  const skippedAnswers = totalQuestions - totalSubmittedAnswers;
  const incorrectAnswers = totalSubmittedAnswers - correctAnswers;

  const listeningCorrect = questionResults.filter(
    (item) => item.partNumber >= 1 && item.partNumber <= 4 && item.isCorrect
  ).length;
  const readingCorrect = questionResults.filter(
    (item) => item.partNumber >= 5 && item.partNumber <= 7 && item.isCorrect
  ).length;

  const handleShowDetailPart = () => {
    setShowDetailPart(!showDetailPart);
  };

  const handleShowDetailResultExam = (item) => {
    setSelectedQuestion(item);
    setShowDetailResultExam(true);
  };

  const handleClosePopup = () => {
    setShowDetailResultExam(false);
    setSelectedQuestion(null);
  };

  if (examLoading) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center gap-5">
        <p className="text-gray-600 text-lg font-semibold">
          Đang tải kết quả bài thi...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center gap-5">
        <p className="text-red-600 text-lg font-semibold">
          {submitError || "Không tìm thấy kết quả bài thi."}
        </p>
        <Button
          text="Go Back"
          variant="default"
          onClick={() => navigate("/exam")}
        />
      </div>
    );
  }

  return (
    <main className="container mx-auto py-10 flex flex-col items-center justify-center gap-5">
      <div className="w-full max-w-5xl bg-white rounded-2xl border-2 border-gray-300 shadow-lg p-8 flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-gray-600">
          {result?.testName || `Test ${result?.testId}`}
        </h1>
        <div className="flex flex-col md:flex-row gap-7 w-full">
          <div className="md:w-1/3 border-2 border-gray-300 rounded-2xl">
            <img
              src={image_result}
              alt="Kết quả bài thi"
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>
          <div className="md:w-2/3 grid grid-cols-2 gap-6 text-sm sm:text-base">
            <div className="space-y-2">
              <div>
                <p className="text-gray-600">Tên người dùng:</p>
                <p className="font-semibold">{userName}</p>
              </div>
              <div>
                <p className="text-gray-600">Ngày làm:</p>
                <p className="font-semibold">{completedDate}</p>
              </div>
              <div>
                <p className="text-gray-600">Thời gian hoàn thành:</p>
                <p className="font-semibold">{timeSpent}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-gray-600">Số câu đúng:</p>
                <p className="font-semibold text-green-600">{correctAnswers}</p>
              </div>
              <div>
                <p className="text-gray-600">Số câu sai:</p>
                <p className="font-semibold text-red-500">{incorrectAnswers}</p>
              </div>
              <div>
                <p className="text-gray-600">Số câu bỏ qua:</p>
                <p className="font-semibold">{skippedAnswers}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-gray-600">Listening:</p>
                <p>
                  <span className="font-semibold">{listeningCorrect}/100</span>{" "}
                  |{" "}
                  <span className="font-semibold text-[#2C99E2]">
                    {listeningScore} điểm
                  </span>
                </p>
              </div>
              <div>
                <p className="text-gray-600">Reading:</p>
                <p>
                  <span className="font-semibold">{readingCorrect}/100</span> |{" "}
                  <span className="font-semibold text-[#2C99E2]">
                    {readingScore} điểm
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center col-span-2 sm:col-span-1">
              <div className="text-center">
                <p className="text-gray-600">Tổng điểm</p>
                <p className="text-4xl sm:text-5xl font-extrabold text-[#2C99E2]">
                  {totalScore}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-5 justify-end w-full max-w-5xl">
        <Button
          text={`${
            showDetailPart ? "Ẩn đáp án chi tiết" : "Hiện đáp án chi tiết"
          }`}
          variant="default"
          size="sm"
          icon={<FontAwesomeIcon icon="fa-solid fa-book" />}
          onClick={handleShowDetailPart}
        />
        <Link to={"/exam"}>
          <Button
            text="Đề khác"
            variant="primary"
            size="sm"
            icon={<FontAwesomeIcon icon="fa-solid fa-angle-right" />}
          />
        </Link>
      </div>

      {showDetailPart && (
        <div className="container max-w-5xl w-full border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-row gap-5 border-b-2 border-gray-200 mb-4 items-center py-3 cursor-pointer">
            {[1, 2, 3, 4, 5, 6, 7].map((part) => (
              <button
                key={part}
                onClick={() => setActivePart(part)}
                className={`px-2 py-2 text-lg font-semibold cursor-pointer ${
                  activePart === part
                    ? "text-[#2C99E2] border-b-3 border-[#2C99E2]"
                    : "text-gray-600"
                } pb-1`}
              >
                Part {part}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {partData[activePart]?.length > 0 ? (
              partData[activePart].map((item) => (
                <div key={item.questionId} className="flex items-center gap-3">
                  <span className="w-10 h-10 flex items-center justify-center bg-[#e8f2ff] text-[#35509a] font-bold rounded-full">
                    {item.id}
                  </span>
                  <span className="font-bold text-[#35509a]">
                    {item.correctAnswer}
                  </span>
                  <span
                    className={`${
                      item.correct
                        ? ""
                        : `${item.userAnswer === "N/A" ? "" : "line-through"}`
                    }`}
                  >
                    {item.userAnswer}
                  </span>
                  {item.correct ? (
                    <span className="text-green-600">
                      <FontAwesomeIcon icon="fa-solid fa-check" />
                    </span>
                  ) : (
                    <span className="text-red-600">
                      <FontAwesomeIcon icon="fa-solid fa-xmark" />
                    </span>
                  )}
                  <span className="text-[#35509a] font-semibold">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleShowDetailResultExam(item);
                        console.log(item);
                      }}
                    >
                      [Chi tiết]
                    </a>
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-600 font-semibold text-center">
                Không có câu trả lời nào cho Part {activePart}
              </p>
            )}
          </div>
        </div>
      )}

      {showDetailResultExam && selectedQuestion && (
        <DetailExamResult
          show={showDetailResultExam}
          onClose={handleClosePopup}
          item={selectedQuestion}
        />
      )}
    </main>
  );
};

export default SubmitExamResult;
