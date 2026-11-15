import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  AlertTriangle,
  Search,
  Eye,
  Building2,
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
  DollarSign,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Star,
  Calendar,
  Briefcase,
  User as UserIcon,
  Mail,
} from 'lucide-react';
import { User, TuitionPost, TuitionApplication, StudentReview } from '../lib/types';
import { GenderAvatar } from './GenderAvatar';
import { cfD1, CLOUDFLARE_D1_SCHEMA, D1DiagnosticLog } from '../lib/cloudflareD1';

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
  // ==========================================
  // AUTHENTICATION STATE
  // ==========================================
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem('porabo_admin_auth') === 'true'
  );

  const [enteredPasscode, setEnteredPasscode] = useState<string>('');
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  const [initialPassword, setInitialPassword] = useState<string>('');
  const [initialConfirmPassword, setInitialConfirmPassword] = useState<string>('');
  const [initialPasswordError, setInitialPasswordError] = useState<string | null>(null);
  const [recoveryCodeModal, setRecoveryCodeModal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [recoveryCodeInput, setRecoveryCodeInput] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  // ==========================================
  // TABS & UI STATE
  // ==========================================
  const [activeTab, setActiveTab] = useState<
    'urgent' | 'reviews' | 'teachers' | 'students' | 'posts' | 'export' | 'cloudflare' | 'settings'
  >('urgent');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);
  const [exportedDump, setExportedDump] = useState<string>('');

  const [diagnosticLogs, setDiagnosticLogs] = useState<D1DiagnosticLog[]>(() =>
    cfD1.getDiagnosticLogs()
  );

  const [rejectingTutorId, setRejectingTutorId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>(
    'National ID or institution credentials could not be verified.'
  );
  const [rejectingReview, setRejectingReview] = useState<{
    tutorId: string;
    reviewId: string;
  } | null>(null);
  const [reviewRejectReason, setReviewRejectReason] = useState<string>(
    'Review contains inappropriate language or does not meet community guidelines.'
  );
  const [inspectingUser, setInspectingUser] = useState<User | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'user' | 'post';
    id: string;
    name: string;
  } | null>(null);

  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>(
    'PENDING'
  );
  const [expandedTeachers, setExpandedTeachers] = useState<Set<string>>(new Set());

  useEffect(() => {
    cfD1.getAdminConfig().then(res => setHasPassword(res.hasPassword));
    const unsub = cfD1.subscribeToDiagnostics((newLog: D1DiagnosticLog) => {
      setDiagnosticLogs(prev => [newLog, ...prev.slice(0, 149)]);
    });
    return unsub;
  }, []);

  // ==========================================
  // DERIVED DATA (memoized)
  // ==========================================
  const tutors = useMemo(() => allUsers.filter(u => u.role === 'TUTOR'), [allUsers]);
  const students = useMemo(() => allUsers.filter(u => u.role === 'STUDENT'), [allUsers]);

  const pendingTutors = useMemo(
    () => tutors.filter(t => t.verificationStatus === 'PENDING' || !t.verificationStatus),
    [tutors]
  );
  const verifiedTutors = useMemo(() => tutors.filter(t => t.verificationStatus === 'VERIFIED'), [tutors]);

  const pendingPosts = useMemo(() => tuitionPosts.filter(p => p.approvalStatus === 'PENDING'), [tuitionPosts]);
  const approvedPosts = useMemo(
    () => tuitionPosts.filter(p => p.approvalStatus === 'APPROVED' || !p.approvalStatus),
    [tuitionPosts]
  );

  const allReviews: FlatReview[] = useMemo(() => {
    const flat: FlatReview[] = [];
    tutors.forEach(t => {
      (t.reviews || []).forEach(r => {
        flat.push({
          ...r,
          tutorId: t.id,
          tutorName: t.fullName,
          tutorDistrict: t.district,
          status: (r.status || 'APPROVED') as any,
        });
      });
    });
    return flat.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tutors]);

  const pendingReviews = allReviews.filter(r => r.status === 'PENDING');
  const approvedReviews = allReviews.filter(r => r.status === 'APPROVED');
  const rejectedReviews = allReviews.filter(r => r.status === 'REJECTED');

  // ==========================================
  // DATE RANGE + EXPORTS
  // ==========================================
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const isWithinDateRange = (dateStr?: string) => {
    if (!startDate && !endDate) return true;
    if (!dateStr) return false;
    const itemDate = new Date(dateStr);
    if (isNaN(itemDate.getTime())) return true;
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (itemDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (itemDate > end) return false;
    }
    return true;
  };

  const exportToExcelCSV = (
    filename: string,
    headers: string[],
    rows: (string | number | undefined | null)[][]
  ) => {
    const escapeCell = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    };
    const csvContent =
      '\uFEFF' +
      [headers.map(escapeCell).join(','), ...rows.map(row => row.map(escapeCell).join(','))].join(
        '\r\n'
      );
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportTeachers = () => {
    const headers = [
      'ID', 'Full Name', 'Email', 'Phone', 'WhatsApp', 'Gender', 'District', 'Area',
      'Institution', 'Department', 'Academic Year', 'Qualifications', 'NID', 'Roll', 'Reg',
      'Verification Status', 'Experience (Yrs)', 'Hourly Rate', 'Rating', 'Reviews',
      'Subjects Taught', 'Grades Taught', 'Submitted At'
    ];
    const rows = tutors.map(t => [
      t.id, t.fullName, t.email, t.phone, t.whatsapp || t.phone, t.gender || 'N/A',
      t.district, t.areaName, t.institution || 'N/A', t.department || 'N/A',
      t.academicYear || 'N/A', t.qualifications || 'N/A', t.nidNumber || 'N/A',
      t.studentIdCardRoll || 'N/A', t.studentIdCardReg || 'N/A',
      t.verificationStatus || 'PENDING', t.yearsOfExperience || 0, t.hourlyOrMonthlyRate || 0,
      t.rating || 0, t.totalReviews || 0,
      (t.subjectsTaught || []).join('; '), (t.gradesTaught || []).join('; '),
      t.verificationSubmittedAt || 'N/A'
    ]);
    exportToExcelCSV(`porabo_teachers_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleExportStudents = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'WhatsApp', 'Gender', 'District', 'Area', 'Exact Address', 'Posts Count'];
    const rows = students.map(s => {
      const postsCount = tuitionPosts.filter(p => p.studentId === s.id).length;
      return [s.id, s.fullName, s.email, s.phone, s.whatsapp || s.phone, s.gender || 'N/A', s.district, s.areaName, s.exactAddress || 'N/A', postsCount];
    });
    exportToExcelCSV(`porabo_students_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleExportAllUsers = () => {
    const headers = [
      'ID', 'Role', 'Full Name', 'Email', 'Phone', 'WhatsApp', 'Gender', 'District', 'Area',
      'Exact Address', 'Institution', 'Department', 'Academic Year', 'NID', 'Roll', 'Reg',
      'Verification Status', 'Rating', 'Total Reviews', 'Experience (Yrs)', 'Rate',
      'Subjects', 'Grades', 'Bio', 'Philosophy', 'Submitted At'
    ];
    const rows = allUsers.map(u => [
      u.id, u.role, u.fullName, u.email, u.phone, u.whatsapp || u.phone, u.gender || 'N/A',
      u.district, u.areaName, u.exactAddress || 'N/A', u.institution || 'N/A',
      u.department || 'N/A', u.academicYear || 'N/A', u.nidNumber || 'N/A',
      u.studentIdCardRoll || 'N/A', u.studentIdCardReg || 'N/A',
      u.verificationStatus || (u.role === 'STUDENT' ? 'VERIFIED' : 'PENDING'),
      u.rating || 0, u.totalReviews || 0, u.yearsOfExperience || 0, u.hourlyOrMonthlyRate || 0,
      (u.subjectsTaught || []).join('; '), (u.gradesTaught || []).join('; '),
      u.bio || '', u.teachingPhilosophy || '', u.verificationSubmittedAt || 'N/A'
    ]);
    exportToExcelCSV(`porabo_all_users_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleExportTuitionPosts = () => {
    const headers = [
      'Post ID', 'Title', 'Student Name', 'Student ID', 'District', 'Area', 'Subject',
      'Grade Level', 'Curriculum', 'Monthly Budget', 'Days/Week', 'Tuition Mode',
      'Approval Status', 'Match Status', 'Created At'
    ];
    const rows = tuitionPosts.filter(p => isWithinDateRange(p.createdAt)).map(p => [
      p.id, p.title, p.studentName, p.studentId, p.district, p.areaName, p.subject,
      p.gradeLevel, p.curriculum || 'N/A', p.salaryBudget, p.daysPerWeek || 3,
      p.tuitionMode || 'N/A', p.approvalStatus || 'APPROVED', p.status || 'OPEN',
      p.createdAt ? new Date(p.createdAt).toISOString() : 'N/A'
    ]);
    exportToExcelCSV(`porabo_tuition_posts_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleExportReviews = () => {
    const headers = ['ID', 'Tutor', 'Student', 'Student Role', 'Punctuality', 'Mastery', 'Style', 'Overall', 'Comment', 'Status', 'Submitted'];
    const rows = allReviews.map(r => [
      r.id, r.tutorName, r.studentName, r.studentRoleOrGrade, r.punctuality, r.subjectMastery,
      r.teachingStyle, r.overall, r.comment, r.status, r.createdAt ? new Date(r.createdAt).toISOString() : 'N/A'
    ]);
    exportToExcelCSV(`porabo_reviews_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleExportAllData = () => {
    handleExportAllUsers();
    setTimeout(() => handleExportTuitionPosts(), 400);
    setTimeout(() => handleExportReviews(), 800);
  };

  // ==========================================
  // SEARCH FILTERS
  // ==========================================
  const filteredTutors = tutors.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.areaName.toLowerCase().includes(q) ||
      u.district.toLowerCase().includes(q) ||
      (u.institution && u.institution.toLowerCase().includes(q))
    );
  });

  const filteredStudents = students.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.areaName.toLowerCase().includes(q) ||
      u.district.toLowerCase().includes(q) ||
      u.phone.includes(q)
    );
  });

  const filteredPosts = tuitionPosts.filter(p => {
    if (!isWithinDateRange(p.createdAt)) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.subject.toLowerCase().includes(q) ||
      p.studentName.toLowerCase().includes(q) ||
      p.areaName.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q)
    );
  });

  const filteredReviews = reviewFilter === 'ALL' ? allReviews : allReviews.filter(r => r.status === reviewFilter);

  // ==========================================
  // AUTH HANDLERS
  // ==========================================
  const handleInitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setInitialPasswordError(null);
    if (!initialPassword || initialPassword.length < 6) {
      setInitialPasswordError('Admin password must be at least 6 characters.');
      return;
    }
    if (initialPassword !== initialConfirmPassword) {
      setInitialPasswordError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    const res = await cfD1.initAdminPassword(initialPassword);
    setIsSubmitting(false);
    if (res.success && res.recoveryCode) setRecoveryCodeModal(res.recoveryCode);
    else setInitialPasswordError(res.error || 'Failed to initialize password.');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);
    setIsSubmitting(true);
    const res = await cfD1.verifyAdminPassword(enteredPasscode);
    setIsSubmitting(false);
    if (res.success) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('porabo_admin_auth', 'true');
    } else setPasscodeError(res.error || 'Invalid password.');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (!newPassword || newPassword.length < 6) {
      setResetError('New password must be at least 6 characters.');
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
        setRecoveryCodeInput('');
        setNewPassword('');
        setEnteredPasscode('');
        setPasscodeError(null);
      }, 2500);
    } else setResetError(res.error || 'Invalid recovery code or reset failed.');
  };

  const handleLockAdminSession = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('porabo_admin_auth');
    sessionStorage.removeItem('porabo_admin_token');
    setEnteredPasscode('');
    setPasscodeError(null);
  };

  // ==========================================
  // OTHER HANDLERS
  // ==========================================
  const handleConfirmRejectTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingTutorId) return;
    onRejectTutor(rejectingTutorId, rejectionReason);
    setRejectingTutorId(null);
  };

  const handleConfirmRejectReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReview) return;
    onRejectReview(rejectingReview.tutorId, rejectingReview.reviewId, reviewRejectReason);
    setRejectingReview(null);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'user') onDeleteUser(itemToDelete.id);
    else onDeletePost(itemToDelete.id);
    setItemToDelete(null);
  };

  const toggleTeacherExpand = (teacherId: string) => {
    setExpandedTeachers(prev => {
      const next = new Set(prev);
      if (next.has(teacherId)) next.delete(teacherId);
      else next.add(teacherId);
      return next;
    });
  };

  // ==========================================
  // RENDER: LOADING
  // ==========================================
  if (hasPassword === null) {
    return (
      <div className="min-h-screen bg-[#070A12] flex flex-col items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="font-mono text-sm">Connecting to secure admin gateway...</p>
      </div>
    );
  }

  // ==========================================
  // RENDER: AUTH GATE
  // ==========================================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070A12] text-slate-100 flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
        <div className="w-full max-w-md bg-[#0B0F19] border border-blue-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/40 text-blue-400 mx-auto flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60">
                {hasPassword ? 'Authorized Personnel Only' : 'Initial Security Setup'}
              </span>
              <h1 className="text-2xl font-black text-white mt-2">
                {!hasPassword ? 'Initialize Admin Password' : 'Porabo Admin Console'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {!hasPassword
                  ? 'Create a master password. This will be required to access the admin panel on ALL devices.'
                  : 'Enter your master password to access system moderation.'}
              </p>
            </div>
          </div>

          {isForgotPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {resetSuccess ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-emerald-300">Password Reset Successful!</p>
                </div>
              ) : (
                <>
                  <div className="text-xs text-slate-400 mb-2">
                    Enter your 8-character Recovery Code and set a new password.
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Recovery Code</label>
                    <input
                      type="text"
                      value={recoveryCodeInput}
                      onChange={e => setRecoveryCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. A1B2C3D4"
                      required
                      className="w-full bg-[#111827] border border-blue-950 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono tracking-widest text-center uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">New Password</label>
                    <input
                      type={showPasscode ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="New master password"
                      required
                      className="w-full bg-[#111827] border border-blue-950 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  {resetError && (
                    <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{resetError}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-sm font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : !hasPassword ? (
            <form onSubmit={handleInitPassword} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Master Password</label>
                <div className="relative">
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    value={initialPassword}
                    onChange={e => setInitialPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    autoFocus
                    className="w-full bg-[#111827] border border-blue-950 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-mono"
                  >
                    {showPasscode ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Confirm Password</label>
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={initialConfirmPassword}
                  onChange={e => setInitialConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full bg-[#111827] border border-blue-950 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              {initialPasswordError && (
                <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{initialPasswordError}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                {isSubmitting ? 'Saving...' : 'Save Password & Enter'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Master Password</label>
                <div className="relative">
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    value={enteredPasscode}
                    onChange={e => setEnteredPasscode(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoFocus
                    className="w-full bg-[#111827] border border-blue-950 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-mono"
                  >
                    {showPasscode ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              {passcodeError && (
                <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{passcodeError}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {isSubmitting ? 'Verifying...' : 'Log In'}
              </button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-slate-800/80 text-center">
            <button
              onClick={onExitAdmin}
              className="text-slate-400 hover:text-white text-xs flex items-center gap-1 mx-auto transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Porabo App
            </button>
          </div>
        </div>

        {recoveryCodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#111827] border border-emerald-500/50 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <KeyRound className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Save Your Recovery Code</h2>
                <p className="text-xs text-slate-400 mt-1">
                  If you forget your password, this code is the <strong className="text-white">ONLY</strong> way to reset it.
                </p>
              </div>
              <div className="text-3xl font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 py-4 rounded-xl tracking-widest select-all">
                {recoveryCodeModal}
              </div>
              <button
                onClick={() => {
                  setRecoveryCodeModal(null);
                  setIsAdminAuthenticated(true);
                  sessionStorage.setItem('porabo_admin_auth', 'true');
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm mt-4 transition-colors shadow-lg shadow-emerald-600/30"
              >
                I have saved it. Enter Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER: MAIN CONSOLE
  // ==========================================
  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white pb-16">
      <header className="sticky top-0 z-40 border-b border-blue-900/50 bg-[#0B0F19]/95 backdrop-blur-md px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
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
              type="button"
              onClick={handleExportAllData}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export All</span>
            </button>
            <button
              type="button"
              onClick={handleLockAdminSession}
              className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock</span>
            </button>
            <button
              type="button"
              onClick={onExitAdmin}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-6 lg:p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-4">
          <div
            onClick={() => setActiveTab('urgent')}
            className={`p-3.5 rounded-3xl border cursor-pointer transition-all shadow-lg ${
              activeTab === 'urgent' ? 'bg-amber-950/30 border-amber-500/60 ring-2 ring-amber-500/30' : 'bg-[#111827] border-blue-950/70'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>QUEUE</span>
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <span className="text-xl font-black text-amber-400">
              {pendingTutors.length + pendingPosts.length + pendingReviews.length}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {pendingTutors.length}T • {pendingPosts.length}P • {pendingReviews.length}R
            </span>
          </div>

          <div
            onClick={() => setActiveTab('reviews')}
            className={`p-3.5 rounded-3xl border cursor-pointer transition-all shadow-lg ${
              activeTab === 'reviews' ? 'bg-purple-950/30 border-purple-500/60 ring-2 ring-purple-500/30' : 'bg-[#111827] border-blue-950/70'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>REVIEWS</span>
              <MessageSquare className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-xl font-black text-purple-400">{allReviews.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{pendingReviews.length} pending</span>
          </div>

          <div
            onClick={() => setActiveTab('teachers')}
            className={`p-3.5 rounded-3xl border cursor-pointer transition-all shadow-lg ${
              activeTab === 'teachers' ? 'bg-blue-950/30 border-blue-500/60 ring-2 ring-blue-500/30' : 'bg-[#111827] border-blue-950/70'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>TEACHERS</span>
              <GraduationCap className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-xl font-black text-white">{tutors.length}</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">{verifiedTutors.length} verified</span>
          </div>

          <div
            onClick={() => setActiveTab('students')}
            className={`p-3.5 rounded-3xl border cursor-pointer transition-all shadow-lg ${
              activeTab === 'students' ? 'bg-cyan-950/30 border-cyan-500/60 ring-2 ring-cyan-500/30' : 'bg-[#111827] border-blue-950/70'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>STUDENTS</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-xl font-black text-cyan-400">{students.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">guardians</span>
          </div>

          <div
            onClick={() => setActiveTab('posts')}
            className={`p-3.5 rounded-3xl border cursor-pointer transition-all shadow-lg ${
              activeTab === 'posts' ? 'bg-emerald-950/30 border-emerald-500/60 ring-2 ring-emerald-500/30' : 'bg-[#111827] border-blue-950/70'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>POSTS</span>
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xl font-black text-white">{tuitionPosts.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{approvedPosts.length} live</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#111827] border border-blue-900/40 rounded-2xl p-1.5 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 min-w-max">
            {[
              { id: 'urgent', label: '🔴 Queue', badge: pendingTutors.length + pendingPosts.length + pendingReviews.length },
              { id: 'reviews', label: 'Reviews', icon: MessageSquare, badge: pendingReviews.length },
              { id: 'teachers', label: 'Teachers', icon: GraduationCap },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'posts', label: 'Posts', icon: BookOpen },
              { id: 'export', label: 'Export', icon: Download },
              { id: 'cloudflare', label: 'D1/KV', icon: Database },
              { id: 'settings', label: 'Settings', icon: KeyRound },
            ].map(tab => {
              const Icon = (tab as any).icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
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

        {['teachers', 'students', 'posts', 'reviews'].includes(activeTab) && (
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, district, area..."
              className="w-full bg-[#111827] border border-blue-950/70 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* QUEUE */}
        {activeTab === 'urgent' && (
          <div className="space-y-6">
            <div className="bg-[#111827] border border-purple-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                  {pendingReviews.length}
                </div>
                <h2 className="text-sm font-bold text-white">Pending Review Approvals</h2>
              </div>
              {pendingReviews.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs text-slate-400">No pending approvals.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReviews.map(review => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onApprove={() => onApproveReview(review.tutorId, review.id)}
                      onReject={() => setRejectingReview({ tutorId: review.tutorId, reviewId: review.id })}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#111827] border border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                  {pendingTutors.length}
                </div>
                <h2 className="text-sm font-bold text-white">Pending Teacher Verifications</h2>
              </div>
              {pendingTutors.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs text-slate-400">No pending dossiers.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingTutors.map(tutor => (
                    <div key={tutor.id} className="bg-[#0B0F19] border border-amber-500/30 rounded-2xl p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <GenderAvatar gender={tutor.gender || 'MALE'} role="TUTOR" size="md" profilePicture={tutor.profilePicture} />
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-sm">{tutor.fullName}</h3>
                          <p className="text-xs text-blue-400">{tutor.institution || '—'}</p>
                          <p className="text-[11px] text-slate-400">{tutor.areaName}, {tutor.district}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#111827] p-2.5 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-slate-500 block text-[9px] font-mono">NID:</span>
                          <span className="text-white font-mono">{tutor.nidNumber || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] font-mono">ROLL/REG:</span>
                          <span className="text-cyan-400 font-mono text-[10px]">
                            {tutor.studentIdCardRoll || '—'}/{tutor.studentIdCardReg || '—'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setInspectingUser(tutor)}
                          className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" /> Full A-Z Info
                        </button>
                        <button
                          onClick={() => onApproveTutor(tutor.id)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => setRejectingTutorId(tutor.id)}
                          className="p-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 rounded-xl border border-rose-800/50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#111827] border border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                  {pendingPosts.length}
                </div>
                <h2 className="text-sm font-bold text-white">Pending Tuition Posts</h2>
              </div>
              {pendingPosts.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs text-slate-400">No pending posts.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingPosts.map(post => (
                    <div key={post.id} className="bg-[#0B0F19] border border-cyan-500/30 rounded-2xl p-4 space-y-3">
                      <h3 className="font-bold text-white text-sm">{post.title}</h3>
                      <p className="text-xs text-cyan-400">{post.subject} • {post.gradeLevel}</p>
                      <div className="text-xs text-slate-300 space-y-0.5">
                        <div>Guardian: {post.studentName}</div>
                        <div className="text-emerald-400 font-bold">৳ {post.salaryBudget.toLocaleString()}/mo</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onApprovePost(post.id)}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setItemToDelete({ type: 'post', id: post.id, name: post.title })}
                          className="py-2 px-3 bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 rounded-xl border border-rose-800/50"
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
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>Reviews ({allReviews.length})</span>
              </h2>
              <button onClick={handleExportReviews} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'PENDING', label: `Pending (${pendingReviews.length})` },
                { id: 'APPROVED', label: `Approved (${approvedReviews.length})` },
                { id: 'REJECTED', label: `Rejected (${rejectedReviews.length})` },
                { id: 'ALL', label: `All (${allReviews.length})` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setReviewFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    reviewFilter === f.id ? 'bg-purple-600 text-white' : 'bg-[#111827] text-slate-400 border border-blue-950/70'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {filteredReviews.length === 0 ? (
              <div className="p-12 text-center bg-[#111827] border border-blue-900/30 rounded-3xl">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-white">No reviews</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReviews.map(review => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    showTutorName
                    onApprove={review.status === 'PENDING' ? () => onApproveReview(review.tutorId, review.id) : undefined}
                    onReject={review.status === 'PENDING' ? () => setRejectingReview({ tutorId: review.tutorId, reviewId: review.id }) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TEACHERS */}
        {activeTab === 'teachers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <span>Teachers ({filteredTutors.length})</span>
              </h2>
              <button onClick={handleExportTeachers} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
            {filteredTutors.length === 0 ? (
              <div className="p-12 text-center bg-[#111827] border border-blue-900/30 rounded-3xl">
                <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-white">No teachers</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredTutors.map(tutor => {
                  const tutorReviews = (tutor.reviews || []).filter(r => (r.status || 'APPROVED') === 'APPROVED');
                  const acceptedApps = applications.filter(a => a.tutorId === tutor.id && a.status === 'ACCEPTED');
                  const totalEarnings = acceptedApps.reduce((sum, a) => sum + (a.proposedSalary || 0), 0);
                  const isExpanded = expandedTeachers.has(tutor.id);
                  const isVerified = tutor.verificationStatus === 'VERIFIED';

                  return (
                    <div key={tutor.id} className="bg-[#111827] border border-blue-900/40 rounded-3xl p-4 sm:p-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <GenderAvatar gender={tutor.gender || 'MALE'} role="TUTOR" size="md" profilePicture={tutor.profilePicture} />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-white text-base">{tutor.fullName}</h3>
                            {isVerified ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                                <CheckCircle className="w-2.5 h-2.5" /> Verified
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                {tutor.verificationStatus || 'PENDING'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-blue-400">{tutor.institution || '—'} • {tutor.department || '—'}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {tutor.areaName}, {tutor.district}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="bg-[#0B0F19] p-2.5 rounded-2xl border border-blue-950/70 text-center">
                          <div className="text-[10px] text-slate-400 font-mono uppercase mb-0.5">Students</div>
                          <div className="text-base font-bold text-white">{acceptedApps.length}</div>
                        </div>
                        <div className="bg-[#0B0F19] p-2.5 rounded-2xl border border-blue-950/70 text-center">
                          <div className="text-[10px] text-slate-400 font-mono uppercase mb-0.5">Rating</div>
                          <div className="text-base font-bold text-amber-400">
                            {tutorReviews.length > 0 ? (tutor.rating || 0).toFixed(1) : '0.0'}
                          </div>
                        </div>
                        <div className="bg-[#0B0F19] p-2.5 rounded-2xl border border-blue-950/70 text-center">
                          <div className="text-[10px] text-slate-400 font-mono uppercase mb-0.5">Reviews</div>
                          <div className="text-base font-bold text-emerald-400">{tutorReviews.length}</div>
                        </div>
                        <div className="bg-[#0B0F19] p-2.5 rounded-2xl border border-blue-950/70 text-center">
                          <div className="text-[10px] text-slate-400 font-mono uppercase mb-0.5">Earnings</div>
                          <div className="text-base font-bold text-cyan-400">
                            ৳{totalEarnings >= 1000 ? `${(totalEarnings / 1000).toFixed(1)}K` : totalEarnings}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setInspectingUser(tutor)}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Full A-Z Info
                      </button>

                      {isExpanded && (
                        <div className="space-y-2 pt-2 border-t border-slate-800/80">
                          <h4 className="text-xs font-bold text-cyan-400">Reviews ({tutorReviews.length})</h4>
                          {(tutor.reviews || []).slice(0, 3).map(rev => (
                            <div key={rev.id} className="p-2.5 bg-[#0B0F19] rounded-xl border border-slate-800 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-white">{rev.studentName}</span>
                                <span className="text-amber-400">★ {rev.overall?.toFixed(1) || '0.0'}</span>
                              </div>
                              <p className="text-slate-400 mt-1 italic line-clamp-2">"{rev.comment}"</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => setInspectingUser(tutor)}
                          className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" /> Full Dossier
                        </button>
                        {!isVerified && (
                          <button
                            onClick={() => onApproveTutor(tutor.id)}
                            className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Verify
                          </button>
                        )}
                        <button
                          onClick={() => setItemToDelete({ type: 'user', id: tutor.id, name: tutor.fullName })}
                          className="p-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 rounded-xl border border-rose-800/50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STUDENTS */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Students ({filteredStudents.length})</span>
              </h2>
              <button onClick={handleExportStudents} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredStudents.map(student => {
                const postsCount = tuitionPosts.filter(p => p.studentId === student.id).length;
                return (
                  <div key={student.id} className="bg-[#111827] border border-blue-900/40 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <GenderAvatar gender={student.gender || 'FEMALE'} role="STUDENT" size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm truncate">{student.fullName}</div>
                        <div className="text-[11px] text-slate-400 truncate">{student.email}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                        {postsCount} posts
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-emerald-400" /> {student.phone}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {student.areaName}, {student.district}
                    </div>
                    <button
                      onClick={() => setInspectingUser(student)}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-blue-400" /> View Full Info
                    </button>
                    <button
                      onClick={() => setItemToDelete({ type: 'user', id: student.id, name: student.fullName })}
                      className="w-full py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 rounded-lg text-[11px] font-semibold border border-rose-800/50 flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* POSTS */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>Posts ({filteredPosts.length})</span>
              </h2>
              <button onClick={handleExportTuitionPosts} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPosts.map(post => (
                <div key={post.id} className="bg-[#111827] border border-blue-900/40 rounded-2xl p-4 space-y-2">
                  <h3 className="font-bold text-white text-sm">{post.title}</h3>
                  <p className="text-xs text-blue-400">{post.subject} • {post.gradeLevel}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{post.studentName}</span>
                    <span className="font-bold text-emerald-400">৳ {post.salaryBudget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin className="w-3 h-3" /> {post.areaName}, {post.district}
                  </div>
                  <div className="flex gap-2">
                    {post.approvalStatus === 'PENDING' ? (
                      <button onClick={() => onApprovePost(post.id)} className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold">
                        Approve
                      </button>
                    ) : (
                      <span className="flex-1 py-1.5 bg-emerald-950/60 text-emerald-400 rounded-lg text-xs font-semibold text-center border border-emerald-800/60">
                        Approved
                      </span>
                    )}
                    <button
                      onClick={() => setItemToDelete({ type: 'post', id: post.id, name: post.title })}
                      className="p-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 rounded-lg border border-rose-800/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-950/40 to-teal-950/20 border border-emerald-500/40 rounded-3xl p-5">
              <h2 className="text-lg font-bold text-white mb-1">Export Data</h2>
              <p className="text-xs text-slate-300 mb-3">Download any dataset as Excel-compatible CSV</p>
              <button onClick={handleExportAllData} className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-2xl text-sm shadow-lg">
                Download Full Archive
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <ExportCard title="Teachers" count={tutors.length} color="blue" onExport={handleExportTeachers} />
              <ExportCard title="Students" count={students.length} color="cyan" onExport={handleExportStudents} />
              <ExportCard title="Posts" count={tuitionPosts.length} color="purple" onExport={handleExportTuitionPosts} />
              <ExportCard title="Reviews" count={allReviews.length} color="amber" onExport={handleExportReviews} />
            </div>
          </div>
        )}

        {/* CLOUDFLARE */}
        {activeTab === 'cloudflare' && (
          <div className="space-y-4">
            <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5">
              <h3 className="text-sm font-bold text-white mb-2">SQL Schema</h3>
              <pre className="bg-[#070A12] p-3 rounded-xl text-[10px] font-mono text-slate-300 overflow-auto max-h-96">
                {CLOUDFLARE_D1_SCHEMA}
              </pre>
            </div>
            <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Query Log ({diagnosticLogs.length})
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
                    {diagnosticLogs.slice(0, 30).map(log => (
                      <tr key={log.id}>
                        <td className="p-2 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="p-2 text-cyan-400 truncate max-w-xs">{log.operation}</td>
                        <td className="p-2 text-emerald-400">{log.executionTimeMs}ms</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${log.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
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

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-lg mx-auto">
            <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center border border-blue-500/30 mb-2">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-base font-bold text-white">Admin Password Security</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Your master password is securely hashed and stored in Cloudflare D1.
              </p>
              <button
                onClick={handleLockAdminSession}
                className="w-full py-2.5 mt-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" /> Lock Session Now
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      {rejectingTutorId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111827] border border-rose-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg text-white">Reject Teacher Verification</h3>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="w-full bg-[#0B0F19] border border-rose-500/30 rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setRejectingTutorId(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handleConfirmRejectTutor} className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111827] border border-rose-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg text-white">Reject Review</h3>
            <textarea
              rows={3}
              value={reviewRejectReason}
              onChange={e => setReviewRejectReason(e.target.value)}
              className="w-full bg-[#0B0F19] border border-rose-500/30 rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setRejectingReview(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handleConfirmRejectReview} className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold">
                Reject Review
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
          <div className="w-full max-w-sm bg-[#111827] border border-rose-500/50 rounded-3xl p-6 space-y-4 text-center shadow-2xl">
            <Trash2 className="w-12 h-12 text-rose-400 mx-auto" />
            <h3 className="font-bold text-lg text-white">Permanently Delete?</h3>
            <p className="text-xs text-slate-400">
              "<strong className="text-white">{itemToDelete.name}</strong>" will be purged. Cannot undo.
            </p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================================
// HELPER: ReviewCard
// ==========================================================
interface ReviewCardProps {
  review: FlatReview;
  showTutorName?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, showTutorName = false, onApprove, onReject }) => {
  const status = review.status || 'APPROVED';
  const statusColor =
    status === 'APPROVED'
      ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
      : status === 'REJECTED'
      ? 'bg-rose-950 text-rose-400 border-rose-800/60'
      : 'bg-amber-950 text-amber-400 border-amber-800/60';

  return (
    <div className="bg-[#0B0F19] border border-blue-950/70 rounded-2xl p-4 space-y-2.5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="font-bold text-sm text-white">{review.studentName}</div>
          <div className="text-[11px] text-slate-400">{review.studentRoleOrGrade}</div>
          {showTutorName && (
            <div className="text-[11px] text-blue-400 mt-1">
              Reviewing: <span className="font-semibold">{review.tutorName}</span>
            </div>
          )}
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusColor}`}>{status}</span>
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
      <div className="p-2.5 bg-[#111827] rounded-xl text-[11px] text-slate-300 italic">"{review.comment}"</div>
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>Submitted {new Date(review.createdAt).toLocaleDateString()}</span>
      </div>
      {status === 'PENDING' && (onApprove || onReject) && (
        <div className="flex gap-2 pt-2 border-t border-slate-800/80">
          {onApprove && (
            <button onClick={onApprove} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Approve & Publish
            </button>
          )}
          {onReject && (
            <button onClick={onReject} className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
              <X className="w-3.5 h-3.5" /> Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================================
// HELPER: ExportCard
// ==========================================================
interface ExportCardProps {
  title: string;
  count: number;
  color: 'blue' | 'cyan' | 'purple' | 'amber';
  onExport: () => void;
}

const ExportCard: React.FC<ExportCardProps> = ({ title, count, color, onExport }) => {
  const colorMap = {
    blue: 'from-blue-600 to-blue-500',
    cyan: 'from-cyan-600 to-cyan-500',
    purple: 'from-purple-600 to-purple-500',
    amber: 'from-amber-600 to-amber-500',
  };
  return (
    <div className="bg-[#111827] border border-blue-900/40 rounded-2xl p-4 flex flex-col justify-between">
      <div>
        <div className="text-xs text-slate-400 font-mono uppercase">{title}</div>
        <div className="text-2xl font-black text-white mt-1">{count}</div>
      </div>
      <button onClick={onExport} className={`mt-3 w-full py-2 bg-gradient-to-r ${colorMap[color]} text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5`}>
        <Download className="w-3.5 h-3.5" /> Export CSV
      </button>
    </div>
  );
};

// ==========================================================
// HELPER: Section (for InspectorModal)
// ==========================================================
const InfoSection: React.FC<{
  title: string;
  icon: React.FC<{ className?: string }>;
  children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
  <div className="border-b border-slate-800 pb-4">
    <div className="flex items-center gap-1.5 mb-2.5">
      <Icon className="w-4 h-4 text-cyan-400" />
      <h3 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h3>
    </div>
    {children}
  </div>
);

const InfoField: React.FC<{
  label: string;
  value?: string | number | null;
  span?: 1 | 2;
  mono?: boolean;
  danger?: boolean;
}> = ({ label, value, span, mono, danger }) => (
  <div className={`bg-[#111827] p-2.5 rounded-xl border border-slate-800 ${span === 2 ? 'col-span-2' : ''}`}>
    <span className="text-[10px] text-slate-500 font-mono uppercase block mb-0.5">{label}</span>
    <span className={`text-xs font-semibold break-words ${danger ? 'text-rose-400' : 'text-white'} ${mono ? 'font-mono' : ''}`}>
      {value ? value : <span className="text-slate-500 italic font-normal">Not provided</span>}
    </span>
  </div>
);

// ==========================================================
// EXPANDED InspectorModal — A-Z View
// ==========================================================
interface InspectorModalProps {
  user: User;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

const InspectorModal: React.FC<InspectorModalProps> = ({ user, onClose, onApprove, onReject }) => {
  const approvedReviews = (user.reviews || []).filter(r => (r.status || 'APPROVED') === 'APPROVED');
  const pendingReviews = (user.reviews || []).filter(r => r.status === 'PENDING');
  const isTutor = user.role === 'TUTOR';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0B0F19] border border-blue-900/80 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 border-b border-slate-800 pb-4">
          <GenderAvatar gender={user.gender || 'MALE'} role={user.role} size="lg" profilePicture={user.profilePicture} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white truncate">{user.fullName}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60 font-mono">
                {user.role}
              </span>
              {isTutor && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    user.verificationStatus === 'VERIFIED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                      : user.verificationStatus === 'REJECTED'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                      : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                  }`}
                >
                  {user.verificationStatus || 'PENDING'}
                </span>
              )}
            </div>
            {isTutor && (
              <p className="text-xs text-blue-400 mt-1">
                {user.institution || '—'} • {user.department || '—'}
              </p>
            )}
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" /> {user.areaName}, {user.district}
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <InfoSection title="Basic Information" icon={UserIcon}>
          <div className="grid grid-cols-2 gap-2">
            <InfoField label="Email" value={user.email} span={2} mono />
            <InfoField label="Phone" value={user.phone} mono />
            <InfoField label="WhatsApp" value={user.whatsapp || user.phone} mono />
            <InfoField label="Gender" value={user.gender} />
            <InfoField label="Role" value={user.role} />
            <InfoField label="User ID" value={user.id} span={2} mono />
          </div>
        </InfoSection>

        {/* Location */}
        <InfoSection title="Location" icon={MapPin}>
          <div className="grid grid-cols-2 gap-2">
            <InfoField label="District" value={user.district} />
            <InfoField label="Area" value={user.areaName} />
            <InfoField label="Exact Address" value={user.exactAddress} span={2} />
            <InfoField
              label="Coordinates"
              value={user.latitude && user.longitude ? `${user.latitude.toFixed(4)}, ${user.longitude.toFixed(4)}` : undefined}
              span={2}
              mono
            />
          </div>
        </InfoSection>

        {/* Verification (Tutor only) */}
        {isTutor && (
          <InfoSection title="Verification Dossier" icon={ShieldCheck}>
            <div className="grid grid-cols-2 gap-2">
              <InfoField label="NID / Birth Cert No." value={user.nidNumber} mono />
              <InfoField label="Student ID Roll" value={user.studentIdCardRoll} mono />
              <InfoField label="Student ID Reg" value={user.studentIdCardReg} mono />
              <InfoField label="Academic Year" value={user.academicYear} />
              <InfoField label="Institution" value={user.institution} span={2} />
              <InfoField label="Department" value={user.department} span={2} />
              <InfoField
                label="Submitted At"
                value={user.verificationSubmittedAt ? new Date(user.verificationSubmittedAt).toLocaleString() : undefined}
                span={2}
              />
              {user.verificationRejectionReason && (
                <InfoField label="Rejection Reason" value={user.verificationRejectionReason} span={2} danger />
              )}
            </div>
          </InfoSection>
        )}

        {/* Professional (Tutor only) */}
        {isTutor && (
          <InfoSection title="Professional Details" icon={Briefcase}>
            <div className="grid grid-cols-2 gap-2">
              <InfoField label="Qualifications" value={user.qualifications} span={2} />
              <InfoField label="Experience" value={user.yearsOfExperience ? `${user.yearsOfExperience} years` : undefined} />
              <InfoField
                label="Expected Rate"
                value={user.hourlyOrMonthlyRate ? `৳ ${user.hourlyOrMonthlyRate.toLocaleString()}/mo` : undefined}
              />
              <InfoField
                label="Rating"
                value={user.totalReviews ? `${(user.rating || 0).toFixed(1)} / 5` : '0.0 / 5'}
              />
              <InfoField label="Total Approved Reviews" value={approvedReviews.length} />
            </div>

            {/* Subjects */}
            <div className="mt-3">
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1.5">Subjects Taught</span>
              <div className="flex flex-wrap gap-1.5">
                {(user.subjectsTaught || []).length > 0 ? (
                  (user.subjectsTaught || []).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 text-xs border border-blue-800/50">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">None specified</span>
                )}
              </div>
            </div>

            {/* Grades */}
            <div className="mt-3">
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1.5">Grades Taught</span>
              <div className="flex flex-wrap gap-1.5">
                {(user.gradesTaught || []).length > 0 ? (
                  (user.gradesTaught || []).map((g, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-xs border border-cyan-800/50">
                      {g}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">None specified</span>
                )}
              </div>
            </div>
          </InfoSection>
        )}

        {/* Bio & Philosophy */}
        {isTutor && (user.bio || user.teachingPhilosophy) && (
          <InfoSection title="Bio & Teaching Philosophy" icon={UserIcon}>
            {user.bio && (
              <div className="mb-3">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Bio</span>
                <p className="text-xs text-slate-300 leading-relaxed">{user.bio}</p>
              </div>
            )}
            {user.teachingPhilosophy && (
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Teaching Philosophy</span>
                <p className="text-xs text-slate-300 leading-relaxed italic">"{user.teachingPhilosophy}"</p>
              </div>
            )}
          </InfoSection>
        )}

        {/* Degrees */}
        {isTutor && (user.degrees || []).length > 0 && (
          <InfoSection title={`Degrees (${user.degrees!.length})`} icon={GraduationCap}>
            <div className="space-y-2">
              {user.degrees!.map((deg, i) => (
                <div key={i} className="p-2.5 bg-[#111827] rounded-xl border border-slate-800 text-xs">
                  <div className="font-semibold text-white">{deg.degreeName}</div>
                  <div className="text-blue-400 text-[11px] mt-0.5">{deg.institution}</div>
                  <div className="text-slate-400 mt-1">
                    Year: {deg.passingYear} {deg.result ? `• Result: ${deg.result}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </InfoSection>
        )}

        {/* Teaching History */}
        {isTutor && (user.teachingHistory || []).length > 0 && (
          <InfoSection title="Teaching History" icon={Calendar}>
            <div className="space-y-2">
              {user.teachingHistory!.map((h, i) => (
                <div key={i} className="p-2.5 bg-[#111827] rounded-xl border border-slate-800 text-xs">
                  <div className="font-semibold text-white">{h.title}</div>
                  <div className="text-blue-400 text-[11px] mt-0.5">{h.year} • {h.organizationOrArea}</div>
                  <p className="text-slate-400 mt-1">{h.highlight}</p>
                  <div className="text-slate-500 text-[11px] mt-1">Students: {h.studentsCount}</div>
                </div>
              ))}
            </div>
          </InfoSection>
        )}

        {/* Reviews */}
        {isTutor && (user.reviews || []).length > 0 && (
          <InfoSection
            title={`Reviews (${approvedReviews.length} approved${pendingReviews.length > 0 ? `, ${pendingReviews.length} pending` : ''})`}
            icon={MessageSquare}
          >
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {(user.reviews || []).slice(0, 10).map(rev => (
                <div key={rev.id} className="p-2.5 bg-[#111827] rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{rev.studentName}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        rev.status === 'APPROVED'
                          ? 'bg-emerald-950 text-emerald-400'
                          : rev.status === 'REJECTED'
                          ? 'bg-rose-950 text-rose-400'
                          : 'bg-amber-950 text-amber-400'
                      }`}
                    >
                      {rev.status || 'APPROVED'}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1 italic">"{rev.comment}"</p>
                  <div className="text-slate-500 mt-1">
                    ★ {(rev.overall || 0).toFixed(1)} • Punctuality: {rev.punctuality} • Mastery: {rev.subjectMastery} • Style: {rev.teachingStyle}
                  </div>
                </div>
              ))}
            </div>
          </InfoSection>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 sticky bottom-0 bg-[#0B0F19] pb-1">
          <button onClick={onClose} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold">
            Close
          </button>
          {isTutor && user.verificationStatus !== 'VERIFIED' && (
            <>
              <button
                onClick={onReject}
                className="px-4 py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-semibold border border-rose-800/50"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Verify & Award Badge
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};