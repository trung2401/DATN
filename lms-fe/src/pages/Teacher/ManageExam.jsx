import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';

import Button from '../../components/Button';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import AddOrEditExam from '../../components/Admin/AddOrEditExam';
import TestQuestionManager from '../../components/Teacher/TestQuestionManager';
import { getTestsByTeacher, setStatusTestByTeacher } from '../../service/examService';
import { getUser } from '../../service/userService';

const ManageExamTeacher = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchExamQuery, setSearchExamQuery] = useState('');
  const [currentPageExams, setCurrentPageExams] = useState(1);

  const [showAddExam, setShowAddExam] = useState(false);
  const [showEditExam, setShowEditExam] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showManageQuestions, setShowManageQuestions] = useState(false);
  const [selectedExamForQuestions, setSelectedExamForQuestions] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const itemsPerPageExams = 5;

  const resolveCurrentUserId = useCallback(async () => {
    const localId = localStorage.getItem('user_id');
    if (localId) {
      return Number(localId);
    }

    const profileRes = await getUser();
    const profile = profileRes?.data || profileRes;
    const userId = Number(profile?.userId || profile?.UserID || 0);

    if (userId) {
      localStorage.setItem('user_id', String(userId));
      return userId;
    }

    throw new Error('Không lấy được thông tin user hiện tại');
  }, []);

  const loadTestsByTeacher = useCallback(async () => {
    setLoading(true);
    try {
      const userId = await resolveCurrentUserId();
      const response = await getTestsByTeacher({ userId });

      const payload = response?.data || response;
      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      const mapped = rows.map((test) => ({
        idTest: test.idTest || test.testId,
        testName: test.testName || test.TestName || 'N/A',
        audio: test.audio || '',
        status: Number(test.status ?? 0),
      }));

      setTests(mapped);
    } catch (error) {
      toast.error(error?.message || 'Lỗi khi lấy danh sách đề thi của giáo viên');
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, [resolveCurrentUserId]);

  useEffect(() => {
    loadTestsByTeacher();
  }, [loadTestsByTeacher]);

  const filteredExams = useMemo(() => {
    const query = searchExamQuery.toLowerCase();
    return tests.filter((exam) => {
      const id = String(exam.idTest || '').toLowerCase();
      const name = String(exam.testName || '').toLowerCase();
      return id.includes(query) || name.includes(query);
    });
  }, [tests, searchExamQuery]);

  const totalExams = filteredExams.length;
  const totalExamPages = Math.ceil(totalExams / itemsPerPageExams) || 1;
  const startIndexExams = (currentPageExams - 1) * itemsPerPageExams;
  const endIndexExams = startIndexExams + itemsPerPageExams;
  const currentExams = filteredExams.slice(startIndexExams, endIndexExams);

  const handleEditExam = (exam) => {
    setSelectedExam({
      testId: exam.idTest,
      testName: exam.testName,
      audio: exam.audio || '',
    });
    setShowEditExam(true);
  };

  const handleManageQuestions = (exam) => {
    setSelectedExamForQuestions(exam);
    setShowManageQuestions(true);
  };

  const handleToggleStatus = async (exam) => {
    if (!exam?.idTest) {
      toast.error('Không tìm thấy ID đề thi');
      return;
    }

    setUpdatingStatusId(exam.idTest);
    try {
      await setStatusTestByTeacher({ testId: exam.idTest });
      toast.success('Cập nhật trạng thái đề thi thành công!');
      await loadTestsByTeacher();
    } catch (error) {
      toast.error(error?.message || 'Lỗi khi cập nhật trạng thái đề thi');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <main className="max-w-6xl w-full mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold">Quản lý đề thi (Giáo viên)</h1>

      <section className="flex flex-col py-5 px-8 gap-5 border-2 border-gray-200 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold">Danh sách đề thi của tôi</h2>

        <div className="flex flex-row gap-4 w-full px-2 py-3">
          <SearchBar
            text="Tìm kiếm theo ID hoặc tên đề thi"
            focusBorderColor="focus:ring-gray-400"
            value={searchExamQuery}
            onChange={(e) => {
              setSearchExamQuery(e.target.value);
              setCurrentPageExams(1);
            }}
          />

          <Button
            text="Thêm mới"
            variant="primary"
            size="sm"
            icon={<FontAwesomeIcon icon="fa-solid fa-plus" />}
            onClick={() => setShowAddExam(true)}
          />
        </div>

        {loading ? (
          <div className="text-center py-4 text-gray-600 font-semibold text-lg">Đang tải...</div>
        ) : (
          <>
            <table className="w-full min-w-[600px] text-center border-2 border-gray-300 rounded-2xl overflow-hidden border-separate border-spacing-0">
              <thead className="bg-gray-200">
                <tr className="text-black font-bold">
                  <th className="py-3 px-4">Exam ID</th>
                  <th className="py-3 px-4">Tên đề thi</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentExams.map((exam) => (
                  <tr key={exam.idTest} className="hover:bg-gray-100">
                    <td className="px-4 py-4 text-gray-600 font-semibold">{exam.idTest}</td>
                    <td className="px-4 py-4 font-bold text-[#2C99E2]">{exam.testName}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                          Number(exam.status) === 1
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {Number(exam.status) === 1 ? 'Đang mở' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-4 py-4 flex gap-2 items-center justify-center">
                      <Button
                        text="Chỉnh sửa"
                        variant="default"
                        size="sm"
                        icon={<FontAwesomeIcon icon="fa-solid fa-pencil" />}
                        onClick={() => handleEditExam(exam)}
                      />

                      <Button
                        text="Câu hỏi"
                        variant="default"
                        size="sm"
                        icon={<FontAwesomeIcon icon="fa-solid fa-list" />}
                        onClick={() => handleManageQuestions(exam)}
                      />

                      <Button
                        text={Number(exam.status) === 1 ? 'Khóa' : 'Mở'}
                        variant={Number(exam.status) === 1 ? 'delete' : 'primary'}
                        size="sm"
                        icon={<FontAwesomeIcon icon="fa-solid fa-lock" />}
                        onClick={() => handleToggleStatus(exam)}
                        disabled={updatingStatusId === exam.idTest}
                      />
                    </td>
                  </tr>
                ))}

                {currentExams.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-600 font-semibold py-4">
                      Không tìm thấy đề thi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalExams > 0 && (
              <div className="flex justify-between items-center p-4">
                <span className="text-sm text-gray-600 font-semibold">
                  Hiển thị từ {startIndexExams + 1} đến {Math.min(endIndexExams, totalExams)} trong số{' '}
                  {totalExams} đề thi
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

      <AddOrEditExam
        show={showAddExam}
        onClose={() => setShowAddExam(false)}
        onSaved={loadTestsByTeacher}
      />

      <AddOrEditExam
        show={showEditExam}
        onClose={() => {
          setShowEditExam(false);
          setSelectedExam(null);
        }}
        examData={selectedExam}
        onSaved={loadTestsByTeacher}
      />

      <TestQuestionManager
        show={showManageQuestions}
        onClose={() => {
          setShowManageQuestions(false);
          setSelectedExamForQuestions(null);
        }}
        test={selectedExamForQuestions}
      />
    </main>
  );
};

export default ManageExamTeacher;
