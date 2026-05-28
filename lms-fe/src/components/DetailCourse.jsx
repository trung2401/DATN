import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "./Button";
import ModalWrapper from "./ModalWrapper";

const PART_LABELS = {
  1: "Part 1: Photographs - Nghe tranh",
  2: "Part 2: Question - Response - Hỏi - đáp",
  3: "Part 3: Conversations - Nghe hiểu đối thoại",
  4: "Part 4: Talks - Nghe hiểu bài nói",
  5: "Part 5: Incomplete Sentences - Điền từ vào câu",
  6: "Part 6: Text Completion - Điền từ vào đoạn văn",
  7: "Part 7: Reading Comprehension - Đọc hiểu văn bản",
};

const DetailCourse = ({
  show,
  onClose,
  selectedCourse,
  curriculumByPart = {},
  curriculumLoading = false,
  canAccessContent = false,
  registrationStatus = null,
  registering = false,
  onRegister,
  isLoggedIn = false,
  onLessonClick,
  variant = "modal",
}) => {
  const isSidebar = variant === "sidebar";
  const content = (
    <div
      onClick={(e) => e.stopPropagation()}
      className={
        isSidebar
          ? "bg-white rounded-xl border border-gray-200 p-4 shadow-sm max-h-[80vh] overflow-y-auto"
          : "bg-white rounded-xl py-6 px-5 w-full max-w-5xl shadow-lg max-h-[95vh] overflow-y-auto"
      }
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4 gap-4">
        <div>
          <h2 className={isSidebar ? "text-xl font-bold" : "text-2xl font-bold"}>
            {selectedCourse?.courseName || "Chương trình học"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {canAccessContent
              ? "Bạn đã mua khóa học. Có thể xem đầy đủ video và bài tập."
              : "Bạn chưa mua khóa học. Có thể xem danh sách bài giảng, nội dung chi tiết đang bị khóa."}
          </p>
        </div>
        {!isSidebar && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center"
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" size="lg" />
          </button>
        )}
      </div>

        {/* Guest access message */}
        {!isLoggedIn && (
          <div className="mb-4 text-sm bg-[#E6F0FA] text-[#25B379] rounded-md px-3 py-2 font-medium">
            Bạn đang xem với quyền khách. Đăng nhập và mua khóa học để mở khóa
            video, bài tập.
            <Link to="/login" className="ml-2 underline font-semibold">
              Đăng nhập
            </Link>
          </div>
        )}

        {/* Registration required message */}
        {isLoggedIn &&
          !canAccessContent &&
          (registrationStatus === null || registrationStatus === "cancel") && (
            <div className="mb-4 flex items-center justify-between gap-3 bg-[#E6F0FA] rounded-md px-3 py-3">
              <p className="text-sm text-[#25B379] font-medium">
                Bạn chưa đăng ký khóa học này.
              </p>
              <Button
                text={registering ? "Đang đăng ký..." : "Đăng ký khóa học"}
                variant="primary"
                size="sm"
                disabled={registering}
                onClick={onRegister}
              />
            </div>
          )}

        {/* Pending approval message */}
        {isLoggedIn &&
          !canAccessContent &&
          registrationStatus === "pending" && (
            <div className="mb-4 text-sm bg-[#FFF7E6] text-[#B7791F] rounded-md px-3 py-2 font-medium">
              Bạn đã đăng ký khóa học. Đơn đang chờ admin xác nhận.
            </div>
          )}

        {/* Curriculum content */}
        {curriculumLoading ? (
          <div className="text-center text-gray-600 font-semibold py-8">
            Đang tải chương trình học...
          </div>
        ) : (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map((partId) => {
              const lessons = curriculumByPart[partId] || [];

              return (
                <div key={partId} className="border-b border-gray-200 pb-3">
                  <h3 className="font-semibold mb-2">{PART_LABELS[partId]}</h3>

                  {lessons.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa có bài giảng.</p>
                  ) : (
                    <div className="space-y-2">
                      {lessons.map((lesson) => {
                        const lessonLocked =
                          !canAccessContent || Boolean(lesson?.isLocked);

                        return (
                          <div
                            key={String(lesson?.lessionId)}
                            className="border border-[#25D390]/40 rounded-md p-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="font-semibold text-[#25B379]">
                                  Bài {lesson?.orderNumber || "-"}:{" "}
                                  {lesson?.lessionName || "Bài giảng"}
                                </p>
                              </div>
                              {lessonLocked && (
                                <FontAwesomeIcon
                                  icon="fa-solid fa-lock"
                                  className="text-[#25B379]"
                                />
                              )}
                            </div>

                            {lessonLocked ? (
                              <p className="text-sm text-gray-500 mt-1">
                                Nội dung video/bài tập bị khóa. Vui lòng mua
                                khóa học để truy cập.
                              </p>
                            ) : (
                              <div className="mt-3 space-y-3">
                                <Link
                                  to={`/video-lession/${selectedCourse?.courseId}/${lesson?.lessionId}`}
                                  state={{ lesson }}
                                  className="inline-flex items-center gap-2 text-sm text-[#25B379] font-semibold hover:underline"
                                  onClick={onLessonClick}
                                >
                                  <FontAwesomeIcon icon="fa-solid fa-circle-play" />
                                  Xem bài giảng
                                </Link>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );

  if (isSidebar) {
    return content;
  }

  return (
    <ModalWrapper show={show} onClose={onClose}>
      {content}
    </ModalWrapper>
  );
};

export default DetailCourse;
