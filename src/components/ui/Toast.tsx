"use client";

import { Toaster, toast as hotToast } from "react-hot-toast";
import { CheckCircle, XCircle, Info, AlertCircle, X } from "lucide-react";

// Custom Toast Component
interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  onDismiss: () => void;
}

function CustomToast({ message, type, onDismiss }: ToastProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-netflix-600" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  };

  const colors = {
    success: "border-green-500/30 bg-green-500/10",
    error: "border-netflix-600/30 bg-netflix-600/10",
    info: "border-blue-500/30 bg-blue-500/10",
    warning: "border-yellow-500/30 bg-yellow-500/10",
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg
        bg-netflix-dark-900/95 backdrop-blur-xl border
        ${colors[type]}
        shadow-lg min-w-[300px] max-w-md
      `}
    >
      {icons[type]}
      <p className="text-sm text-white flex-1">{message}</p>
      <button
        onClick={onDismiss}
        className="p-1 hover:bg-white/10 rounded transition-colors"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
}

// Toast Provider Component
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
        },
      }}
    />
  );
}

// Toast Helper Functions
export const toast = {
  success: (message: string) => {
    hotToast.custom(
      (t) => (
        <CustomToast
          message={message}
          type="success"
          onDismiss={() => hotToast.dismiss(t.id)}
        />
      ),
      { duration: 4000 }
    );
  },

  error: (message: string) => {
    hotToast.custom(
      (t) => (
        <CustomToast
          message={message}
          type="error"
          onDismiss={() => hotToast.dismiss(t.id)}
        />
      ),
      { duration: 5000 }
    );
  },

  info: (message: string) => {
    hotToast.custom(
      (t) => (
        <CustomToast
          message={message}
          type="info"
          onDismiss={() => hotToast.dismiss(t.id)}
        />
      ),
      { duration: 4000 }
    );
  },

  warning: (message: string) => {
    hotToast.custom(
      (t) => (
        <CustomToast
          message={message}
          type="warning"
          onDismiss={() => hotToast.dismiss(t.id)}
        />
      ),
      { duration: 4500 }
    );
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    }
  ) => {
    return hotToast.promise(
      promise,
      {
        loading,
        success,
        error,
      },
      {
        style: {
          background: "rgba(20, 20, 20, 0.95)",
          color: "#fff",
          backdropFilter: "blur(12px)",
        },
      }
    );
  },
};
