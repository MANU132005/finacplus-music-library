import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const toast = React.useMemo(
    () => ({
      success: (msg: string) => showToast(msg, 'success'),
      error: (msg: string) => showToast(msg, 'error'),
      info: (msg: string) => showToast(msg, 'info'),
    }),
    [showToast]
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Overlay Container */}
      <div 
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
        aria-live="assertive"
        aria-instant="true"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-2xl border flex items-start gap-3 shadow-soft bg-white border-slate-100 pointer-events-auto animate-slideUp transition-all duration-350`}
            role="alert"
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle size={16} className="text-emerald-500" />}
              {t.type === 'error' && <XCircle size={16} className="text-red-500" />}
              {t.type === 'info' && <Info size={16} className="text-indigo-500" />}
            </div>
            <div className="flex-1 text-xs font-semibold leading-snug text-slate-700">
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 hover:bg-slate-50 rounded-lg transition-colors focus:outline-none"
              aria-label="Dismiss Notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a dummy fallback toast object rather than throwing to avoid crashing MFE integrations
    return {
      toast: {
        success: (msg: string) => console.log('Mock success toast:', msg),
        error: (msg: string) => console.error('Mock error toast:', msg),
        info: (msg: string) => console.info('Mock info toast:', msg),
      }
    };
  }
  return context;
};
