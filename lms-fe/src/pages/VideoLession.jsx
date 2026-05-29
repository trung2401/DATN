import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { getCourseCurriculum, getVocabularyListInfo, getUserRegisteredCourses } from "../service/courseService";
import DetailCourse from "../components/DetailCourse";
import { getEffectiveRegistrationStatus } from "../utils/dateUtils";

const resolveAssetUrl = (assetPath) => {
  const path = String(assetPath || "").trim();
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const backendBase = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
  const publicBase = backendBase.replace(/\/api$/i, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${publicBase}${normalizedPath}`;
};

const VideoLession = () => {
  const { courseId, lessonId } = useParams();
  const location = useLocation();

  const [lesson, setLesson] = useState(location.state?.lesson || null);
  const [loading, setLoading] = useState(false);
  const [vocabularyListInfo, setVocabularyListInfo] = useState(
    location.state?.listInfo || null
  );
  const [curriculumByPart, setCurriculumByPart] = useState({});
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState("pending");
  const [canAccessContent, setCanAccessContent] = useState(false);
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);

  // Check course registration status and expiry
  useEffect(() => {
    const checkRegistration = async () => {
      if (!isLoggedIn || !courseId) {
        setCanAccessContent(false);
        setRegistrationStatus(null);
        return;
      }

      try {
        const response = await getUserRegisteredCourses();
        const data = response?.data || response || [];
        const registrations = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        
        console.log('📚 VideoLession - Registrations loaded:', registrations);
        
        const courseReg = registrations.find(
          reg => Number(reg.course?.courseId) === Number(courseId)
        );

        console.log(`🔍 VideoLession - Looking for courseId: ${courseId}`, { courseReg });

        if (!courseReg || courseReg.status !== 'confirmed') {
          console.warn(`⚠️  VideoLession - No confirmed registration found. Status:`, courseReg?.status);
          setCanAccessContent(false);
          setRegistrationStatus(courseReg?.status || null);
          return;
        }

        console.log('📅 VideoLession - Checking expiry:', {
          date: courseReg.date,
          duration: courseReg.course?.duration,
          courseId: courseReg.course?.courseId
        });

        // Check if registration expired
        const effectiveStatus = getEffectiveRegistrationStatus(
          courseReg.status,
          courseReg.date,
          courseReg.course?.duration
        );

        console.log(`✅ VideoLession - Effective status: ${effectiveStatus}`);

        if (effectiveStatus === 'expired') {
          console.error('❌ VideoLession - Registration EXPIRED, blocking access');
          setCanAccessContent(false);
          setRegistrationStatus('expired');
        } else {
          console.log('✓ VideoLession - Registration ACTIVE, allowing access');
          setCanAccessContent(true);
          setRegistrationStatus(effectiveStatus);
        }
      } catch (error) {
        console.error("Failed to check course registration:", error);
        setCanAccessContent(false);
        setRegistrationStatus(null);
      }
    };

    checkRegistration();
  }, [isLoggedIn, courseId]);

  useEffect(() => {
    const fetchVocabularyListName = async () => {
      if (!lesson?.listId) return;

      try {
        const response = await getVocabularyListInfo({ listId: lesson.listId });
        const payload = response?.data || response;
        const info = payload?.data || payload;

        if (info?.listId || info?.ListID) {
          setVocabularyListInfo({
            listId: info.listId || info.ListID,
            nameList: info.nameList || info.NameList || `Danh sách từ vựng #${lesson.listId}`,
          });
        }
      } catch {
        setVocabularyListInfo({
          listId: lesson.listId,
          nameList: `Danh sách từ vựng #${lesson.listId}`,
        });
      }
    };

    fetchVocabularyListName();
  }, [lesson]);

  useEffect(() => {
    const loadCurriculum = async () => {
      if (!courseId) return;

      try {
        setCurriculumLoading(true);
        const response = await getCourseCurriculum({ courseId });
        const payload = Array.isArray(response) ? { data: response } : (response || {});
        const rows = Array.isArray(payload?.data) ? payload.data : [];

        const grouped = rows.reduce((acc, lsn) => {
          const partId = Number(lsn?.partId || lsn?.PartID || 0);
          if (!partId) return acc;
          if (!acc[partId]) acc[partId] = [];
          acc[partId].push(lsn);
          return acc;
        }, {});

        Object.keys(grouped).forEach((partId) => {
          grouped[partId] = grouped[partId].sort(
            (a, b) => Number(a?.orderNumber || 0) - Number(b?.orderNumber || 0)
          );
        });

        setCurriculumByPart(grouped);
      } catch {
        setCurriculumByPart({});
      } finally {
        setCurriculumLoading(false);
      }
    };

    loadCurriculum();
  }, [courseId, lessonId]);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!courseId || !lessonId) return;

      try {
        setLoading(true);
        const response = await getCourseCurriculum({ courseId });
        const payload = Array.isArray(response) ? { data: response } : (response || {});
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        const found = rows.find((item) => Number(item?.lessionId) === Number(lessonId));
        if (!found) {
          toast.error("Không tìm thấy bài giảng");
          return;
        }
        setLesson(found);
      } catch (error) {
        toast.error(error?.message || "Không tải được bài giảng");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [courseId, lessonId]);

  const videoUrl = useMemo(() => resolveAssetUrl(lesson?.video), [lesson]);
  const exerciseUrl = useMemo(() => resolveAssetUrl(lesson?.exercise), [lesson]);

  return (
    <main className="container mx-auto px-4 py-10">
      {loading ? (
        <div className="text-center text-gray-600 font-semibold">Đang tải bài giảng...</div>
      ) : !lesson ? (
        <div className="text-center text-gray-600 font-semibold">Không có dữ liệu bài giảng.</div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">
          <section className="flex-1 lg:basis-2/3 space-y-4">
            <h1 className="text-4xl font-bold">{lesson?.lessionName || "Bài giảng"}</h1>

            <div className="flex items-center gap-2">
              <Link
                to="/course"
                className="inline-flex items-center gap-2 text-[#25B379] font-semibold hover:underline"
              >
                <FontAwesomeIcon icon="fa-solid fa-chevron-left" size="xs" />
                Trở về khóa học
              </Link>
            </div>

            {!canAccessContent ? (
              <div className="w-full rounded border border-red-300 bg-red-50 p-6 text-center">
                <p className="text-red-700 font-semibold mb-2">
                  {registrationStatus === 'expired'
                    ? '⏰ Khóa học của bạn đã quá hạn'
                    : '🔒 Bạn không có quyền xem bài giảng này'}
                </p>
                <p className="text-red-600 text-sm mb-4">
                  {registrationStatus === 'expired'
                    ? 'Thời gian sử dụng khóa học đã kết thúc. Vui lòng đăng ký lại để tiếp tục học tập.'
                    : 'Vui lòng đăng ký khóa học để xem nội dung.'}
                </p>
                <Link
                  to="/courses"
                  className="inline-block bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700"
                >
                  ← Quay lại danh sách khóa học
                </Link>
              </div>
            ) : videoUrl ? (
              <video controls className="w-full rounded border border-gray-200 bg-black">
                <source src={videoUrl} />
                Trình duyệt không hỗ trợ video.
              </video>
            ) : (
              <div className="text-gray-500 font-medium">Bài này chưa có video.</div>
            )}

            <ul className="list-disc pl-6 text-lg text-[#25B379] space-y-1">
              <li>
                Từ vựng:{" "}
                {lesson?.listId ? (
                  canAccessContent ? (
                    <Link
                      to={`/course/vocabulary-list/${lesson.listId}`}
                      state={{
                        courseId,
                        listInfo: vocabularyListInfo || {
                          listId: lesson.listId,
                          nameList: `Danh sách từ vựng #${lesson.listId}`,
                        },
                      }}
                      className="text-[#25B379] underline font-semibold"
                    >
                      {vocabularyListInfo?.nameList || `Danh sách từ vựng #${lesson.listId}`}
                    </Link>
                  ) : (
                    <span className="text-gray-400 line-through cursor-not-allowed" title="Bạn không có quyền truy cập">
                      {vocabularyListInfo?.nameList || `Danh sách từ vựng #${lesson.listId}`}
                    </span>
                  )
                ) : (
                  "Chưa có danh sách từ vựng"
                )}
              </li>
              <li>
                Bài tập:{" "}
                {exerciseUrl ? (
                  canAccessContent ? (
                    <a
                      href={exerciseUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#25B379] underline font-semibold"
                    >
                      {lesson?.lessionName || "Tải bài tập"}
                    </a>
                  ) : (
                    <span className="text-gray-400 line-through cursor-not-allowed" title="Bạn không có quyền truy cập">
                      {lesson?.lessionName || "Tải bài tập"}
                    </span>
                  )
                ) : (
                  "Chưa có bài tập"
                )}
              </li>
            </ul>
          </section>

          <aside className="w-full lg:w-[360px] lg:shrink-0">
            <DetailCourse
              variant="sidebar"
              selectedCourse={{
                courseId,
                courseName: lesson?.courseNameDetail || "Khóa học",
              }}
              curriculumByPart={curriculumByPart}
              curriculumLoading={curriculumLoading}
              canAccessContent={canAccessContent}
              registrationStatus={registrationStatus}
              registering={false}
              onRegister={() => {}}
              isLoggedIn={isLoggedIn}
              onLessonClick={() => {
                // Handler is already handled by Link navigation
                // This just ensures the link works properly
              }}
            />
          </aside>
        </div>
      )}
    </main>
  );
};

export default VideoLession;
