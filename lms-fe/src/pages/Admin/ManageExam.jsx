import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllHistoryTests,
  fetchAllTests,
  fetchDeleteTest,
} from "../../redux/slice/adminSlice";
import { getTestDetail } from "../../service/adminService";
import Button from "../../components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SearchBar from "../../components/SearchBar";
import DetailExamResult from "../../components/Admin/DetailExamResult";
import AddOrEditExam from "../../components/Admin/AddOrEditExam";
import ModalConfirm from "../../components/ConfirmModal";
import Pagination from "../../components/Pagination";
import { toast } from "react-toastify";

const ManageExam = () => {
  const dispatch = useDispatch();
  const {
    tests,
    historyTests,
    loadingTest,
    loadingHistoryTest,
    errorHistoryTest,
    errorTest,
  } = useSelector((state) => state.admin);
  const [currentPageExams, setCurrentPageExams] = useState(1);
  const [currentPageResults, setCurrentPageResults] = useState(1);
  const [searchExamQuery, setSearchExamQuery] = useState("");
  const [searchResultQuery, setSearchResultQuery] = useState("");
  const [showDetailResult, setShowDetailResult] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);
  const [showEditExam, setShowEditExam] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  const itemsPerPageExams = 5;
  const itemsPerPageResults = 5;

  useEffect(() => {
    dispatch(fetchAllTests());
    dispatch(fetchAllHistoryTests());
  }, [dispatch]);

  useEffect(() => {
    if (errorTest) {
      toast.error(errorTest);
    }
    if (errorHistoryTest) {
      toast.error(errorHistoryTest);
    }
  }, [errorTest, errorHistoryTest]);

  const filteredExams = tests.filter((exam) => {
    const query = searchExamQuery.toLowerCase();
    return (
      exam.idTest?.toLowerCase().includes(query) ||
      exam.testName?.toLowerCase().includes(query)
    );
  });

  const filteredResults = historyTests.filter((result) => {
    const query = searchResultQuery.toLowerCase();
    return (
      result.idTestHistory?.toLowerCase().includes(query) ||
      result.email?.toLowerCase().includes(query)
    );
  });

  // Pagination for exams
  const totalExams = filteredExams.length;
  const totalExamPages = Math.ceil(totalExams / itemsPerPageExams);
  const startIndexExams = (currentPageExams - 1) * itemsPerPageExams;
  const endIndexExams = startIndexExams + itemsPerPageExams;
  const currentExams = filteredExams.slice(startIndexExams, endIndexExams);

  // Pagination for exam results
  const totalResults = filteredResults.length;
  const totalResultPages = Math.ceil(totalResults / itemsPerPageResults);
  const startIndexResults = (currentPageResults - 1) * itemsPerPageResults;
  const endIndexResults = startIndexResults + itemsPerPageResults;
  const currentResults = filteredResults.slice(
    startIndexResults,
    endIndexResults
  );

  const handleCancel = () => {
    setShowModal(false);
  };

  const handleDelete = async (exam) => {
    if (!exam.idTest) {
      toast.error("Không tìm thấy ID đề thi");
      return;
    }
    try {
      await dispatch(fetchDeleteTest({ testId: exam.idTest})).unwrap();
      toast.success(`Xóa đề thi thành công!`);
      dispatch(fetchAllTests());
      setSelectedExam(null);
      setShowModal(false);
    } catch (error) {
      toast.error(error || "Lỗi khi xóa đề thi");
      return;
    }
  };

