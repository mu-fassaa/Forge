import React, { useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { LucideIcon } from '../LucideIcon';
import type { ToastNotification } from '../../types/workspace';

export const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification } = useWorkspace();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
      {notifications.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeNotification} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastNotification;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const { id, type, message, duration = 4000 } = toast;

  // Auto dismiss
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  // Visual configuration based on status type
  const config = {
    success: {
      bg: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300',
      icon: 'CheckCircle2',
      iconColor: 'text-emerald-400',
    },
    warning: {
      bg: 'bg-amber-950/90 border-amber-500/30 text-amber-300',
      icon: 'AlertTriangle',
      iconColor: 'text-amber-400',
    },
    error: {
      bg: 'bg-red-950/90 border-red-500/30 text-red-300',
      icon: 'XCircle',
      iconColor: 'text-red-400',
    },
    info: {
      bg: 'bg-indigo-950/90 border-indigo-500/30 text-indigo-300',
      icon: 'Info',
      iconColor: 'text-indigo-400',
    },
  }[type];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-slide-in-right ${config.bg}`}
    >
      <div className="mt-0.5 shrink-0">
        <LucideIcon name={config.icon as any} size={15} className={config.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold leading-relaxed break-words">{message}</p>
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 text-gray-500 hover:text-gray-300 transition-colors p-0.5 cursor-pointer"
      >
        <LucideIcon name="X" size={12} />
      </button>
    </div>
  );
};
