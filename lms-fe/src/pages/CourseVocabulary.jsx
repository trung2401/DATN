import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import SearchBar from "../components/SearchBar";
import VocabularyCard from "../components/Note/VocabularyCard";
import FlipCard from "../components/Note/FlipCard";
import { getVocabularyByList, getUserRegisteredCourses } from "../service/courseService";
import { getEffectiveRegistrationStatus } from "../utils/dateUtils";

const normalizeVocabulary = (item) => ({
  id: item?.vocabId,
  word: item?.vocab || "",
  wordType: item?.wordType || "",
  pronounce: item?.pronunciation || "",
  description: item?.mean || "",
  example: item?.example || "",
  status: Number(item?.status ?? 0),
});

const CourseVocabulary = () => {
  const { listId } = useParams();
  const location = useLocation();
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
  const courseId = location.state?.courseId; // Pass courseId from parent

  const [loading, setLoading] = useState(false);
  const [canAccessContent, setCanAccessContent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [vocabularies, setVocabularies] = useState([]);
  const [listInfo, setListInfo] = useState(location.state?.listInfo || null);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [studyVocabulary, setStudyVocabulary] = useState(null);

  // Check access permission
  useEffect(() => {
    const checkAccess = async () => {
      if (!isLoggedIn || !courseId) {
        setCanAccessContent(false);
        return;
      }

      try {
        const response = await getUserRegisteredCourses();
        const data = response?.data || response || [];
        const registrations = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        
        const courseReg = registrations.find(
          reg => Number(reg.course?.courseId) === Number(courseId)
        );

        if (!courseReg || courseReg.status !== 'confirmed') {
          setCanAccessContent(false);
          return;
        }

        const effectiveStatus = getEffectiveRegistrationStatus(
          courseReg.status,
          courseReg.date,
          courseReg.course?.duration
        );

        setCanAccessContent(effectiveStatus !== 'expired');
      } catch (error) {
        console.error("Failed to check access:", error);
        setCanAccessContent(false);
      }
    };

    checkAccess();
  }, [isLoggedIn, courseId]);

  useEffect(() => {
    const fetchList = async () => {
      if (!listId) return;

      try {
        setLoading(true);
        const response = await getVocabularyByList({ listId });
        const payload = Array.isArray(response) ? { data: response } : (response || {});
        const rows = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];

        setVocabularies(rows.map(normalizeVocabulary));
        if (payload?.list) {
          setListInfo(payload.list);
        }
      } catch (error) {
        toast.error(error?.message || "Không thể tải danh sách từ vựng");
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [listId]);

  const filteredVocabularies = useMemo(() => {
    const keyword = searchQuery.toLowerCase().trim();
    if (!keyword) return vocabularies;

    return vocabularies.filter((vocab) => {
      return (
        vocab.word.toLowerCase().includes(keyword) ||
        vocab.description.toLowerCase().includes(keyword) ||
        vocab.example.toLowerCase().includes(keyword)
      );
    });
  }, [vocabularies, searchQuery]);

  const handleOpenStudyModal = (vocabulary) => {
    setStudyVocabulary(vocabulary);
    setShowStudyModal(true);
  };

  return (
    <main className="container mx-auto py-6 px-4 flex-1">
      <div className="flex flex-col gap-3 mb-5">
        <h2 className="text-3xl font-bold">{listInfo?.nameList || `Danh sách từ vựng #${listId}`}</h2>
        <Link to={-1} className="text-[#25B379] font-semibold hover:underline w-fit">
          Trở về bài giảng
        </Link>
      </div>

      {!canAccessContent && courseId ? (
        <div className="w-full rounded border border-red-300 bg-red-50 p-6 text-center">
          <p className="text-red-700 font-semibold mb-2">🔒 Bạn không có quyền truy cập tài liệu này</p>
          <p className="text-red-600 text-sm mb-4">Vui lòng đăng ký khóa học để xem danh sách từ vựng.</p>
          <Link to="/courses" className="inline-block bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700">
            ← Quay lại danh sách khóa học
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-5">
            <SearchBar
              text="Tìm kiếm từ vựng"
              focusBorderColor="focus:ring-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="mt-6 max-h-[calc(100vh-180px)] w-full p-2 overflow-y-auto">
            {loading ? (
              <p className="text-center text-gray-600 text-lg font-medium py-8">Đang tải từ vựng...</p>
            ) : filteredVocabularies.length === 0 ? (
              <p className="text-center text-gray-600 text-lg font-medium py-8">Không có từ vựng phù hợp.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVocabularies.map((vocab) => (
                  <VocabularyCard
                    key={vocab.id}
                    word={vocab.word}
                    wordType={vocab.wordType}
                    pronounce={vocab.pronounce}
                    description={vocab.description}
                    example={vocab.example}
                    status={Number(vocab.status) === 1 ? "Đã học" : "Chưa học"}
                    onStudy={() => handleOpenStudyModal(vocab)}
                    readOnly
                  />
                ))}
              </div>
            )}
          </div>

          <FlipCard
            show={showStudyModal}
            onClose={() => setShowStudyModal(false)}
            vocabulary={studyVocabulary}
            vocabularies={filteredVocabularies}
            onStudy={() => {}}
            readOnlyStudy
          />
        </>
      )}
    </main>
  );
};

export default CourseVocabulary;
