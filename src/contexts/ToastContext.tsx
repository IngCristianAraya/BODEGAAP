'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import SuccessToast from '@/components/common/SuccessToast';

interface Toast {
  message: string;
  type?: 'success' | 'error';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<Toast | null>(null);
  const [visible, setVisible] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setVisible(true);
    setTimeout(() => setVisible(false), 3000);
  };

  const handleClose = () => setVisible(false);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && toast && toast.type === 'success' && (
        <SuccessToast message={toast.message} onClose={handleClose} />
      )}
      {/* Puedes agregar ErrorToast aquí cuando lo crees */}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
};
