const ModalWrapper = ({ show, onClose, children }) => {
    if (!show) return null
  
    return (
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 py-4 px-4 sm:px-6"
      >
        {children}
      </div>
    )
  }
  
export default ModalWrapper
  