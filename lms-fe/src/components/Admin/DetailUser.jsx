import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ModalWrapper from '../ModalWrapper';
import Button from '../../components/Button.jsx'

const DetailUser = ({ show, onClose, user }) => {
  return (
    <ModalWrapper show={show} onClose={onClose}>
      <div
        className="w-full max-w-2xl mx-auto bg-white border-2 border-gray-200 shadow-lg rounded-2xl px-6 sm:px-4 pt-6 pb-6 max-h-[95vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col items-center p-3">
          <div className="flex items-center justify-between w-full mb-1">
            <h2 className="text-xl font-medium text-center sm:text-2xl">
              Chi tiết người dùng
            </h2>
            <button
              onClick={onClose}
              type="button"
              className="flex items-center justify-center w-8 h-8 hover:bg-gray-200 hover:rounded-lg transition-all duration-200 ease-in-out"
            >
              <FontAwesomeIcon
                icon="fa-solid fa-xmark"
                size="lg"
                style={{ color: '#565E6C' }}
              />
            </button>
          </div>
          <p className="flex justify-start w-full text-sm text-muted-foreground text-gray-600 font-medium">
            Thông tin chi tiết người dùng {user?.id}
          </p>
        </div>

        <div className="w-full max-w-2xl px-8 py-6 flex flex-col gap-6 bg-white">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p className="font-semibold text-gray-600">ID</p>
              <p className="font-bold">{user?.id}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Loại người dùng</p>
              <p className="font-bold">{user?.type}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Tên người dùng</p>
              <p className="font-bold">{user?.name}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Ngày tạo</p>
              <p className="font-bold">{user?.createdAt}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Email</p>
              <p className="font-bold">{user?.email}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Ngày cập nhật</p>
              <p className="font-bold">{user?.updatedAt}</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              text="Đóng"
              variant="default"
              size="sm"
              onClick={onClose}
            />
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default DetailUser