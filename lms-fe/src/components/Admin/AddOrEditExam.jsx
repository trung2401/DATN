import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ModalWrapper from "../ModalWrapper.jsx";
import Button from "../Button.jsx";
import { createTestByTeacher, updateTestByTeacher, uploadTestAudio } from "../../service/examService.js";
import { toast } from "react-toastify";

const AddOrEditExam = ({ show, onClose, examData, onSaved }) => {
  const [basicTestName, setBasicTestName] = useState("");
  const [basicAudio, setBasicAudio] = useState("");
  const [uploadingBasicAudio, setUploadingBasicAudio] = useState(false);
  const [savingBasicTest, setSavingBasicTest] = useState(false);
  const currentRole = localStorage.getItem("role");
  const isTeacherMode = currentRole === "TEACHER";

  useEffect(() => {
    if (show) {
      setBasicTestName(examData?.testName || "");
      setBasicAudio(examData?.audio || "");
    }
  }, [show, examData]);

  const handleClose = () => {
    setBasicTestName("");
    setBasicAudio("");
    onClose();
  };

  const handleSave = async () => {
    if (!isTeacherMode && !(examData && (examData.idTest || examData.testId))) {
      toast.error("Chỉ Giáo Viên mới được thêm mới đề thi.");
      return;
    }

    if (!basicTestName.trim()) {
      toast.error("Vui lòng nhập tên đề thi!");
      return;
    }

    setSavingBasicTest(true);
    try {
      const editId = examData?.idTest || examData?.testId;
      if (editId) {
        await updateTestByTeacher({
          testId: editId,
          testName: basicTestName.trim(),
          audio: basicAudio || null,
        });
        toast.success("Cập nhật đề thi thành công!");
      } else {
        await createTestByTeacher({
          testName: basicTestName.trim(),
          audio: basicAudio || null,
        });
        toast.success("Thêm mới đề thi thành công!");
      }

      if (typeof onSaved === "function") {
        await onSaved();
      }
      handleClose();
    } catch (error) {
      toast.error(error?.message || "Lưu đề thi thất bại!");
    } finally {
      setSavingBasicTest(false);
    }
  };

  const handleBasicAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!allowedExtensions.includes(fileExtension)) {
      toast.error("Vui lòng chọn file audio hợp lệ (.mp3, .wav, .ogg, .m4a, .aac, .flac)!");
      e.target.value = "";
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File âm thanh không được vượt quá 50MB!");
      e.target.value = "";
      return;
    }

    setUploadingBasicAudio(true);
    try {
      const response = await uploadTestAudio({ file });
      const payload = response?.data || response;
      const audioUrl = payload?.url || payload?.data?.url || "";

      if (!audioUrl) {
        throw new Error("Không nhận được URL file audio từ server");
      }

      setBasicAudio(audioUrl);
      toast.success("Tải audio thành công!");
    } catch (error) {
      toast.error(error?.message || "Lỗi khi tải audio!");
      e.target.value = "";
    } finally {
      setUploadingBasicAudio(false);
    }
  };

  return (
    <ModalWrapper show={show} onClose={handleClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl py-6 flex flex-col px-5 w-full max-w-2xl shadow-lg max-h-[95vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {examData && (examData.idTest || examData.testId)
              ? "Chỉnh sửa đề thi"
              : "Thêm mới đề thi"}
          </h2>
          <button
            onClick={handleClose}
            type="button"
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-200 hover:rounded-lg transition-all duration-200 ease-in-out"
          >
            <FontAwesomeIcon
              icon="fa-solid fa-xmark"
              size="lg"
              style={{ color: "#565E6C" }}
            />
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 px-2">
              <label className="font-semibold text-gray-800" htmlFor="teacher-testName">
                Tên đề thi
              </label>
              <input
                className="w-full text-gray-600 font-semibold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                id="teacher-testName"
                placeholder="Nhập tên đề thi"
                type="text"
                value={basicTestName}
                onChange={(e) => setBasicTestName(e.target.value)}
              />
            </div>

            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 transition hover:border-[#25B379] hover:bg-[#f5faff] mx-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25B379]/10 text-[#25B379]">
                  <FontAwesomeIcon icon="fa-solid fa-music" />
                </div>
                <div className="flex-1">
                  <label className="block font-semibold text-gray-800 mb-1" htmlFor="teacher-audio-upload">
                    Audio tổng bài nghe
                  </label>
                  <input
                    id="teacher-audio-upload"
                    type="file"
                    accept=".mp3,.wav,.ogg,.m4a,.aac,.flac,audio/*"
                    onChange={handleBasicAudioUpload}
                    className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#25B379] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#1e9a5a]"
                  />
                </div>
              </div>

              <div className="mt-3 text-sm font-medium text-gray-500">
                {uploadingBasicAudio
                  ? "Đang tải audio..."
                  : basicAudio
                    ? `Đã tải: ${basicAudio}`
                    : "Chưa có audio (có thể lưu mà không có audio)."}
              </div>

              {basicAudio && (
                <audio controls src={basicAudio} className="mt-3 w-full">
                  Trình duyệt không hỗ trợ phát audio.
                </audio>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            text="Hủy"
            variant="default"
            size="sm"
            onClick={handleClose}
          />
          <Button
            text={
              savingBasicTest
                ? "Đang lưu..."
                : "Lưu"
            }
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={savingBasicTest || uploadingBasicAudio}
          />
        </div>
      </form>
    </ModalWrapper>
  );
};

export default AddOrEditExam;