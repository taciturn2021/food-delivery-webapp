import React, { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, variant = "default", duration = 5000 }) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((prevToasts) => [
      ...prevToasts,
      {
        id,
        title,
        description,
        variant,
      },
    ]);

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const ToastContainer = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4 w-full max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`shadow-lg rounded-md p-4 bg-white border ${
            toast.variant === "destructive"
              ? "border-red-500"
              : toast.variant === "success"
              ? "border-green-500"
              : "border-gray-200"
          } animate-in slide-in-from-right`}
        >
          {toast.title && (
            <div className={`font-semibold ${
              toast.variant === "destructive"
                ? "text-red-500"
                : toast.variant === "success"
                ? "text-green-500"
                : "text-gray-800"
            }`}>
              {toast.title}
            </div>
          )}
          {toast.description && (
            <div className="text-sm text-gray-600">{toast.description}</div>
          )}
        </div>
      ))}
    </div>
  );
};