import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';

import Button from '../../components/Button';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import CourseLessonManager from '../../components/Teacher/CourseLessonManager';
import { getTeacherCourses } from '../../service/teacherCourseService';

const ManageCourseTeacher = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showLessonManager, setShowLessonManager] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const itemsPerPage = 5;

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getTeacherCourses();
      const payload = response?.data || response;
      const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

      setCourses(
        rows.map((course) => ({
          courseId: course.courseId || course.CourseID,
          courseName: course.courseName || course.CourseName || 'N/A',
          teacherName: course.teacherName || course.Teacher?.Name || 'N/A',
          status: Number(course.status ?? 1),
        }))
      );
    } catch (error) {
      toast.error(error?.message || 'Lỗi khi lấy danh sách khóa học của giáo viên');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return courses;

    return courses.filter((course) => {
      const id = String(course.courseId || '').toLowerCase();
      const name = String(course.courseName || '').toLowerCase();
      const teacher = String(course.teacherName || '').toLowerCase();
      return id.includes(query) || name.includes(query) || teacher.includes(query);
    });
  }, [courses, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, courses]);

  const totalCourses = filteredCourses.length;
  const totalPages = Math.ceil(totalCourses / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  const handleOpenLessons = (course) => {
    setSelectedCourse(course);
    setShowLessonManager(true);
  };

  return (
    <main className="max-w-6xl w-full mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold">Quản lý khóa học (Giáo viên)</h1>

      <section className="flex flex-col py-5 px-8 gap-5 border-2 border-gray-200 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold">Danh sách khóa học của tôi</h2>

        <div className="flex flex-row gap-4 w-full px-2 py-3">
          <SearchBar
            text="Tìm kiếm theo ID hoặc tên khóa học"
            focusBorderColor="focus:ring-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-4 text-gray-600 font-semibold text-lg">Đang tải...</div>
        ) : (
          <>
            <table className="w-full min-w-[600px] text-center border-2 border-gray-300 rounded-2xl overflow-hidden border-separate border-spacing-0">
              <thead className="bg-gray-200">
                <tr className="text-black font-bold">
                  <th className="py-3 px-4">Course ID</th>
                  <th className="py-3 px-4">Tên khóa học</th>
                  <th className="py-3 px-4">Giáo viên</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentCourses.map((course) => (
                  <tr key={course.courseId} className="hover:bg-gray-100">
                    <td className="px-4 py-4 text-gray-600 font-semibold">{course.courseId}</td>
                    <td className="px-4 py-4 font-bold text-[#2C99E2]">{course.courseName}</td>
                    <td className="px-4 py-4 text-gray-700 font-medium">{course.teacherName}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                          Number(course.status) === 1
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {Number(course.status) === 1 ? 'Đang mở' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-4 py-4 flex gap-2 items-center justify-center">
                      <Button
                        text="Bài giảng"
                        variant="default"
                        size="sm"
                        icon={<FontAwesomeIcon icon="fa-solid fa-book-open" />}
                        onClick={() => handleOpenLessons(course)}
                      />
                    </td>
                  </tr>
                ))}

                {currentCourses.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-600 font-semibold py-4">
                      Không tìm thấy khóa học.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalCourses > 0 && (
              <div className="flex justify-between items-center p-4">
                <span className="text-sm text-gray-600 font-semibold">
                  Hiển thị từ {startIndex + 1} đến {Math.min(endIndex, totalCourses)} trong số {totalCourses} khóa học
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

      <CourseLessonManager
        show={showLessonManager}
        onClose={() => {
          setShowLessonManager(false);
          setSelectedCourse(null);
        }}
        course={selectedCourse}
      />
    </main>
  );
};

export default ManageCourseTeacher;
