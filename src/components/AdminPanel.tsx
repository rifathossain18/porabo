import React, { useState, useMemo } from 'react';
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
  IdCard,
  Database,
  Server,
  Download,
  Copy,
  Trash2,
  KeyRound,
  Shield,
  MapPin,
  RefreshCw,
  Award,
  Activity,
  Send,
  Calendar,
  RotateCcw,
  FileSpreadsheet,
  Star,
  MessageSquare,
  DollarSign,
  TrendingUp,
  ChevronDown,
  ChevronUp
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
  // ---- Auth gate ----
  const [storedMasterPassword, setStoredMasterPassword] = useState<string>(() =>
    localStorage.getItem('porabo_admin_master_password') || ''
  );
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem('porabo_admin_auth') === 'true'
  );
  const [enteredPasscode, setEnteredPasscode] = useState<string>('');
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  const [initialPassword, setInitialPassword] = useState<string>('');
  const [initialConfirmPassword, setInitialConfirmPassword] = useState<string>('');
  const [initialPasswordError, setInitialPasswordError] = useState<string | null>(null);

  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState<string>('');
  const [showSettingsPassword, setShowSettingsPassword] = useState<boolean>(false);
  const [settingsFeedback, setSettingsFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // ---- Tabs ----
  const [activeTab, setActiveTab] = useState<
    | 'urgent'
    | 'reviews'
    | 'teachers'
    | 'students'
    | 'posts'
    | 'export'
    | 'cloudflare'
    | 'settings'
  >('urgent');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);
  const [exportedDump, setExportedDump] = useState<string>('');

  const [diagnosticLogs, setDiagnosticLogs] = useState<D1DiagnosticLog[]>(() =>
    cfD1.getDiagnosticLogs()
  );

  React.useEffect(() => {
    const unsub = cfD1.subscribeToDiagnostics((newLog: D1DiagnosticLog) => {
      setDiagnosticLogs(prev => [newLog, ...prev.slice(0, 149)]);
    });
    return unsub;
  }, []);

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

  // Reviews filter + expandable teacher performance
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>(
    'PENDING'
  );
  const [expandedTeachers, setExpandedTeachers] = useState<Set<string>>(new Set());

  // ---- Derived lists ----
  const tutors = allUsers.filter(u => u.role === 'TUTOR');
  const students = allUsers.filter(u => u.role === 'STUDENT');
  const pendingTutors = tutors.filter(
    t => t.verificationStatus === 'PENDING' || !t.verificationStatus
  );
  const verifiedTutors = tutors.filter(t => t.verificationStatus === 'VERIFIED');

  const pendingPosts = tuitionPosts.filter(p => p.approvalStatus === 'PENDING');
  const approvedPosts = tuitionPosts.filter(
    p => p.approvalStatus === 'APPROVED' || !p.approvalStatus
  );

  // Flat list of all reviews with tutor info attached
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
    return flat.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [tutors]);

  const pendingReviews = allReviews.filter(r => r.status === 'PENDING');
  const approvedReviews = allReviews.filter(r => r.status === 'APPROVED');
  const rejectedReviews = allReviews.filter(r => r.status === 'REJECTED');

  // ---- Date range filtering ----
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

  const handlePresetDate = (preset: 'all' | 'today' | '7days' | '30days' | 'thisMonth') => {
    const today = new Date();
    const formatYMD = (d: Date) => d.toISOString().slice(0, 10);
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      const ymd = formatYMD(today);
      setStartDate(ymd);
      setEndDate(ymd);
    } else if (preset === '7days') {
      const past7 = new Date(today);
      past7.setDate(past7.getDate() - 7);
      setStartDate(formatYMD(past7));
      setEndDate(formatYMD(today));
    } else if (preset === '30days') {
      const past30 = new Date(today);
      past30.setDate(past30.getDate() - 30);
      setStartDate(formatYMD(past30));
      setEndDate(formatYMD(today));
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(formatYMD(firstDay));
      setEndDate(formatYMD(today));
    }
  };

  const dateFilteredPosts = useMemo(
    () => tuitionPosts.filter(p => isWithinDateRange(p.createdAt)),
    [tuitionPosts, startDate, endDate]
  );
  const dateFilteredApplications = useMemo(
    () => applications.filter(a => isWithinDateRange(a.createdAt)),
    [applications, startDate, endDate]
  );

  // ---- Export helpers ----
  const exportToExcelCSV = (
    filename: string,
    headers: string[],
    rows: (string | number | undefined | null)[][]
  ) => {
    const escapeCell = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };
    const csvContent =
      '\uFEFF' +
      [
        headers.map(escapeCell).join(','),
        ...rows.map(row => row.map(escapeCell).join(','))
      ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      filename.endsWith('.csv') ? filename : `${filename}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportTeachers = () => {
    const headers = [
      'Teacher ID',
      'Full Name',
      'Phone',
      'Email',
      'Gender',
      'District',
      'Area',
      'Institution',
      'Department',
      'Academic Year',
      'NID',
      'Student Roll',
      'Student Reg',
      'Verification Status',
      'Overall Rating',
      'Total Approved Reviews',
      'Experience Years',
      'Total Students Taught',
      'Currently Teaching'
    ];
    const rows = tutors.map(t => {
      const approvedReviewsCount = (t.reviews || []).filter(
        r => (r.status || 'APPROVED') === 'APPROVED'
      ).length;
      const acceptedApps = applications.filter(
        a => a.tutorId === t.id && a.status === 'ACCEPTED'
      );
      const activeApps = acceptedApps.filter(a => {
        const post = tuitionPosts.find(p => p.id === a.postId);
        return post && post.status !== 'CLOSED' && post.status !== 'CANCELLED';
      });
      return [
        t.id,
        t.fullName,
        t.phone,
        t.email,
        t.gender || 'N/A',
        t.district,
        t.areaName,
        t.institution || 'N/A',
        t.department || 'N/A',
        t.academicYear || 'N/A',
        t.nidNumber || 'N/A',
        t.studentIdCardRoll || 'N/A',
        t.studentIdCardReg || 'N/A',
        t.verificationStatus || 'PENDING',
        t.rating || 0.0,
        approvedReviewsCount,
        t.yearsOfExperience || 0,
        acceptedApps.length,
        activeApps.length
      ];
    });
    exportToExcelCSV(
      `porabo_teachers_${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows
    );
  };

  const handleExportStudents = () => {
    const headers = [
      'Student ID',
      'Full Name',
      'Phone',
      'Email',
      'Gender',
      'District',
      'Area',
      'Exact Address',
      'Tuition Posts',
      'Total Applications Received'
    ];
    const rows = students.map(s => {
      const postsCount = tuitionPosts.filter(p => p.studentId === s.id).length;
      const myPostIds = tuitionPosts
        .filter(p => p.studentId === s.id)
        .map(p => p.id);
      const appsReceived = applications.filter(a =>
        myPostIds.includes(a.postId)
      ).length;
      return [
        s.id,
        s.fullName,
        s.phone,
        s.email,
        s.gender || 'N/A',
        s.district,
        s.areaName,
        s.exactAddress || `${s.areaName}, ${s.district}`,
        postsCount,
        appsReceived
      ];
    });
    exportToExcelCSV(
      `porabo_students_${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows
    );
  };

  const handleExportAllUsers = () => {
    const headers = [
      'User ID',
      'Role',
      'Full Name',
      'Phone',
      'Email',
      'Gender',
      'District',
      'Area',
      'Exact Address',
      'Institution',
      'Department',
      'Academic Year',
      'NID',
      'Student Roll',
      'Student Reg',
      'Verification Status',
      'Rating',
      'Total Reviews',
      'Experience Years'
    ];
    const rows = allUsers.map(u => [
      u.id,
      u.role,
      u.fullName,
      u.phone,
      u.email,
      u.gender || 'N/A',
      u.district,
      u.areaName,
      u.exactAddress || `${u.areaName}, ${u.district}`,
      u.institution || 'N/A',
      u.department || 'N/A',
      u.academicYear || 'N/A',
      u.nidNumber || 'N/A',
      u.studentIdCardRoll || 'N/A',
      u.studentIdCardReg || 'N/A',
      u.verificationStatus || (u.role === 'STUDENT' ? 'VERIFIED' : 'PENDING'),
      u.rating || 0.0,
      u.totalReviews || 0,
      u.yearsOfExperience || 0
    ]);
    exportToExcelCSV(
      `porabo_all_users_${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows
    );
  };

  const handleExportTuitionPosts = (useFiltered: boolean = true) => {
    const postsToExport =
      useFiltered && (startDate || endDate) ? dateFilteredPosts : tuitionPosts;
    const headers = [
      'Post ID',
      'Title',
      'Student Name',
      'Student ID',
      'District',
      'Area',
      'Subject',
      'Grade Level',
      'Curriculum',
      'Monthly Budget (BDT)',
      'Days Per Week',
      'Approval Status',
      'Match Status',
      'Created At'
    ];
    const rows = postsToExport.map(p => [
      p.id,
      p.title,
      p.studentName,
      p.studentId,
      p.district,
      p.areaName,
      p.subject,
      p.gradeLevel,
      p.curriculum || 'N/A',
      p.salaryBudget,
      p.daysPerWeek || 3,
      p.approvalStatus || 'APPROVED',
      p.status || 'OPEN',
      p.createdAt ? new Date(p.createdAt).toISOString() : 'N/A'
    ]);
    const suffix =
      startDate || endDate
        ? `_${startDate || 'earliest'}_to_${endDate || 'latest'}`
        : `_${new Date().toISOString().slice(0, 10)}`;
    exportToExcelCSV(`porabo_tuition_posts${suffix}`, headers, rows);
  };

  const handleExportApplications = (useFiltered: boolean = true) => {
    const appsToExport =
      useFiltered && (startDate || endDate)
        ? dateFilteredApplications
        : applications;
    const headers = [
      'Application ID',
      'Post ID',
      'Tutor ID',
      'Tutor Name',
      'Proposed Salary (BDT)',
      'Status',
      'Applied Date'
    ];
    const rows = appsToExport.map(a => [
      a.id,
      a.postId,
      a.tutorId,
      a.tutorName,
      a.proposedSalary,
      a.status,
      a.createdAt ? new Date(a.createdAt).toISOString() : 'N/A'
    ]);
    const suffix =
      startDate || endDate
        ? `_${startDate || 'earliest'}_to_${endDate || 'latest'}`
        : `_${new Date().toISOString().slice(0, 10)}`;
    exportToExcelCSV(`porabo_applications${suffix}`, headers, rows);
  };

  const handleExportReviews = () => {
    const headers = [
      'Review ID',
      'Tutor Name',
      'Student Name',
      'Student Role',
      'Punctuality',
      'Subject Mastery',
      'Teaching Style',
      'Overall',
      'Comment',
      'Status',
      'Submitted Date',
      'Approved Date'
    ];
    const rows = allReviews.map(r => [
      r.id,
      r.tutorName,
      r.studentName,
      r.studentRoleOrGrade,
      r.punctuality,
      r.subjectMastery,
      r.teachingStyle,
      r.overall,
      r.comment,
      r.status,
      r.createdAt ? new Date(r.createdAt).toISOString() : 'N/A',
      r.approvedAt ? new Date(r.approvedAt).toISOString() : ''
    ]);
    exportToExcelCSV(
      `porabo_reviews_${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows
    );
  };

  const handleExportAllData = () => {
    handleExportAllUsers();
    setTimeout(() => handleExportTuitionPosts(true), 500);
    if (applications.length > 0) {
      setTimeout(() => handleExportApplications(true), 1000);
    }
  };

  // ---- Search filters ----
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

  const filteredReviews =
    reviewFilter === 'ALL' ? allReviews : allReviews.filter(r => r.status === reviewFilter);

  // ---- Auth handlers ----
  const handleSetupInitialPassword = (e: React.FormEvent) => {
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
    const clean = initialPassword.trim();
    localStorage.setItem('porabo_admin_master_password', clean);
    setStoredMasterPassword(clean);
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('porabo_admin_auth', 'true');
  };

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);
    const valid = storedMasterPassword || localStorage.getItem('porabo_admin_master_password');
    if (!valid) {
      setPasscodeError('No admin password set.');
      return;
    }
    if (enteredPasscode.trim() === valid) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('porabo_admin_auth', 'true');
      setEnteredPasscode('');
    } else {
      setPasscodeError('Invalid password.');
    }
  };

  const handleRotatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsFeedback(null);
    const valid = storedMasterPassword || localStorage.getItem('porabo_admin_master_password');
    if (currentPasswordInput.trim() !== valid) {
      setSettingsFeedback({ type: 'error', message: 'Current password incorrect.' });
      return;
    }
    if (!newPasswordInput || newPasswordInput.length < 6) {
      setSettingsFeedback({ type: 'error', message: 'New password min 6 chars.' });
      return;
    }
    if (newPasswordInput !== confirmNewPasswordInput) {
      setSettingsFeedback({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    const clean = newPasswordInput.trim();
    localStorage.setItem('porabo_admin_master_password', clean);
    setStoredMasterPassword(clean);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmNewPasswordInput('');
    setSettingsFeedback({ type: 'success', message: 'Password updated!' });
  };

  const handleLockAdminSession = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('porabo_admin_auth');
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

  // ---- Auth Gate ----
  if (!isAdminAuthenticated) {
    const hasExisting = Boolean(
      storedMasterPassword || localStorage.getItem('porabo_admin_master_password')
    );
    return (
      <div className="min-h-screen bg-[#070A12] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0B0F19] border border-blue-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/40 text-blue-400 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60">
              {hasExisting ? 'Admin Console' : 'Security Setup'}
            </span>
            <h1 className="text-2xl font-black text-white">
              {hasExisting ? 'Porabo Admin' : 'Create Master Password'}
            </h1>
          </div>

          {!hasExisting ? (
            <form onSubmit={handleSetupInitialPassword} className="space-y-4">
              <input
                type={showPasscode ? 'text' : 'password'}
                value={initialPassword}
                onChange={e => setInitialPassword(e.target.value)}
                placeholder="Master password (min 6 chars)"
                required
                autoFocus
                className="w-full bg-[#111827] border border-blue-950 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <input
                type={showPasscode ? 'text' : 'password'}
                value={initialConfirmPassword}
                onChange={e => setInitialConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                className="w-full bg-[#111827] border border-blue-950 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              {initialPasswordError && (
                <div className="text-xs text-rose-400 flex items-center gap-1.5 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{initialPasswordError}</span>
                </div>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-bold text-sm"
              >
                Save &amp; Enter
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasscodeLogin} className="space-y-4">
              <input
                type={showPasscode ? 'text' : 'password'}
                value={enteredPasscode}
                onChange={e => setEnteredPasscode(e.target.value)}
                placeholder="Enter password"
                autoFocus
                className="w-full bg-[#111827] border border-blue-950 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              {passcodeError && (
                <div className="text-xs text-rose-400 flex items-center gap-1.5 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{passcodeError}</span>
                </div>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-bold text-sm"
              >
                Sign In
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              onClick={onExitAdmin}
              className="text-slate-400 hover:text-white text-xs flex items-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Porabo App</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN ADMIN CONSOLE
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-blue-900/50 bg-[#0B0F19]/95 backdrop-blur-md px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-white">
                  Porabo <span className="text-blue-400">Admin</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5" /> Auth
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Full moderation • Teacher performance • Review approvals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAllData}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export All</span>
            </button>
            <button
              onClick={handleLockAdminSession}
              className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 rounded-xl text-xs font-semibold"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock</span>
            </button>
            <button
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
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div
            onClick={() => setActiveTab('urgent')}
            className={`p-3 rounded-3xl border cursor-pointer transition-all ${
              activeTab === 'urgent'
                ? 'bg-amber-950/30 border-amber-500/60 ring-2 ring-amber-500/30'
                : 'bg-[#111827] border-blue-950/70 hover:border-amber-500/40'
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
            className={`p-3 rounded-3xl border cursor-pointer transition-all ${
              activeTab === 'reviews'
                ? 'bg-purple-950/30 border-purple-500/60 ring-2 ring-purple-500/30'
                : 'bg-[#111827] border-blue-950/70 hover:border-purple-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>REVIEWS</span>
              <MessageSquare className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-xl font-black text-purple-400">{allReviews.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {pendingReviews.length} pending
            </span>
          </div>

          <div
            onClick={() => setActiveTab('teachers')}
            className={`p-3 rounded-3xl border cursor-pointer transition-all ${
              activeTab === 'teachers'
                ? 'bg-blue-950/30 border-blue-500/60 ring-2 ring-blue-500/30'
                : 'bg-[#111827] border-blue-950/70 hover:border-blue-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>TEACHERS</span>
              <GraduationCap className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-xl font-black text-white">{tutors.length}</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">
              {verifiedTutors.length} verified
            </span>
          </div>

          <div
            onClick={() => setActiveTab('students')}
            className={`p-3 rounded-3xl border cursor-pointer transition-all ${
              activeTab === 'students'
                ? 'bg-cyan-950/30 border-cyan-500/60 ring-2 ring-cyan-500/30'
                : 'bg-[#111827] border-blue-950/70 hover:border-cyan-500/40'
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
            className={`p-3 rounded-3xl border cursor-pointer transition-all ${
              activeTab === 'posts'
                ? 'bg-emerald-950/30 border-emerald-500/60 ring-2 ring-emerald-500/30'
                : 'bg-[#111827] border-blue-950/70 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>POSTS</span>
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xl font-black text-white">{tuitionPosts.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {approvedPosts.length} live
            </span>
          </div>
        </div>

        {/* Tab nav */}
        <div className="bg-[#111827] border border-blue-900/40 rounded-2xl p-1.5 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {[
              { id: 'urgent', label: '🔴 Queue', badge: pendingTutors.length + pendingPosts.length + pendingReviews.length },
              { id: 'reviews', label: 'Reviews', icon: MessageSquare, badge: pendingReviews.length },
              { id: 'teachers', label: 'Teachers & Performance', icon: GraduationCap },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'posts', label: 'Posts', icon: BookOpen },
              { id: 'export', label: 'Export', icon: Download },
              { id: 'cloudflare', label: 'D1/KV', icon: Database },
              { id: 'settings', label: 'Settings', icon: KeyRound },
            ].map(tab => {
              const Icon = tab.icon as any;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
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

        {/* Search */}
        {['teachers', 'students', 'posts', 'reviews'].includes(activeTab) && (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-[#111827] border border-blue-950/70 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* ==================== URGENT QUEUE ==================== */}
        {activeTab === 'urgent' && (
          <div className="space-y-6">
            {/* Pending Reviews */}
            <div className="bg-[#111827] border border-purple-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                  {pendingReviews.length}
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Pending Review Approvals
                </h2>
              </div>
              {pendingReviews.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs text-slate-400">All reviews moderated. No pending approvals.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReviews.map(review => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onApprove={() => onApproveReview(review.tutorId, review.id)}
                      onReject={() =>
                        setRejectingReview({ tutorId: review.tutorId, reviewId: review.id })
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pending Tutors */}
            <div className="bg-[#111827] border border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                  {pendingTutors.length}
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Pending Teacher Verifications
                </h2>
              </div>
              {pendingTutors.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs text-slate-400">No pending tutor dossiers.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingTutors.map(tutor => (
                    <div
                      key={tutor.id}
                      className="bg-[#0B0F19] border border-amber-500/30 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <GenderAvatar gender={tutor.gender || 'MALE'} role="TUTOR" size="md" />
                        <div>
                          <h3 className="font-bold text-white text-sm">{tutor.fullName}</h3>
                          <p className="text-xs text-blue-400">{tutor.institution || '—'}</p>
                          <p className="text-[11px] text-slate-400">
                            {tutor.areaName}, {tutor.district}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#111827] p-2.5 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-slate-500 block text-[9px] font-mono">NID:</span>
                          <span className="text-white font-mono">{tutor.nidNumber || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] font-mono">ROLL/REG:</span>
                          <span className="text-cyan-400 font-mono">
                            {tutor.studentIdCardRoll || '—'} / {tutor.studentIdCardReg || '—'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setInspectingUser(tutor)}
                          className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          Inspect
                        </button>
                        <button
                          onClick={() => onApproveTutor(tutor.id)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
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

            {/* Pending Posts */}
            <div className="bg-[#111827] border border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                  {pendingPosts.length}
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white">Pending Tuition Posts</h2>
              </div>
              {pendingPosts.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs text-slate-400">No pending tuition posts.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingPosts.map(post => (
                    <div
                      key={post.id}
                      className="bg-[#0B0F19] border border-cyan-500/30 rounded-2xl p-4 space-y-3"
                    >
                      <h3 className="font-bold text-white text-sm">{post.title}</h3>
                      <p className="text-xs text-cyan-400">
                        {post.subject} • {post.gradeLevel}
                      </p>
                      <div className="text-xs text-slate-300 space-y-0.5">
                        <div>Guardian: {post.studentName}</div>
                        <div className="text-emerald-400 font-bold">
                          ৳ {post.salaryBudget.toLocaleString()}/mo
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onApprovePost(post.id)}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            setItemToDelete({ type: 'post', id: post.id, name: post.title })
                          }
                          className="py-2 px-3 bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 rounded-xl text-xs font-semibold border border-rose-800/50"
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

        {/* ==================== REVIEWS TAB ==================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>Review Moderation Center ({allReviews.length})</span>
              </h2>
              <button
                onClick={handleExportReviews}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export Reviews
              </button>
            </div>

            {/* Filter chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'PENDING', label: `Pending (${pendingReviews.length})`, color: 'amber' },
                { id: 'APPROVED', label: `Approved (${approvedReviews.length})`, color: 'emerald' },
                { id: 'REJECTED', label: `Rejected (${rejectedReviews.length})`, color: 'rose' },
                { id: 'ALL', label: `All (${allReviews.length})`, color: 'blue' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setReviewFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    reviewFilter === f.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-[#111827] text-slate-400 hover:text-white border border-blue-950/70'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredReviews.length === 0 ? (
              <div className="p-12 text-center bg-[#111827] border border-blue-900/30 rounded-3xl">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-white">No reviews to show</p>
                <p className="text-xs text-slate-500 mt-1">
                  No reviews match the selected filter.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReviews.map(review => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    showTutorName
                    onApprove={
                      review.status === 'PENDING'
                        ? () => onApproveReview(review.tutorId, review.id)
                        : undefined
                    }
                    onReject={
                      review.status === 'PENDING'
                        ? () =>
                            setRejectingReview({
                              tutorId: review.tutorId,
                              reviewId: review.id,
                            })
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TEACHERS & PERFORMANCE ==================== */}
        {activeTab === 'teachers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>Teachers &amp; Performance Dashboard ({filteredTutors.length})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ratings • Active students • Earnings • Moderation status
                </p>
              </div>
              <button
                onClick={handleExportTeachers}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export Teachers
              </button>
            </div>

            {filteredTutors.length === 0 ? (
              <div className="p-12 text-center bg-[#111827] border border-blue-900/30 rounded-3xl">
                <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-white">No teachers found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredTutors.map(tutor => {
                  const tutorReviews = (tutor.reviews || []).filter(
                    r => (r.status || 'APPROVED') === 'APPROVED'
                  );
                  const pendingTutorReviews = (tutor.reviews || []).filter(
                    r => r.status === 'PENDING'
                  );
                  const acceptedApps = applications.filter(
                    a => a.tutorId === tutor.id && a.status === 'ACCEPTED'
                  );
                  const activeApps = acceptedApps.filter(a => {
                    const post = tuitionPosts.find(p => p.id === a.postId);
                    return post && post.status !== 'CLOSED' && post.status !== 'CANCELLED';
                  });
                  const totalEarnings = acceptedApps.reduce(
                    (sum, a) => sum + (a.proposedSalary || 0),
                    0
                  );
                  const isExpanded = expandedTeachers.has(tutor.id);
                  const isVerified = tutor.verificationStatus === 'VERIFIED';

                  return (
                    <div
                      key={tutor.id}
                      className="bg-[#111827] border border-blue-900/40 rounded-3xl p-4 sm:p-5 space-y-4 hover:border-blue-700 transition-all"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <GenderAvatar
                            gender={tutor.gender || 'MALE'}
                            role="TUTOR"
                            size="md"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-bold text-white text-base">
                                {tutor.fullName}
                              </h3>
                              {isVerified && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                                  <CheckCircle className="w-2.5 h-2.5" /> Verified
                                </span>
                              )}
                              {!isVerified && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  {tutor.verificationStatus || 'PENDING'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-blue-400">
                              {tutor.institution || '—'} • {tutor.department || '—'}
                            </p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {tutor.areaName}, {tutor.district}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Performance metrics grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="bg-[#0B0F19] p-2.5 rounded-2xl border border-blue-950/70 text-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono uppercase mb-0.5">
                            <Users className="w-3 h-3 text-blue-400" />
                            <span>Students Taught</span>
                          </div>
                          <div className="text-base font-bold text-white">
                            {acceptedApps.length}
                          </div>
                        </div>
                        <div className="bg-[#0B0F19] p-2.5 rounded-2xl border border-blue-950/70 text-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono uppercase mb-0.5">
                            <Activity className="w-3 h-3 text-cyan-400" />
                            <span>Currently Active</span>
                          </div>
                          <div className="text-base font-bold text-cyan-400">
                            {activeApps.length}
                          </div>
                        </div>
                        <div className="bg-[#0B0F19] p-2.5 rounded-2xl border border-blue-950/70 text-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono uppercase mb-0.5">
                            <Star className="w-3 h-3 text-amber-400" />
                            <span>Rating</span>
                          </div>
                          <div className="text-base font-bold text-amber-400">
                            {tutorReviews.length > 0
                              ? (tutor.rating || 0).toFixed(1)
                              : '0.0'}
                            <span className="text-[10px] text-slate-500 font-normal">
                              {' '}
                              /5
                            </span>
                          </div>
                        </div>
                        <div className="bg-[#0B0F19] p-2.5 rounded-2xl border border-blue-950/70 text-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono uppercase mb-0.5">
                            <DollarSign className="w-3 h-3 text-emerald-400" />
                            <span>Total Earnings</span>
                          </div>
                          <div className="text-base font-bold text-emerald-400">
                            ৳{totalEarnings >= 1000
                              ? `${(totalEarnings / 1000).toFixed(1)}K`
                              : totalEarnings}
                          </div>
                        </div>
                      </div>

                      {/* Reviews row */}
                      <div className="flex items-center gap-3 flex-wrap text-xs">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {tutorReviews.length} approved
                        </span>
                        {pendingTutorReviews.length > 0 && (
                          <span className="flex items-center gap-1 text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                            {pendingTutorReviews.length} pending
                          </span>
                        )}
                      </div>

                      {/* Expand toggle */}
                      <button
                        onClick={() => toggleTeacherExpand(tutor.id)}
                        className="w-full py-2 bg-[#0B0F19] hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 border border-blue-950/70"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            Show Students &amp; Reviews
                          </>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="space-y-3 pt-2 border-t border-slate-800/80">
                          {/* Current Students */}
                          <div>
                            <h4 className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" />
                              Current Students ({activeApps.length})
                            </h4>
                            {activeApps.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">
                                No active matches yet.
                              </p>
                            ) : (
                              <div className="space-y-1.5">
                                {activeApps.map(app => {
                                  const post = tuitionPosts.find(p => p.id === app.postId);
                                  const student = allUsers.find(
                                    u => u.id === post?.studentId
                                  );
                                  return (
                                    <div
                                      key={app.id}
                                      className="p-2.5 bg-[#0B0F19] rounded-xl border border-slate-800 text-xs flex items-start justify-between gap-2"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-white truncate">
                                          {student?.fullName || post?.studentName || '—'}
                                        </div>
                                        <div className="text-[11px] text-slate-400 truncate">
                                          {post?.subject} • {post?.gradeLevel}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-mono">
                                          {app.acceptedAt
                                            ? new Date(app.acceptedAt).toLocaleDateString()
                                            : 'recent'}
                                          {' • '}
                                          {post?.areaName}
                                        </div>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <div className="font-bold text-emerald-400">
                                          ৳{app.proposedSalary.toLocaleString()}
                                        </div>
                                        {post?.studentPhone && (
                                          <a
                                            href={`tel:${post.studentPhone}`}
                                            className="text-[10px] text-blue-400 font-mono hover:underline"
                                          >
                                            {post.studentPhone}
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* All Reviews for this tutor */}
                          <div>
                            <h4 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5" />
                              Reviews ({tutorReviews.length} approved
                              {pendingTutorReviews.length > 0 &&
                                `, ${pendingTutorReviews.length} pending`}
                              )
                            </h4>
                            {(tutor.reviews || []).length === 0 ? (
                              <p className="text-xs text-slate-500 italic">
                                No reviews submitted yet.
                              </p>
                            ) : (
                              <div className="space-y-1.5">
                                {(tutor.reviews || [])
                                  .slice(0, 5)
                                  .map(rev => (
                                    <div
                                      key={rev.id}
                                      className="p-2.5 bg-[#0B0F19] rounded-xl border border-slate-800 text-xs"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-semibold text-white">
                                          {rev.studentName}
                                        </span>
                                        <span
                                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                            rev.status === 'APPROVED'
                                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                                              : rev.status === 'REJECTED'
                                              ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                                              : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                                          }`}
                                        >
                                          {rev.status || 'APPROVED'}
                                        </span>
                                      </div>
                                      <div className="text-[11px] text-slate-400 mt-0.5 italic line-clamp-2">
                                        "{rev.comment}"
                                      </div>
                                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                                        ★ {(rev.overall || 0).toFixed(1)} •{' '}
                                        {new Date(rev.createdAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => setInspectingUser(tutor)}
                          className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          Full Dossier
                        </button>
                        {!isVerified && (
                          <button
                            onClick={() => onApproveTutor(tutor.id)}
                            className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setItemToDelete({
                              type: 'user',
                              id: tutor.id,
                              name: tutor.fullName,
                            })
                          }
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

        {/* ==================== STUDENTS ==================== */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Students ({filteredStudents.length})
              </h2>
              <button
                onClick={handleExportStudents}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export Students
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredStudents.map(student => {
                const postsCount = tuitionPosts.filter(
                  p => p.studentId === student.id
                ).length;
                return (
                  <div
                    key={student.id}
                    className="bg-[#111827] border border-blue-900/40 rounded-2xl p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <GenderAvatar
                        gender={student.gender || 'FEMALE'}
                        role="STUDENT"
                        size="sm"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-white text-sm">
                          {student.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {student.email}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                        {postsCount} posts
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      {student.phone}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {student.areaName}, {student.district}
                    </div>
                    <button
                      onClick={() =>
                        setItemToDelete({
                          type: 'user',
                          id: student.id,
                          name: student.fullName,
                        })
                      }
                      className="w-full py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 rounded-lg text-[11px] font-semibold border border-rose-800/50 flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== POSTS ==================== */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                Tuition Posts ({filteredPosts.length})
              </h2>
              <button
                onClick={() => handleExportTuitionPosts(true)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export Posts
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPosts.map(post => (
                <div
                  key={post.id}
                  className="bg-[#111827] border border-blue-900/40 rounded-2xl p-4 space-y-2"
                >
                  <h3 className="font-bold text-white text-sm">{post.title}</h3>
                  <p className="text-xs text-blue-400">
                    {post.subject} • {post.gradeLevel}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{post.studentName}</span>
                    <span className="font-bold text-emerald-400">
                      ৳ {post.salaryBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin className="w-3 h-3" />
                    {post.areaName}, {post.district}
                  </div>
                  <div className="flex gap-2">
                    {post.approvalStatus === 'PENDING' ? (
                      <button
                        onClick={() => onApprovePost(post.id)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="flex-1 py-1.5 bg-emerald-950/60 text-emerald-400 rounded-lg text-xs font-semibold text-center border border-emerald-800/60">
                        Approved
                      </span>
                    )}
                    <button
                      onClick={() =>
                        setItemToDelete({
                          type: 'post',
                          id: post.id,
                          name: post.title,
                        })
                      }
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

        {/* ==================== EXPORT ==================== */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-950/40 to-teal-950/20 border border-emerald-500/40 rounded-3xl p-5">
              <h2 className="text-lg font-bold text-white mb-1">Export Data</h2>
              <p className="text-xs text-slate-300 mb-3">
                Download any dataset as Excel-compatible CSV
              </p>
              <button
                onClick={handleExportAllData}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-2xl text-sm"
              >
                Download Full Archive
              </button>
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
                onExport={() => handleExportTuitionPosts(true)}
              />
              <ExportCard
                title="Reviews"
                count={allReviews.length}
                color="amber"
                onExport={handleExportReviews}
              />
            </div>
            <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5">
              <h3 className="text-sm font-bold text-white mb-2">Date Range Filter</h3>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'today', '7days', '30days', 'thisMonth'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => handlePresetDate(p)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                  >
                    {p === 'all'
                      ? 'All Time'
                      : p === 'today'
                      ? 'Today'
                      : p === '7days'
                      ? '7 Days'
                      : p === '30days'
                      ? '30 Days'
                      : 'This Month'}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="bg-[#0B0F19] border border-blue-950 text-white text-xs rounded-lg px-3 py-1.5 [color-scheme:dark]"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="bg-[#0B0F19] border border-blue-950 text-white text-xs rounded-lg px-3 py-1.5 [color-scheme:dark]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================== CLOUDFLARE ==================== */}
        {activeTab === 'cloudflare' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                Cloudflare D1 &amp; KV
              </h2>
              <button
                onClick={async () => {
                  const dump = await cfD1.exportFullD1Dump();
                  setExportedDump(dump);
                  navigator.clipboard?.writeText(dump);
                  setCopiedSchema(true);
                  setTimeout(() => setCopiedSchema(false), 2000);
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                {copiedSchema ? 'Copied!' : 'Export SQL Dump'}
              </button>
            </div>
            <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5">
              <h3 className="text-sm font-bold text-white mb-2">SQL Schema</h3>
              <pre className="bg-[#070A12] p-3 rounded-xl text-[10px] font-mono text-slate-300 overflow-auto max-h-96">
                {exportedDump || CLOUDFLARE_D1_SCHEMA}
              </pre>
            </div>
            <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Real-time Query Log ({diagnosticLogs.length})
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
                        <td className="p-2 text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-2 text-cyan-400 truncate max-w-xs">
                          {log.operation}
                        </td>
                        <td className="p-2 text-emerald-400">{log.executionTimeMs}ms</td>
                        <td className="p-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              log.status === 'SUCCESS'
                                ? 'bg-emerald-950 text-emerald-400'
                                : 'bg-rose-950 text-rose-400'
                            }`}
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

        {/* ==================== SETTINGS ==================== */}
        {activeTab === 'settings' && (
          <div className="max-w-lg mx-auto">
            <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                Rotate Admin Password
              </h2>
              {settingsFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs ${
                    settingsFeedback.type === 'success'
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-950/40 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {settingsFeedback.message}
                </div>
              )}
              <form onSubmit={handleRotatePassword} className="space-y-3">
                <input
                  type={showSettingsPassword ? 'text' : 'password'}
                  value={currentPasswordInput}
                  onChange={e => setCurrentPasswordInput(e.target.value)}
                  placeholder="Current password"
                  required
                  className="w-full bg-[#0B0F19] border border-blue-950 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type={showSettingsPassword ? 'text' : 'password'}
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  placeholder="New password (min 6)"
                  required
                  className="w-full bg-[#0B0F19] border border-blue-950 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type={showSettingsPassword ? 'text' : 'password'}
                  value={confirmNewPasswordInput}
                  onChange={e => setConfirmNewPasswordInput(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full bg-[#0B0F19] border border-blue-950 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <div className="flex justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSettingsPassword(!showSettingsPassword)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    {showSettingsPassword ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Reject tutor modal */}
      {rejectingTutorId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md bg-[#111827] border border-rose-500/40 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-white">Reject Teacher Verification</h3>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="w-full bg-[#0B0F19] border border-rose-500/30 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-400 resize-none"
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
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject review modal */}
      {rejectingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md bg-[#111827] border border-rose-500/40 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-white">Reject Review</h3>
            <p className="text-xs text-slate-400">
              Explain why this review is being rejected. Student will see this reason.
            </p>
            <textarea
              rows={3}
              value={reviewRejectReason}
              onChange={e => setReviewRejectReason(e.target.value)}
              className="w-full bg-[#0B0F19] border border-rose-500/30 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-400 resize-none"
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
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
              >
                Reject Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspector */}
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

      {/* Delete confirm */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
          <div className="w-full max-w-sm bg-[#111827] border border-rose-500/50 rounded-3xl p-6 space-y-4 text-center">
            <Trash2 className="w-12 h-12 text-rose-400 mx-auto" />
            <h3 className="font-bold text-lg text-white">Permanently Delete?</h3>
            <p className="text-xs text-slate-400">
              "{itemToDelete.name}" will be purged from the database. Cannot undo.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
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

// ==========================================================
// HELPER COMPONENTS
// ==========================================================

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

      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>Submitted {new Date(review.createdAt).toLocaleDateString()}</span>
        {review.approvedAt && (
          <span className="text-emerald-500">
            Approved {new Date(review.approvedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {status === 'PENDING' && (onApprove || onReject) && (
        <div className="flex gap-2 pt-2 border-t border-slate-800/80">
          {onApprove && (
            <button
              onClick={onApprove}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Approve &amp; Publish
            </button>
          )}
          {onReject && (
            <button
              onClick={onReject}
              className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
};

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
      <button
        onClick={onExport}
        className={`mt-3 w-full py-2 bg-gradient-to-r ${colorMap[color]} text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5`}
      >
        <Download className="w-3.5 h-3.5" />
        Export CSV
      </button>
    </div>
  );
};

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
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
    <div className="w-full max-w-2xl bg-[#0B0F19] border border-blue-900/80 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto relative">
      <button
        onClick={onClose}
        className="absolute right-5 top-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <GenderAvatar gender={user.gender || 'MALE'} role="TUTOR" size="lg" />
        <div>
          <h2 className="text-lg font-bold text-white">{user.fullName}</h2>
          <p className="text-xs text-blue-400">
            {user.institution || '—'} • {user.department || '—'}
          </p>
          <p className="text-xs text-slate-400">
            {user.areaName}, {user.district}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-[#111827] p-3 rounded-xl border border-blue-950">
          <span className="text-[10px] text-slate-500 font-mono block">NID / BIRTH CERT</span>
          <span className="text-white font-mono font-bold">
            {user.nidNumber || 'Not provided'}
          </span>
        </div>
        <div className="bg-[#111827] p-3 rounded-xl border border-blue-950">
          <span className="text-[10px] text-slate-500 font-mono block">STUDENT ROLL</span>
          <span className="text-cyan-400 font-mono font-bold">
            {user.studentIdCardRoll || '—'}
          </span>
        </div>
        <div className="bg-[#111827] p-3 rounded-xl border border-blue-950">
          <span className="text-[10px] text-slate-500 font-mono block">STUDENT REG</span>
          <span className="text-cyan-400 font-mono font-bold">
            {user.studentIdCardReg || '—'}
          </span>
        </div>
        <div className="bg-[#111827] p-3 rounded-xl border border-blue-950">
          <span className="text-[10px] text-slate-500 font-mono block">PHONE</span>
          <span className="text-emerald-400 font-mono font-bold">{user.phone}</span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
        <button
          onClick={onReject}
          className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-semibold border border-rose-800/50"
        >
          Reject
        </button>
        <button
          onClick={onApprove}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          Verify &amp; Award Badge
        </button>
      </div>
    </div>
  </div>
);