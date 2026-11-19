import React from 'react';
import { Clock } from 'lucide-react';

interface PostCountdownProps {
  createdAt: string;
  daysToExpire?: number;
  variant?: 'badge' | 'card';
}

export const PostCountdown: React.FC<PostCountdownProps> = ({
  createdAt,
  daysToExpire = 30,
  variant = 'badge',
}) => {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const expiredAt = created + daysToExpire * 24 * 60 * 60 * 1000;
  const msLeft = expiredAt - now;
  const daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
  const hoursLeft = Math.max(0, Math.ceil(msLeft / (60 * 60 * 1000)));

  const color =
    daysLeft <= 0 || daysLeft <= 3
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : daysLeft <= 7
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (daysLeft <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono bg-rose-50 text-rose-700 border-rose-200">
        <Clock className="w-3 h-3" />
        Expired
      </span>
    );
  }

  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono ${color}`}
        title={`Auto-deletes ${daysLeft} day(s) after posting`}
      >
        <Clock className="w-3 h-3" />
        {daysLeft}d left
      </span>
    );
  }

  return (
    <div className={`p-3 rounded-xl border ${color}`}>
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">
          Auto-Delete Countdown
        </span>
      </div>
      <div className="text-lg font-black">
        {daysLeft} day{daysLeft !== 1 ? 's' : ''}
      </div>
      <div className="text-[10px] opacity-70 mt-0.5">
        {daysLeft <= 1
          ? `${hoursLeft} hours left`
          : `Expires after ${daysToExpire} days`}
      </div>
    </div>
  );
};