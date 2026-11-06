import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string | null;
  type?: ToastType | 'auto';
  duration?: number;
  onClose?: () => void;
}

function detectType(msg: string): ToastType {
  const lower = msg.toLowerCase();
  const errorWords = [
    'failed',
    'error',
    'invalid',
    'wrong',
    'not found',
    'rejected',
    'expired',
    'unauthorized',
    'missing',
    'denied',
    'unable to',
    'cannot',
    'no account',
  ];
  const successWords = [
    'success',
    'submitted',
    'approved',
    'accepted',
    'saved',
    'welcome',
    'created',
    'added',
    'restored',
    'copied',
    'verified',
    'unlocked',
    'matched',
    'sent',
    'updated',
    'completed',
  ];
  if (errorWords.some(w => lower.includes(w))) return 'error';
  if (successWords.some(w => lower.includes(w))) return 'success';
  return 'info';
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'auto',
  duration = 3800,
  onClose,
}) => {
  const [renderedMessage, setRenderedMessage] = useState<string | null>(message);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync incoming message + animate in/out
  useEffect(() => {
    if (message) {
      setRenderedMessage(message);
      // Force a paint first so exit animation state doesn't stick
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      hideTimerRef.current = setTimeout(() => {
        setRenderedMessage(null);
      }, 300);
    }

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [message]);

  // Progress bar countdown
  useEffect(() => {
    if (!message) return;
    setProgress(100);
    const startedAt = Date.now();

    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0 && progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    }, 60);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [message, duration]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
    hideTimerRef.current = setTimeout(() => setRenderedMessage(null), 300);
  };

  if (!renderedMessage) return null;

  const resolvedType: ToastType =
    type === 'auto' ? detectType(renderedMessage) : type;

  const palette = {
    success: {
      accent: 'bg-emerald-500',
      ring: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
      Icon: CheckCircle2,
    },
    error: {
      accent: 'bg-rose-500',
      ring: 'border-rose-500/30',
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-400',
      Icon: AlertCircle,
    },
    info: {
      accent: 'bg-blue-500',
      ring: 'border-blue-500/30',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
      Icon: Info,
    },
  }[resolvedType];

  const Icon = palette.Icon;

  return (
    <div
      className="fixed top-4 inset-x-0 z-[200] flex justify-center px-3 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto relative overflow-hidden w-full max-w-md rounded-2xl border ${palette.ring} bg-[#111827] shadow-2xl transition-all duration-300 ease-out ${
          visible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-3 scale-95'
        }`}
      >
        <div className="flex items-start gap-3 px-4 py-3">
          <div
            className={`shrink-0 w-7 h-7 rounded-full ${palette.iconBg} border ${palette.ring} flex items-center justify-center mt-0.5`}
          >
            <Icon className={`w-3.5 h-3.5 ${palette.iconColor}`} />
          </div>

          <p className="flex-1 min-w-0 text-[13px] leading-relaxed font-medium text-slate-100">
            {renderedMessage}
          </p>

          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 -mr-1 -mt-0.5 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom progress bar */}
        <div className="h-[2px] w-full bg-slate-500/20 overflow-hidden">
          <div
            className={`h-full ${palette.accent} transition-[width] duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};