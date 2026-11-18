import {
  Check,
  CheckCircle,
  Download,
  Eye,
  GraduationCap,
  MapPin,
  Phone,
  Trash2,
  Users,
} from "lucide-react";
import type { User } from "../../lib/types";
import { downloadTeacherCard } from "../../lib/cardGenerator";
import { GenderAvatar } from "../GenderAvatar";

interface AdminTeachersSectionProps {
  isActive: boolean;
  tutors: User[];
  downloadingTeacherCardId: string | null;
  setDownloadingTeacherCardId: (id: string | null) => void;
  setInspectingUser: (user: User | null) => void;
  onApproveTutor: (id: string) => void;
  onRequestDelete: (user: User) => void;
  onExport: () => void;
}

export function AdminTeachersSection({
  isActive,
  tutors,
  downloadingTeacherCardId,
  setDownloadingTeacherCardId,
  setInspectingUser,
  onApproveTutor,
  onRequestDelete,
  onExport,
}: AdminTeachersSectionProps) {
  if (!isActive) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-blue-400" /> Teachers (
          {tutors.length})
        </h2>
        <button
          onClick={onExport}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {tutors.map((tutor) => {
          const isVerified = tutor.verificationStatus === "VERIFIED";
          return (
            <div
              key={tutor.id}
              className="bg-[#111827] border border-blue-900/40 rounded-3xl p-4 sm:p-5 space-y-3"
            >
              <div className="flex items-start gap-3">
                <GenderAvatar
                  gender={tutor.gender || "MALE"}
                  role="TUTOR"
                  size="md"
                  profilePicture={tutor.profilePicture}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-white text-base">
                      {tutor.fullName}
                    </h3>
                    {isVerified ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                        <CheckCircle className="w-2.5 h-2.5" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {tutor.verificationStatus || "PENDING"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-blue-400">
                    {tutor.institution || "—"} • {tutor.department || "—"}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {tutor.areaName},{" "}
                    {tutor.district}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setInspectingUser(tutor)}
                  className="flex-1 min-w-[100px] py-2 bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" /> View Full Info
                </button>
                <button
                  onClick={() => void downloadCard(tutor)}
                  disabled={downloadingTeacherCardId === tutor.id}
                  className="py-2 px-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-600/20 disabled:opacity-50"
                  title="Download cinematic bio card"
                >
                  <Download
                    className={`w-3.5 h-3.5 ${downloadingTeacherCardId === tutor.id ? "animate-pulse" : ""}`}
                  />
                  {downloadingTeacherCardId === tutor.id ? "..." : "Bio Card"}
                </button>
                {!isVerified && (
                  <button
                    onClick={() => onApproveTutor(tutor.id)}
                    className="py-2 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Verify
                  </button>
                )}
                <button
                  onClick={() => onRequestDelete(tutor)}
                  className="p-2 bg-rose-950/60 text-rose-400 rounded-xl border border-rose-800/50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  async function downloadCard(tutor: User) {
    if (downloadingTeacherCardId) return;
    setDownloadingTeacherCardId(tutor.id);
    try {
      await downloadTeacherCard(tutor);
    } catch {
      alert("Failed to generate bio card. Try again.");
    } finally {
      setDownloadingTeacherCardId(null);
    }
  }
}

interface AdminStudentsSectionProps {
  isActive: boolean;
  students: User[];
  tuitionPostsCountByStudent: (studentId: string) => number;
  setInspectingUser: (user: User | null) => void;
  onRequestDelete: (user: User) => void;
  onExport: () => void;
}

export function AdminStudentsSection({
  isActive,
  students,
  tuitionPostsCountByStudent,
  setInspectingUser,
  onRequestDelete,
  onExport,
}: AdminStudentsSectionProps) {
  if (!isActive) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" /> Students ({students.length})
        </h2>
        <button
          onClick={onExport}
          className="px-3 py-1.5 bg-cyan-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {students.map((student) => (
          <div
            key={student.id}
            className="bg-[#111827] border border-blue-900/40 rounded-2xl p-4 space-y-2"
          >
            <div className="flex items-center gap-2.5">
              <GenderAvatar
                gender={student.gender || "FEMALE"}
                role="STUDENT"
                size="sm"
                profilePicture={student.profilePicture}
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm truncate">
                  {student.fullName}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {student.email}
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                {tuitionPostsCountByStudent(student.id)} posts
              </span>
            </div>
            <div className="text-xs text-slate-300 flex items-center gap-1 font-mono">
              <Phone className="w-3 h-3 text-emerald-400" /> {student.phone}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {student.areaName}, {student.district}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setInspectingUser(student)}
                className="flex-1 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1"
              >
                <Eye className="w-3 h-3 text-blue-400" /> View
              </button>
              <button
                onClick={() => onRequestDelete(student)}
                className="flex-1 py-1.5 bg-rose-950/60 text-rose-400 rounded-lg text-[11px] font-semibold border border-rose-800/50 flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
