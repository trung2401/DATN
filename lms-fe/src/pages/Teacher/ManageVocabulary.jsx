import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';

import Button from '../../components/Button';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import AddVocabularyListForm from '../../components/Teacher/AddVocabularyListForm';
import VocabularyListDetailModal from '../../components/Teacher/VocabularyListDetailModal';
import { getTeacherVocabularyLists, deleteVocabularyList } from '../../service/teacherVocabularyService';

const ManageVocabulary = () => {
  const [vocabularyLists, setVocabularyLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVocabList, setSelectedVocabList] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const itemsPerPage = 5;

  const loadVocabularyLists = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getTeacherVocabularyLists();
      const payload = response?.data || response;
      const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

      setVocabularyLists(
        rows.map((list) => ({
          listId: list.listId || list.ListID,
          nameList: list.nameList || list.NameList || 'N/A',
          description: list.description || list.Description || '',
          userId: list.userId || list.UserID,
        }))
      );
    } catch (error) {
      toast.error(error?.message || 'Lỗi khi lấy danh sách từ vựng');
      setVocabularyLists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVocabularyLists();
  }, [loadVocabularyLists]);

  const filteredLists = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return vocabularyLists;

    return vocabularyLists.filter((list) => {
      const id = String(list.listId || '').toLowerCase();
      const name = String(list.nameList || '').toLowerCase();
      const desc = String(list.description || '').toLowerCase();
      return id.includes(query) || name.includes(query) || desc.includes(query);
    });
  }, [vocabularyLists, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, vocabularyLists]);

  const totalLists = filteredLists.length;
  const totalPages = Math.ceil(totalLists / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLists = filteredLists.slice(startIndex, endIndex);

  const handleViewDetail = (list) => {
    setSelectedVocabList(list);
    setShowDetailModal(true);
  };

  const handleDelete = async (listId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh sách từ vựng này?')) {
      return;
    }

    setDeletingId(listId);
    try {
      await deleteVocabularyList(listId);
      toast.success('Xóa danh sách từ vựng thành công!');
      await loadVocabularyLists();
    } catch (error) {
      toast.error(error?.message || 'Lỗi khi xóa danh sách từ vựng');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="max-w-6xl w-full mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold">Quản lý từ vựng (Giáo viên)</h1>

      <section className="flex flex-col py-5 px-8 gap-5 border-2 border-gray-200 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold">Danh sách từ vựng của tôi</h2>

        <div className="flex flex-row gap-4 w-full px-2 py-3">
          <SearchBar
            text="Tìm kiếm theo ID, tên hoặc mô tả"
            focusBorderColor="focus:ring-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Button
            text="Thêm danh sách"
            variant="primary"
            size="sm"
            icon={<FontAwesomeIcon icon="fa-solid fa-plus" />}
            onClick={() => setShowAddModal(true)}
          />
        </div>

        {loading ? (
          <div className="text-center py-4 text-gray-600 font-semibold text-lg">Đang tải...</div>
        ) : (
          <>
            <table className="w-full min-w-[600px] text-center border-2 border-gray-300 rounded-2xl overflow-hidden border-separate border-spacing-0">
              <thead className="bg-gray-200">
                <tr className="text-black font-bold">
                  <th className="py-3 px-4">List ID</th>
                  <th className="py-3 px-4">Tên danh sách</th>
                  <th className="py-3 px-4">Mô tả</th>
                  <th className="py-3 px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentLists.map((list) => (
                  <tr key={list.listId} className="hover:bg-gray-100">
                    <td className="px-4 py-4 text-gray-600 font-semibold">{list.listId}</td>
                    <td className="px-4 py-4 font-bold text-[#2C99E2]">{list.nameList}</td>
                    <td className="px-4 py-4 text-gray-700 font-medium text-sm">
                      {list.description || '(Không có mô tả)'}
                    </td>
                    <td className="px-4 py-4 flex gap-2 items-center justify-center flex-wrap">
                      <Button
                        text="Chi tiết"
                        variant="primary"
                        size="sm"
                        icon={<FontAwesomeIcon icon="fa-solid fa-eye" />}
                        onClick={() => handleViewDetail(list)}
                      />

                      <Button
                        text="Xóa"
                        variant="delete"
                        size="sm"
                        icon={<FontAwesomeIcon icon="fa-solid fa-trash" />}
                        onClick={() => handleDelete(list.listId)}
                        disabled={deletingId === list.listId}
                      />
                    </td>
                  </tr>
                ))}

                {currentLists.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-600 font-semibold py-4">
                      Không tìm thấy danh sách từ vựng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalLists > 0 && (
              <div className="flex justify-between items-center p-4">
                <span className="text-sm text-gray-600 font-semibold">
                  Hiển thị từ {startIndex + 1} đến {Math.min(endIndex, totalLists)} trong số {totalLists} danh sách
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

      <VocabularyListDetailModal
        show={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedVocabList(null);
        }}
        vocabularyList={selectedVocabList}
      />

      <AddVocabularyListForm
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={loadVocabularyLists}
      />
    </main>
  );
};

export default ManageVocabulary;
