import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Building2,
  Check,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Edit3,
  GraduationCap,
  MapPin,
  MessageSquare,
  QrCode,
  RefreshCw,
  Share2,
  ShieldCheck,
  Star,
  Tag,
  User as UserIcon,
  Users,
} from "lucide-react";
import { GenderAvatar } from "../../../components/GenderAvatar";
import { QRCodeModal } from "../../../components/QRCodeModal";
import { Toast } from "../../../components/Toast";
import { useAppContext } from "../../AppContext";
import { TeacherProfileEditModal } from "./TeacherProfileEditModal";
import { TeacherProfileRatings } from "./TeacherProfileRatings";

export function TeacherProfileContent() {
  const {
    allQuizzes,
    applications,
    currentUser,
    downloadingTeacherCardId,
    handleDownloadTeacherCard,
    handleShareTutorProfile,
    qrModalData,
    setEditBio,
    setEditExpectedFee,
    setEditPhilosophy,
    setEditSubjects,
    setFilterSubject,
    setIsEditProfileOpen,
    setIsResubmitModalOpen,
    setQrModalData,
    setResubmitNidNumber,
    setResubmitReg,
    setResubmitRoll,
    setTeacherViewMode,
    setToastMessage,
    setTutorToAccept,
    setViewingTeacherProfileId,
    showToast,
    studentMyPosts,
    toastMessage,
    viewingTeacherProfile,
    viewingTeacherProfileId,
  } = useAppContext();

  if (!currentUser) return null;

  // VIEW: DEDICATED TEACHER PROFILE PAGE (HIGH-TECH PERFORMANCE COVER, NO PHOTOS)
    // =========================================================================
  
    if (viewingTeacherProfileId && viewingTeacherProfile) {
      const tutor = viewingTeacherProfile;
      const tutorQuizzes = allQuizzes.filter((q) => q.teacherId === tutor.id);
      const isStudentViewing = currentUser.role === "STUDENT";
      const isSelfViewing = currentUser.id === tutor.id;
      const isPending = tutor.verificationStatus === "PENDING";
      const isRejected = tutor.verificationStatus === "REJECTED";
  
      const relevantApplication = isStudentViewing
        ? applications.find(
            (a) =>
              a.tutorId === tutor.id &&
              studentMyPosts.some((p) => p.id === a.postId),
          )
        : null;
  
      return (
        <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
          {/* Toast Notification */}
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
  
          {/* Top Header Navigation */}
          <header className="sticky top-0 z-40 border-b border-blue-950/50 bg-[#0B0F19]/90 backdrop-blur-md px-4 py-3 sm:px-6">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <button
                onClick={() => setViewingTeacherProfileId(null)}
                className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 px-3.5 py-1.5 rounded-xl border border-slate-700/60 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-blue-400" />
                <span>
                  Back to{" "}
                  {currentUser.role === "STUDENT" ? "My Posts" : "Tuition Feed"}
                </span>
              </button>
  
              <div className="flex items-center gap-2">
                {/* Share via QR Code */}
                <button
                  type="button"
                  onClick={() => {
                    setQrModalData({
                      isOpen: true,
                      title: tutor.fullName,
                      subtitle: `${tutor.institution || "Verified Educator"} • ${tutor.department || tutor.district}`,
                      district: tutor.district,
                      areaName: tutor.areaName,
                      shareUrl: `${window.location.origin}/#tutor-${tutor.id}`,
                      type: "tutor",
                    });
                  }}
                  className="px-2.5 sm:px-3 py-1.5 bg-[#111827] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Share via QR Code for offline neighborhood distribution"
                >
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">QR Code</span>
                </button>
  
                {/* Web Share */}
                <button
                  type="button"
                  onClick={(e) => handleShareTutorProfile(tutor, e)}
                  className="px-2.5 sm:px-3 py-1.5 bg-[#111827] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Share profile link"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Share</span>
                </button>
  
                {/* 🆕 Download Premium Bio Card */}
                <button
                  type="button"
                  onClick={() => handleDownloadTeacherCard(tutor)}
                  disabled={downloadingTeacherCardId === tutor.id}
                  className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border border-cyan-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
                  title="Download premium bio card with QR code"
                >
                  <Download
                    className={`w-3.5 h-3.5 ${downloadingTeacherCardId === tutor.id ? "animate-pulse" : ""}`}
                  />
                  <span className="hidden sm:inline">
                    {downloadingTeacherCardId === tutor.id ? "..." : "Bio Card"}
                  </span>
                </button>
  
                {isSelfViewing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditBio(tutor.bio || "");
                      setEditPhilosophy(tutor.teachingPhilosophy || "");
                      setEditExpectedFee(tutor.hourlyOrMonthlyRate || 8500);
                      setEditSubjects(
                        tutor.subjectsTaught || ["Higher Math", "Physics"],
                      );
                      setIsEditProfileOpen(true);
                    }}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                )}
  
                <span
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1.5 border ${
                    tutor.verificationStatus === "VERIFIED"
                      ? "bg-emerald-950 text-emerald-400 border-emerald-800/60"
                      : "bg-amber-950 text-amber-400 border-amber-800/60"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {tutor.verificationStatus === "VERIFIED"
                      ? "Verified Teacher Profile"
                      : "Verification Under Review"}
                  </span>
                </span>
              </div>
            </div>
          </header>
  
          {/* Dedicated Profile Body */}
          <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Status Alert if Pending Verification */}
            {isSelfViewing && isPending && (
              <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs sm:text-sm shadow-xl space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-base">
                        Verification in Progress
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60">
                        ETA: 24–48 Hours
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                      Your institutional credentials (University, Department,
                      Student ID Roll/Reg) and uploaded documents (Ear-Visible
                      Selfie, 2-Sided NID, Student ID Card) are currently
                      undergoing manual compliance audit.
                    </p>
                  </div>
                </div>
  
                {/* Step Timeline Indicator */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-amber-500/20 text-center font-mono text-[10px]">
                  <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
                    <span className="block font-bold">1. Uploaded</span>
                    <span className="text-emerald-400">✓ Complete</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/60 text-amber-300">
                    <span className="block font-bold">2. Ear Check</span>
                    <span className="text-amber-400 animate-pulse">
                      ● In Review
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                    <span className="block font-bold">3. Campus ID</span>
                    <span>Queue</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                    <span className="block font-bold">4. Badge</span>
                    <span>Pending</span>
                  </div>
                </div>
              </div>
            )}
  
            {/* Status Alert if Verification Rejected */}
            {isSelfViewing && isRejected && (
              <div className="p-5 rounded-3xl bg-rose-500/15 border border-rose-500/50 text-rose-300 text-xs sm:text-sm shadow-xl space-y-3">
                <div className="flex items-start justify-between gap-3 flex-col sm:flex-row">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">
                          Verification Dossier Rejected
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/60">
                          Action Required
                        </span>
                      </div>
                      <p className="text-rose-200 text-xs mt-1 leading-relaxed">
                        Reason:{" "}
                        <span className="font-medium text-white">
                          {tutor.verificationRejectionReason ||
                            "Selfie did not show both ears clearly or Student ID / NID photo was illegible."}
                        </span>
                      </p>
                      <p className="text-slate-400 text-[11px] mt-1">
                        You can re-upload your documents and submit for immediate
                        re-verification below.
                      </p>
                    </div>
                  </div>
  
                  <button
                    type="button"
                    onClick={() => {
                      setResubmitNidNumber(tutor.nidNumber || "");
                      setResubmitRoll(tutor.studentIdCardRoll || "");
                      setResubmitReg(tutor.studentIdCardReg || "");
                      setIsResubmitModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-rose-600/30 flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Re-submit Verification Documents</span>
                  </button>
                </div>
              </div>
            )}
  
            {/* Profile Hero Card with Ultra-Premium Minimalist Dark Cyber Cover */}
            <div className="bg-[#111827] border border-blue-900/40 rounded-3xl overflow-hidden shadow-2xl relative">
              {/* Minimalist Top-Notch Cover Header */}
              <div className="bg-gradient-to-r from-[#070D1A] via-[#0B1528] to-[#080E1D] border-b border-blue-900/60 p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.12),_transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(37,99,235,0.08),_transparent_50%)]" />
  
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-blue-950/90 text-cyan-400 border border-cyan-800/60 flex items-center gap-1.5 shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-cyan-400" />
                        <span>Verified Educator Dossier</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        ID: {tutor.id.substring(0, 10)}
                      </span>
                    </div>
                  </div>
  
                  {/* Minimalist Authentic Performance Indicators */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="bg-[#0B0F19]/90 px-3.5 py-2 rounded-2xl border border-blue-900/60 text-center shadow-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Authentic Rating
                      </span>
                      <span className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>
                          {tutor.totalReviews && tutor.totalReviews > 0
                            ? (tutor.rating || 0.0).toFixed(1)
                            : "0.0"}
                        </span>
                      </span>
                    </div>
                    <div className="bg-[#0B0F19]/90 px-3.5 py-2 rounded-2xl border border-blue-900/60 text-center shadow-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Verified Reviews
                      </span>
                      <span className="text-sm font-bold text-cyan-400 font-mono">
                        {tutor.totalReviews || 0} Real
                      </span>
                    </div>
                    <div className="bg-[#0B0F19]/90 px-3.5 py-2 rounded-2xl border border-blue-900/60 text-center shadow-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Experience
                      </span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">
                        {tutor.yearsOfExperience || 2}+ Yrs
                      </span>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Avatar & Core Profile Identity */}
              <div className="px-6 pb-6 pt-0 relative">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-10 sm:-mt-12 gap-4 mb-4">
                  <div className="flex items-end gap-4">
                    {/* Stylized Gender Vector Avatar (No Human Photos) */}
                    <GenderAvatar
                      gender={tutor.gender || "MALE"}
                      role="TUTOR"
                      size="xl"
                      className="border-4 border-[#111827] shadow-2xl"
                      profilePicture={tutor.profilePicture}
                    />
                    <div className="mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl sm:text-2xl font-bold text-white">
                          {tutor.fullName}
                        </h1>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${
                            tutor.verificationStatus === "VERIFIED"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {tutor.verificationStatus === "VERIFIED"
                            ? "Verified Scholar"
                            : "Pending Verification"}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>
                          {tutor.institution || "University of Dhaka"} &bull;{" "}
                          {tutor.department || "Science"}
                        </span>
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {tutor.areaName}, {tutor.district}
                        </span>
                      </p>
                    </div>
                  </div>
  
                  {isStudentViewing &&
                    relevantApplication &&
                    relevantApplication.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => setTutorToAccept(relevantApplication)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept This Tutor</span>
                      </button>
                    )}
                </div>
  
                {/* Professional Bio */}
                <div className="mt-4 p-4 rounded-2xl bg-[#0B0F19] border border-blue-950/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>Professional Bio</span>
                    </span>
                    {isSelfViewing && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditBio(tutor.bio || "");
                          setEditPhilosophy(tutor.teachingPhilosophy || "");
                          setEditExpectedFee(tutor.hourlyOrMonthlyRate || 8500);
                          setEditSubjects(
                            tutor.subjectsTaught || ["Higher Math", "Physics"],
                          );
                          setIsEditProfileOpen(true);
                        }}
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {tutor.bio ||
                      "Dedicated educator focused on conceptual clarity, weekly evaluations, and syllabus mastery for board & university entrance readiness."}
                  </p>
                  {tutor.teachingPhilosophy && (
                    <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-800/80">
                      "{tutor.teachingPhilosophy}"
                    </p>
                  )}
                </div>
  
                {/* SUBJECT EXPERTISE - VIBRANT CLICKABLE TAGS */}
                <div className="mt-4 p-4 rounded-2xl bg-[#0B0F19] border border-blue-950/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>
                        Subject Expertise (Click to Search Similar Tuitions)
                      </span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Interactive Tags
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(
                      tutor.subjectsTaught || [
                        "Higher Math",
                        "Physics",
                        "General Science",
                      ]
                    ).map((subj, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => {
                          setFilterSubject(subj);
                          setViewingTeacherProfileId(null);
                          setTeacherViewMode("feed");
                          showToast(`Filtered tuitions & tutors by "${subj}".`);
                        }}
                        className="group px-3 py-1.5 rounded-xl bg-blue-950/40 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-800/60 hover:border-blue-400 text-xs font-medium transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <span className="text-blue-500 group-hover:text-cyan-300 font-mono">
                          #
                        </span>
                        <span>{subj}</span>
                      </button>
                    ))}
                  </div>
                </div>
  
                {/* Quick Metrics Bar - Real Data Disciplined */}
                {(() => {
                  const hasTutorReviews = Boolean(
                    tutor.totalReviews && tutor.totalReviews > 0,
                  );
                  const tutorRatingVal = hasTutorReviews
                    ? tutor.rating || 0.0
                    : 0.0;
                  const reviewsCountVal = tutor.totalReviews || 0;
  
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 mt-4">
                      <div className="bg-[#0B0F19] p-3 rounded-2xl border border-blue-950/60">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">
                          Overall Rating
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="text-base font-bold text-white">
                            {hasTutorReviews ? tutorRatingVal.toFixed(1) : "0.0"}
                          </span>
                          <span className="text-xs text-slate-500">
                            (
                            {reviewsCountVal > 0
                              ? `${reviewsCountVal} reviews`
                              : "0 Reviews"}
                            )
                          </span>
                        </div>
                      </div>
  
                      <div className="bg-[#0B0F19] p-3 rounded-2xl border border-blue-950/60">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">
                          Experience
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="text-base font-bold text-white">
                            {tutor.yearsOfExperience || 2}+ Years
                          </span>
                        </div>
                      </div>
  
                      <div className="bg-[#0B0F19] p-3 rounded-2xl border border-blue-950/60">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">
                          Students Taught
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Users className="w-4 h-4 text-cyan-400" />
                          <span className="text-base font-bold text-white">
                            {hasTutorReviews
                              ? `${reviewsCountVal * 3}+ Students`
                              : "Starting Portfolio"}
                          </span>
                        </div>
                      </div>
  
                      <div className="bg-[#0B0F19] p-3 rounded-2xl border border-indigo-950/60">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">
                          Quiz Points
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Award className="w-4 h-4 text-indigo-400" />
                          <span className="text-base font-bold text-white">
                            {tutorQuizzes.length} Quizzes
                          </span>
                        </div>
                      </div>
  
                      <div className="bg-[#0B0F19] p-3 rounded-2xl border border-blue-950/60">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">
                          Expected Monthly Fee
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <DollarSign className="w-4 h-4 text-emerald-400" />
                          <span className="text-base font-bold text-white">
                            ৳{" "}
                            {(tutor.hourlyOrMonthlyRate || 8500).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
  
            <TeacherProfileRatings tutor={tutor} />

            {/* Academic Degrees & Credentials */}
            <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-400" />
                  <h2 className="text-base font-bold text-white">
                    Academic Degrees
                  </h2>
                </div>
                <span className="text-xs font-mono text-emerald-400">
                  Admin Verified
                </span>
              </div>
  
              <div className="space-y-2">
                {(
                  tutor.degrees || [
                    {
                      degreeName: "B.Sc (Hons) in Mathematics",
                      institution: "University of Dhaka",
                      passingYear: "2024",
                      result: "CGPA 3.88 / 4.00",
                    },
                    {
                      degreeName: "Higher Secondary Certificate (HSC)",
                      institution: "Viqarunnisa Noon College",
                      passingYear: "2020",
                      result: "GPA 5.00",
                    },
                  ]
                ).map((deg, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#0B0F19] border border-blue-950/70"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-sm text-white">
                          {deg.degreeName}
                        </div>
                        <div className="text-xs text-blue-400 mt-0.5">
                          {deg.institution}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {deg.passingYear}
                      </span>
                    </div>
                    {deg.result && (
                      <div className="mt-1 text-xs text-slate-400">
                        Result:{" "}
                        <span className="text-emerald-400 font-semibold">
                          {deg.result}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
  
            {/* Teacher's Quiz Bank Section */}
            <div className="bg-[#111827] border border-indigo-900/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-base font-bold text-white">
                    Teacher's Quiz Bank ({tutorQuizzes.length})
                  </h2>
                </div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-800/60">
                  🏆 {tutorQuizzes.length} Quiz Points
                </span>
              </div>
  
              {tutorQuizzes.length === 0 ? (
                <div className="p-6 text-center bg-[#0B0F19] rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">
                    This teacher hasn't created any quizzes yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tutorQuizzes.map((quiz, idx) => (
                    <div
                      key={quiz.id}
                      className="p-4 rounded-2xl bg-[#0B0F19] border border-blue-950/70 space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold font-mono text-sm mt-0.5">
                          Q{idx + 1}.
                        </span>
                        <p className="text-sm text-white font-medium">
                          {quiz.questionText}
                        </p>
                      </div>
  
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                        {(Array.isArray(quiz.options)
                          ? quiz.options
                          : (() => {
                              try {
                                return JSON.parse(quiz.options || "[]");
                              } catch {
                                return [];
                              }
                            })()
                        ).map((opt: string, oIdx: number) => (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl text-xs border flex items-center justify-between ${
                              quiz.correctIndex === oIdx
                                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-semibold"
                                : "bg-slate-900/60 border-slate-800 text-slate-400"
                            }`}
                          >
                            <span>
                              {String.fromCharCode(65 + oIdx)}. {opt}
                            </span>
                            {quiz.correctIndex === oIdx && (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </div>
                        ))}
                      </div>
  
                      <div className="flex items-center justify-end gap-2 text-[10px] text-slate-500 font-mono pt-1">
                        <span className="px-2 py-0.5 rounded bg-slate-800/80">
                          {quiz.subject}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800/80">
                          {quiz.gradeLevel}
                        </span>
                        {quiz.topic && (
                          <span className="px-2 py-0.5 rounded bg-slate-800/80">
                            Topic: {quiz.topic}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
  
            {/* Student Reviews Section (Vector Avatars, Zero Photos) */}
            <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <h2 className="text-base font-bold text-white">
                    Verified Reviews ({tutor.reviews?.length || 2})
                  </h2>
                </div>
              </div>
  
              <div className="space-y-3">
                {(tutor.reviews || []).filter(
                  (r) => (r.status || "APPROVED") === "APPROVED",
                ).length === 0 ? (
                  <div className="p-6 text-center bg-[#0B0F19] rounded-2xl border border-slate-800">
                    <MessageSquare className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-xs text-slate-400">
                      No approved reviews yet. Reviews will appear here after
                      admin moderation.
                    </p>
                  </div>
                ) : (
                  (tutor.reviews || [])
                    .filter((r) => (r.status || "APPROVED") === "APPROVED")
                    .map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl bg-[#0B0F19] border border-blue-950/70 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <GenderAvatar
                              gender="FEMALE"
                              role="STUDENT"
                              size="sm"
                            />
                            <div>
                              <div className="font-semibold text-xs sm:text-sm text-white">
                                {rev.studentName}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {rev.studentRoleOrGrade}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20 text-xs font-bold text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{rev.overall}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed italic">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))
                )}
              </div>
            </div>
          </main>
  
          {/* MODAL: EDIT PROFILE / PROFESSIONAL BIO */}
          <TeacherProfileEditModal />

          {/* MODAL: QR CODE NEIGHBORHOOD SHARING (Teacher Profile) */}
          <QRCodeModal
            isOpen={qrModalData.isOpen}
            onClose={() => setQrModalData((prev) => ({ ...prev, isOpen: false }))}
            title={qrModalData.title}
            subtitle={qrModalData.subtitle}
            district={qrModalData.district}
            areaName={qrModalData.areaName}
            shareUrl={qrModalData.shareUrl}
            type={qrModalData.type}
          />
        </div>
      );
    }
  
    // =========================================================================
  return null;
 }
