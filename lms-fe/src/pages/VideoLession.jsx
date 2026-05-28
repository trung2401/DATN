import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { getCourseCurriculum, getVocabularyListInfo } from "../service/courseService";
import DetailCourse from "../components/DetailCourse";

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
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);

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
  }, [courseId]);

  useEffect(() => {
    const fetchLesson = async () => {
      if (lesson) return;
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
  }, [courseId, lessonId, lesson]);

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

            {videoUrl ? (
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
                  <Link
                    to={`/course/vocabulary-list/${lesson.listId}`}
                    state={{
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
                  "Chưa có danh sách từ vựng"
                )}
              </li>
              <li>
                Bài tập:{" "}
                {exerciseUrl ? (
                  <a
                    href={exerciseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#25B379] underline font-semibold"
                  >
                    {lesson?.lessionName || "Tải bài tập"}
                  </a>
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
              canAccessContent={true}
              registrationStatus="confirmed"
              registering={false}
              onRegister={() => {}}
              isLoggedIn={isLoggedIn}
              onLessonClick={() => {}}
            />
          </aside>
        </div>
      )}
    </main>
  );
};

export default VideoLession;
