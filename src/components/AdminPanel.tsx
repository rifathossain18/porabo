import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Eye,
  Phone,
  GraduationCap,
  Users,
  BookOpen,
  ArrowLeft,
  Check,
  X,
  Lock,
  Database,
  Download,
  Trash2,
  KeyRound,
  Shield,
  MapPin,
  RefreshCw,
  Activity,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Star,
  Calendar,
  Briefcase,
  User as UserIcon,
} from "lucide-react";
import {
  User,
  TuitionPost,
  TuitionApplication,
} from "../lib/types";
import { GenderAvatar } from "./GenderAvatar";
import { PostCountdown } from "./PostCountdown";
import {
  cfD1,
  CLOUDFLARE_D1_SCHEMA,
  D1DiagnosticLog,
} from "../lib/cloudflareD1";
import { ReviewCard } from "./admin/ReviewCard";
import { ExportCard } from "./admin/ExportCard";
import { InspectorModal } from "./admin/InspectorModal";
import { FlatReview } from "./admin/adminTypes";
import { AdminPostsSection } from "./admin/AdminPostsSection";
import { AdminAuthGate } from "./admin/AdminAuthGate";
import {
  AdminStudentsSection,
  AdminTeachersSection,
} from "./admin/AdminUserSections";
import { AdminSystemSection } from "./admin/AdminSystemSection";
import { useAdminExports } from "./admin/useAdminExports";

