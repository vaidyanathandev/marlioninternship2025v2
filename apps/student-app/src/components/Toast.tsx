import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return "fa-circle-check";
      case "error":
        return "fa-circle-xmark";
      case "warning":
        return "fa-triangle-exclamation";
      default:
        return "fa-circle-info";
    }
  };

  const getColors = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-marlion-success/10 border-marlion-success/30 text-marlion-success";
      case "error":
        return "bg-marlion-danger/10 border-marlion-danger/30 text-marlion-danger";
      case "warning":
        return "bg-marlion-warning/10 border-marlion-warning/30 text-marlion-warning";
      default:
        return "bg-marlion-primary/10 border-marlion-primary/30 text-marlion-primary";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`glass-card border ${getColors(
              toast.type
            )} p-4 rounded-xl shadow-lg animate-slide-down pointer-events-auto`}
          >
            <div className="flex items-start gap-3">
              <i className={`fa-solid ${getIcon(toast.type)} text-xl mt-0.5`}></i>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-marlion-muted hover:text-white transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
