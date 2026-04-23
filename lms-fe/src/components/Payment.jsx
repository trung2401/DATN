import React, { useEffect, useState } from "react";
import ModalWrapper from "../components/ModalWrapper";
import Button from "./Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ModalConfirm from "../components/ConfirmModal";
import { useSelector, useDispatch } from "react-redux";
import { fetchQRCode, fetchCheckPayment } from "../redux/slice/paymentSlice";
import { fetchUserInfo } from "../redux/slice/userSlice";
import { toast } from "react-toastify";
const Payment = ({ show, onClose }) => {
  const { qrCode, loadingQRCode, loadingPayment, errorQRCode} =
    useSelector((state) => state.payment);
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    dispatch(fetchQRCode());
    setIsImageLoaded(false);
  }, [dispatch]);

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCheckPayment = async () => {
    handleCloseModal();
    try {
      await dispatch(fetchCheckPayment({ code: qrCode.code })).unwrap();
      toast.success("Thanh toán thành công");
      const result = await dispatch(fetchUserInfo()).unwrap();
      if (result.typeUser !== 0) {
        onClose(); 
      }
    } catch (err) {
      toast.error(err || "Thanh toán thất bại! Vui lòng thử lại");
    }
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  return (
    <>
      <ModalWrapper show={show} onClose={onClose}>
        <div
          className="w-full max-w-2xl max-h-[100vh] border-2 border-gray-200 shadow-md rounded-2xl p-3 bg-white overflow-y-auto custom-scrollbar relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Spinner */}
          {loadingPayment && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <div className="w-10 h-10 border-5 border-t-5 border-gray-200 border-t-[#2C99E2] rounded-full animate-spin"></div>
            </div>
          )}
          <div className="flex flex-col gap-5 p-4">
            <div className="flex items-center justify-between w-full mb-1">
              <h1 className="text-2xl flex-1 font-bold text-center">
                Thanh toán
              </h1>
              <button
                onClick={onClose}
                type="button"
                className="flex items-center justify-center w-8 h-8 hover:bg-gray-200 hover:rounded-lg transition-all duration-200 ease-in-out"
                disabled={loadingPayment}
              >
                <FontAwesomeIcon
                  icon="fa-solid fa-xmark"
                  size="lg"
                  style={{ color: "#565E6C" }}
                />
              </button>
            </div>
            <div className="w-full flex items-center justify-center relative min-h-60">
              {(loadingQRCode || (qrCode?.qrLink && !isImageLoaded)) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-5 border-t-5 border-gray-200 border-t-[#2C99E2] rounded-full animate-spin"></div>
                </div>
              )}
              {qrCode?.qrLink && !loadingQRCode && !errorQRCode ? (
                <img
                  className="w-sm h-sm max-w-full object-contain"
                  src={qrCode.qrLink}
                  alt="Mã QR thanh toán"
                  onLoad={handleImageLoad} 
                />
              ) : (
                !loadingQRCode && (
                  <p className="text-red-500">Không thể tải mã QR</p>
                )
              )}
            </div>
            <Button
              text="Đã thanh toán"
              size="lg"
              variant="primary"
              onClick={handleShowModal}
              disabled={loadingPayment}
            />
          </div>
        </div>
      </ModalWrapper>

      {showModal && (
        <ModalConfirm
          show={showModal}
          onClose={() => setShowModal(false)}
          title="Xác nhận thanh toán"
          description="Bạn có chắc chắn đã thanh toán"
          confirmVariant="primary"
          onCancel={handleCloseModal}
          onConfirm={handleCheckPayment}
          confirmText="Xác nhận"
        />
      )}
    </>
  );
};

export default Payment;