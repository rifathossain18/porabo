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
  StudentReview,
} from "../lib/types";
import { GenderAvatar } from "./GenderAvatar";
import { PostCountdown } from "./PostCountdown";
import { downloadTeacherCard } from "../lib/cardGenerator";
import { downloadTuitionCard } from "../lib/cardGenerator";
import {
  cfD1,
  CLOUDFLARE_D1_SCHEMA,
  D1DiagnosticLog,
} from "../lib/cloudflareD1";

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

interface FlatReview extends StudentReview {
  tutorName: string;
  tutorDistrict: string;
}

const DAY_LABELS: Record<string, string> = {
  SAT: "Sat",
  SUN: "Sun",
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thu",
  FRI: "Fri",
};

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

  const [downloadingPostId, setDownloadingPostId] = useState<string | null>(
    null,
  );

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

  const exportToExcelCSV = (
    filename: string,
    headers: string[],
    rows: (string | number | undefined | null)[][],
  ) => {
    const escapeCell = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    };
    const csvContent =
      "\uFEFF" +
      [
        headers.map(escapeCell).join(","),
        ...rows.map((row) => row.map(escapeCell).join(",")),
      ].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      filename.endsWith(".csv") ? filename : `${filename}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportTeachers = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Gender",
      "District",
      "Institution",
      "Department",
      "NID",
      "Roll",
      "Reg",
      "Status",
      "Rating",
    ];
    const rows = tutors.map((t) => [
      t.id,
      t.fullName,
      t.email,
      t.phone,
      t.gender,
      t.district,
      t.institution,
      t.department,
      t.nidNumber,
      t.studentIdCardRoll,
      t.studentIdCardReg,
      t.verificationStatus,
      t.rating,
    ]);
    exportToExcelCSV(
      `porabo_teachers_${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows,
    );
  };

  const handleExportStudents = () => {
    const headers = ["ID", "Name", "Email", "Phone", "District", "Address"];
    const rows = students.map((s) => [
      s.id,
      s.fullName,
      s.email,
      s.phone,
      s.district,
      s.exactAddress,
    ]);
    exportToExcelCSV(
      `porabo_students_${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows,
    );
  };

  const handleExportTuitionPosts = () => {
    const headers = [
      "Post ID",
      "Title",
      "Student",
      "Subject",
      "Grade",
      "Budget",
      "Mode",
      "Status",
      "Applicants",
      "Accepted Tutor",
      "Created",
    ];
    const rows = tuitionPosts.map((p) => {
      const postApps = applications.filter((a) => a.postId === p.id);
      const accepted = postApps.find((a) => a.status === "ACCEPTED");
      return [
        p.id,
        p.title,
        p.studentName,
        p.subject,
        p.gradeLevel,
        p.salaryBudget,
        p.tuitionMode || "—",
        p.status,
        postApps.length,
        accepted?.tutorName || "—",
        new Date(p.createdAt).toISOString(),
      ];
    });
    exportToExcelCSV(
      `porabo_posts_${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows,
    );
  };

  const handleExportReviews = () => {
    const headers = [
      "ID",
      "Tutor",
      "Student",
      "Punctuality",
      "Mastery",
      "Style",
      "Overall",
      "Comment",
      "Status",
    ];
    const rows = allReviews.map((r) => [
      r.id,
      r.tutorName,
      r.studentName,
      r.punctuality,
      r.subjectMastery,
      r.teachingStyle,
      r.overall,
      r.comment,
      r.status,
    ]);
    exportToExcelCSV(
      `porabo_reviews_${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows,
    );
  };

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

  if (hasPassword === null) {
    return (
      <div className="min-h-screen bg-[#070A12] flex flex-col items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="font-mono text-sm">
          Connecting to secure admin gateway...
        </p>
      </div>
    );
  }

  // ============ AUTH GATE ============
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070A12] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0B0F19] border border-blue-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/40 text-blue-400 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60">
                {hasPassword
                  ? "Authorized Personnel Only"
                  : "Initial Security Setup"}
              </span>
              <h1 className="text-2xl font-black text-white mt-2">
                {!hasPassword
                  ? "Initialize Admin Password"
                  : "Porabo Admin Console"}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {!hasPassword
                  ? "Create a master password."
                  : "Enter your master password."}
              </p>
            </div>
          </div>

          {isForgotPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {resetSuccess ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-emerald-300">
                    Password Reset Successful!
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Recovery Code
                    </label>
                    <input
                      type="text"
                      value={recoveryCodeInput}
                      onChange={(e) =>
                        setRecoveryCodeInput(e.target.value.toUpperCase())
                      }
                      placeholder="e.g. A1B2C3D4"
                      required
                      className="w-full bg-[#111827] border border-blue-950 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono tracking-widest text-center uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      New Password
                    </label>
                    <input
                      type={showPasscode ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full bg-[#111827] border border-blue-950 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  {resetError && (
                    <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
                      {resetError}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="flex-1 py-3.5 bg-slate-800 text-slate-300 rounded-2xl text-sm font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl text-sm font-bold disabled:opacity-50"
                    >
                      {isSubmitting ? "Resetting..." : "Reset Password"}
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : !hasPassword ? (
            <form onSubmit={handleInitPassword} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Master Password
                </label>
                <input
                  type={showPasscode ? "text" : "password"}
                  value={initialPassword}
                  onChange={(e) => setInitialPassword(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-[#111827] border border-blue-950 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPasscode ? "text" : "password"}
                  value={initialConfirmPassword}
                  onChange={(e) => setInitialConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-[#111827] border border-blue-950 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              {initialPasswordError && (
                <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
                  {initialPasswordError}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                {isSubmitting ? "Saving..." : "Save Password & Enter"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Master Password
                </label>
                <input
                  type={showPasscode ? "text" : "password"}
                  value={enteredPasscode}
                  onChange={(e) => setEnteredPasscode(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoFocus
                  className="w-full bg-[#111827] border border-blue-950 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              {passcodeError && (
                <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
                  {passcodeError}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                {isSubmitting ? "Verifying..." : "Log In"}
              </button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-slate-800/80 text-center">
            <button
              onClick={onExitAdmin}
              className="text-slate-400 hover:text-white text-xs flex items-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Porabo App
            </button>
          </div>
        </div>

        {recoveryCodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#111827] border border-emerald-500/50 rounded-3xl p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <KeyRound className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Save Your Recovery Code
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  This is the ONLY way to reset your password if forgotten.
                </p>
              </div>
              <div className="text-3xl font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 py-4 rounded-xl tracking-widest select-all">
                {recoveryCodeModal}
              </div>
              <button
                onClick={() => {
                  setRecoveryCodeModal(null);
                  setIsAdminAuthenticated(true);
                  sessionStorage.setItem("porabo_admin_auth", "true");
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm"
              >
                I have saved it. Enter Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
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

        {/* TEACHERS */}
        {activeTab === "teachers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-400" /> Teachers (
                {filteredTutors.length})
              </h2>
              <button
                onClick={handleExportTeachers}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {filteredTutors.map((tutor) => {
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
                        <Eye className="w-3.5 h-3.5 text-blue-400" /> View Full
                        Info
                      </button>
                      <button
                        onClick={async () => {
                          if (downloadingTeacherCardId) return;
                          setDownloadingTeacherCardId(tutor.id);
                          try {
                            await downloadTeacherCard(tutor);
                          } catch (err) {
                            alert("Failed to generate bio card. Try again.");
                          } finally {
                            setDownloadingTeacherCardId(null);
                          }
                        }}
                        disabled={downloadingTeacherCardId === tutor.id}
                        className="py-2 px-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-600/20 disabled:opacity-50"
                        title="Download cinematic bio card"
                      >
                        <Download
                          className={`w-3.5 h-3.5 ${downloadingTeacherCardId === tutor.id ? "animate-pulse" : ""}`}
                        />
                        {downloadingTeacherCardId === tutor.id
                          ? "..."
                          : "Bio Card"}
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
                        onClick={() =>
                          setItemToDelete({
                            type: "user",
                            id: tutor.id,
                            name: tutor.fullName,
                          })
                        }
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
        )}

        {/* STUDENTS */}
        {activeTab === "students" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" /> Students (
                {filteredStudents.length})
              </h2>
              <button
                onClick={handleExportStudents}
                className="px-3 py-1.5 bg-cyan-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredStudents.map((student) => {
                const postsCount = tuitionPosts.filter(
                  (p) => p.studentId === student.id,
                ).length;
                return (
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
                        {postsCount} posts
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-emerald-400" />{" "}
                      {student.phone}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {student.areaName},{" "}
                      {student.district}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setInspectingUser(student)}
                        className="flex-1 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-blue-400" /> View
                      </button>
                      <button
                        onClick={() =>
                          setItemToDelete({
                            type: "user",
                            id: student.id,
                            name: student.fullName,
                          })
                        }
                        className="flex-1 py-1.5 bg-rose-950/60 text-rose-400 rounded-lg text-[11px] font-semibold border border-rose-800/50 flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* POSTS — FULL DETAILS + APPLICANTS + COUNTDOWN */}
        {activeTab === "posts" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" /> Tuition Posts —
                Full Details ({filteredPosts.length})
              </h2>
              <button
                onClick={handleExportTuitionPosts}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="p-12 text-center bg-[#111827] border border-blue-900/30 rounded-3xl">
                <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-white">
                  No posts found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredPosts.map((post) => {
                  const postApps = applications.filter(
                    (a) => a.postId === post.id,
                  );
                  const acceptedApp = postApps.find(
                    (a) => a.status === "ACCEPTED",
                  );
                  const pendingApps = postApps.filter(
                    (a) => a.status === "PENDING",
                  );
                  const rejectedApps = postApps.filter(
                    (a) => a.status === "REJECTED",
                  );
                  const acceptedTutor = acceptedApp
                    ? allUsers.find((u) => u.id === acceptedApp.tutorId)
                    : null;
                  const postStudent = allUsers.find(
                    (u) => u.id === post.studentId,
                  );

                  return (
                    <div
                      key={post.id}
                      className="bg-[#111827] border border-blue-900/40 rounded-3xl p-4 sm:p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-white text-base">
                              {post.title}
                            </h3>
                            <PostCountdown createdAt={post.createdAt} />
                            {post.approvalStatus === "PENDING" ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                                PENDING
                              </span>
                            ) : post.approvalStatus === "REJECTED" ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono">
                                REJECTED
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                                APPROVED
                              </span>
                            )}
                            {post.status === "MATCHED" && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                                MATCHED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-blue-400">
                            {post.subject} • {post.gradeLevel}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-slate-500 uppercase font-mono">
                            Budget
                          </div>
                          <div className="text-lg font-black text-emerald-400">
                            ৳ {post.salaryBudget.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
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
                          <div className="text-xs text-emerald-400 font-mono truncate">
                            {postStudent?.phone || post.studentPhone || "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-500 font-mono uppercase">
                            Email
                          </div>
                          <div className="text-xs text-slate-300 truncate">
                            {postStudent?.email || "—"}
                          </div>
                        </div>
                        <div className="col-span-2 sm:col-span-3">
                          <div className="text-[9px] text-slate-500 font-mono uppercase">
                            Exact Address
                          </div>
                          <div className="text-xs text-white">
                            {post.exactAddress ||
                              `${post.areaName}, ${post.district}`}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-2 rounded-lg bg-[#0B0F19] border border-slate-800 text-center">
                          <div className="text-[9px] text-slate-500 font-mono uppercase">
                            Curriculum
                          </div>
                          <div className="text-[11px] font-semibold text-white truncate">
                            {post.curriculum}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-[#0B0F19] border border-slate-800 text-center">
                          <div className="text-[9px] text-slate-500 font-mono uppercase">
                            Mode
                          </div>
                          <div className="text-[11px] font-semibold text-white">
                            {post.tuitionMode === "ONLINE"
                              ? "🌐 Online"
                              : post.tuitionMode === "OFFLINE"
                                ? "🏠 Offline"
                                : post.tuitionMode === "BOTH"
                                  ? "🔄 Both"
                                  : "—"}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-[#0B0F19] border border-slate-800 text-center">
                          <div className="text-[9px] text-slate-500 font-mono uppercase">
                            Days/Wk
                          </div>
                          <div className="text-[11px] font-semibold text-white">
                            {post.daysPerWeek}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-[#0B0F19] border border-slate-800 text-center">
                          <div className="text-[9px] text-slate-500 font-mono uppercase">
                            Hrs/Day
                          </div>
                          <div className="text-[11px] font-semibold text-white">
                            {post.hoursPerDay || "—"}h
                          </div>
                        </div>
                      </div>

                      {post.weeklySchedule &&
                        post.weeklySchedule.length > 0 && (
                          <div className="p-3 rounded-xl bg-[#0B0F19] border border-cyan-900/50">
                            <div className="text-[10px] text-cyan-400 font-mono uppercase mb-1.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Weekly Schedule
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                              {post.weeklySchedule.map((slot, i) => (
                                <div
                                  key={i}
                                  className="p-1.5 rounded-lg bg-[#111827] border border-slate-800 text-[10px]"
                                >
                                  <div className="font-semibold text-white">
                                    {DAY_LABELS[slot.day] || slot.day}
                                  </div>
                                  <div className="text-cyan-400 font-mono">
                                    {slot.startTime}–{slot.endTime}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {post.specialRequirements && (
                        <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-slate-800">
                          <div className="text-[9px] text-slate-500 font-mono uppercase">
                            Special Requirements
                          </div>
                          <p className="text-[11px] text-slate-300 italic mt-0.5">
                            {post.specialRequirements}
                          </p>
                        </div>
                      )}

                      {acceptedApp && acceptedTutor && (
                        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-emerald-900/20 border border-emerald-500/50">
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono uppercase">
                              <CheckCircle className="w-3.5 h-3.5" /> Accepted
                              Tutor — Tuition Awarded
                            </div>
                            <div className="text-[9px] text-emerald-500 font-mono">
                              ৳ {acceptedApp.proposedSalary.toLocaleString()}/mo
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
                                {acceptedApp.tutorName}
                              </div>
                              <div className="text-[10px] text-slate-300 truncate">
                                {acceptedTutor.email} • {acceptedTutor.phone}
                              </div>
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Accepted on{" "}
                            {new Date(
                              acceptedApp.acceptedAt || acceptedApp.createdAt,
                            ).toLocaleString()}
                          </div>
                        </div>
                      )}

                      {postApps.length > 0 ? (
                        <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[10px] text-slate-400 font-mono uppercase flex items-center gap-1">
                              <Users className="w-3 h-3 text-blue-400" />{" "}
                              Applicants ({postApps.length})
                            </div>
                            <div className="flex gap-1 text-[9px] font-mono">
                              <span className="text-amber-400">
                                {pendingApps.length} pending
                              </span>
                              <span className="text-emerald-400">
                                • {acceptedApp ? 1 : 0} accepted
                              </span>
                              <span className="text-rose-400">
                                • {rejectedApps.length} rejected
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                            {postApps
                              .slice()
                              .sort((a, b) => {
                                const order: any = {
                                  ACCEPTED: 0,
                                  PENDING: 1,
                                  REJECTED: 2,
                                };
                                return (
                                  (order[a.status] ?? 3) -
                                  (order[b.status] ?? 3)
                                );
                              })
                              .map((app) => {
                                const appTutor = allUsers.find(
                                  (u) => u.id === app.tutorId,
                                );
                                const statusColor =
                                  app.status === "ACCEPTED"
                                    ? "bg-emerald-950 text-emerald-400 border-emerald-800/60"
                                    : app.status === "REJECTED"
                                      ? "bg-rose-950 text-rose-400 border-rose-800/60"
                                      : "bg-amber-950 text-amber-400 border-amber-800/60";
                                return (
                                  <div
                                    key={app.id}
                                    className="p-2 rounded-lg bg-[#111827] border border-slate-800 text-[11px] flex items-start gap-2"
                                  >
                                    <GenderAvatar
                                      gender={appTutor?.gender || "MALE"}
                                      role="TUTOR"
                                      size="xs"
                                      profilePicture={appTutor?.profilePicture}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-semibold text-white truncate">
                                          {app.tutorName}
                                        </span>
                                        <span
                                          className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${statusColor}`}
                                        >
                                          {app.status}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-400 truncate">
                                        {appTutor?.institution ||
                                          app.tutorInstitution ||
                                          "—"}{" "}
                                        • {appTutor?.areaName || "—"}
                                      </div>
                                      <div className="text-[10px] text-emerald-400 font-mono">
                                        ৳ {app.proposedSalary.toLocaleString()}
                                        /mo • {app.availableSchedule}
                                      </div>
                                      {app.message && (
                                        <div className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-2">
                                          "{app.message}"
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 text-center text-[11px] text-slate-500 italic">
                          No applicants yet
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        {post.approvalStatus === "PENDING" ? (
                          <button
                            onClick={() => onApprovePost(post.id)}
                            className="flex-1 min-w-[100px] py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                          >
                            Approve Post
                          </button>
                        ) : (
                          <span className="flex-1 min-w-[100px] py-2 bg-emerald-950/60 text-emerald-400 rounded-lg text-xs font-semibold text-center border border-emerald-800/60">
                            Approved &amp; Live
                          </span>
                        )}
                        <button
                          onClick={async () => {
                            if (downloadingPostId) return;
                            setDownloadingPostId(post.id);
                            try {
                              await downloadTuitionCard(post);
                            } catch (err) {
                              alert("Failed to generate card. Try again.");
                            } finally {
                              setDownloadingPostId(null);
                            }
                          }}
                          disabled={downloadingPostId === post.id}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 disabled:opacity-50"
                        >
                          <Download
                            className={`w-3.5 h-3.5 ${downloadingPostId === post.id ? "animate-pulse" : ""}`}
                          />
                          {downloadingPostId === post.id
                            ? "Generating..."
                            : "Card"}
                        </button>
                        <button
                          onClick={() =>
                            setItemToDelete({
                              type: "post",
                              id: post.id,
                              name: post.title,
                            })
                          }
                          className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 rounded-lg border border-rose-800/50 text-xs font-semibold flex items-center gap-1.5"
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
        )}

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

        {/* CLOUDFLARE */}
        {activeTab === "cloudflare" && (
          <div className="space-y-4">
            <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5">
              <h3 className="text-sm font-bold text-white mb-2">SQL Schema</h3>
              <pre className="bg-[#070A12] p-3 rounded-xl text-[10px] font-mono text-slate-300 overflow-auto max-h-96">
                {CLOUDFLARE_D1_SCHEMA}
              </pre>
            </div>
            <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Query Log (
                {diagnosticLogs.length})
              </h3>
              <div className="overflow-auto max-h-72 rounded-xl border border-slate-800">
                <table className="w-full text-[11px] font-mono">
                  <thead className="bg-[#0B0F19] text-slate-400 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Time</th>
                      <th className="p-2 text-left">Operation</th>
                      <th className="p-2 text-left">Latency</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {diagnosticLogs.slice(0, 30).map((log) => (
                      <tr key={log.id}>
                        <td className="p-2 text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-2 text-cyan-400 truncate max-w-xs">
                          {log.operation}
                        </td>
                        <td className="p-2 text-emerald-400">
                          {log.executionTimeMs}ms
                        </td>
                        <td className="p-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${log.status === "SUCCESS" ? "bg-emerald-950 text-emerald-400" : "bg-rose-950 text-rose-400"}`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS — Fixed layout */}
        {activeTab === "settings" && (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center border border-blue-500/30">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-base font-bold text-white">
                Admin Password Security
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Your master password is securely hashed and stored in Cloudflare
                D1.
              </p>
              <button
                onClick={handleLockAdminSession}
                className="w-full py-2.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" /> Lock Session Now
              </button>
            </div>

            <div className="bg-[#111827] border border-amber-700/50 rounded-3xl p-5 space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-amber-400" />
                Flatten Legacy User Data
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                If admin panel shows blank teacher fields, run this once. It
                converts nested <code>teacherDetails</code> into flat top-level
                fields for all users.
              </p>
              <button
                type="button"
                onClick={async () => {
                  if (
                    !confirm(
                      "Migrate all users to flat structure? This is safe and idempotent.",
                    )
                  )
                    return;
                  const res = await cfD1.migrateUsers();
                  if (res.success) {
                    alert(
                      `✅ Migration complete.\nMigrated: ${res.migrated || 0}/${res.total || 0} users.\n\nRefreshing page to see updated data.`,
                    );
                    window.location.reload();
                  } else {
                    alert(
                      `❌ Migration failed: ${res.error || "Unknown error"}`,
                    );
                  }
                }}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Run Data Migration
              </button>
            </div>
          </div>
        )}
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

// ============ HELPER: ReviewCard ============
interface ReviewCardProps {
  review: FlatReview;
  showTutorName?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
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
          <div className="font-bold text-sm text-white">
            {review.studentName}
          </div>
          {showTutorName && (
            <div className="text-[11px] text-blue-400 mt-1">
              Reviewing:{" "}
              <span className="font-semibold">{review.tutorName}</span>
            </div>
          )}
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusColor}`}
        >
          {status}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div className="text-center">
          <div className="text-[9px] text-slate-500 font-mono uppercase">
            Punctuality
          </div>
          <div className="text-amber-400 font-bold">
            {review.punctuality.toFixed(1)}/5
          </div>
        </div>
        <div className="text-center">
          <div className="text-[9px] text-slate-500 font-mono uppercase">
            Mastery
          </div>
          <div className="text-cyan-400 font-bold">
            {review.subjectMastery.toFixed(1)}/5
          </div>
        </div>
        <div className="text-center">
          <div className="text-[9px] text-slate-500 font-mono uppercase">
            Style
          </div>
          <div className="text-indigo-400 font-bold">
            {review.teachingStyle.toFixed(1)}/5
          </div>
        </div>
      </div>
      <div className="p-2.5 bg-[#111827] rounded-xl text-[11px] text-slate-300 italic">
        "{review.comment}"
      </div>
      {status === "PENDING" && (onApprove || onReject) && (
        <div className="flex gap-2 pt-2 border-t border-slate-800/80">
          {onApprove && (
            <button
              onClick={onApprove}
              className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Approve
            </button>
          )}
          {onReject && (
            <button
              onClick={onReject}
              className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ============ HELPER: ExportCard ============
interface ExportCardProps {
  title: string;
  count: number;
  color: "blue" | "cyan" | "purple" | "amber";
  onExport: () => void;
}
const ExportCard: React.FC<ExportCardProps> = ({
  title,
  count,
  color,
  onExport,
}) => {
  const colorMap = {
    blue: "from-blue-600 to-blue-500",
    cyan: "from-cyan-600 to-cyan-500",
    purple: "from-purple-600 to-purple-500",
    amber: "from-amber-600 to-amber-500",
  };
  return (
    <div className="bg-[#111827] border border-blue-900/40 rounded-2xl p-4 flex flex-col justify-between">
      <div>
        <div className="text-xs text-slate-400 font-mono uppercase">
          {title}
        </div>
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

// ============ HELPER: InfoField ============
const InfoField: React.FC<{
  label: string;
  value?: string | number | null;
  span?: 1 | 2;
  mono?: boolean;
  danger?: boolean;
}> = ({ label, value, span, mono, danger }) => (
  <div
    className={`bg-[#111827] p-2.5 rounded-xl border border-slate-800 ${span === 2 ? "col-span-2" : ""}`}
  >
    <span className="text-[10px] text-slate-500 font-mono uppercase block mb-0.5">
      {label}
    </span>
    <span
      className={`text-xs font-semibold break-words ${danger ? "text-rose-400" : "text-white"} ${mono ? "font-mono" : ""}`}
    >
      {value ? (
        value
      ) : (
        <span className="text-slate-500 italic font-normal">Not provided</span>
      )}
    </span>
  </div>
);

// ============ HELPER: InspectorModal ============
interface InspectorModalProps {
  user: User;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}
const InspectorModal: React.FC<InspectorModalProps> = ({
  user,
  onClose,
  onApprove,
  onReject,
}) => {
  const approvedReviews = (user.reviews || []).filter(
    (r) => (r.status || "APPROVED") === "APPROVED",
  );
  const pendingReviews = (user.reviews || []).filter(
    (r) => r.status === "PENDING",
  );
  const isTutor = user.role === "TUTOR";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0B0F19] border border-blue-900/80 rounded-3xl p-5 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 border-b border-slate-800 pb-4">
          <GenderAvatar
            gender={user.gender || "MALE"}
            role={user.role}
            size="lg"
            profilePicture={user.profilePicture}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white truncate">
                {user.fullName}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60 font-mono">
                {user.role}
              </span>
              {isTutor && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${user.verificationStatus === "VERIFIED" ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60" : user.verificationStatus === "REJECTED" ? "bg-rose-950 text-rose-400 border border-rose-800/60" : "bg-amber-950 text-amber-400 border border-amber-800/60"}`}
                >
                  {user.verificationStatus || "PENDING"}
                </span>
              )}
            </div>
            {isTutor && (
              <p className="text-xs text-blue-400 mt-1">
                {user.institution || "—"} • {user.department || "—"}
              </p>
            )}
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" /> {user.areaName}, {user.district}
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <UserIcon className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase">
              Basic Information
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <InfoField label="Email" value={user.email} span={2} mono />
            <InfoField label="Phone" value={user.phone} mono />
            <InfoField
              label="WhatsApp"
              value={user.whatsapp || user.phone}
              mono
            />
            <InfoField label="Gender" value={user.gender} />
            <InfoField label="Role" value={user.role} />
            <InfoField label="User ID" value={user.id} span={2} mono />
          </div>
        </div>

        {/* Location */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase">Location</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <InfoField label="District" value={user.district} />
            <InfoField label="Area" value={user.areaName} />
            <InfoField
              label="Exact Address"
              value={user.exactAddress}
              span={2}
            />
            <InfoField
              label="Coordinates"
              value={
                user.latitude && user.longitude
                  ? `${user.latitude.toFixed(4)}, ${user.longitude.toFixed(4)}`
                  : undefined
              }
              span={2}
              mono
            />
          </div>
        </div>

        {isTutor && (
          <>
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase">
                  Verification Dossier
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <InfoField
                  label="NID / Birth Cert No."
                  value={user.nidNumber}
                  mono
                />
                <InfoField
                  label="Student ID Roll"
                  value={user.studentIdCardRoll}
                  mono
                />
                <InfoField
                  label="Student ID Reg"
                  value={user.studentIdCardReg}
                  mono
                />
                <InfoField label="Academic Year" value={user.academicYear} />
                <InfoField
                  label="Institution"
                  value={user.institution}
                  span={2}
                />
                <InfoField
                  label="Department"
                  value={user.department}
                  span={2}
                />
                <InfoField
                  label="Submitted At"
                  value={
                    user.verificationSubmittedAt
                      ? new Date(user.verificationSubmittedAt).toLocaleString()
                      : undefined
                  }
                  span={2}
                />
                {user.verificationRejectionReason && (
                  <InfoField
                    label="Rejection Reason"
                    value={user.verificationRejectionReason}
                    span={2}
                    danger
                  />
                )}
              </div>
            </div>

            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase">
                  Professional
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <InfoField
                  label="Qualifications"
                  value={user.qualifications}
                  span={2}
                />
                <InfoField
                  label="Experience"
                  value={
                    user.yearsOfExperience
                      ? `${user.yearsOfExperience} years`
                      : undefined
                  }
                />
                <InfoField
                  label="Expected Rate"
                  value={
                    user.hourlyOrMonthlyRate
                      ? `৳ ${user.hourlyOrMonthlyRate.toLocaleString()}/mo`
                      : undefined
                  }
                />
                <InfoField
                  label="Rating"
                  value={
                    user.totalReviews
                      ? `${(user.rating || 0).toFixed(1)} / 5`
                      : "0.0 / 5"
                  }
                />
                <InfoField
                  label="Total Reviews"
                  value={approvedReviews.length}
                />
              </div>
              <div className="mt-3">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1.5">
                  Subjects
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(user.subjectsTaught || []).length > 0 ? (
                    (user.subjectsTaught || []).map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 text-xs border border-blue-800/50"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">None</span>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1.5">
                  Grades
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(user.gradesTaught || []).length > 0 ? (
                    (user.gradesTaught || []).map((g, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-xs border border-cyan-800/50"
                      >
                        {g}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">None</span>
                  )}
                </div>
              </div>
            </div>

            {(user.bio || user.teachingPhilosophy) && (
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <UserIcon className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase">
                    Bio & Philosophy
                  </h3>
                </div>
                {user.bio && (
                  <div className="mb-3">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                      Bio
                    </span>
                    <p className="text-xs text-slate-300">{user.bio}</p>
                  </div>
                )}
                {user.teachingPhilosophy && (
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                      Philosophy
                    </span>
                    <p className="text-xs text-slate-300 italic">
                      "{user.teachingPhilosophy}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {(user.degrees || []).length > 0 && (
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase">
                    Degrees ({user.degrees!.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {user.degrees!.map((d, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-[#111827] rounded-xl border border-slate-800 text-xs"
                    >
                      <div className="font-semibold text-white">
                        {d.degreeName}
                      </div>
                      <div className="text-blue-400 text-[11px]">
                        {d.institution}
                      </div>
                      <div className="text-slate-400 text-[10px] mt-1">
                        Year: {d.passingYear}{" "}
                        {d.result ? `• Result: ${d.result}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(user.reviews || []).length > 0 && (
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase">
                    Reviews ({approvedReviews.length} approved
                    {pendingReviews.length > 0
                      ? `, ${pendingReviews.length} pending`
                      : ""}
                    )
                  </h3>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {(user.reviews || []).slice(0, 10).map((r) => (
                    <div
                      key={r.id}
                      className="p-2.5 bg-[#111827] rounded-xl border border-slate-800 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">
                          {r.studentName}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${r.status === "APPROVED" ? "bg-emerald-950 text-emerald-400" : r.status === "REJECTED" ? "bg-rose-950 text-rose-400" : "bg-amber-950 text-amber-400"}`}
                        >
                          {r.status || "APPROVED"}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1 italic">
                        "{r.comment}"
                      </p>
                      <div className="text-slate-500 text-[10px] mt-1">
                        ★ {(r.overall || 0).toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 sticky bottom-0 bg-[#0B0F19] pb-1">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Close
          </button>
          {isTutor && user.verificationStatus !== "VERIFIED" && (
            <>
              <button
                onClick={onReject}
                className="px-4 py-2.5 bg-rose-950/80 text-rose-300 rounded-xl text-xs font-semibold border border-rose-800/50"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Verify
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
