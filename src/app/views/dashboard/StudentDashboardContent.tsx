import { MapPin, CheckCircle2, Unlock, Phone, Download, Users, PlusCircle, Check, BookOpen, Star, Clock, Filter, CheckCircle, GraduationCap, Info, Eye, User as UserIcon, CheckSquare, Sun } from "lucide-react";
import { Area } from "recharts";
import { GenderAvatar } from "../../../components/GenderAvatar";
import { EmptyInboxIllustration } from "../../../components/EmptyStateIllustrations";
import { PostCountdown } from "../../../components/PostCountdown";
import { getTutorRatingSummary } from "../../../lib/ratings";
import { useAppContext } from "../../AppContext";

export function StudentDashboardContent() {
  const {
    currentUser,
    setSelectedTutorForDetailModal,
    setSelectedApplicationForModal,
    downloadingPostId,
    allUsers,
    tuitionPosts,
    applications,
    studentPostStatusFilter,
    setStudentPostStatusFilter,
    setIsCreatePostOpen,
    setIsRatingModalOpen,
    setRatingTutorId,
    setRatingApplication,
    setRatingPunctuality,
    setRatingSubjectMastery,
    setRatingTeachingStyle,
    studentMyPosts,
    filteredStudentPosts,
    studentReceivedApplications,
    myAcceptedApplications,
    acceptTutorDirectly,
    handleMarkTutorFound,
    handleDownloadCard,
    handleOpenTeacherProfile,
    handleOpenProfileModal,
  } = useAppContext();
  if (!currentUser || currentUser.role !== "STUDENT") return null;
  return (
    <>
      <div className="space-y-6">
                    {/* Student Top Banner */}
                    <div className="bg-gradient-to-r from-emerald-50 via-emerald-50 to-emerald-50 border border-emerald-700/50 rounded-3xl p-5 sm:p-7 shadow-xl shadow-emerald-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono border border-emerald-200">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>
                              Your Location: {currentUser.areaName || "Area"},{" "}
                              {currentUser.district}
                            </span>
                          </div>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                          Welcome, {currentUser.fullName.split(" ")[0]}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                          Find a trusted teacher for your family. Post your learning
                          needs, compare verified teachers, and choose the right fit.
                        </p>
                      </div>
        
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                          type="button"
                          onClick={handleOpenProfileModal}
                          className="px-4 py-3 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-2xl text-xs sm:text-sm transition-all border border-slate-300 flex items-center justify-center gap-2 shrink-0 shadow-md"
                        >
                          <UserIcon className="w-4 h-4 text-emerald-700" />
                          <span>My profile</span>
                        </button>
        
                        <button
                          type="button"
                          onClick={() => setIsCreatePostOpen(true)}
                          className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 shrink-0"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Find a teacher</span>
                        </button>
                      </div>
                    </div>
        
                    {/* Applicant Inbox Section */}
                    <div className="bg-white border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-700 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <h2 className="text-base sm:text-lg font-bold text-white">
                              Applicant Inbox
                            </h2>
                            <p className="text-xs text-slate-500">
                              Verified teachers who applied to your tuition posts
                            </p>
                          </div>
                        </div>
                      </div>
        
                      {studentReceivedApplications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 space-y-3">
                          <EmptyInboxIllustration className="w-36 h-36 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-slate-600">
                            No applications received yet.
                          </p>
                          <p className="text-xs text-slate-500 max-w-md mx-auto">
                            Once verified neighborhood teachers apply to your tuition
                            posts, their credentials and proposals will appear here for
                            your review.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {studentReceivedApplications.map((app) => {
                            const post = tuitionPosts.find((p) => p.id === app.postId);
                            const isAccepted = app.status === "ACCEPTED";
                            const tutorUser = allUsers.find(
                              (u) => u.id === app.tutorId,
                            );
                            const tutorRating = getTutorRatingSummary(tutorUser);
        
                            return (
                              <div
                                key={app.id}
                                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                                  isAccepted
                                    ? "bg-emerald-50 border-emerald-500/50 shadow-lg shadow-emerald-950/40"
                                    : "bg-white border-emerald-200 hover:border-emerald-200"
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-start gap-3">
                                    <GenderAvatar
                                      gender={tutorUser?.gender || "MALE"}
                                      role="TUTOR"
                                      size="md"
                                      profilePicture={tutorUser?.profilePicture}
                                    />
                                    <div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span
                                          onClick={() => {
                                            const tutorObj = allUsers.find(
                                              (u) => u.id === app.tutorId,
                                            );
                                            if (tutorObj) {
                                              setSelectedTutorForDetailModal(tutorObj);
                                              setSelectedApplicationForModal(app);
                                            } else {
                                              handleOpenTeacherProfile(app.tutorId);
                                            }
                                          }}
                                          className="font-bold text-sm sm:text-base text-white hover:text-emerald-700 cursor-pointer underline decoration-emerald-500/40 decoration-dotted hover:decoration-solid transition-colors inline-flex items-center gap-1"
                                          title="Click to view detailed qualifications, degrees, experience & ratings"
                                        >
                                          <span>{app.tutorName}</span>
                                          <Info className="w-3.5 h-3.5 text-emerald-700" />
                                        </span>
                                        <span
                                          className={`flex items-center gap-0.5 text-xs ${
                                            tutorRating.average > 0
                                              ? "text-amber-700"
                                              : "text-slate-500"
                                          }`}
                                          title={`${tutorRating.reviewCount} approved reviews`}
                                        >
                                          <Star
                                            className={`h-3 w-3 ${
                                              tutorRating.average > 0
                                                ? "fill-amber-400"
                                                : ""
                                            }`}
                                          />
                                          <span>
                                            {tutorRating.average.toFixed(1)} (
                                            {tutorRating.reviewCount})
                                          </span>
                                        </span>
                                        <span className="text-xs text-slate-500">
                                          &bull; {app.tutorDistanceKm || 0.8} km away
                                        </span>
                                      </div>
                                      <p className="text-xs text-emerald-700 mt-0.5">
                                        {app.tutorQualifications}
                                      </p>
                                      {tutorUser?.institution?.trim() && (
                                        <span className="mt-1 inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                                          <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                                          <span className="truncate">
                                            {tutorUser.institution}
                                          </span>
                                        </span>
                                      )}
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        Applying for:{" "}
                                        <span className="text-slate-600 font-medium">
                                          {post?.title || "Tuition Post"}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
        
                                  <div className="flex items-center gap-2 self-start sm:self-center">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleOpenTeacherProfile(app.tutorId)
                                      }
                                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium border border-slate-300 transition-colors flex items-center gap-1"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-emerald-700" />
                                      <span>View Full Profile</span>
                                    </button>
        
                                    {!isAccepted && app.status !== "REJECTED" && (
                                      <button
                                        type="button"
                                        onClick={() => acceptTutorDirectly(app)}
                                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Accept Tutor</span>
                                      </button>
                                    )}
        
                                    {isAccepted &&
                                      (() => {
                                        const acceptedAtIso =
                                          app.acceptedAt ||
                                          app.statusUpdatedAt ||
                                          app.createdAt;
                                        const daysSince = Math.floor(
                                          (Date.now() -
                                            new Date(acceptedAtIso).getTime()) /
                                            (1000 * 60 * 60 * 24),
                                        );
                                        const tutorUser = allUsers.find(
                                          (u) => u.id === app.tutorId,
                                        );
                                        const myReview = (
                                          tutorUser?.reviews || []
                                        ).find((r) => r.applicationId === app.id);
                                        const canReview = daysSince >= 30 && !myReview;
        
                                        if (myReview) {
                                          const colorMap = {
                                            PENDING:
                                              "bg-amber-500/20 text-amber-700 border-amber-500/30",
                                            APPROVED:
                                              "bg-emerald-500/20 text-emerald-700 border-emerald-500/30",
                                            REJECTED:
                                              "bg-rose-500/20 text-rose-700 border-rose-500/30",
                                          };
                                          const labelMap = {
                                            PENDING: "Review Pending Approval",
                                            APPROVED: "Review Approved ✓",
                                            REJECTED: "Review Rejected",
                                          };
                                          return (
                                            <span
                                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 ${colorMap[myReview.status || "APPROVED"]}`}
                                            >
                                              <Star className="w-3.5 h-3.5" />
                                              <span>
                                                {
                                                  labelMap[
                                                    myReview.status || "APPROVED"
                                                  ]
                                                }
                                              </span>
                                            </span>
                                          );
                                        }
        
                                        if (canReview) {
                                          return (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setRatingApplication(app);
                                                setRatingTutorId(app.tutorId);
                                                setRatingPunctuality(0);
                                                setRatingSubjectMastery(0);
                                                setRatingTeachingStyle(0);
                                                setIsRatingModalOpen(true);
                                              }}
                                              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 text-xs font-semibold border border-amber-500/40 flex items-center gap-1 transition-colors"
                                            >
                                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                                              <span>Rate Tutor</span>
                                            </button>
                                          );
                                        }
        
                                        return (
                                          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold border border-slate-300 flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Review in {30 - daysSince}d</span>
                                          </span>
                                        );
                                      })()}
                                  </div>
                                </div>
        
                                {/* Proposal Details */}
                                <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                                  <div>
                                    <span className="text-slate-500">
                                      Proposed Fee:
                                    </span>{" "}
                                    <span className="font-semibold text-emerald-700">
                                      ৳ {app.proposedSalary} / month
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500">
                                      Available Schedule:
                                    </span>{" "}
                                    <span className="text-slate-600">
                                      {app.availableSchedule}
                                    </span>
                                  </div>
                                </div>
        
                                {/* Unlocked Contact Details on Acceptance */}
                                {isAccepted && (
                                  <div className="mt-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-500/40 text-xs space-y-1.5">
                                    <div className="font-semibold text-emerald-700 flex items-center gap-1.5">
                                      <Unlock className="w-4 h-4 text-emerald-700" />
                                      <span>Mutual Contact Details Unlocked!</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 pt-1">
                                      <div>
                                        <span className="text-slate-500">
                                          Tutor Phone:
                                        </span>{" "}
                                        <span className="font-mono font-bold text-white">
                                          {app.tutorPhone || "+880 1712-345678"}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-slate-500">
                                          Tutor WhatsApp:
                                        </span>{" "}
                                        <span className="font-mono font-bold text-emerald-700">
                                          {app.tutorWhatsapp || app.tutorPhone}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
        
                    {/* 🆕 My Hired Tutors — Permanent Review Access (survives post deletion) */}
                    {myAcceptedApplications.length > 0 && (
                      <div className="bg-white border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-700 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                              <h2 className="text-base sm:text-lg font-bold text-white">
                                My Hired Tutors ({myAcceptedApplications.length})
                              </h2>
                              <p className="text-xs text-emerald-700">
                                ✅ Review unlocked after 30 days — never expires
                              </p>
                            </div>
                          </div>
                        </div>
        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {myAcceptedApplications.map((app) => {
                            const tutorUser = allUsers.find(
                              (u) => u.id === app.tutorId,
                            );
                            const post = tuitionPosts.find((p) => p.id === app.postId);
                            const acceptedAtIso =
                              app.acceptedAt || app.statusUpdatedAt || app.createdAt;
                            const daysSince = Math.floor(
                              (Date.now() - new Date(acceptedAtIso).getTime()) /
                                (1000 * 60 * 60 * 24),
                            );
                            const myReview = (tutorUser?.reviews || []).find(
                              (r) => r.applicationId === app.id,
                            );
                            const canReview = daysSince >= 30 && !myReview;
        
                            return (
                              <div
                                key={app.id}
                                className="p-4 rounded-2xl bg-white border border-emerald-500/40 space-y-3"
                              >
                                <div className="flex items-start gap-3">
                                  <GenderAvatar
                                    gender={tutorUser?.gender || "MALE"}
                                    role="TUTOR"
                                    size="md"
                                    profilePicture={tutorUser?.profilePicture}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm text-white truncate">
                                      {app.tutorName}
                                    </div>
                                    <div className="text-[11px] text-emerald-700 truncate">
                                      {tutorUser?.institution ||
                                        app.tutorInstitution ||
                                        "—"}
                                    </div>
                                    <div className="text-[10px] text-emerald-700 font-mono mt-0.5 truncate">
                                      📞 {app.tutorPhone || tutorUser?.phone}
                                    </div>
                                    <div className="text-[10px] text-emerald-700 font-mono truncate">
                                      💬{" "}
                                      {app.tutorWhatsapp ||
                                        tutorUser?.whatsapp ||
                                        tutorUser?.phone}
                                    </div>
                                  </div>
                                </div>
        
                                <div className="p-2 rounded-lg bg-white border border-slate-200 text-xs space-y-0.5">
                                  <div className="text-slate-500">
                                    <span className="font-mono text-[10px]">
                                      Matched:
                                    </span>{" "}
                                    {new Date(acceptedAtIso).toLocaleDateString()}
                                  </div>
                                  {post ? (
                                    <div className="text-slate-600 truncate">
                                      <span className="font-mono text-[10px]">
                                        Post:
                                      </span>{" "}
                                      {post.title}
                                    </div>
                                  ) : (
                                    <div className="text-slate-500 italic text-[10px]">
                                      📦 Post archived (30-day auto-cleanup)
                                    </div>
                                  )}
                                  <div className="text-emerald-700 font-mono text-[10px]">
                                    ৳ {app.proposedSalary.toLocaleString()}/mo
                                  </div>
                                </div>
        
                                {myReview ? (
                                  <span
                                    className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 justify-center ${
                                      myReview.status === "APPROVED"
                                        ? "bg-emerald-500/20 text-emerald-700 border-emerald-500/30"
                                        : myReview.status === "REJECTED"
                                          ? "bg-rose-500/20 text-rose-700 border-rose-500/30"
                                          : "bg-amber-500/20 text-amber-700 border-amber-500/30"
                                    }`}
                                  >
                                    <Star className="w-3.5 h-3.5" />
                                    <span>
                                      {myReview.status === "APPROVED"
                                        ? "✅ Review Approved"
                                        : myReview.status === "REJECTED"
                                          ? "Review Rejected"
                                          : "⏳ Review Pending Approval"}
                                    </span>
                                  </span>
                                ) : canReview ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRatingApplication(app);
                                      setRatingTutorId(app.tutorId);
                                      setRatingPunctuality(0);
                                      setRatingSubjectMastery(0);
                                      setRatingTeachingStyle(0);
                                      setIsRatingModalOpen(true);
                                    }}
                                    className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 text-xs font-semibold border border-amber-500/40 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                                  >
                                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                                    <span>⭐ Rate This Tutor</span>
                                  </button>
                                ) : (
                                  <span className="px-3 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold border border-slate-300 flex items-center justify-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>
                                      Review unlocks in {30 - daysSince} day
                                      {30 - daysSince !== 1 ? "s" : ""}
                                    </span>
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
        
                    {/* Student's My Posts List with Status Filter & Full Tracking */}
                    <div className="bg-white border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-emerald-700" />
                          <h2 className="text-base sm:text-lg font-bold text-white">
                            My Tuition Posts ({studentMyPosts.length})
                          </h2>
                        </div>
        
                        {/* Status-Based Filter Chips */}
                        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-emerald-200 overflow-x-auto scrollbar-none">
                          {(["ALL", "OPEN", "PENDING", "MATCHED"] as const).map(
                            (status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => setStudentPostStatusFilter(status)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                  studentPostStatusFilter === status
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-900"
                                }`}
                              >
                                {status === "ALL"
                                  ? `All (${studentMyPosts.length})`
                                  : status === "OPEN"
                                    ? "Active / Live"
                                    : status === "PENDING"
                                      ? "Under Review"
                                      : "Matched"}
                              </button>
                            ),
                          )}
                        </div>
                      </div>
        
                      {filteredStudentPosts.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 space-y-2">
                          <BookOpen className="w-8 h-8 mx-auto text-slate-600" />
                          <p className="text-sm font-semibold text-slate-600">
                            {studentMyPosts.length === 0
                              ? "You haven't posted any tuition needs yet."
                              : `No tuition posts found in "${studentPostStatusFilter}".`}
                          </p>
                          <p className="text-xs text-slate-500">
                            Click "Post Tuition Need" above to connect with verified
                            neighborhood tutors.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredStudentPosts.map((post) => {
                            const isMatched =
                              post.status === "MATCHED" || post.isFoundTutor;
                            const isPendingApproval = post.approvalStatus === "PENDING";
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
        
                            const dayLabels: Record<string, string> = {
                              SAT: "Sat",
                              SUN: "Sun",
                              MON: "Mon",
                              TUE: "Tue",
                              WED: "Wed",
                              THU: "Thu",
                              FRI: "Fri",
                            };
        
                            return (
                              <div
                                key={post.id}
                                className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-3"
                              >
                                {/* Header with countdown */}
                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold text-sm sm:text-base text-white">
                                        {post.title}
                                      </span>
                                      <PostCountdown createdAt={post.createdAt} />
                                    </div>
                                    <div className="text-xs text-emerald-700 mt-0.5">
                                      {post.subject} • {post.gradeLevel}
                                    </div>
                                  </div>
                                  <div className="shrink-0">
                                    {isPendingApproval ? (
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 border border-amber-500/30 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Under Review
                                      </span>
                                    ) : isMatched ? (
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Matched
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Live
                                      </span>
                                    )}
                                  </div>
                                </div>
        
                                {/* Details grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-center">
                                    <div className="text-[9px] text-slate-500 font-mono uppercase">
                                      Budget
                                    </div>
                                    <div className="text-[11px] font-bold text-emerald-700">
                                      ৳ {post.salaryBudget.toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-center">
                                    <div className="text-[9px] text-slate-500 font-mono uppercase">
                                      Curriculum
                                    </div>
                                    <div className="text-[11px] font-semibold text-white truncate">
                                      {post.curriculum}
                                    </div>
                                  </div>
                                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-center">
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
                                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-center">
                                    <div className="text-[9px] text-slate-500 font-mono uppercase">
                                      Days/Wk
                                    </div>
                                    <div className="text-[11px] font-semibold text-white">
                                      {post.daysPerWeek}
                                    </div>
                                  </div>
                                </div>
        
                                {/* Address */}
                                <div className="p-2 rounded-lg bg-white border border-slate-200 text-xs">
                                  <div className="text-[9px] text-slate-500 font-mono uppercase">
                                    Your Address
                                  </div>
                                  <div className="text-white mt-0.5">
                                    {post.exactAddress ||
                                      `${post.areaName}, ${post.district}`}
                                  </div>
                                </div>
        
                                {/* Weekly schedule */}
                                {post.weeklySchedule &&
                                  post.weeklySchedule.length > 0 && (
                                    <div className="p-2 rounded-lg bg-white border border-emerald-200">
                                      <div className="text-[9px] text-emerald-700 font-mono uppercase mb-1">
                                        Weekly Schedule
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {post.weeklySchedule.map((slot, i) => (
                                          <span
                                            key={i}
                                            className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono"
                                          >
                                            {dayLabels[slot.day] || slot.day}{" "}
                                            {slot.startTime}–{slot.endTime}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
        
                                {post.specialRequirements && (
                                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-xs">
                                    <div className="text-[9px] text-slate-500 font-mono uppercase">
                                      Special Requirements
                                    </div>
                                    <p className="text-slate-600 italic mt-0.5">
                                      {post.specialRequirements}
                                    </p>
                                  </div>
                                )}
        
                                {/* Accepted tutor */}
                                {acceptedApp && acceptedTutor && (
                                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-500/50">
                                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-mono uppercase mb-1">
                                      <CheckCircle className="w-3.5 h-3.5" /> Accepted
                                      Tutor — Contact Unlocked
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
                                        <div className="text-[10px] text-emerald-700 font-mono truncate">
                                          📞{" "}
                                          {acceptedApp.tutorPhone ||
                                            acceptedTutor.phone}
                                        </div>
                                        <div className="text-[10px] text-emerald-700 font-mono truncate">
                                          💬 WhatsApp:{" "}
                                          {acceptedApp.tutorWhatsapp ||
                                            acceptedTutor.whatsapp ||
                                            acceptedTutor.phone}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-[10px] text-emerald-700 mt-1">
                                      Matched on{" "}
                                      {new Date(
                                        acceptedApp.acceptedAt || acceptedApp.createdAt,
                                      ).toLocaleString()}
                                    </div>
                                  </div>
                                )}
        
                                {/* Applicants list */}
                                {postApps.length > 0 ? (
                                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="text-[10px] text-slate-500 font-mono uppercase flex items-center gap-1">
                                        <Users className="w-3 h-3 text-emerald-700" />{" "}
                                        Applicants ({postApps.length})
                                      </div>
                                      <div className="text-[9px] font-mono text-slate-500">
                                        {pendingApps.length} pending •{" "}
                                        {acceptedApp ? 1 : 0} accepted •{" "}
                                        {rejectedApps.length} rejected
                                      </div>
                                    </div>
                                    <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
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
                                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                              : app.status === "REJECTED"
                                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                                : "bg-amber-50 text-amber-700 border-amber-200";
                                          return (
                                            <div
                                              key={app.id}
                                              className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] flex items-start gap-2"
                                            >
                                              <GenderAvatar
                                                gender={appTutor?.gender || "MALE"}
                                                role="TUTOR"
                                                size="xs"
                                                profilePicture={
                                                  appTutor?.profilePicture
                                                }
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
                                                <div className="text-[10px] text-slate-500 truncate">
                                                  {appTutor?.institution ||
                                                    app.tutorInstitution ||
                                                    "—"}{" "}
                                                  • {appTutor?.areaName || "—"}
                                                </div>
                                                <div className="text-[10px] text-emerald-700 font-mono">
                                                  ৳{" "}
                                                  {app.proposedSalary.toLocaleString()}
                                                  /mo
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
                                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-center text-[11px] text-slate-500 italic">
                                    No applicants yet. Verified tutors will appear here
                                    once they apply.
                                  </div>
                                )}
        
                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs gap-2 flex-wrap">
                                  <span className="text-slate-500">
                                    {postApps.length} applicant(s)
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    {/* 🆕 Download Card Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadCard(post)}
                                      disabled={downloadingPostId === post.id}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 disabled:opacity-50 shadow-md shadow-emerald-600/20"
                                      title="Download beautiful PNG card"
                                    >
                                      <Download
                                        className={`w-3 h-3 ${downloadingPostId === post.id ? "animate-pulse" : ""}`}
                                      />
                                      <span>
                                        {downloadingPostId === post.id ? "..." : "Card"}
                                      </span>
                                    </button>
                                    {!isMatched && (
                                      <button
                                        type="button"
                                        onClick={() => handleMarkTutorFound(post.id)}
                                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-[11px] font-medium border border-slate-300 transition-colors flex items-center gap-1"
                                      >
                                        <CheckSquare className="w-3 h-3 text-emerald-700" />
                                        <span>Mark Tutor Found</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
    </>
  );
}
