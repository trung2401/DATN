import React from "react";
import Button from "../Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ModalWrapper from "../ModalWrapper";
const DetailPayment = ({ show, onClose, paymentData }) => {
  return (
    <ModalWrapper show={show} onClose={onClose}>
      <div className="flex flex-col border-2 space-y-7 border-gray-200 bg-white rounded-xl p-8 w-full max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">
            Chi tiết giao dịch
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-200 rounded-lg transition-all"
          >
            <FontAwesomeIcon
              icon="fa-solid fa-xmark"
              size="lg"
              style={{ color: "#565E6C" }}
            />
          </button>
        </div>

        {/* Thông tin giao dịch */}
        <div className="grid grid-cols-2 gap-8 mb-6 justify-items-center">
          <div className="flex flex-col text-left space-y-2">
            <p className="font-semibold">Payment ID</p>
            <p className="font-semibold">Tên người dùng</p>
            <p className="font-semibold">Email</p>
            <p className="font-semibold">Phương thức thanh toán</p>
            <p className="font-semibold">Số tiền</p>
            <p className="font-semibold">Ngày giao dịch</p>
          </div>
          <div className="flex flex-col text-left space-y-2">
            <p className="font-medium text-gray-600">{paymentData?.id || "PAY001"}</p>
            <p className="font-medium text-gray-600">
              {paymentData?.user || "Nguyễn Văn A"}
            </p>
            <p className="font-medium text-gray-600">
              {paymentData?.email || "email@example.com"}
            </p>
            <p className="font-medium text-gray-600">
              {paymentData?.method || "Chuyển khoản"}
            </p>
            <p className="font-medium text-gray-600">
              {paymentData?.amount || "500.000 VNĐ"}
            </p>
            <p className="font-medium text-gray-600">{paymentData?.date || "18/04/2025"}</p>
          </div>
        </div>

        {/* Nút đóng */}
        <div className="flex justify-end">
          <Button text="Đóng" variant="default" size="sm" onClick={onClose} />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default DetailPayment;