interface AdminPanelProps {
  allUsers: User[];
  tuitionPosts: TuitionPost[];
  applications?: TuitionApplication[];
  onApproveTutor: (tutorId: string) => void;
  onRejectTutor: (tutorId: string, reason: string) => void;
  onApprovePost: (postId: string) => void;
  onRejectPost: (postId: string) => void;
  onDeleteUser: (userId: string) => void;
  onDeletePost: (postId: string) => void;
  onApproveReview: (tutorId: string, reviewId: string) => void;
  onRejectReview: (tutorId: string, reviewId: string, reason: string) => void;
  onExitAdmin: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  allUsers,
  tuitionPosts,
  applications = [],
  onApproveTutor,
  onRejectTutor,
  onApprovePost,
  onRejectPost,
  onDeleteUser,
  onDeletePost,
  onApproveReview,
  onRejectReview,
  onExitAdmin,
}) => {
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem("porabo_admin_auth") === "true",
  );

  const [enteredPasscode, setEnteredPasscode] = useState<string>("");
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  const [initialPassword, setInitialPassword] = useState<string>("");
  const [initialConfirmPassword, setInitialConfirmPassword] =
    useState<string>("");
  const [initialPasswordError, setInitialPasswordError] = useState<
    string | null
  >(null);
  const [recoveryCodeModal, setRecoveryCodeModal] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [recoveryCodeInput, setRecoveryCodeInput] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<
    | "urgent"
    | "reviews"
    | "teachers"
    | "students"
    | "posts"
    | "export"
    | "cloudflare"
    | "settings"
  >("urgent");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [diagnosticLogs, setDiagnosticLogs] = useState<D1DiagnosticLog[]>(() =>
    cfD1.getDiagnosticLogs(),
  );

  const [rejectingTutorId, setRejectingTutorId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>(
    "National ID or institution credentials could not be verified.",
  );
  const [rejectingReview, setRejectingReview] = useState<{
    tutorId: string;
    reviewId: string;
  } | null>(null);
  const [reviewRejectReason, setReviewRejectReason] = useState<string>(
    "Review contains inappropriate language or does not meet community guidelines.",
  );
  const [inspectingUser, setInspectingUser] = useState<User | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{
    type: "user" | "post";
    id: string;
    name: string;
  } | null>(null);

  const [downloadingTeacherCardId, setDownloadingTeacherCardId] = useState<
    string | null
  >(null);

  const [reviewFilter, setReviewFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("PENDING");

  useEffect(() => {
    cfD1.getAdminConfig().then((res) => setHasPassword(res.hasPassword));
    const unsub = cfD1.subscribeToDiagnostics((newLog: D1DiagnosticLog) => {
      setDiagnosticLogs((prev) => [newLog, ...prev.slice(0, 149)]);
    });
    return unsub;
  }, []);

  const tutors = useMemo(
    () => allUsers.filter((u) => u.role === "TUTOR"),
    [allUsers],
  );
  const students = useMemo(
    () => allUsers.filter((u) => u.role === "STUDENT"),
    [allUsers],
  );
  const pendingTutors = useMemo(
    () =>
      tutors.filter(
        (t) => t.verificationStatus === "PENDING" || !t.verificationStatus,
      ),
    [tutors],
  );
  const verifiedTutors = useMemo(
    () => tutors.filter((t) => t.verificationStatus === "VERIFIED"),
    [tutors],
  );
  const pendingPosts = useMemo(
    () => tuitionPosts.filter((p) => p.approvalStatus === "PENDING"),
    [tuitionPosts],
  );
  const approvedPosts = useMemo(
    () =>
      tuitionPosts.filter(
        (p) => p.approvalStatus === "APPROVED" || !p.approvalStatus,
      ),
    [tuitionPosts],
  );

  const allReviews: FlatReview[] = useMemo(() => {
    const flat: FlatReview[] = [];
    tutors.forEach((t) => {
      (t.reviews || []).forEach((r) => {
        flat.push({
          ...r,
          tutorId: t.id,
          tutorName: t.fullName,
          tutorDistrict: t.district,
          status: (r.status || "APPROVED") as any,
        });
      });
    });
    return flat.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [tutors]);

  const pendingReviews = allReviews.filter((r) => r.status === "PENDING");
  const approvedReviews = allReviews.filter((r) => r.status === "APPROVED");
  const rejectedReviews = allReviews.filter((r) => r.status === "REJECTED");

  const {
    handleExportTeachers,
    handleExportStudents,
    handleExportTuitionPosts,
    handleExportReviews,
  } = useAdminExports({ tutors, students, tuitionPosts, applications, allReviews });

  const filteredTutors = tutors.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.areaName.toLowerCase().includes(q) ||
      u.district.toLowerCase().includes(q)
    );
  });

  const filteredStudents = students.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q)
    );
  });

  const filteredPosts = tuitionPosts.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.subject.toLowerCase().includes(q) ||
      p.studentName.toLowerCase().includes(q)
    );
  });

  const filteredReviews =
    reviewFilter === "ALL"
      ? allReviews
      : allReviews.filter((r) => r.status === reviewFilter);

  const handleInitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setInitialPasswordError(null);
    if (!initialPassword || initialPassword.length < 6) {
      setInitialPasswordError("Admin password must be at least 6 characters.");
      return;
    }
    if (initialPassword !== initialConfirmPassword) {
      setInitialPasswordError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    const res = await cfD1.initAdminPassword(initialPassword);
    setIsSubmitting(false);
    if (res.success && res.recoveryCode) setRecoveryCodeModal(res.recoveryCode);
    else setInitialPasswordError(res.error || "Failed to initialize password.");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);
    setIsSubmitting(true);
    const res = await cfD1.verifyAdminPassword(enteredPasscode);
    setIsSubmitting(false);
    if (res.success) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem("porabo_admin_auth", "true");
    } else setPasscodeError(res.error || "Invalid password.");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (!newPassword || newPassword.length < 6) {
      setResetError("New password must be at least 6 characters.");
      return;
    }
    setIsSubmitting(true);
    const res = await cfD1.resetAdminPassword(recoveryCodeInput, newPassword);
    setIsSubmitting(false);
    if (res.success) {
      setResetSuccess(true);
      setTimeout(() => {
        setIsForgotPassword(false);
        setResetSuccess(false);
        setRecoveryCodeInput("");
        setNewPassword("");
        setEnteredPasscode("");
        setPasscodeError(null);
      }, 2500);
    } else setResetError(res.error || "Invalid recovery code or reset failed.");
  };

  const handleLockAdminSession = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem("porabo_admin_auth");
    sessionStorage.removeItem("porabo_admin_token");
    setEnteredPasscode("");
    setPasscodeError(null);
  };

  const handleConfirmRejectTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingTutorId) return;
    onRejectTutor(rejectingTutorId, rejectionReason);
    setRejectingTutorId(null);
  };

  const handleConfirmRejectReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReview) return;
    onRejectReview(
      rejectingReview.tutorId,
      rejectingReview.reviewId,
      reviewRejectReason,
    );
    setRejectingReview(null);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === "user") onDeleteUser(itemToDelete.id);
    else onDeletePost(itemToDelete.id);
    setItemToDelete(null);
  };

  if (hasPassword === null || !isAdminAuthenticated) {
    return (
      <AdminAuthGate
        hasPassword={hasPassword}
        isForgotPassword={isForgotPassword}
        setIsForgotPassword={setIsForgotPassword}
        resetSuccess={resetSuccess}
        recoveryCodeInput={recoveryCodeInput}
        setRecoveryCodeInput={setRecoveryCodeInput}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        showPasscode={showPasscode}
        resetError={resetError}
        handleResetPassword={handleResetPassword}
        isSubmitting={isSubmitting}
        initialPassword={initialPassword}
        setInitialPassword={setInitialPassword}
        initialConfirmPassword={initialConfirmPassword}
        setInitialConfirmPassword={setInitialConfirmPassword}
        initialPasswordError={initialPasswordError}
        handleInitPassword={handleInitPassword}
        enteredPasscode={enteredPasscode}
        setEnteredPasscode={setEnteredPasscode}
        passcodeError={passcodeError}
        handleLogin={handleLogin}
        recoveryCodeModal={recoveryCodeModal}
        setRecoveryCodeModal={setRecoveryCodeModal}
        setIsAdminAuthenticated={setIsAdminAuthenticated}
        onExitAdmin={onExitAdmin}
      />
    );
  }

  // ============ MAIN CONSOLE ============
  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col pb-16">
      <header className="sticky top-0 z-40 border-b border-blue-900/50 bg-[#0B0F19]/95 backdrop-blur-md px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white">
                  Porabo <span className="text-blue-400">Admin</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5" /> Authenticated
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLockAdminSession}
              className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />{" "}
              <span className="hidden sm:inline">Lock</span>
            </button>
            <button
              onClick={onExitAdmin}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-400" /> Exit
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-6 lg:p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-4">
          <div
            onClick={() => setActiveTab("urgent")}
            className={`p-3.5 rounded-3xl border cursor-pointer transition-all ${activeTab === "urgent" ? "bg-amber-950/30 border-amber-500/60 ring-2 ring-amber-500/30" : "bg-[#111827] border-blue-950/70"}`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>QUEUE</span>
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <span className="text-xl font-black text-amber-400">
              {pendingTutors.length +
                pendingPosts.length +
                pendingReviews.length}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {pendingTutors.length}T • {pendingPosts.length}P •{" "}
              {pendingReviews.length}R
            </span>
          </div>
          <div
            onClick={() => setActiveTab("reviews")}
            className={`p-3.5 rounded-3xl border cursor-pointer transition-all ${activeTab === "reviews" ? "bg-purple-950/30 border-purple-500/60 ring-2 ring-purple-500/30" : "bg-[#111827] border-blue-950/70"}`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>REVIEWS</span>
              <MessageSquare className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-xl font-black text-purple-400">
              {allReviews.length}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {pendingReviews.length} pending
            </span>
          </div>
          <div
            onClick={() => setActiveTab("teachers")}
            className={`p-3.5 rounded-3xl border cursor-pointer transition-all ${activeTab === "teachers" ? "bg-blue-950/30 border-blue-500/60 ring-2 ring-blue-500/30" : "bg-[#111827] border-blue-950/70"}`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>TEACHERS</span>
              <GraduationCap className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-xl font-black text-white">
              {tutors.length}
            </span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">
              {verifiedTutors.length} verified
            </span>
          </div>
          <div
            onClick={() => setActiveTab("students")}
            className={`p-3.5 rounded-3xl border cursor-pointer transition-all ${activeTab === "students" ? "bg-cyan-950/30 border-cyan-500/60 ring-2 ring-cyan-500/30" : "bg-[#111827] border-blue-950/70"}`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>STUDENTS</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-xl font-black text-cyan-400">
              {students.length}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              guardians
            </span>
          </div>
          <div
            onClick={() => setActiveTab("posts")}
            className={`p-3.5 rounded-3xl border cursor-pointer transition-all ${activeTab === "posts" ? "bg-emerald-950/30 border-emerald-500/60 ring-2 ring-emerald-500/30" : "bg-[#111827] border-blue-950/70"}`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>POSTS</span>
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xl font-black text-white">
              {tuitionPosts.length}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {approvedPosts.length} live
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#111827] border border-blue-900/40 rounded-2xl p-1.5 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 min-w-max">
            {[
              {
                id: "urgent",
                label: "🔴 Queue",
                badge:
                  pendingTutors.length +
                  pendingPosts.length +
                  pendingReviews.length,
              },
              {
                id: "reviews",
                label: "Reviews",
                icon: MessageSquare,
                badge: pendingReviews.length,
              },
              { id: "teachers", label: "Teachers", icon: GraduationCap },
              { id: "students", label: "Students", icon: Users },
              { id: "posts", label: "Posts", icon: BookOpen },
              { id: "export", label: "Export", icon: Download },
              { id: "cloudflare", label: "D1/KV", icon: Database },
              { id: "settings", label: "Settings", icon: KeyRound },
            ].map((tab: any) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === tab.id ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="px-1.5 py-0 rounded bg-amber-500 text-slate-900 text-[10px] font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {["teachers", "students", "posts", "reviews"].includes(activeTab) && (
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-[#111827] border border-blue-950/70 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* QUEUE */}
        {activeTab === "urgent" && (
          <div className="space-y-6">
            <div className="bg-[#111827] border border-purple-500/40 rounded-3xl p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                  {pendingReviews.length}
                </div>
                <h2 className="text-sm font-bold text-white">
                  Pending Reviews
                </h2>
              </div>
              {pendingReviews.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs text-slate-400">No pending reviews.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReviews.map((r) => (
                    <ReviewCard
                      key={r.id}
                      review={r}
                      onApprove={() => onApproveReview(r.tutorId, r.id)}
                      onReject={() =>
                        setRejectingReview({
                          tutorId: r.tutorId,
                          reviewId: r.id,
                        })
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#111827] border border-amber-500/40 rounded-3xl p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                  {pendingTutors.length}
                </div>
                <h2 className="text-sm font-bold text-white">
                  Pending Teachers
                </h2>
              </div>
              {pendingTutors.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs text-slate-400">No pending teachers.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingTutors.map((tutor) => (
                    <div
                      key={tutor.id}
                      className="bg-[#0B0F19] border border-amber-500/30 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <GenderAvatar
                          gender={tutor.gender || "MALE"}
                          role="TUTOR"
                          size="md"
                          profilePicture={tutor.profilePicture}
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-sm">
                            {tutor.fullName}
                          </h3>
                          <p className="text-xs text-blue-400">
                            {tutor.institution || "—"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {tutor.areaName}, {tutor.district}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setInspectingUser(tutor)}
                          className="flex-1 py-2 bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" /> Full
                          Info
                        </button>
                        <button
                          onClick={() => onApproveTutor(tutor.id)}
                          className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => setRejectingTutorId(tutor.id)}
                          className="p-2 bg-rose-950/60 text-rose-400 rounded-xl border border-rose-800/50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#111827] border border-cyan-500/40 rounded-3xl p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                  {pendingPosts.length}
                </div>
                <h2 className="text-sm font-bold text-white">Pending Posts</h2>
              </div>
              {pendingPosts.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs text-slate-400">No pending posts.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-[#0B0F19] border border-cyan-500/30 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white text-sm">
                          {post.title}
                        </h3>
                        <PostCountdown createdAt={post.createdAt} />
                      </div>
                      <p className="text-xs text-cyan-400">
                        {post.subject} • {post.gradeLevel}
                      </p>
                      <div className="text-xs text-slate-300">
                        Guardian: {post.studentName} •{" "}
                        <span className="text-emerald-400 font-bold">
                          ৳ {post.salaryBudget.toLocaleString()}/mo
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onApprovePost(post.id)}
                          className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            setItemToDelete({
                              type: "post",
                              id: post.id,
                              name: post.title,
                            })
                          }
                          className="py-2 px-3 bg-rose-950/60 text-rose-400 rounded-xl border border-rose-800/50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" /> Reviews (
                {allReviews.length})
              </h2>
              <button
                onClick={handleExportReviews}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "PENDING", label: `Pending (${pendingReviews.length})` },
                {
                  id: "APPROVED",
                  label: `Approved (${approvedReviews.length})`,
                },
                {
                  id: "REJECTED",
                  label: `Rejected (${rejectedReviews.length})`,
                },
                { id: "ALL", label: `All (${allReviews.length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setReviewFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${reviewFilter === f.id ? "bg-purple-600 text-white" : "bg-[#111827] text-slate-400 border border-blue-950/70"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredReviews.map((r) => (
                <ReviewCard
                  key={r.id}
                  review={r}
                  showTutorName
                  onApprove={
                    r.status === "PENDING"
                      ? () => onApproveReview(r.tutorId, r.id)
                      : undefined
                  }
                  onReject={
                    r.status === "PENDING"
                      ? () =>
                          setRejectingReview({
                            tutorId: r.tutorId,
                            reviewId: r.id,
                          })
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        )}

        <AdminTeachersSection
          isActive={activeTab === "teachers"}
          tutors={filteredTutors}
          downloadingTeacherCardId={downloadingTeacherCardId}
          setDownloadingTeacherCardId={setDownloadingTeacherCardId}
          setInspectingUser={setInspectingUser}
          onApproveTutor={onApproveTutor}
          onRequestDelete={(user) =>
            setItemToDelete({
              type: "user",
              id: user.id,
              name: user.fullName,
            })
          }
          onExport={handleExportTeachers}
        />
        <AdminStudentsSection
          isActive={activeTab === "students"}
          students={filteredStudents}
          tuitionPostsCountByStudent={(studentId) =>
            tuitionPosts.filter((post) => post.studentId === studentId).length
          }
          setInspectingUser={setInspectingUser}
          onRequestDelete={(user) =>
            setItemToDelete({
              type: "user",
              id: user.id,
              name: user.fullName,
            })
          }
          onExport={handleExportStudents}
        />

        <AdminPostsSection
          isActive={activeTab === "posts"}
          posts={filteredPosts}
          applications={applications}
          allUsers={allUsers}
          onApprovePost={onApprovePost}
          onRequestDelete={(post) => setItemToDelete({ type: "post", id: post.id, name: post.title })}
          onExport={handleExportTuitionPosts}
        />
        {/* EXPORT */}
        {activeTab === "export" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-950/40 to-teal-950/20 border border-emerald-500/40 rounded-3xl p-5">
              <h2 className="text-lg font-bold text-white mb-1">Export Data</h2>
              <p className="text-xs text-slate-300 mb-3">
                Download datasets as CSV
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <ExportCard
                title="Teachers"
                count={tutors.length}
                color="blue"
                onExport={handleExportTeachers}
              />
              <ExportCard
                title="Students"
                count={students.length}
                color="cyan"
                onExport={handleExportStudents}
              />
              <ExportCard
                title="Posts"
                count={tuitionPosts.length}
                color="purple"
                onExport={handleExportTuitionPosts}
              />
              <ExportCard
                title="Reviews"
                count={allReviews.length}
                color="amber"
                onExport={handleExportReviews}
              />
            </div>
          </div>
        )}

        <AdminSystemSection
          isCloudflareActive={activeTab === "cloudflare"}
          isSettingsActive={activeTab === "settings"}
          diagnosticLogs={diagnosticLogs}
          onLockSession={handleLockAdminSession}
        />
      </main>

      {/* MODALS */}
      {rejectingTutorId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111827] border border-rose-500/40 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-white">Reject Teacher</h3>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-[#0B0F19] border border-rose-500/30 rounded-xl p-3 text-xs text-white resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRejectingTutorId(null)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectTutor}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111827] border border-rose-500/40 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-white">Reject Review</h3>
            <textarea
              rows={3}
              value={reviewRejectReason}
              onChange={(e) => setReviewRejectReason(e.target.value)}
              className="w-full bg-[#0B0F19] border border-rose-500/30 rounded-xl p-3 text-xs text-white resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRejectingReview(null)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectReview}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {inspectingUser && (
        <InspectorModal
          user={inspectingUser}
          onClose={() => setInspectingUser(null)}
          onApprove={() => {
            onApproveTutor(inspectingUser.id);
            setInspectingUser(null);
          }}
          onReject={() => {
            setRejectingTutorId(inspectingUser.id);
            setInspectingUser(null);
          }}
        />
      )}

      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#111827] border border-rose-500/50 rounded-3xl p-6 space-y-4 text-center">
            <Trash2 className="w-12 h-12 text-rose-400 mx-auto" />
            <h3 className="font-bold text-lg text-white">
              Permanently Delete?
            </h3>
            <p className="text-xs text-slate-400">
              "{itemToDelete.name}" will be purged. Cannot undo.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
