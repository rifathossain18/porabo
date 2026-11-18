import React from "react";
import { Check, X } from "lucide-react";
import { FlatReview } from "./adminTypes";

interface ReviewCardProps {
  review: FlatReview;
  showTutorName?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showTutorName = false,
  onApprove,
  onReject,
}) => {
  const status = review.status || "APPROVED";
  const statusColor =
    status === "APPROVED"
      ? "bg-emerald-950 text-emerald-400 border-emerald-800/60"
      : status === "REJECTED"
        ? "bg-rose-950 text-rose-400 border-rose-800/60"
        : "bg-amber-950 text-amber-400 border-amber-800/60";

  return (
    <div className="bg-[#0B0F19] border border-blue-950/70 rounded-2xl p-4 space-y-2.5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="font-bold text-sm text-white">{review.studentName}</div>
          {showTutorName && (
            <div className="text-[11px] text-blue-400 mt-1">
              Reviewing: <span className="font-semibold">{review.tutorName}</span>
            </div>
          )}
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusColor}`}>
          {status}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div className="text-center">
          <div className="text-[9px] text-slate-500 font-mono uppercase">Punctuality</div>
          <div className="text-amber-400 font-bold">{review.punctuality.toFixed(1)}/5</div>
        </div>
        <div className="text-center">
          <div className="text-[9px] text-slate-500 font-mono uppercase">Mastery</div>
          <div className="text-cyan-400 font-bold">{review.subjectMastery.toFixed(1)}/5</div>
        </div>
        <div className="text-center">
          <div className="text-[9px] text-slate-500 font-mono uppercase">Style</div>
          <div className="text-indigo-400 font-bold">{review.teachingStyle.toFixed(1)}/5</div>
        </div>
      </div>
      <div className="p-2.5 bg-[#111827] rounded-xl text-[11px] text-slate-300 italic">
        "{review.comment}"
      </div>
      {status === "PENDING" && (onApprove || onReject) && (
        <div className="flex gap-2 pt-2 border-t border-slate-800/80">
          {onApprove && (
            <button onClick={onApprove} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Approve
            </button>
          )}
          {onReject && (
            <button onClick={onReject} className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
              <X className="w-3.5 h-3.5" /> Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
};
