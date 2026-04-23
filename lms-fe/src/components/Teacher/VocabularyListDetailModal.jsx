import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import ModalWrapper from '../ModalWrapper';
import Button from '../Button';
import AddOrEditVocabularyForm from './AddOrEditVocabularyForm';
import { deleteVocabularyItem, getVocabularyListDetail } from '../../service/teacherVocabularyService';

const VocabularyListDetailModal = ({ show, onClose, vocabularyList }) => {
  const [vocabularies, setVocabularies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showVocabularyForm, setShowVocabularyForm] = useState(false);
  const [editingVocabulary, setEditingVocabulary] = useState(null);
  const [deletingVocabId, setDeletingVocabId] = useState(null);

  useEffect(() => {
    if (show && vocabularyList?.listId) {
      loadVocabularies();
    }
  }, [show, vocabularyList]);

  const loadVocabularies = async () => {
    setLoading(true);
    try {
      const response = await getVocabularyListDetail(vocabularyList.listId);
      const payload = response?.data || response;
      const vocabData = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
      setVocabularies(vocabData);
    } catch (error) {
      toast.error(error?.message || 'Lỗi khi lấy danh sách từ vựng');
      setVocabularies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddForm = () => {
    setEditingVocabulary(null);
    setShowVocabularyForm(true);
  };

  const handleOpenEditForm = (vocab) => {
    setEditingVocabulary(vocab);
    setShowVocabularyForm(true);
  };

  const handleDeleteVocabulary = async (vocabId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa từ vựng này?')) {
      return;
    }

    setDeletingVocabId(vocabId);
    try {
      await deleteVocabularyItem(vocabId);
      toast.success('Xóa từ vựng thành công!');
      await loadVocabularies();
    } catch (error) {
      toast.error(error?.message || 'Lỗi khi xóa từ vựng');
    } finally {
      setDeletingVocabId(null);
    }
  };

  return (
    <ModalWrapper show={show} onClose={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl mx-auto bg-white border-2 border-gray-200 shadow-lg rounded-2xl px-6 pt-6 pb-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold">{vocabularyList?.nameList || 'Danh sách từ vựng'}</h2>
            {vocabularyList?.description && (
              <p className="text-sm text-gray-600 mt-1">{vocabularyList.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              text="Thêm từ vựng"
              variant="primary"
              size="sm"
              icon={<FontAwesomeIcon icon="fa-solid fa-plus" />}
              onClick={handleOpenAddForm}
            />
            <button
              onClick={onClose}
              type="button"
              className="flex items-center justify-center w-8 h-8 hover:bg-gray-200 hover:rounded-lg transition-all duration-200"
            >
              <FontAwesomeIcon icon="fa-solid fa-xmark" size="lg" style={{ color: '#565E6C' }} />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-8 text-gray-600 font-semibold">Đang tải...</div>
        ) : vocabularies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Không có từ vựng trong danh sách này</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vocabularies.map((vocab) => (
              <div
                key={vocab.vocabId}
                className="border-2 border-gray-200 shadow-sm rounded-lg p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Word Header */}
                  <div className="mb-2 pb-2 border-b border-gray-200">
                    <h3 className="font-bold text-lg">{vocab.vocab}</h3>
                    {vocab.pronunciation && (
                      <div className="text-gray-600 font-medium text-sm">{vocab.pronunciation}</div>
                    )}
                  </div>

                  {/* Word Details */}
                  {vocab.mean && <div className="mb-1 text-black font-bold">{vocab.mean}</div>}
                  {vocab.wordType && (
                    <div className="text-sm mb-1 text-gray-600 font-medium italic">({vocab.wordType})</div>
                  )}
                  {vocab.example && (
                    <div className="text-sm mb-3 text-gray-600 font-medium">{vocab.example}</div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    text="Chỉnh sửa"
                    variant="default"
                    size="sm"
                    icon={<FontAwesomeIcon icon="fa-solid fa-pen-to-square" />}
                    onClick={() => handleOpenEditForm(vocab)}
                  />
                  <Button
                    text="Xóa"
                    variant="delete"
                    size="sm"
                    icon={<FontAwesomeIcon icon="fa-solid fa-trash" />}
                    onClick={() => handleDeleteVocabulary(vocab.vocabId)}
                    disabled={deletingVocabId === vocab.vocabId}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
          <Button text="Đóng" variant="default" size="sm" onClick={onClose} />
        </div>

        <AddOrEditVocabularyForm
          show={showVocabularyForm}
          onClose={() => {
            setShowVocabularyForm(false);
            setEditingVocabulary(null);
          }}
          listId={vocabularyList?.listId}
          vocabularyData={editingVocabulary}
          onSaved={loadVocabularies}
        />
      </div>
    </ModalWrapper>
  );
};

export default VocabularyListDetailModal;
