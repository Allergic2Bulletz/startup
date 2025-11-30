import React from 'react';
import modalStyles from './modals.module.css';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  // Close modal when clicking overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={modalStyles.modalOverlay} onClick={handleOverlayClick}>
      <div className={modalStyles.modal}>
        <div className={modalStyles.modalContent}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;