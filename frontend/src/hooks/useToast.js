import React, { createContext, useContext, useState, useCallback } from 'react';

// Create Toast Context
const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = 'info' }) => {
    const id = Date.now();
    const newToast = {
      id,
      title,
      description,
      variant
    };

    setToasts(current => [...current, newToast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(current => current.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(current => current.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onRemove={() => removeToast(toast.id)} 
          />
        ))}
      </div>
    </>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const variants = {
    success: 'bg-green-100 text-green-800 border-green-300',
    error: 'bg-red-100 text-red-800 border-red-300', 
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  return (
    <div className={`p-4 rounded-lg border shadow-elevate-lg ${variants[toast.variant || 'info']}`}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">{toast.title}</h4>
          {toast.description && (
            <p className="text-sm mt-1 opacity-90">{toast.description}</p>
          )}
        </div>
        <button 
          onClick={onRemove}
          className="ml-4 text-xl leading-none hover:opacity-70"
        >
          ×
        </button>
      </div>
    </div>
  );
};