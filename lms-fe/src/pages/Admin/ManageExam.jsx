import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllHistoryTests, fetchAllTests } from "../../redux/slice/adminSlice";
import Button from "../../components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 5;

const getTeacherDisplayName = (test) => test.teacherName || test.teacherUserName || "Không rõ";

const getTeacherSortKey = (teacher) => {
  const teacherId = teacher.teacherId ?? "";
  const teacherName = teacher.teacherName || teacher.teacherUserName || "";
  return `${String(teacherId)}-${teacherName}`;
};

const getStatusLabel = (status) => (Number(status) === 1 ? "Đã phát hành" : "Chưa phát hành");

const getStatusClassName = (status) =>
  Number(status) === 1
    ? "bg-green-100 text-green-700"
    : "bg-amber-100 text-amber-700";

const ManageExam = () => {
  const dispatch = useDispatch();
  const { tests, historyTests, loadingTest, loadingHistoryTest, errorHistoryTest, errorTest } = useSelector(
    (state) => state.admin
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

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

  const groupedTeachers = useMemo(() => {
    const attemptCountByTestId = historyTests.reduce((accumulator, item) => {
      const testId = String(item.testId ?? "");
      if (!testId) return accumulator;
      accumulator.set(testId, (accumulator.get(testId) || 0) + 1);
      return accumulator;
    }, new Map());

    const teacherMap = new Map();

    tests.forEach((test) => {
      const teacherId = test.teacherId ?? "unknown";
      const teacherKey = String(teacherId);
      const teacherName = getTeacherDisplayName(test);

      if (!teacherMap.has(teacherKey)) {
        teacherMap.set(teacherKey, {
          teacherId,
          teacherName,
          teacherUserName: test.teacherUserName || "",
          tests: [],
        });
      }

      teacherMap.get(teacherKey).tests.push({
        idTest: test.idTest,
        testName: test.testName,
        status: test.status,
        numberOfQuestion: test.numberOfQuestion,
        attemptCount: attemptCountByTestId.get(String(test.idTest)) || 0,
      });
    });

    return Array.from(teacherMap.values())
      .map((teacher) => {
        const testsOfTeacher = [...teacher.tests].sort(
          (firstTest, secondTest) => Number(secondTest.idTest) - Number(firstTest.idTest)
        );

        return {
          ...teacher,
          tests: testsOfTeacher,
          publishedCount: testsOfTeacher.filter((item) => Number(item.status) === 1).length,
          unpublishedCount: testsOfTeacher.filter((item) => Number(item.status) !== 1).length,
        };
      })
      .sort((firstTeacher, secondTeacher) =>
        getTeacherSortKey(firstTeacher).localeCompare(getTeacherSortKey(secondTeacher), "vi", { numeric: true })
      );
  }, [historyTests, tests]);

  const filteredTeachers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return groupedTeachers;

    return groupedTeachers.filter((teacher) => {
      const teacherIdText = String(teacher.teacherId ?? "").toLowerCase();
      const teacherNameText = String(teacher.teacherName ?? "").toLowerCase();
      const teacherUserNameText = String(teacher.teacherUserName ?? "").toLowerCase();
      return (
        teacherIdText.includes(query) ||
        teacherNameText.includes(query) ||
        teacherUserNameText.includes(query)
      );
    });
  }, [groupedTeachers, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalTeachers = filteredTeachers.length;
  const totalPages = Math.ceil(totalTeachers / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTeachers = filteredTeachers.slice(startIndex, endIndex);

  const detailTests = selectedTeacher?.tests || [];

  return (
    <main className="max-w-6xl w-full mx-auto space-y-6 p-4">
      <section className="flex flex-col py-5 px-8 gap-5 border-2 border-gray-200 rounded-xl shadow-md">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Quản lý đề thi</h1>
          <p className="text-sm text-gray-500 font-medium">
            Mỗi dòng tương ứng với một giáo viên, hiển thị số đề đã phát hành và chưa phát hành.
          </p>
        </div>

        <div className="flex flex-row gap-4 w-full px-0 py-1">
          <SearchBar
            text="Tìm theo userId hoặc tên giáo viên"
            focusBorderColor="focus:ring-gray-400"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        {loadingTest || loadingHistoryTest ? (
          <div className="text-center py-4 text-gray-600 font-semibold text-lg">Đang tải...</div>
        ) : (
          <>
            <table className="w-full min-w-[720px] text-center border-2 border-gray-300 rounded-2xl overflow-hidden border-separate border-spacing-0">
              <thead className="bg-gray-200">
                <tr className="text-black font-bold">
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Tên giáo viên</th>
                  <th className="py-3 px-4">Số đề đã phát hành</th>
                  <th className="py-3 px-4">Số đề chưa phát hành</th>
                  <th className="py-3 px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentTeachers.map((teacher) => (
                  <tr key={String(teacher.teacherId)} className="hover:bg-gray-100">
                    <td className="px-4 py-4 text-gray-600 font-semibold">{teacher.teacherId ?? "N/A"}</td>
                    <td className="px-4 py-4 font-bold text-[#2C99E2]">{teacher.teacherName}</td>
                    <td className="px-4 py-4 text-gray-600 font-semibold">{teacher.publishedCount}</td>
                    <td className="px-4 py-4 text-gray-600 font-semibold">{teacher.unpublishedCount}</td>
                    <td className="px-4 py-4">
                      <Button
                        text="Xem chi tiết"
                        variant="default"
                        size="sm"
                        icon={<FontAwesomeIcon icon="fa-solid fa-eye" />}
                        onClick={() => setSelectedTeacher(teacher)}
                      />
                    </td>
                  </tr>
                ))}
                {currentTeachers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-600 font-semibold py-4">
                      Không tìm thấy giáo viên phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalTeachers > 0 && (
              <div className="flex justify-between items-center p-4">
                <span className="text-sm text-gray-600 font-semibold">
                  Hiển thị từ {startIndex + 1} đến {Math.min(endIndex, totalTeachers)} trong số {totalTeachers} giáo viên
                </span>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </>
        )}
      </section>

      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold">Chi tiết đề thi của giáo viên</h2>
                <p className="text-sm text-gray-500">
                  User ID: {selectedTeacher.teacherId ?? "N/A"} • Tên: {selectedTeacher.teacherName}
                </p>
              </div>
              <Button text="Đóng" variant="default" size="sm" onClick={() => setSelectedTeacher(null)} />
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full min-w-[720px] text-center border-separate border-spacing-0">
                <thead className="bg-gray-100">
                  <tr className="font-bold text-black">
                    <th className="py-3 px-4">Test ID</th>
                    <th className="py-3 px-4">Tên đề thi</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4">Số câu hỏi</th>
                    <th className="py-3 px-4">Số lượt làm</th>
                  </tr>
                </thead>
                <tbody>
                  {detailTests.map((test) => (
                    <tr key={String(test.idTest)} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-gray-600 font-semibold">{test.idTest}</td>
                      <td className="px-4 py-4 font-bold text-[#2C99E2]">{test.testName}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusClassName(test.status)}`}>
                          {getStatusLabel(test.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-600 font-semibold">{test.numberOfQuestion || 0}</td>
                      <td className="px-4 py-4 text-gray-600 font-semibold">{test.attemptCount}</td>
                    </tr>
                  ))}
                  {detailTests.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-gray-600 font-semibold py-4">
                        Giáo viên này chưa có đề thi nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ManageExam;
