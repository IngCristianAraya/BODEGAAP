import React from 'react';

interface SuccessToastProps {
  message: string;
  onClose: () => void;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ message, onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center bg-emerald-600 text-white px-6 py-4 rounded-lg shadow-lg animate-fade-in-up">
      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span className="font-semibold text-base">{message}</span>
      <button
        className="ml-4 px-2 py-1 rounded bg-white bg-opacity-20 hover:bg-opacity-40 transition"
        onClick={onClose}
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
};

export default SuccessToast;
