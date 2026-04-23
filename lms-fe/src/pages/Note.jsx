import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchNotes,
  deleteVocabulary,
  updateVocabulary,
} from "../redux/slice/noteSlice";
import Button from "../components/Button.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SearchBar from "../components/SearchBar.jsx";
import VocabularyCard from "../components/Note/VocabularyCard.jsx";
import VocabularyForm from "../components/Note/VocabularyForm.jsx";
import ModalConfirm from "../components/ConfirmModal.jsx";
import { toast } from "react-toastify";
import FlipCard from "../components/Note/FlipCard.jsx";

const Note = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [vocabularyToDelete, setVocabularyToDelete] = useState(null);
  const [currentVocabulary, setCurrentVocabulary] = useState(null);
  const [studyVocabulary, setStudyVocabulary] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const {
    vocabularies,
    loading,
    error,
  } = useSelector((state) => state.note);
  const dispatch = useDispatch();
  const accessToken = localStorage.getItem("access_token") || "";

  useEffect(() => {
    if (!accessToken) {
      toast.error("Vui lòng đăng nhập để xem danh sách từ vựng.");
    } else {
      dispatch(fetchNotes())
        .unwrap()
        .catch((err) => {
          toast.error(err || "Không thể tải danh sách từ vựng.");
        });
    }
  }, [dispatch, accessToken]);

  const toggleFilter = () => setShowFilter((prev) => !prev);

  const handleEdit = (vocabulary) => {
    setCurrentVocabulary(vocabulary);
    setShowForm(true);
  };

  const handleDelete = (vocabulary) => {
    setVocabularyToDelete(vocabulary);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (vocabularyToDelete) {
      try {
        await dispatch(
          deleteVocabulary({ wordId: vocabularyToDelete.id })
        ).unwrap();
        toast.success("Xóa từ vựng thành công!");
      } catch (err) {
        toast.error(err || "Xóa từ vựng thất bại!");
      }
    }
    setShowModal(false);
    setVocabularyToDelete(null);
  };

  const handleCancel = () => {
    setShowModal(false);
    setVocabularyToDelete(null);
  };

  const handleStudyVocabulary = async (vocabulary) => {
    try {
      await dispatch(
        updateVocabulary({
          wordId: vocabulary.id,
          word: vocabulary.word,
          description: vocabulary.description,
          wordType: vocabulary.wordType,
          pronounce: vocabulary.pronounce,
          example: vocabulary.example,
          status: 1,
        })
      ).unwrap();
      toast.success("Cập nhật trạng thái từ vựng thành công!");
    } catch (err) {
      toast.error(err || "Cập nhật trạng thái thất bại!");
    }
  };

  const handleOpenStudyModal = (vocabulary) => {
    setStudyVocabulary(vocabulary);
    setShowStudyModal(true);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilter = (filterValue) => {
    setFilter(filterValue);
    setShowFilter(false);
  };

  const filteredVocabularies = useMemo(() => {
    return vocabularies.filter((vocab) => {
      const matchesSearch =
        vocab.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vocab.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "learned" && Number(vocab.status) === 1) ||
        (filter === "not_learned" && Number(vocab.status) === 0);

      return matchesSearch && matchesFilter;
    });
  }, [vocabularies, searchQuery, filter]);

  return (
    <main className="container mx-auto py-6 px-4 flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-5">
        <div className="flex flex-col items-center text-center gap-2">
          <h2 className="text-3xl font-bold">Ghi chú từ vựng của bạn</h2>
          <p className="text-gray-600 font-medium">
            Lưu trữ và quản lý từ vựng Tiếng Anh dễ dàng
          </p>
        </div>
        <div className="flex justify-center">
          <Button
            text="Thêm từ mới"
            variant="primary"
            size="sm"
            icon={
              <FontAwesomeIcon
                icon="fa-solid fa-plus"
                size="md"
                style={{ color: "#ffffff" }}
              />
            }
            onClick={() => {
              setCurrentVocabulary(null);
              setShowForm(true);
            }}
          />
        </div>
      </div>

      {/* Status Card */}
      {vocabularies.length > 0 && (
        <div className="border-2 border-gray-200 shadow-md rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <h2 className="text-gray-600 font-medium">Tổng số từ vựng</h2>
              <p className="text-2xl font-bold mt-2">{vocabularies.length}</p>
            </div>
            <div className="text-center">
              <h2 className="text-gray-600 font-medium">Số từ đã học</h2>
              <p className="text-2xl font-bold mt-2">
                {vocabularies.filter((v) => Number(v.status) === 1).length}/
                {vocabularies.length}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <h2 className="text-gray-600 font-medium mb-2">
                Tiến độ học tập
              </h2>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black"
                  style={{
                    width: `${
                      vocabularies.length > 0
                        ? (vocabularies.filter((v) => Number(v.status) === 1)
                            .length /
                            vocabularies.length) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <div className="font-bold mt-1 text-sm">
                {vocabularies.length > 0
                  ? Math.round(
                      (vocabularies.filter((v) => Number(v.status) === 1).length /
                        vocabularies.length) *
                        100
                    )
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tìm kiếm & Lọc */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 px-4 md:px-12">
        <SearchBar
          text="Tìm kiếm từ vựng"
          focusBorderColor="focus:ring-gray-400"
          value={searchQuery}
          onChange={handleSearch}
        />
        <div className="relative w-12 md:w-auto">
          <button
            onClick={toggleFilter}
            className="flex items-center justify-center w-full md:w-12 h-12 border-2 border-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200 ease-in-out"
          >
            <FontAwesomeIcon icon="fa-solid fa-filter" size="lg" />
          </button>
          {showFilter && (
            <ul className="absolute top-14 -right-14 bg-white border-2 border-gray-200 rounded-lg shadow-lg w-40 z-10">
              <li
                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium ${
                  filter === "all" ? "bg-gray-100 font-bold" : ""
                }`}
                onClick={() => handleFilter("all")}
              >
                Tất cả
              </li>
              <li
                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium ${
                  filter === "learned" ? "bg-gray-100 font-bold" : ""
                }`}
                onClick={() => handleFilter("learned")}
              >
                Đã học
              </li>
              <li
                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium ${
                  filter === "not_learned" ? "bg-gray-100 font-bold" : ""
                }`}
                onClick={() => handleFilter("not_learned")}
              >
                Chưa học
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Vocabulary Cards */}
      <div className="mt-6 max-h-[calc(100vh-100px)] w-full p-2 overflow-y-auto">
        {loading ? (
          <p
            className="text-center text-gray-600 text-lg font-medium py-8"
          >
            Đang tải từ vựng...
          </p>
        ) : error? (
          <p className="text-center text-red-500 text-lg font-medium py-8">
            {error}
          </p>
        ) : filteredVocabularies.length === 0 ? (
          <p className="text-center text-gray-600 text-lg font-medium py-8">
            Bạn hiện tại chưa có từ vựng nào. Hãy thêm từ vựng mới đi nào!
          </p>
        ) :(
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVocabularies.map((vocab) => (
              <VocabularyCard
                key={vocab.id}
                word={vocab.word}
                wordType={vocab.wordType}
                pronounce={vocab.pronounce}
                description={vocab.description}
                example={vocab.example || ""}
                status={Number(vocab.status) === 1 ? "Đã học" : "Chưa học"}
                onEdit={() => handleEdit(vocab)}
                onDelete={() => handleDelete(vocab)}
                onStudy={() => handleOpenStudyModal(vocab)}
              />
            ))}
          </div>
        )}
      </div>
        {/* Thêm/Cập nhật từ vựng */}
      <VocabularyForm
        show={showForm}
        onClose={() => {
          setShowForm(false);
          setCurrentVocabulary(null);
        }}
        vocabularyData={currentVocabulary}
      />
      {/* Xóa từ vựng */}
      {showModal && (
        <ModalConfirm
          show={showModal}
          onClose={() => setShowModal(false)}
          title="Xác nhận xóa từ vựng"
          description={`Bạn có chắc chắn muốn xóa từ vựng '${vocabularyToDelete?.word}'? Hành động này không thể hoàn tác.`}
          onCancel={handleCancel}
          onConfirm={handleConfirmDelete}
          hoverBgConfirm="hover:bg-red-700"
        />
      )}
      {/* Học từ vựng */}
      <FlipCard
        show={showStudyModal}
        onClose={() => setShowStudyModal(false)}
        vocabulary={studyVocabulary}
        vocabularies={filteredVocabularies}
        onStudy={handleStudyVocabulary}
      />

    </main>
  );
};

export default Note;