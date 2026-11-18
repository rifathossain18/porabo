import React from "react";
import { Download } from "lucide-react";

interface ExportCardProps {
  title: string;
  count: number;
  color: "blue" | "cyan" | "purple" | "amber";
  onExport: () => void;
}

export const ExportCard: React.FC<ExportCardProps> = ({ title, count, color, onExport }) => {
  const colorMap = {
    blue: "from-blue-600 to-blue-500",
    cyan: "from-cyan-600 to-cyan-500",
    purple: "from-purple-600 to-purple-500",
    amber: "from-amber-600 to-amber-500",
  };

  return (
    <div className="bg-[#111827] border border-blue-900/40 rounded-2xl p-4 flex flex-col justify-between">
      <div>
        <div className="text-xs text-slate-400 font-mono uppercase">{title}</div>
        <div className="text-2xl font-black text-white mt-1">{count}</div>
      </div>
      <button
        onClick={onExport}
        className={`mt-3 w-full py-2 bg-gradient-to-r ${colorMap[color]} text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5`}
      >
        <Download className="w-3.5 h-3.5" /> Export CSV
      </button>
    </div>
  );
};
