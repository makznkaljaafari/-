
import React, { useEffect } from 'react';

export interface ToastProps {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'ai_alert';
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, title, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const config = {
    success: { icon: '✅', color: 'bg-emerald-500', bg: 'bg-emerald-50/90 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800/50', text: 'text-emerald-900 dark:text-emerald-100' },
    warning: { icon: '⚠️', color: 'bg-amber-500', bg: 'bg-amber-50/90 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800/50', text: 'text-amber-900 dark:text-amber-100' },
    info: { icon: 'ℹ️', color: 'bg-blue-500', bg: 'bg-blue-50/90 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800/50', text: 'text-blue-900 dark:text-blue-100' },
    ai_alert: { icon: '🤖', color: 'bg-indigo-600', bg: 'bg-indigo-50/90 dark:bg-indigo-900/30', border: 'border-indigo-200 dark:border-indigo-800/50', text: 'text-indigo-900 dark:text-indigo-100' }
  };

  const current = config[type];

  return (
    <div 
      className={`w-full max-w-sm pointer-events-auto overflow-hidden rounded-[1.5rem] border-2 ${current.border} ${current.bg} backdrop-blur-xl shadow-2xl transform transition-all duration-500 animate-in slide-in-from-top-full fade-in`}
      onClick={() => onClose(id)}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 ${current.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2 border-white/20`}>
            {current.icon}
          </div>
          <div className="flex-1 pt-1">
            <h3 className={`font-black text-sm ${current.text} leading-none mb-1`}>{title}</h3>
            <p className={`text-[11px] font-bold opacity-80 ${current.text} leading-tight`}>{message}</p>
          </div>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <span className="text-xl">×</span>
          </button>
        </div>
      </div>
      <div className="h-1 w-full bg-black/5 dark:bg-white/5">
        <div 
          className={`h-full ${current.color} transition-all duration-[4000ms] ease-linear`}
          style={{ width: '0%', animation: 'progress 4s linear forwards' }}
        ></div>
      </div>
      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: any[], removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] p-6 flex flex-col items-center gap-4 pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>
  );
};
