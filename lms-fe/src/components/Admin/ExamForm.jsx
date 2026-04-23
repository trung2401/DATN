import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector, useDispatch } from "react-redux";
import Button from "../Button";
import { toast } from "react-toastify";
import {
  addOrUpdateTempPart,
  addOrUpdateTempQuestion,
} from "../../redux/slice/adminSlice";
import { uploadAudio, uploadImage } from "../../service/adminService";

const ExamForm = ({ show, onClose, partNumber, questionData }) => {
  const dispatch = useDispatch();
  const { tempExam } = useSelector((state) => state.admin);
  const [activeTab, setActiveTab] = useState("Cấu trúc phần thi");
  const [partForm, setPartForm] = useState({
    partNumber: partNumber || 1,
    partName: "",
    instructions: "",
    questionCount: 0,
    timeLimit: 0,
  });
  const [questionForm, setQuestionForm] = useState({
    partNumber: partNumber || 1,
    questionNumber: "",
    questionType: "",
    questionText: "",
    options: [
      { id: "A", value: "" },
      { id: "B", value: "" },
      { id: "C", value: "" },
      { id: "D", value: "" },
    ],
    correctAnswer: "",
    mediaFiles: { audio: "", image: "" },
    transcript: "",
    groupId: "",
  });
  const [uploading, setUploading] = useState({ audio: false, image: false });

  // Use refs to reliably trigger file inputs
  const audioInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
        // Initialize questionForm
        if (questionData) {
          const options =
            Array.isArray(questionData.options) && questionData.options.length > 0
              ? questionData.options.map((opt, idx) => {
                  if (typeof opt === "string") {
                    const match = opt.match(/^([A-Z])\.\s*(.*)$/);
                    return {
                      id: match ? match[1] : String.fromCharCode(65 + idx),
                      value: match ? match[2] : opt,
                    };
                  }
                  return {
                    id: opt.id || String.fromCharCode(65 + idx),
                    value: opt.value || opt.text || "",
                  };
                })
              : [
                  { id: "A", value: "" },
                  { id: "B", value: "" },
                  { id: "C", value: "" },
                  { id: "D", value: "" },
                ];
          setQuestionForm({
            partNumber: questionData.partNumber || partNumber || 1,
            // Convert từ 0-based (database) sang 1-based (UI display)
            questionNumber: (questionData.questionNumber + 1).toString(),
            questionType: questionData.questionType || "",
            questionText: questionData.questionText || "",
            options,
            correctAnswer: questionData.correctAnswer || "",
            mediaFiles: questionData.mediaFiles || { audio: "", image: "" },
            transcript: questionData.transcript || "",
            groupId: questionData.groupId || "",
          });
        } else {
          setQuestionForm({
            partNumber: partNumber || 1,
            questionNumber: "",
            questionType: "",
            questionText: "",
            options: [
              { id: "A", value: "" },
              { id: "B", value: "" },
              { id: "C", value: "" },
              { id: "D", value: "" },
            ],
            correctAnswer: "",
            mediaFiles: { audio: "", image: "" },
            transcript: "",
            groupId: "",
          });
        }

        // Initialize partForm
        const existingPart =
          tempExam?.parts?.find((p) => p.partNumber === partNumber) || {};
        setPartForm({
          partNumber: partNumber || 1,
          partName: existingPart.partName || "",
          instructions: existingPart.instructions || "",
          questionCount: existingPart.questionCount || 0,
          timeLimit: existingPart.timeLimit || 0,
        });
  }, [partNumber, questionData, tempExam?.parts, tempExam?.questions]);

  const handleClose = () => {
    onClose();
  };

  const addOption = () => {
    const newId = String.fromCharCode(65 + questionForm.options.length);
    if (questionForm.options.length < 26) {
      setQuestionForm({
        ...questionForm,
        options: [...questionForm.options, { id: newId, value: "" }],
      });
    } else {
      toast.warning("Đã đạt số lượng lựa chọn tối đa!");
    }
  };

  const removeOption = (index) => {
    if (questionForm.options.length > 1) {
      setQuestionForm({
        ...questionForm,
        options: questionForm.options.filter((_, i) => i !== index),
      });
    } else {
      toast.warning("Phải có ít nhất một lựa chọn!");
    }
  };

  const updateOptionValue = (index, value) => {
    const updatedOptions = [...questionForm.options];
    updatedOptions[index] = { ...updatedOptions[index], value };
    setQuestionForm({ ...questionForm, options: updatedOptions });
  };

  const handlePartInputChange = (e) => {
    const { id, value } = e.target;
    setPartForm({
      ...partForm,
      [id]:
        id === "partNumber" || id === "questionCount" || id === "timeLimit"
          ? parseInt(value) || 0
          : value,
    });
  };

  const handleQuestionInputChange = (e) => {
    const { id, value } = e.target;
    setQuestionForm({
      ...questionForm,
      [id]: id === "questionNumber" ? value : value,
    });
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Vui lòng chọn một file âm thanh!");
      return;
    }

    const allowedExtensions = [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));
    if (!allowedExtensions.includes(fileExtension)) {
      toast.error(
        "Vui lòng chọn file audio hợp lệ (.mp3, .wav, .ogg, .m4a, .aac, .flac)!"
      );
      e.target.value = "";
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error("File âm thanh không được vượt quá 50MB!");
      e.target.value = "";
      return;
    }

    setUploading((prev) => ({ ...prev, audio: true }));
    try {
      const response = await uploadAudio({ file });

      if (response.status === 200) {
        const audioUrl = response.data.url;
        if (!audioUrl) {
          throw new Error("Không nhận được URL file từ server");
        }
        setQuestionForm({
          ...questionForm,
          mediaFiles: { ...questionForm.mediaFiles, audio: audioUrl },
        });
        toast.success("Tải lên file âm thanh thành công!");
      } else {
        throw new Error(
          response.data?.message || "Tải lên file âm thanh thất bại!"
        );
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast.error(error.message || "Lỗi khi tải lên file âm thanh!");
      e.target.value = "";
    } finally {
      setUploading((prev) => ({ ...prev, audio: false }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Vui lòng chọn một file hình ảnh!");
      return;
    }

    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".bmp",
      ".svg",
    ];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));
    if (!allowedExtensions.includes(fileExtension)) {
      toast.error(
        "Vui lòng chọn file hình ảnh hợp lệ (.jpg, .jpeg, .png, .gif, .webp, .bmp, .svg)!"
      );
      e.target.value = "";
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File hình ảnh không được vượt quá 10MB!");
      e.target.value = "";
      return;
    }

    setUploading((prev) => ({ ...prev, image: true }));
    try {
      const response = await uploadImage({ file });
      if (response.status === 200) {
        const imageUrl = response.data.url;
        if (!imageUrl) {
          throw new Error("Không nhận được URL file từ server");
        }
        setQuestionForm({
          ...questionForm,
          mediaFiles: { ...questionForm.mediaFiles, image: imageUrl },
        });
        toast.success("Tải lên file hình ảnh thành công!");
      } else {
        throw new Error(
          response.data?.message || "Tải lên file hình ảnh thất bại!"
        );
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Lỗi khi tải lên file hình ảnh!");
      e.target.value = "";
    } finally {
      setUploading((prev) => ({ ...prev, image: false }));
    }
  };

  const handleSave = () => {
    if (activeTab === "Cấu trúc phần thi") {
      if (!partForm.partNumber) {
        toast.error("Vui lòng nhập số phần!");
        return;
      }
      dispatch(addOrUpdateTempPart(partForm));
      toast.success("Đã lưu cấu trúc phần thi!");
    } else {
      if (!questionForm.questionNumber || isNaN(parseInt(questionForm.questionNumber)) || parseInt(questionForm.questionNumber) <= 0) {
        toast.error("Vui lòng nhập số thứ tự câu hợp lệ (từ 1 trở lên)!");
        return;
      }
      if (
        !tempExam?.parts?.some((p) => p.partNumber === questionForm.partNumber)
      ) {
        toast.warning("Vui lòng tạo phần tương ứng trước khi lưu câu hỏi!");
        return;
      }
      const questionToSave = {
        ...questionForm,
        // Convert từ 1-based (UI) sang 0-based (database)
        questionNumber: parseInt(questionForm.questionNumber) - 1,
        options: questionForm.options.map((opt) => `${opt.id}. ${opt.value}`),
      };
      dispatch(addOrUpdateTempQuestion(questionToSave));
      toast.success("Đã lưu câu hỏi!");
    }
    onClose();
  };

  if (!show) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        className="w-full flex flex-col max-w-7xl mx-auto bg-white border-2 border-gray-200 shadow-lg rounded-2xl px-4 sm:px-6 pt-6 pb-6 max-h-[95vh] overflow-y-auto custom-scrollbar relative"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {questionData ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-200 hover:rounded-lg transition-all duration-200"
          >
            <FontAwesomeIcon
              icon="fa-solid fa-xmark"
              size="lg"
              style={{ color: "#565E6C" }}
            />
          </button>
        </div>
        <div className="flex-1 flex flex-col gap-4 overflow-auto">
          <ul className="flex flex-row gap-5 justify-center items-center py-3 cursor-pointer">
            {["Cấu trúc phần thi", "Câu hỏi"].map((part) => (
              <li
                key={part}
                onClick={() => setActiveTab(part)}
                className={`px-2 py-2 text-lg font-semibold cursor-pointer ${
                  activeTab === part
                    ? "text-[#2C99E2] border-b-3 border-[#2C99E2]"
                    : "text-gray-600"
                } pb-1`}
              >
                {part}
              </li>
            ))}
          </ul>
          <div className="flex flex-col w-full border-2 border-gray-300 rounded-lg p-4 gap-2">
            {activeTab === "Cấu trúc phần thi" ? (
              <>
                <h1 className="text-xl text-gray-700 font-bold">
                  Part {partForm.partNumber}
                </h1>
                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex gap-2">
                    <div className="flex w-1/2 flex-col gap-2 px-2">
                      <label
                        className="font-semibold text-gray-800"
                        htmlFor="partNumber"
                      >
                        Số phần
                      </label>
                      <input
                        className="w-full text-gray-600 font-semibold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                        id="partNumber"
                        placeholder="Nhập vào phần (ví dụ: 1)"
                        type="text"
                        value={partForm.partNumber}
                        onChange={handlePartInputChange}
                      />
                    </div>
                    <div className="flex w-1/2 flex-col gap-2 px-2">
                      <label
                        className="font-semibold text-gray-800"
                        htmlFor="partName"
                      >
                        Tên phần
                      </label>
                      <input
                        className="w-full text-gray-600 font-semibold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                        id="partName"
                        placeholder="Nhập tên phần (ví dụ: Photographs)"
                        type="text"
                        value={partForm.partName}
                        onChange={handlePartInputChange}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 px-2">
                    <label
                      className="font-semibold text-gray-800"
                      htmlFor="instructions"
                    >
                      Hướng dẫn
                    </label>
                    <textarea
                      className="w-full text-gray-600 font-semibold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                      id="instructions"
                      placeholder="Nhập hướng dẫn"
                      value={partForm.instructions}
                      onChange={handlePartInputChange}
                      rows="5"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex w-1/2 flex-col gap-2 px-2">
                      <label
                        className="font-semibold text-gray-800"
                        htmlFor="questionCount"
                      >
                        Số câu
                      </label>
                      <input
                        className="w-full text-gray-600 font-semibold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                        id="questionCount"
                        placeholder="Nhập vào số câu"
                        type="text"
                        value={partForm.questionCount}
                        onChange={handlePartInputChange}
                      />
                    </div>
                    <div className="flex w-1/2 flex-col gap-2 px-2">
                      <label
                        className="font-semibold text-gray-800"
                        htmlFor="timeLimit"
                      >
                        Thời gian tối đa (phút)
                      </label>
                      <input
                        className="w-full text-gray-600 font-semibold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                        id="timeLimit"
                        placeholder="Nhập vào thời gian tối đa (phút)"
                        type="text"
                        value={partForm.timeLimit}
                        onChange={handlePartInputChange}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-3 items-center">
                  <h1 className="text-xl text-gray-700 font-bold">Câu hỏi</h1>
                  {tempExam?.parts?.length > 0 || partNumber ? (
                    // Cách 1: Hiển thị các phần đã tạo để người dùng lựa chọn
                    // <select
                    //   id="partSelect"
                    //   className="px-3 py-2 border-2 border-gray-300 rounded-lg"
                    //   value={questionForm.partNumber.toString()}
                    //   onChange={(e) =>
                    //     setQuestionForm({
                    //       ...questionForm,
                    //       partNumber: parseInt(e.target.value),
                    //     })
                    //   }
                    // >
                    //   {[
                    //     ...(tempExam?.parts?.length > 0
                    //       ? tempExam.parts
                    //       : [{ partNumber: partNumber || 1 }]),
                    //   ].map((part) => (
                    //     <option
                    //       key={part.partNumber}
                    //       value={part.partNumber.toString()}
                    //     >
                    //       Part {part.partNumber}
                    //     </option>
                    //   ))}
                    // </select>
                    // Cách 2: Luôn hiển thị 7 part để người dùng lựa chọn
                    <select
                      id="partSelect"
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg"
                      value={questionForm.partNumber.toString()}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          partNumber: parseInt(e.target.value),
                        })
                      }
                    >
                      {Array.from({ length: 7 }, (_, i) => i + 1).map(
                        (partNum) => (
                          <option key={partNum} value={partNum.toString()}>
                            Part {partNum}
                          </option>
                        )
                      )}
                    </select>
                  ) : (
                    <p className="text-red-600">
                      Vui lòng tạo ít nhất một phần trước khi thêm câu hỏi.
                    </p>
                  )}
                </div>
                {(tempExam?.parts?.length > 0 || partNumber) && (
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex gap-2">
                      <div className="flex w-1/2 flex-col gap-2 px-2">
                        <label
                          className="font-semibold text-gray-800"
                          htmlFor="questionNumber"
                        >
                          Số thứ tự câu
                        </label>
                        <input
                          className="w-full text-gray-600 font-semibold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                          id="questionNumber"
                          placeholder="Nhập vào số thứ tự câu"
                          type="text"
                          value={questionForm.questionNumber}
                          onChange={handleQuestionInputChange}
                        />
                      </div>
                      <div className="flex w-1/2 flex-col gap-2 px-2">
                        <label
                          className="font-semibold text-gray-800"
                          htmlFor="questionType"
                        >
                          Loại câu hỏi
                        </label>
                        <select
                          id="questionType"
                          className="w-full text-gray-600 font-semibold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                          value={questionForm.questionType}
                          onChange={handleQuestionInputChange}
                        >
                          <option value="listening_photo">
                            Listening - Photographs
                          </option>
                          <option value="listening_question_response">
                            Listening - Question-Response
                          </option>
                          <option value="listening_conversation">
                            Listening - Conversations
                          </option>
                          <option value="listening_talk">
                            Listening - Talks
                          </option>
                          <option value="reading_incomplete_sentences">
                            Reading - Incomplete Sentences
                          </option>
                          <option value="reading_text_completion">
                            Reading - Text Completion
                          </option>
                          <option value="reading_reading_comprehension">
                            Reading - Reading Comprehension
                          </option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 px-2">
                      <label
                        className="font-semibold text-gray-800"
                        htmlFor="questionText"
                      >
                        Nội dung câu hỏi
                      </label>
                      <input
                        className="w-full text-gray-600 font-semibold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                        id="questionText"
                        placeholder="Nhập nội dung câu hỏi"
                        type="text"
                        value={questionForm.questionText}
                        onChange={handleQuestionInputChange}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex w-1/2 flex-col gap-2 px-2">
                        <label
                          className="font-semibold text-gray-800"
                          htmlFor="groupId"
                        >
                          Nhóm câu hỏi
                        </label>
                        <input
                          className="w-full text-gray-600 font-semibold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                          id="groupId"
                          placeholder="Nhập ID nhóm câu hỏi"
                          type="text"
                          value={questionForm.groupId || ""}
                          onChange={handleQuestionInputChange}
                        />
                      </div>
                      <div className="flex w-1/2 flex-col gap-2 px-2">
                        <label
                          className="font-semibold text-gray-800"
                          htmlFor="correctAnswer"
                        >
                          Đáp án đúng
                        </label>
                        <input
                          className="w-full text-gray-600 font-semibold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                          id="correctAnswer"
                          placeholder="Nhập đáp án đúng"
                          type="text"
                          value={questionForm.correctAnswer}
                          onChange={handleQuestionInputChange}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 px-2">
                      <label
                        className="font-semibold text-gray-800"
                        htmlFor="options"
                      >
                        Các lựa chọn
                      </label>
                      <div className="flex flex-col w-full px-10 gap-2">
                        {questionForm.options?.length > 0 ? (
                          questionForm.options.map((option, index) => (
                            <div
                              key={option.id}
                              className="flex items-center gap-3"
                            >
                              <span className="w-8 font-semibold text-gray-600">
                                {option.id}
                              </span>
                              <input
                                type="text"
                                className="w-full p-2 border-2 border-gray-300 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                placeholder={`Nhập lựa chọn ${option.id}`}
                                value={option.value || ""}
                                onChange={(e) =>
                                  updateOptionValue(index, e.target.value)
                                }
                              />
                              <button
                                type="button"
                                className="text-red-600 hover:text-red-800 cursor-pointer"
                                onClick={() => removeOption(index)}
                              >
                                <FontAwesomeIcon icon="fa-solid fa-trash" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-red-600">
                            Không có lựa chọn nào để hiển thị.
                          </p>
                        )}
                        <div className="flex items-center justify-center mt-2">
                          <Button
                            text="Thêm lựa chọn"
                            variant="default"
                            size="sm"
                            onClick={addOption}
                            icon={<FontAwesomeIcon icon="fa-solid fa-plus" />}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 px-2">
                      <label className="font-semibold text-gray-800">
                        File âm thanh
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          ref={audioInputRef}
                          onChange={handleAudioUpload}
                        />
                        <input
                          type="text"
                          className="w-full flex-1 text-gray-600 font-semibold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                          placeholder="Chọn file âm thanh"
                          value={questionForm.mediaFiles.audio}
                          readOnly
                        />
                        <Button
                          text={uploading.audio ? "Đang tải..." : "Chọn"}
                          variant="primary"
                          size="sm"
                          onClick={() => audioInputRef.current?.click()}
                          icon={<FontAwesomeIcon icon="fa-solid fa-upload" />}
                          disabled={uploading.audio}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 px-2">
                      <label className="font-semibold text-gray-800">
                        File hình ảnh
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={imageInputRef}
                          onChange={handleImageUpload}
                        />
                        <input
                          type="text"
                          className="w-full flex-1 text-gray-600 font-semibold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                          placeholder="Chọn hình ảnh"
                          value={questionForm.mediaFiles.image}
                          readOnly
                        />
                        <Button
                          text={uploading.image ? "Đang tải..." : "Chọn"}
                          variant="primary"
                          size="sm"
                          onClick={() => imageInputRef.current?.click()}
                          icon={<FontAwesomeIcon icon="fa-solid fa-upload" />}
                          disabled={uploading.image}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 px-2">
                      <label
                        className="font-semibold text-gray-800"
                        htmlFor="transcript"
                      >
                        Giải thích
                      </label>
                      <textarea
                        className="w-full text-gray-600 font-semibold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                        id="transcript"
                        placeholder="Nhập giải thích chi tiết (nếu có)"
                        value={questionForm.transcript}
                        onChange={handleQuestionInputChange}
                        rows="4"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            text="Hủy"
            variant="default"
            size="sm"
            onClick={handleClose}
          />
          <Button text="Lưu" variant="primary" size="sm" onClick={handleSave} />
        </div>
      </form>
    </div>
  );
};

export default ExamForm;
