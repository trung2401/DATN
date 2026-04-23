import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';

import ModalWrapper from '../ModalWrapper';
import Button from '../Button';
import { createVocabularyList } from '../../service/teacherVocabularyService';

const AddVocabularyListForm = ({ show, onClose, onSaved }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nameList: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      setFormData({ nameList: '', description: '' });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [show]);

  const validate = (data) => {
    const nextErrors = {};
    if (!String(data.nameList || '').trim()) {
      nextErrors.nameList = 'Tên danh sách là bắt buộc';
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

    setIsSubmitting(true);
    try {
      await createVocabularyList(formData.nameList.trim(), formData.description.trim());
      toast.success('Tạo danh sách từ vựng thành công!');
      await onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error(error?.message || 'Lỗi khi tạo danh sách từ vựng');
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
            <h2 className="text-xl font-medium text-center sm:text-2xl">Thêm danh sách từ vựng</h2>
            <button
              onClick={onClose}
              type="button"
              className="flex items-center justify-center w-8 h-8 hover:bg-gray-200 hover:rounded-lg transition-all duration-200 ease-in-out"
            >
              <FontAwesomeIcon icon="fa-solid fa-xmark" size="lg" style={{ color: '#565E6C' }} />
            </button>
          </div>
          <p className="flex justify-start w-full text-sm text-muted-foreground text-gray-600 font-medium">
            Nhập thông tin danh sách từ vựng mới
          </p>
        </div>

        <div className="flex flex-col space-y-3 items-center justify-center w-full mb-4 p-3">
          <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-full sm:w-1/5 font-semibold" htmlFor="nameList">
              Tên danh sách
            </label>
            <div className="flex-1 w-full">
              <input
                id="nameList"
                name="nameList"
                type="text"
                className={`flex-1 w-full px-4 py-2.5 text-gray-600 font-medium border ${
                  errors.nameList
                    ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400'
                } rounded-lg`}
                value={formData.nameList}
                onChange={handleChange}
                placeholder="Nhập tên danh sách"
              />
              {errors.nameList && <div className="text-sm text-red-500 font-medium">{errors.nameList}</div>}
            </div>
          </div>

          <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-full sm:w-1/5 font-semibold" htmlFor="description">
              Mô tả
            </label>
            <div className="flex-1 w-full">
              <textarea
                id="description"
                name="description"
                rows={4}
                className="flex-1 w-full p-3 text-gray-600 font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 rounded-lg"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả (không bắt buộc)"
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

export default AddVocabularyListForm;
