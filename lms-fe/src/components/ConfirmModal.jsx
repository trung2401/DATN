import React from 'react'
import Button from './Button.jsx'

const ConfirmModal = ({
  show,
  onClose,
  title,
  description,
  onCancel,
  onConfirm,
  cancelText = "Hủy",
  confirmText = "Xác nhận",
  cancelVariant = "default",
  confirmVariant = "delete",
  hoverBgConfirm 
}) => {
  if (!show) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 w-full h-full flex items-center justify-center bg-black/30 z-100 py-4 px-4 sm:px-6"
    >
      <div
        className="bg-white w-full max-w-xl flex flex-col gap-3 border-2 border-gray-200 rounded-lg p-6 sm:p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
        <span className="text-sm sm:text-base font-semibold text-gray-600">{description}</span>
        <div className="flex justify-end gap-4">
          <Button
            text={cancelText}
            variant={cancelVariant}
            size="sm"
            onClick={onCancel}
          />
          <Button
            text={confirmText}
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            hoverBg={hoverBgConfirm}
          />
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
