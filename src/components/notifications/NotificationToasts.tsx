import React from 'react';
import { useOS } from '../../context/OSContext';
import { OSIcon } from '../common/OSIcon';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const NotificationToasts: React.FC = () => {
  const { notifications, markNotificationRead } = useOS();

  // Show only unread toasts (max 3 at once)
  const activeToasts = notifications.filter(n => !n.read).slice(0, 4);

  const getIcon = (type: string, customIcon?: string) => {
    if (customIcon) return <OSIcon name={customIcon} className="w-4 h-4" />;
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[99990] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {activeToasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            id={`toast-${toast.id}`}
            className="pointer-events-auto p-3.5 rounded-2xl os-glass shadow-2xl border border-white/20 backdrop-blur-2xl flex items-start gap-3 text-slate-100 relative group overflow-hidden"
          >
            <div className="p-2 rounded-xl bg-white/10 shrink-0 mt-0.5">
              {getIcon(toast.type, toast.icon)}
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <div className="font-semibold text-xs text-white tracking-wide flex items-center gap-2">
                <span>{toast.title}</span>
                <span className="text-[10px] text-slate-400 font-normal">Just now</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words line-clamp-2">
                {toast.message}
              </p>
              {toast.actionLabel && toast.onAction && (
                <button
                  onClick={() => {
                    toast.onAction?.();
                    markNotificationRead(toast.id);
                  }}
                  className="mt-2 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                >
                  {toast.actionLabel}
                </button>
              )}
            </div>

            <button
              onClick={() => markNotificationRead(toast.id)}
              className="absolute top-2.5 right-2.5 p-1 rounded-lg hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
