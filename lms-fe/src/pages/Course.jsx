import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import formatCurrency from "../utils/formatCurrency";
import Button from "../components/Button";
import { getCourseCurriculum, getOpenCourses, registerCourse, getUserRegisteredCourses } from "../service/courseService";
import ModalWrapper from "../components/ModalWrapper";
import DetailCourse from "../components/DetailCourse";
import { getUser } from "../service/userService";
import { getEffectiveRegistrationStatus } from "../utils/dateUtils";

const fallbackImage =
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80";

const resolveImageUrl = (image) => {
  const path = String(image || "").trim();
  if (!path) return fallbackImage;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const backendBase = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
  const publicBase = backendBase.replace(/\/api$/i, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${publicBase}${normalizedPath}`;
};

const COURSE_QR_IMAGE = "http://localhost:3000/data/MaQR.jpg";

const PART_LABELS = {
  1: "Part 1: Photographs - Nghe tranh",
  2: "Part 2: Question - Response - Hỏi - đáp",
  3: "Part 3: Conversations - Nghe hiểu đối thoại",
  4: "Part 4: Talks - Nghe hiểu bài nói",
  5: "Part 5: Incomplete Sentences - Điền từ vào câu",
  6: "Part 6: Text Completion - Điền từ vào đoạn văn",
  7: "Part 7: Reading Comprehension - Đọc hiểu văn bản",
};

const Course = () => {
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
  const userInfo = useSelector((state) => state.user.userInfo);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [registeredLoading, setRegisteredLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCurriculum, setShowCurriculum] = useState(false);
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [canAccessContent, setCanAccessContent] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("");
  const [curriculumByPart, setCurriculumByPart] = useState({});

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const response = await getOpenCourses();
        const rows = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];

        setCourses(rows);
      } catch (error) {
        setCourses([]);
        toast.error(error?.message || "Không thể tải danh sách khóa học");
      } finally {
        setLoading(false);
      }
    };

    const loadRegisteredCourses = async () => {
      if (!isLoggedIn) {
        setRegisteredCourses([]);
        return;
      }

      try {
        setRegisteredLoading(true);
        const response = await getUserRegisteredCourses();
        const data = response?.data || response || [];
        const registrations = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        
        // Extract course info from registrations with duration check
        const coursesList = registrations
          .filter(reg => reg.course && (reg.status === 'pending' || reg.status === 'confirmed'))
          .map(reg => {
            const effectiveStatus = getEffectiveRegistrationStatus(
              reg.status,
              reg.date,
              reg.course?.duration
            );
            return {
              courseId: reg.course.courseId,
              courseName: reg.course.courseName,
              registerCourseId: reg.registerCourseId,
              registrationStatus: effectiveStatus,
              date: reg.date,
              duration: reg.course?.duration
            };
          });
        
        setRegisteredCourses(coursesList);
      } catch (error) {
        setRegisteredCourses([]);
        console.error("Failed to load registered courses:", error);
      } finally {
        setRegisteredLoading(false);
      }
    };

    loadCourses();
    loadRegisteredCourses();
  }, [isLoggedIn]);

  const openCourses = useMemo(
    () => courses.filter((course) => Number(course?.status ?? 1) === 1),
    [courses]
  );

  const handleOpenCurriculum = async (course) => {
    const courseId = Number(course?.courseId);
    if (!courseId) return;

    setSelectedCourse(course);
    setShowCurriculum(true);
    setCurriculumLoading(true);
    setCurriculumByPart({});
    setCanAccessContent(false);
    setRegistrationStatus(null);

    try {
      const response = await getCourseCurriculum({ courseId });
      // axios-customize có thể đã unwrap thành object { success, canAccessContent, data }
      // hoặc trả trực tiếp mảng tùy endpoint
      const payload = Array.isArray(response) ? { data: response } : (response || {});
      const rows = Array.isArray(payload?.data) ? payload.data : [];

      const grouped = rows.reduce((acc, lesson) => {
        const partId = Number(lesson?.partId || lesson?.PartID || 0);
        if (!partId) return acc;
        if (!acc[partId]) acc[partId] = [];
        acc[partId].push(lesson);
        return acc;
      }, {});

      Object.keys(grouped).forEach((partId) => {
        grouped[partId] = grouped[partId].sort(
          (a, b) => Number(a?.orderNumber || 0) - Number(b?.orderNumber || 0)
        );
      });

      setCurriculumByPart(grouped);
      setCanAccessContent(Boolean(payload?.canAccessContent));
      setRegistrationStatus(payload?.registrationStatus ? String(payload.registrationStatus).toLowerCase() : null);
    } catch (error) {
      setCurriculumByPart({});
      toast.error(error?.message || "Không thể tải chương trình học");
    } finally {
      setCurriculumLoading(false);
    }
  };

  const closeCurriculumModal = () => {
    setShowCurriculum(false);
    setSelectedCourse(null);
    setCurriculumByPart({});
    setCanAccessContent(false);
    setRegistrationStatus(null);
  };

  const handleRegisterCourse = async () => {
    if (!isLoggedIn) {
      toast.info("Vui lòng đăng nhập để đăng ký khóa học");
      return;
    }

    let resolvedUserName = String(userInfo?.userName || userInfo?.UserName || "").trim();
    if (!resolvedUserName) {
      try {
        const response = await getUser();
        const profile = response?.data || response;
        resolvedUserName = String(profile?.userName || profile?.UserName || "").trim();
      } catch {
        resolvedUserName = "";
      }
    }

    setCurrentUserName(resolvedUserName || "user");
    setShowPaymentModal(true);
  };

  const handleContactTeacher = (course) => {
    const teacherId = Number(course?.teacherId || course?.TeacherID || course?.teacher?.userId || 0);
    if (!teacherId) {
      toast.error("Không xác định được giáo viên của khóa học này.");
      return;
    }

    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          redirectTo: "/chat",
          chatContactUserId: teacherId,
        },
      });
      return;
    }

    navigate("/chat", {
      state: {
        contactUserId: teacherId,
      },
    });
  };

  const handleConfirmPaidAndRegister = async () => {
    const courseId = Number(selectedCourse?.courseId);
    if (!courseId) return;

    try {
      setRegistering(true);
      await registerCourse({
        courseId,
        totalAmount: Number(selectedCourse?.price || 0),
      });
      toast.success("Đã ghi nhận đăng ký khóa học thành công.");
      setRegistrationStatus("pending");
      setShowPaymentModal(false);
    } catch (error) {
      toast.error(error?.message || "Đăng ký khóa học thất bại");
    } finally {
      setRegistering(false);
    }
  };

  const transferContent = `${currentUserName} thanh toan ${selectedCourse?.courseId || ""}`;

  return (
    <>
      <main className="container mx-auto px-4 py-10">
      {isLoggedIn && (
        <section className="mb-12">
          <h1 className="text-3xl font-bold mb-2">Khóa học đã đăng ký</h1>
          <p className="text-gray-600 font-medium mb-6">
            Các khóa học bạn đã đăng ký hoặc đang chờ xác nhận từ admin.
          </p>

          {registeredLoading ? (
            <div className="text-center text-gray-600 font-semibold py-10">Đang tải danh sách khóa học đã đăng ký...</div>
          ) : registeredCourses.length === 0 ? (
            <div className="text-center text-gray-600 font-semibold py-10">Bạn chưa đăng ký khóa học nào.</div>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredCourses.map((reg) => {
                const courseFromList = courses.find(c => Number(c?.courseId) === Number(reg.courseId));
                if (!courseFromList) return null;

                const courseName = courseFromList?.courseName || "Khóa học TOEIC";
                const teacherName = courseFromList?.teacherName || "Đội ngũ giảng viên";
                const imageUrl = resolveImageUrl(courseFromList?.image);

                return (
                  <article
                    key={String(reg.registerCourseId)}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleOpenCurriculum(courseFromList)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleOpenCurriculum(courseFromList);
                      }
                    }}
                    className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white hover:shadow-lg transition cursor-pointer"
                  >
                    <div className="relative h-48 bg-gray-100">
                      <img src={imageUrl} alt={courseName} className="w-full h-full object-cover" />
                      <span className={`absolute top-2 right-2 text-white text-sm font-semibold px-3 py-1 rounded-sm ${
                        reg.registrationStatus === 'expired' 
                          ? 'bg-red-600' 
                          : reg.registrationStatus === 'confirmed' 
                            ? 'bg-[#25B379]' 
                            : 'bg-orange-500'
                      }`}>
                        {reg.registrationStatus === 'expired' ? 'Đã quá hạn' : reg.registrationStatus === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h2 className="font-bold text-lg leading-snug">{courseName}</h2>
                      <p className="text-gray-600 text-sm">{courseFromList?.courseDesc || "Chưa có mô tả khóa học."}</p>
                      <p className="text-gray-600 text-sm">Giảng viên: {teacherName}</p>
                      <p className="text-gray-600 text-sm">Đầu vào: {courseFromList?.input || "Đang cập nhật"}</p>
                      <p className="text-gray-600 text-sm">Mục tiêu: {courseFromList?.target || "Đang cập nhật"}</p>
                      <p className="text-[#25B379] text-sm font-semibold pt-2">Nhấn để xem chương trình học</p>
                      <div className="pt-2 flex justify-end">
                        <Button
                          text="Liên hệ giáo viên"
                          variant="default"
                          size="sm"
                          icon={<FontAwesomeIcon icon="fa-solid fa-comments" />}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleContactTeacher(courseFromList);
                          }}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </section>
      )}

      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{isLoggedIn ? 'Khóa học đang mở' : 'Khóa học đang mở'}</h1>
        <p className="text-gray-600 font-medium">
          {isLoggedIn 
            ? 'Danh sách tất cả các khóa học có sẵn để bạn đăng ký thêm.'
            : 'Danh sách khóa học TOEIC hiện có để bạn tham khảo trước khi đăng ký.'}
        </p>
      </section>

      {loading ? (
        <div className="text-center text-gray-600 font-semibold py-10">Đang tải danh sách khóa học...</div>
      ) : openCourses.length === 0 ? (
        <div className="text-center text-gray-600 font-semibold py-10">Hiện chưa có khóa học mở đăng ký.</div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {openCourses.map((course) => {
            const courseId = course?.courseId ?? "N/A";
            const courseName = course?.courseName || "Khóa học TOEIC";
            const teacherName = course?.teacherName || "Đội ngũ giảng viên";
            const imageUrl = resolveImageUrl(course?.image);

            return (
              <article
                key={String(courseId)}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenCurriculum(course)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpenCurriculum(course);
                  }
                }}
                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white hover:shadow-lg transition cursor-pointer"
              >
                <div className="relative h-48 bg-gray-100">
                  <img src={imageUrl} alt={courseName} className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 bg-[#25B379] text-white text-sm font-semibold px-3 py-1 rounded-sm">
                    {formatCurrency(Number(course?.price || 0))}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h2 className="font-bold text-lg leading-snug">{courseName}</h2>
                  <p className="text-gray-600 text-sm">{course?.courseDesc || "Chưa có mô tả khóa học."}</p>
                  <p className="text-gray-600 text-sm">Giảng viên: {teacherName}</p>
                  <p className="text-gray-600 text-sm">Đầu vào: {course?.input || "Đang cập nhật"}</p>
                  <p className="text-gray-600 text-sm">Mục tiêu: {course?.target || "Đang cập nhật"}</p>
                  <p className="text-gray-500 text-sm">Số lượng học viên: {Number(course?.studentCount || 0)}</p>
                  <p className="text-[#25B379] text-sm font-semibold pt-2">Nhấn để xem chương trình học</p>
                  <div className="pt-2 flex justify-end">
                    <Button
                      text="Liên hệ giáo viên"
                      variant="default"
                      size="sm"
                      icon={<FontAwesomeIcon icon="fa-solid fa-comments" />}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleContactTeacher(course);
                      }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
      </main>

      <DetailCourse
        show={showCurriculum}
        onClose={closeCurriculumModal}
        selectedCourse={selectedCourse}
        curriculumByPart={curriculumByPart}
        curriculumLoading={curriculumLoading}
        canAccessContent={canAccessContent}
        registrationStatus={registrationStatus}
        registering={registering}
        onRegister={handleRegisterCourse}
        isLoggedIn={isLoggedIn}
        onLessonClick={() => {}}
      />

      <ModalWrapper show={showPaymentModal} onClose={() => !registering && setShowPaymentModal(false)}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[95vh] border-2 border-gray-200 shadow-md rounded-2xl p-4 bg-white overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-center flex-1">Thanh toán</h3>
            <button
              type="button"
              onClick={() => !registering && setShowPaymentModal(false)}
              className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center"
              disabled={registering}
            >
              <FontAwesomeIcon icon="fa-solid fa-xmark" />
            </button>
          </div>

          <div className="flex justify-center mb-4">
            <img src={COURSE_QR_IMAGE} alt="QR thanh toán khóa học" className="w-full max-w-sm object-contain rounded" />
          </div>

          <div className="space-y-2 mb-5">
            <p className="text-gray-700 font-medium">
              Số tiền cần thanh toán: <span className="font-bold text-[#25B379]">{formatCurrency(Number(selectedCourse?.price || 0))}</span>
            </p>
            <p className="text-gray-700 font-medium">
              Nội dung chuyển khoản:
            </p>
            <div className="bg-gray-100 rounded-md px-3 py-2 text-[#25B379] font-semibold break-all">
              {transferContent}
            </div>
          </div>

          <Button
            text={registering ? "Đang xử lý..." : "Tôi đã thanh toán"}
            size="lg"
            variant="primary"
            disabled={registering}
            onClick={handleConfirmPaidAndRegister}
          />
        </div>
      </ModalWrapper>
    </>
  );
};

export default Course;
