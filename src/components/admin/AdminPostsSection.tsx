import { useState } from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Download,
  Trash2,
  Users,
} from "lucide-react";
import { TuitionApplication, TuitionPost, User } from "../../lib/types";
import { downloadTuitionCard } from "../../lib/cardGenerator";
import { GenderAvatar } from "../GenderAvatar";
import { PostCountdown } from "../PostCountdown";

const DAY_LABELS: Record<string, string> = {
  SAT: "Sat",
  SUN: "Sun",
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thu",
  FRI: "Fri",
};

interface AdminPostsSectionProps {
  isActive: boolean;
  posts: TuitionPost[];
  applications: TuitionApplication[];
  allUsers: User[];
  onApprovePost: (postId: string) => void;
  onRequestDelete: (post: TuitionPost) => void;
  onExport: () => void;
}

export function AdminPostsSection({
  isActive,
  posts,
  applications,
  allUsers,
  onApprovePost,
  onRequestDelete,
  onExport,
}: AdminPostsSectionProps) {
  const [downloadingPostId, setDownloadingPostId] = useState<string | null>(
    null,
  );

  if (!isActive) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-700" /> Tuition Posts — Full
          Details ({posts.length})
        </h2>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 self-start rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="p-12 text-center bg-white border border-blue-200 rounded-3xl">
          <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-white">No posts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => {
            const postApplications = applications.filter(
              (application) => application.postId === post.id,
            );
            const acceptedApplication = postApplications.find(
              (application) => application.status === "ACCEPTED",
            );
            const pendingApplications = postApplications.filter(
              (application) => application.status === "PENDING",
            );
            const rejectedApplications = postApplications.filter(
              (application) => application.status === "REJECTED",
            );
            const acceptedTutor = acceptedApplication
              ? allUsers.find(
                  (user) => user.id === acceptedApplication.tutorId,
                )
              : null;
            const student = allUsers.find((user) => user.id === post.studentId);

            return (
              <div
                key={post.id}
                className="bg-white border border-blue-200 rounded-3xl p-4 sm:p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-white text-base">
                        {post.title}
                      </h3>
                      <PostCountdown createdAt={post.createdAt} />
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${
                          post.approvalStatus === "PENDING"
                            ? "bg-amber-500/20 text-amber-700 border-amber-500/30"
                            : post.approvalStatus === "REJECTED"
                              ? "bg-rose-500/20 text-rose-700 border-rose-500/30"
                              : "bg-emerald-500/20 text-emerald-700 border-emerald-500/30"
                        }`}
                      >
                        {post.approvalStatus || "APPROVED"}
                      </span>
                      {post.status === "MATCHED" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 border border-blue-500/30 font-mono">
                          MATCHED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-blue-700">
                      {post.subject} • {post.gradeLevel}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-500 uppercase font-mono">
                      Budget
                    </div>
                    <div className="text-lg font-black text-emerald-700">
                      ৳ {post.salaryBudget.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-white border border-slate-200">
                  <div>
                    <div className="text-[9px] text-slate-500 font-mono uppercase">
                      Student
                    </div>
                    <div className="text-xs font-semibold text-white truncate">
                      {post.studentName}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 font-mono uppercase">
                      Phone
                    </div>
                    <div className="text-xs text-emerald-700 font-mono truncate">
                      {student?.phone || post.studentPhone || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 font-mono uppercase">
                      Email
                    </div>
                    <div className="text-xs text-slate-600 truncate">
                      {student?.email || "—"}
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <div className="text-[9px] text-slate-500 font-mono uppercase">
                      Exact Address
                    </div>
                    <div className="text-xs text-white">
                      {post.exactAddress || `${post.areaName}, ${post.district}`}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <PostDetail label="Curriculum" value={post.curriculum} />
                  <PostDetail
                    label="Mode"
                    value={
                      post.tuitionMode === "ONLINE"
                        ? "🌐 Online"
                        : post.tuitionMode === "OFFLINE"
                          ? "🏠 Offline"
                          : post.tuitionMode === "BOTH"
                            ? "🔄 Both"
                            : "—"
                    }
                  />
                  <PostDetail label="Days/Wk" value={String(post.daysPerWeek)} />
                  <PostDetail
                    label="Hrs/Day"
                    value={`${post.hoursPerDay || "—"}h`}
                  />
                </div>

                {post.weeklySchedule && post.weeklySchedule.length > 0 && (
                  <div className="p-3 rounded-xl bg-white border border-blue-200">
                    <div className="text-[10px] text-blue-700 font-mono uppercase mb-1.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Weekly Schedule
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {post.weeklySchedule.map((slot, index) => (
                        <div
                          key={`${slot.day}-${index}`}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-[10px]"
                        >
                          <div className="font-semibold text-white">
                            {DAY_LABELS[slot.day] || slot.day}
                          </div>
                          <div className="text-blue-700 font-mono">
                            {slot.startTime}–{slot.endTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {post.specialRequirements && (
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[9px] text-slate-500 font-mono uppercase">
                      Special Requirements
                    </div>
                    <p className="text-[11px] text-slate-600 italic mt-0.5">
                      {post.specialRequirements}
                    </p>
                  </div>
                )}

                {acceptedApplication && acceptedTutor && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-50 border border-emerald-500/50">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-mono uppercase">
                        <CheckCircle className="w-3.5 h-3.5" /> Accepted Tutor —
                        Tuition Awarded
                      </div>
                      <div className="text-[9px] text-emerald-500 font-mono">
                        ৳ {acceptedApplication.proposedSalary.toLocaleString()}
                        /mo
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <GenderAvatar
                        gender={acceptedTutor.gender || "MALE"}
                        role="TUTOR"
                        size="sm"
                        profilePicture={acceptedTutor.profilePicture}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">
                          {acceptedApplication.tutorName}
                        </div>
                        <div className="text-[10px] text-slate-600 truncate">
                          {acceptedTutor.email} • {acceptedTutor.phone}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Accepted on{" "}
                      {new Date(
                        acceptedApplication.acceptedAt ||
                          acceptedApplication.createdAt,
                      ).toLocaleString()}
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] text-slate-500 font-mono uppercase flex items-center gap-1">
                      <Users className="w-3 h-3 text-blue-700" /> Applicants (
                      {postApplications.length})
                    </div>
                    <div className="flex gap-1 text-[9px] font-mono">
                      <span className="text-amber-700">
                        {pendingApplications.length} pending
                      </span>
                      <span className="text-emerald-700">
                        • {acceptedApplication ? 1 : 0} accepted
                      </span>
                      <span className="text-rose-700">
                        • {rejectedApplications.length} rejected
                      </span>
                    </div>
                  </div>
                  {postApplications.length === 0 ? (
                    <div className="text-center text-[11px] text-slate-500 italic">
                      No applicants yet
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                      {postApplications
                        .slice()
                        .sort(
                          (first, second) =>
                            applicationOrder(first.status) -
                            applicationOrder(second.status),
                        )
                        .map((application) => {
                          const tutor = allUsers.find(
                            (user) => user.id === application.tutorId,
                          );
                          const statusColor =
                            application.status === "ACCEPTED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : application.status === "REJECTED"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-700 border-amber-200";

                          return (
                            <div
                              key={application.id}
                              className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] flex items-start gap-2"
                            >
                              <GenderAvatar
                                gender={tutor?.gender || "MALE"}
                                role="TUTOR"
                                size="xs"
                                profilePicture={tutor?.profilePicture}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-white truncate">
                                    {application.tutorName}
                                  </span>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${statusColor}`}
                                  >
                                    {application.status}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                  {tutor?.institution ||
                                    application.tutorInstitution ||
                                    "—"}{" "}
                                  • {tutor?.areaName || "—"}
                                </div>
                                <div className="text-[10px] text-emerald-700 font-mono">
                                  ৳ {application.proposedSalary.toLocaleString()}
                                  /mo • {application.availableSchedule}
                                </div>
                                {application.message && (
                                  <div className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-2">
                                    "{application.message}"
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {post.approvalStatus === "PENDING" ? (
                    <button
                      onClick={() => onApprovePost(post.id)}
                      className="flex-1 min-w-[100px] py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                    >
                      Approve Post
                    </button>
                  ) : (
                    <span className="flex-1 min-w-[100px] py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold text-center border border-emerald-200">
                      Approved &amp; Live
                    </span>
                  )}
                  <button
                    onClick={() => void downloadCard(post)}
                    disabled={downloadingPostId === post.id}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 disabled:opacity-50"
                  >
                    <Download
                      className={`w-3.5 h-3.5 ${downloadingPostId === post.id ? "animate-pulse" : ""}`}
                    />
                    {downloadingPostId === post.id ? "Generating..." : "Card"}
                  </button>
                  <button
                    onClick={() => onRequestDelete(post)}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-50 text-rose-700 rounded-lg border border-rose-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  async function downloadCard(post: TuitionPost) {
    if (downloadingPostId) return;

    setDownloadingPostId(post.id);
    try {
      await downloadTuitionCard(post);
    } catch {
      alert("Failed to generate card. Try again.");
    } finally {
      setDownloadingPostId(null);
    }
  }
}

function applicationOrder(status: TuitionApplication["status"]) {
  const order: Record<TuitionApplication["status"], number> = {
    ACCEPTED: 0,
    PENDING: 1,
    REJECTED: 2,
    WITHDRAWN: 3,
  };
  return order[status];
}

function PostDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg bg-white border border-slate-200 text-center">
      <div className="text-[9px] text-slate-500 font-mono uppercase">
        {label}
      </div>
      <div className="text-[11px] font-semibold text-white truncate">
        {value}
      </div>
    </div>
  );
}
