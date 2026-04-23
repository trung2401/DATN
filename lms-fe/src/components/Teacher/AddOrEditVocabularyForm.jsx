import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';

import ModalWrapper from '../ModalWrapper';
import Button from '../Button';
import { addVocabularyToList, updateVocabularyItem } from '../../service/teacherVocabularyService';

const AddOrEditVocabularyForm = ({ show, onClose, listId, vocabularyData, onSaved }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vocab: '',
    mean: '',
    wordType: '',
    pronunciation: '',
    example: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!show) return;

    setFormData({
      vocab: vocabularyData?.vocab || '',
      mean: vocabularyData?.mean || '',
      wordType: vocabularyData?.wordType || '',
      pronunciation: vocabularyData?.pronunciation || '',
      example: vocabularyData?.example || '',
    });
    setErrors({});
    setIsSubmitting(false);
  }, [show, vocabularyData]);

  const validate = (data) => {
    const nextErrors = {};
    if (!String(data.vocab || '').trim()) {
      nextErrors.vocab = 'Từ vựng là bắt buộc';
    }
    return nextErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    setErrors(validate(next));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validate(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!listId && !vocabularyData?.listId) {
      toast.error('Không tìm thấy danh sách từ vựng');
      return;
    }

    const payload = {
      vocab: formData.vocab.trim(),
      mean: formData.mean.trim(),
      wordType: formData.wordType.trim(),
      pronunciation: formData.pronunciation.trim(),
      example: formData.example.trim(),
      status: Number(vocabularyData?.status) === 1 ? 1 : 0,
    };

    setIsSubmitting(true);
    try {
      if (vocabularyData?.vocabId) {
        await updateVocabularyItem(vocabularyData.vocabId, payload);
        toast.success('Cập nhật từ vựng thành công!');
      } else {
        await addVocabularyToList(listId, payload);
        toast.success('Thêm từ vựng thành công!');
      }

      await onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error(error?.message || 'Lỗi khi lưu từ vựng');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper show={show} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl mx-auto bg-white border-2 border-gray-200 shadow-lg rounded-2xl px-6 sm:px-4 pt-6 pb-6 max-h-[95vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex flex-col items-center p-3">
          <div className="flex items-center justify-between w-full mb-1">
            <h2 className="text-xl font-medium text-center sm:text-2xl">
              {vocabularyData ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng'}
            </h2>
            <button
              onClick={onClose}
              type="button"
              className="flex items-center justify-center w-8 h-8 hover:bg-gray-200 hover:rounded-lg transition-all duration-200 ease-in-out"
            >
              <FontAwesomeIcon icon="fa-solid fa-xmark" size="lg" style={{ color: '#565E6C' }} />
            </button>
          </div>
          <p className="flex justify-start w-full text-sm text-gray-600 font-medium">
            {vocabularyData ? 'Cập nhật thông tin từ vựng' : 'Nhập thông tin từ vựng mới'}
          </p>
        </div>

        <div className="flex flex-col space-y-3 items-center justify-center w-full mb-4 p-3">
          <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-full sm:w-1/5 font-semibold" htmlFor="vocab">
              Từ vựng
            </label>
            <div className="flex-1 w-full">
              <input
                id="vocab"
                name="vocab"
                type="text"
                className={`flex-1 w-full px-4 py-2.5 text-gray-600 font-medium border ${
                  errors.vocab
                    ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400'
                } rounded-lg`}
                value={formData.vocab}
                onChange={handleChange}
              />
              {errors.vocab && <div className="text-sm text-red-500 font-medium">{errors.vocab}</div>}
            </div>
          </div>

          <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-full sm:w-1/5 font-semibold" htmlFor="mean">
              Nghĩa
            </label>
            <div className="flex-1 w-full">
              <input
                id="mean"
                name="mean"
                type="text"
                className="flex-1 w-full px-4 py-2.5 text-gray-600 font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 rounded-lg"
                value={formData.mean}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-full sm:w-1/5 font-semibold" htmlFor="wordType">
              Loại từ
            </label>
            <div className="flex-1 w-full">
              <input
                id="wordType"
                name="wordType"
                type="text"
                className="flex-1 w-full px-4 py-2.5 text-gray-600 font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 rounded-lg"
                value={formData.wordType}
                onChange={handleChange}
                placeholder="noun, verb, adj..."
              />
            </div>
          </div>

          <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-full sm:w-1/5 font-semibold" htmlFor="pronunciation">
              Phát âm
            </label>
            <div className="flex-1 w-full">
              <input
                id="pronunciation"
                name="pronunciation"
                type="text"
                className="flex-1 w-full px-4 py-2.5 text-gray-600 font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 rounded-lg"
                value={formData.pronunciation}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-full sm:w-1/5 font-semibold" htmlFor="example">
              Ví dụ
            </label>
            <div className="flex-1 w-full">
              <textarea
                id="example"
                name="example"
                rows={5}
                className="flex-1 w-full p-3 text-gray-600 font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 rounded-lg"
                value={formData.example}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end p-3">
          <Button text="Hủy" variant="default" size="sm" onClick={onClose} type="button" />
          <Button text="Lưu" variant="primary" size="sm" type="submit" disabled={isSubmitting} />
        </div>
      </form>
    </ModalWrapper>
  );
};

export default AddOrEditVocabularyForm;