const handleEditExam = async (examId) => {
  try {
    const response = await getTestDetail({ testId: examId }); 
    const examData = response.data;
    console.log("Exam data for editing:", examData);
    setSelectedExam({
      ...examData,
      testId: examData.testId,
      parts: examData.parts || [],
      questions: examData.questions || [],
    });
    setShowEditExam(true);
  } catch (error) {
    toast.error(error || "Không tìm thấy đề thi");
  }
};

  return (
    <main className="max-w-6xl w-full mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold">Quản lý đề thi</h1>
      {/* Danh sách đề thi */}
      <section className="flex flex-col py-5 px-8 gap-5 border-2 border-gray-200 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold">Danh sách đề thi</h1>
        <div className="flex flex-row gap-4 w-full px-6 py-3">
          <SearchBar
            text="Tìm kiếm đề thi theo ID hoặc tên đề thi"
            focusBorderColor="focus:ring-gray-400"
            value={searchExamQuery}
            onChange={(e) => {
              setSearchExamQuery(e.target.value);
              setCurrentPageExams(1);
            }}
          />
        </div>
        <p className="px-6 -mt-2 text-sm text-gray-500 font-medium">
          Chỉ tài khoản Giáo viên mới được thêm mới đề thi.
        </p>
        {loadingTest ? (
          <div className="text-center py-4 text-gray-600 font-semibold text-lg">
            Đang tải...
          </div>
        ) : (
          <>
            <table className="w-full min-w-[600px] text-center border-2 border-gray-300 rounded-2xl overflow-hidden border-separate border-spacing-0">
              <thead className="bg-gray-200">
                <tr className="text-black font-bold">
                  <th className="py-3 px-4">Exam ID</th>
                  <th className="py-3 px-4">Tên đề thi</th>
                  <th className="py-3 px-4">Số câu hỏi</th>
                  <th className="py-3 px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentExams.map((exam) => (
                  <tr key={exam.idTest} className="hover:bg-gray-100">
                    <td className="px-4 py-4 text-gray-600 font-semibold">
                      {exam.idTest}
                    </td>
                    <td className="px-4 py-4 font-bold text-[#2C99E2]">
                      {exam.testName}
                    </td>
                    <td className="px-4 py-4 text-gray-600 font-semibold">
                      {exam.numberOfQuestion}
                    </td>
                    <td className="px-4 py-4 flex gap-2 items-center justify-center">
                      <Button
                        text="Chỉnh sửa"
                        variant="default"
                        size="sm"
                        icon={<FontAwesomeIcon icon="fa-solid fa-pencil" />}
                        onClick={() => {
                          handleEditExam(exam.idTest)
                          setShowEditExam(true);
                        }}
                      />
                      <Button
                        text="Xóa"
                        variant="delete"
                        size="sm"
                        hoverBg="hover:bg-red-700"
                        icon={<FontAwesomeIcon icon="fa-solid fa-trash" />}
                        onClick={() =>{
                          setSelectedExam(exam);
                          setShowModal(true);
                          console.log("Selected exam for deletion:", exam.idTest);
                        }}
                      />
                    </td>
                  </tr>
                ))}
                {currentExams.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center text-gray-600 font-semibold py-4"
                    >
                      Không tìm thấy đề thi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalExams > 0 && (
              <div className="flex justify-between items-center p-4">
                <span className="text-sm text-gray-600 font-semibold">
                  Hiển thị từ {startIndexExams + 1} đến{" "}
                  {Math.min(endIndexExams, totalExams)} trong số {totalExams} đề
                  thi
                </span>
                <Pagination
                  currentPage={currentPageExams}
                  totalPages={totalExamPages}
                  onPageChange={(page) => setCurrentPageExams(page)}
                />
              </div>
            )}
          </>
        )}
      </section>

      {/* Kết quả làm bài */}
      <section className="flex flex-col py-5 px-8 gap-5 border-2 border-gray-200 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold">Kết quả làm bài</h1>
        <div className="flex justify-center py-3">
          <div className="w-full max-w-3xl">
            <SearchBar
              text="Tìm kiếm kết quả theo ID hoặc email"
              focusBorderColor="focus:ring-gray-400"
              value={searchResultQuery}
              onChange={(e) => {
                setSearchResultQuery(e.target.value);
                setCurrentPageResults(1);
              }}
            />
          </div>
        </div>
        {loadingHistoryTest ? (
          <div className="text-center py-4 text-gray-600 font-semibold text-lg">
            Đang tải...
          </div>
        ) : (
          <>
            <table className="w-full min-w-[600px] text-center border-2 border-gray-300 rounded-2xl overflow-hidden border-separate border-spacing-0">
              <thead className="bg-gray-200">
                <tr className="text-black font-bold">
                  <th className="py-3 px-4">Result ID</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Điểm số</th>
                  <th className="py-3 px-4">Ngày nộp bài</th>
                </tr>
              </thead>
              <tbody>
                {currentResults.map((result) => (
                  <tr key={result.idTestHistory} className="hover:bg-gray-100">
                    <td className="px-4 py-4 text-gray-600 font-semibold">
                      {result.idTestHistory}
                    </td>
                    <td className="px-4 py-4 text-gray-600 font-semibold">
                      {result.email}
                    </td>
                    <td className="px-4 py-4 font-bold text-[#2C99E2]">
                      {result.score || "N/A"} / 990
                    </td>
                    <td className="px-4 py-4 text-gray-600 font-semibold">
                      {result.dateTest || "N/A"}
                    </td>
                  </tr>
                ))}
                {currentResults.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center text-gray-600 font-semibold py-4"
                    >
                      Không tìm thấy kết quả.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalResults > 0 && (
              <div className="flex justify-between items-center p-4">
                <span className="text-sm text-gray-600 font-semibold">
                  Hiển thị từ {startIndexResults + 1} đến{" "}
                  {Math.min(endIndexResults, totalResults)} trong số{" "}
                  {totalResults} kết quả
                </span>
                <Pagination
                  currentPage={currentPageResults}
                  totalPages={totalResultPages}
                  onPageChange={(page) => setCurrentPageResults(page)}
                />
              </div>
            )}
          </>
        )}
      </section>

      {/* Thêm đề thi */}
      <AddOrEditExam
        show={showAddExam}
        onClose={() => setShowAddExam(false)}
      />
      {/* Chỉnh sửa đề thi */}
      <AddOrEditExam
        show={showEditExam}
        onClose={() => {
          setShowEditExam(false);
          setSelectedExam(null);
        }}
        examData={selectedExam}
      />

      {/* Xóa đề thi */}
      <ModalConfirm
        show={showModal}
        title="Xác nhận xóa đề thi"
        description={`Bạn có chắc chắn muốn xóa đề thi '${
          selectedExam?.testName || "N/A"
        }'? Hành động này không thể hoàn tác.`}
        hoverBgConfirm="hover:bg-red-700"
        onCancel={handleCancel}
        onConfirm={() => handleDelete(selectedExam)}
      />
  

      {/* Xem chi tiết kết quả */}
      <DetailExamResult
        show={showDetailResult}
        onClose={() => {
          setShowDetailResult(false);
          setSelectedResult(null);
        }}
        result={selectedResult}
      />
    </main>
  );
};

export default ManageExam;
