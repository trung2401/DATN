// components/Admin/EditExam.jsx
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../Button";
import ModalWrapper from "../ModalWrapper.jsx";
import SearchBar from "../../components/SearchBar";

const EditExam = ({ show, onClose, exam, onSave }) => {
  const [questionId, setQuestionId] = useState("");
  const [question, setQuestion] = useState(null);

  if (!show) return null;

  const handleSearchQuestion = () => {
    if (exam && questionId) {
      const foundQuestion = exam.questions?.find((q) => q.id === questionId);
      if (foundQuestion) {
        setQuestion({ ...foundQuestion });
      } else {
        alert("Không tìm thấy câu hỏi với ID này!");
        setQuestion(null);
      }
    }
  };

  const handleQuestionContentChange = (content) => {
    setQuestion({ ...question, content });
  };

  const handleOptionChange = (optionId, text) => {
    setQuestion({
      ...question,
      options: question.options.map((opt) =>
        opt.id === optionId ? { ...opt, text } : opt
      ),
    });
  };

  const handleAddOption = () => {
    if (question.options.length >= 4) {
      alert("Tối đa 4 lựa chọn!");
      return;
    }
    const newOptionId = String.fromCharCode(65 + question.options.length); // A, B, C, D
    setQuestion({
      ...question,
      options: [...question.options, { id: newOptionId, text: "" }],
    });
  };

  const handleDeleteOption = (optionId) => {
    if (question.options.length <= 1) {
      alert("Phải có ít nhất 1 lựa chọn!");
      return;
    }
    setQuestion({
      ...question,
      options: question.options.filter((opt) => opt.id !== optionId),
    });
  };

  const handleCorrectAnswerChange = (answer) => {
    setQuestion({ ...question, correctAnswer: answer });
  };

  const handleSaveQuestion = () => {
    if (!question.content || question.options.some((opt) => !opt.text)) {
      alert("Vui lòng điền đầy đủ nội dung câu hỏi và các lựa chọn!");
      return;
    }
    onSave(question);
    handleClose();
  };

  const handleClose = () => {
    setQuestionId("");
    setQuestion(null);
    onClose();
  };

  const handleQuestionIdChange = (e) => {
    const newValue = e.target.value;
    setQuestionId(newValue);
    if (!newValue) {
      setQuestion(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <ModalWrapper show={show} onClose={handleClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg max-h-[95vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Chỉnh sửa đề thi</h2>
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Exam ID */}
        <div className="flex flex-row gap-5 mb-6 items-center">
          <label className="w-32 text-gray-600 font-semibold">
            ID đề thi
          </label>
          <div className="flex-1">
            <input
              type="text"
              value={exam?.id || ""}
              readOnly
              className="w-full p-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
          </div>
        </div>

        {/* Question ID */}
        <div className="flex flex-row gap-5 mb-6 items-center">
          <label className="w-32 text-gray-600 font-semibold">
            ID câu hỏi
          </label>
          <div className="flex-1 flex gap-3" onClick={(e) => e.stopPropagation()}>
            <SearchBar
              text="Nhập ID câu hỏi"
              value={questionId}
              onChange={handleQuestionIdChange}
              focusBorderColor="focus:ring-gray-400"
            />
            <Button
              text="Tìm kiếm"
              variant="primary"
              size="sm"
              onClick={handleSearchQuestion}
            />
          </div>
        </div>

        {/* Question Edit Form */}
        {question && (
          <div className="space-y-6">
            {/* Question Content */}
            <div className="flex flex-row gap-5">
              <label className="w-32 text-gray-600 font-semibold">
                Nội dung câu hỏi
              </label>
              <div className="flex-1">
                <textarea
                  value={question.content}
                  rows={5}
                  onChange={(e) => handleQuestionContentChange(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg resize-y min-h-[100px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="Nhập nội dung câu hỏi..."
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-row gap-5">
              <label className="w-32 text-gray-600 font-semibold py-2">
                Các lựa chọn
              </label>
              <div className="flex-1 space-y-3">
                {question.options.map((option) => (
                  <div key={option.id} className="flex items-center gap-3">
                    <span className="w-8 font-semibold text-gray-600">{option.id}</span>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) =>
                        handleOptionChange(option.id, e.target.value)
                      }
                      className="flex-1 p-2 border-2 border-gray-300 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      placeholder={`Lựa chọn ${option.id}`}
                    />
                    <button
                      onClick={() => handleDeleteOption(option.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FontAwesomeIcon icon="fa-solid fa-trash" />
                    </button>
                  </div>
                ))}
                <Button
                  text="Thêm lựa chọn"
                  variant="default"
                  size="sm"
                  icon={<FontAwesomeIcon icon="fa-solid fa-plus" />}
                  onClick={handleAddOption}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Correct Answer */}
            <div className="flex flex-row gap-5">
              <label className="w-32 text-gray-600 font-semibold">
                Đáp án đúng
              </label>
              <div className="flex-1">
                <div className="flex flex-col gap-2">
                  {question.options.map((option) => (
                    <label key={option.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={option.id}
                        checked={question.correctAnswer === option.id}
                        onChange={() => handleCorrectAnswerChange(option.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-600">{option.id}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-8">
          <Button
            text="Hủy"
            variant="default"
            size="sm"
            onClick={handleClose}
          />
          {question && (
            <Button
              text="Lưu"
              variant="primary"
              size="sm"
              onClick={handleSaveQuestion}
            />
          )}
        </div>
      </form>
    </ModalWrapper>
  );
};

export default EditExam;