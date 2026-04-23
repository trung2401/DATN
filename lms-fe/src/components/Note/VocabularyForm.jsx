import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../Button.jsx';
import ModalWrapper from '../ModalWrapper.jsx';
import { addVocabulary, updateVocabulary } from '../../redux/slice/noteSlice.js';
import { validateAddUpdateVocabulary } from '../../utils/validate.js';
import { toast } from 'react-toastify';
const VocabularyForm = ({ show, onClose, vocabularyData }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    word: vocabularyData?.word || '',
    description: vocabularyData?.description || '',
    wordType: vocabularyData?.wordType || '',
    pronounce: vocabularyData?.pronounce || '',
    example: vocabularyData?.example || '',
    status: Number(vocabularyData?.status) === 1 ? 1 : 0,
  });
  const [formErrors, setFormErrors] = useState({});

  // Đồng bộ dữ liệu khi vocabularyData thay đổi
  useEffect(() => {
    setFormData({
      word: vocabularyData?.word || '',
      description: vocabularyData?.description || '',
      wordType: vocabularyData?.wordType || '',
      pronounce: vocabularyData?.pronounce || '',
      example: vocabularyData?.example || '',
      status: Number(vocabularyData?.status) === 1 ? 1 : 0,
    });
    setFormErrors({}); // Reset lỗi khi dữ liệu thay đổi
  }, [vocabularyData]);

  // Xử lý thay đổi input và validate real-time
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    // Validate ngay khi thay đổi
    const errors = validateAddUpdateVocabulary(updatedFormData);
    setFormErrors(errors);
  };

  // Xử lý thay đổi trạng thái
  const handleStatusChange = (e) => {
    const updatedFormData = { ...formData, status: Number(e.target.value) === 1 ? 1 : 0 };
    setFormData(updatedFormData);

    // Validate sau khi thay đổi trạng thái
    const errors = validateAddUpdateVocabulary(updatedFormData);
    setFormErrors(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate trước khi submit
    const errors = validateAddUpdateVocabulary(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return; // Dừng lại nếu có lỗi
    }

    setIsSubmitting(true);
    const submitData = {
      word: formData.word,
      description: formData.description,
      wordType: formData.wordType,
      pronounce: formData.pronounce,
      example: formData.example,
      status: Number(formData.status) === 1 ? 1 : 0,
    };

    try {
      if (vocabularyData) {
        // Update existing vocabulary
        await dispatch(updateVocabulary({ ...submitData, wordId: vocabularyData.id })).unwrap();
        toast.success('Cập nhật từ vựng thành công!');

      } else {
        // Add new vocabulary
        await dispatch(addVocabulary(submitData)).unwrap();
        toast.success('Thêm từ vựng thành công!');
        setFormData({
          word: '',
          description: '',
          wordType: '',
          pronounce: '',
          example: '',
          status: 0,
        });
      }
      onClose();
    } catch (err) {
      toast.error(err || 'Đã xảy ra lỗi. Vui lòng thử lại!');
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
        {/* Header */}
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
          <p className="flex justify-start w-full text-sm text-muted-foreground text-gray-600 font-medium">
            {vocabularyData
              ? 'Chỉnh sửa thông tin từ vựng'
              : 'Nhập thông tin từ vựng bạn muốn lưu trữ và học tập'}
          </p>
        </div>
        {/* Input Fields */}
        <div className="flex flex-col space-y-3 items-center justify-center w-full mb-4 p-3">
          {/* Từ vựng */}
          <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-full sm:w-1/5 font-semibold" htmlFor="word">
              Từ vựng
            </label>
            <div className="flex-1 w-full">
              <input
                id="word"
                name="word"
                type="text"
                className={`flex-1 w-full px-4 py-2.5 text-gray-600 font-medium border ${
                  formErrors.word
                    ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400'
                } rounded-lg`}
                value={formData.word}
                onChange={handleChange}
              />
              {formErrors.word && (
                <div className="text-sm text-red-500 font-medium">{formErrors.word}</div>
              )}
            </div>
          </div>
          {/* Nghĩa */}
          <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-full sm:w-1/5 font-semibold" htmlFor="description">
              Nghĩa
            </label>
            <div className="flex-1 w-full">
              <input
                id="description"
                name="description"
                type="text"
                className={`flex-1 w-full px-4 py-2.5 text-gray-600 font-medium  border ${
                  formErrors.description
                    ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400'
                } rounded-lg`}
                value={formData.description}
                onChange={handleChange}
              />
              {formErrors.description && (
                <div className="text-sm text-red-500 font-medium">{formErrors.description}</div>
              )}
            </div>
          </div>
          {/* Phát âm */}
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

          {/* Phát âm */}
          <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-full sm:w-1/5 font-semibold" htmlFor="pronounce">
              Phát âm
            </label>
            <div className="flex-1 w-full">
              <input
                id="pronounce"
                name="pronounce"
                type="text"
                className={`flex-1 w-full px-4 py-2.5 text-gray-600 font-medium border ${
                  formErrors.pronounce
                    ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400'
                } rounded-lg`}
                value={formData.pronounce}
                onChange={handleChange}
              />
              {formErrors.pronounce && (
                <div className="text-sm text-red-500 font-medium">{formErrors.pronounce}</div>
              )}
            </div>
          </div>
          {/* Ví dụ */}
          <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-full sm:w-1/5 font-semibold" htmlFor="example">
              Ví dụ
            </label>
            <div className="flex-1 w-full">
              <textarea
                id="example"
                name="example"
                rows={5}
                className={`flex-1 w-full p-3 text-gray-600 font-medium  border ${
                  formErrors.example
                    ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400'
                } rounded-lg`}
                value={formData.example}
                onChange={handleChange}
              />
              {formErrors.example && (
                <div className="text-sm text-red-500 font-medium">{formErrors.example}</div>
              )}
            </div>
          </div>
          {/* Trạng thái */}
          <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-full sm:w-1/5 font-semibold" htmlFor="status">
              Trạng thái
            </label>
            <div className="flex-1 w-full">
              <select
                id="status"
                name="status"
                className={`flex-1 w-full px-4 py-2.5 text-gray-600 font-medium border ${
                  formErrors.status
                    ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400'
                } rounded-lg bg-white`}
                value={Number(formData.status) === 1 ? '1' : '0'}
                onChange={handleStatusChange}
              >
                <option value="0">Chưa học</option>
                <option value="1">Đã học</option>
              </select>
            </div>
          </div>
        </div>
        {/* Button */}
        <div className="flex gap-4 justify-end p-3">
          <Button text="Hủy" variant="default" size="sm" onClick={onClose} />
          <Button
            text="Lưu"
            variant="primary"
            size="sm"
            type="submit"
          />
        </div>
      </form>
    </ModalWrapper>
  );
};

export default VocabularyForm;