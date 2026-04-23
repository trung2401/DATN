import React, { useState, useEffect } from 'react';
import ModalWrapper from '../ModalWrapper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../Button';

const PackageForm = ({ show, onClose, packageData, onSubmit }) => {
  const [packageName, setPackageName] = useState(packageData?.name || '');
  const [description, setDescription] = useState(packageData?.description || '');
  const [cost, setCost] = useState(packageData?.cost || '');
  const [duration, setDuration] = useState(packageData?.duration || '');

  // Đồng bộ state khi packageData thay đổi
  useEffect(() => {
    setPackageName(packageData?.name || '');
    setDescription(packageData?.description || '');
    setCost(packageData?.cost || '');
    setDuration(packageData?.duration || '');
  }, [packageData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      id: packageData?.id || '',
      name: packageName,
      description,
      cost,
      duration,
    };
    onSubmit(formData);
  };

  return (
    <ModalWrapper show={show} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl mx-auto bg-white border-2 border-gray-200 shadow-lg rounded-2xl px-6 pt-6 pb-6 max-h-[95vh] overflow-y-auto"
      >
        <div className="flex flex-col items-center p-3">
          <div className="flex items-center justify-between w-full mb-1">
            <h2 className="text-xl font-medium text-center sm:text-2xl">
              {packageData ? 'Chỉnh sửa gói học' : 'Thêm gói học mới'}
            </h2>
            <button
              onClick={onClose}
              type="button"
              className="flex items-center justify-center w-8 h-8 hover:bg-gray-200 hover:rounded-lg transition-all duration-200"
            >
              <i className="fas fa-xmark text-lg" style={{ color: '#565E6C' }}></i>
            </button>
          </div>
          <p className="flex justify-start w-full text-sm text-gray-600 font-medium">
            {packageData ? 'Chỉnh sửa thông tin gói học' : 'Thêm một gói học mới vào hệ thống'}
          </p>
        </div>
        <div className="flex flex-col space-y-3 items-center justify-center w-full mb-4 p-3">
          <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-full sm:w-1/5 font-semibold">Tên gói</label>
            <input
              type="text"
              className="flex-1 w-full border-2 border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              required
            />
          </div>
          <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-full sm:w-1/5 font-semibold">Mô tả</label>
            <textarea
              rows={5}
              className="flex-1 w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-full sm:w-1/5 font-semibold">Chi phí</label>
            <input
              type="text"
              className="flex-1 w-full border-2 border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
            />
          </div>
          <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-full sm:w-1/5 font-semibold">Thời hạn</label>
            <input
              type="text"
              placeholder="ví dụ: 1 tháng"
              className="flex-1 w-full border-2 border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex gap-4 justify-end p-3">
          <Button text="Hủy" variant="default" size="sm" onClick={onClose} />
          <Button text="Lưu" variant="primary" size="sm" type="submit" />
        </div>
      </form>
    </ModalWrapper>
  );
};

export default PackageForm;