import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
const image_result = "https://pub-e860ef97c13d407c808df35aa1a698c7.r2.dev/material-web-app/6.png"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../Button";
import { Link } from "react-router-dom";
import DetailExamResult from "../Exam/DetailExamResult";
import { fetchUserInfo } from "../../redux/slice/userSlice";
import { fetchHistoryExamById } from "../../redux/slice/examSlice";
// import formatDate from "../../utils/formatDate";

const HistoryExamResult = () => {
  const [activePart, setActivePart] = useState(1);
  const [showDetailPart, setShowDetailPart] = useState(false);
  const [showDetailResultExam, setShowDetailResultExam] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { testId } = useParams();
  const {
    historyExamById: result,
    loading: examLoading,
    error: examError,
  } = useSelector((state) => state.exam || {});
  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUserInfo());
    if (testId) {
      dispatch(fetchHistoryExamById(testId));
    }
  }, [dispatch, testId]);

  const userName = result?.Name || userInfo?.name || userInfo?.userName || "N/A";
  const rawDate = result?.dateTest || result?.completedAt || "";
  const completedDate = rawDate ? String(rawDate).split("T")[0] : "N/A";
  const listeningScore = result?.data?.score?.listening ?? result?.listeningScore ?? 0;
  const readingScore = result?.data?.score?.reading ?? result?.readingScore ?? 0;
  const totalScore = result?.data?.score?.total ?? result?.totalScore ?? 0;
  const totalQuestions = result?.data?.overall?.total || 200;
  let correctAnswers = 0;
  let totalSubmittedAnswers = 0;
  
  const partData = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };

  if (result?.userAnswer) {
    result.userAnswer.forEach((item) => {
      const part = item.partNumber;
      const userAnswer = item.userAnswer || "N/A";
      const correctAnswer = item.correctAnswer || "N/A";
      const isCorrect = userAnswer !== "N/A" && userAnswer === correctAnswer;

      if (userAnswer !== "N/A") {
        totalSubmittedAnswers++;
        if (isCorrect) {
          correctAnswers++;
        }
      }
      const questionForDetail = {
        id: item.questionNumber + 1,
        testName: result.testName,
        part: part, 
        userAnswer,
        correctAnswer,
        correct: isCorrect,
        questionData: {
          idQuestion: item.questionNumber,
          questionText: item.questionText || "",
          options: item.options || [],
          transcript: item.transcript || "",
          image: item.mediaFiles.image || null,
          audio: item.mediaFiles.audio || null,
          passageText: item.mediaFiles.text || null,
        },
      };

      partData[part].push(questionForDetail);
    });
  }

  const incorrectAnswers =
    result?.data?.overall?.wrong ?? (totalSubmittedAnswers - correctAnswers);
  const skippedAnswers =
    result?.data?.overall?.skipped ?? (totalQuestions - totalSubmittedAnswers);

  const listeningCorrectFromAnswers =
    (partData[1]?.filter((item) => item.correct).length || 0) +
    (partData[2]?.filter((item) => item.correct).length || 0) +
    (partData[3]?.filter((item) => item.correct).length || 0) +
    (partData[4]?.filter((item) => item.correct).length || 0);
  const readingCorrectFromAnswers =
    (partData[5]?.filter((item) => item.correct).length || 0) +
    (partData[6]?.filter((item) => item.correct).length || 0) +
    (partData[7]?.filter((item) => item.correct).length || 0);

  const listeningCorrect =
    result?.data?.details?.correctListening ?? listeningCorrectFromAnswers;
  const readingCorrect =
    result?.data?.details?.correctReading ?? readingCorrectFromAnswers;
  const displayCorrectAnswers =
    result?.data?.overall?.correct ?? correctAnswers;

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
        <p className="text-gray-600 text-lg font-semibold">Đang tải kết quả bài thi...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center gap-5">
        <p className="text-red-600 text-lg font-semibold">
          {examError || "Không tìm thấy kết quả bài thi."}
        </p>
        <Button
          text="Quay lại"
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
          {result?.testName || `Test ${result?.idTestHistory}`}
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
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-gray-600">Số câu đúng:</p>
                <p className="font-semibold text-green-600">{displayCorrectAnswers}</p>
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
                  <span className="font-semibold text-[#25B379]">
                    {listeningScore} điểm
                  </span>
                </p>
              </div>
              <div>
                <p className="text-gray-600">Reading:</p>
                <p>
                  <span className="font-semibold">{readingCorrect}/100</span> |{" "}
                  <span className="font-semibold text-[#25B379]">
                    {readingScore} điểm
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center col-span-2 sm:col-span-1">
              <div className="text-center">
                <p className="text-gray-600">Tổng điểm</p>
                <p className="text-4xl sm:text-5xl font-extrabold text-[#25B379]">
                  {totalScore}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-5 justify-end w-full max-w-5xl">
        <Button
          text={`${showDetailPart ? "Ẩn đáp án chi tiết" : "Hiện đáp án chi tiết"}`}
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
            {[1, 2, 3, 4, 5, 6, 7]?.map((part) => (
              <button
                key={part}
                onClick={() => setActivePart(part)}
                className={`px-2 py-2 text-lg font-semibold cursor-pointer ${
                  activePart === part
                    ? "text-[#25B379] border-b-3 border-[#25B379]"
                    : "text-gray-600"
                } pb-1`}
              >
                Part {part}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-5xl gap-4 mx-auto">
            {partData[activePart]?.length > 0 ? (
              partData[activePart]?.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="w-10 h-10 flex items-center justify-center bg-[#e8f2ff] text-[#35509a] font-bold rounded-full">
                    {item.id}
                  </span>
                  <span className="font-bold text-[#35509a]">
                    {item.correctAnswer}
                  </span>
                  <span className={`${
                    item.correct? "": `${item.userAnswer ==="N/A"? "": "line-through"}`
                    }`}>
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
                      }}
                    >
                      [Chi tiết]
                    </a>
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-600 font-semibold text-center">
                Không có câu trả lời cho Part {activePart}
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

export default HistoryExamResult;