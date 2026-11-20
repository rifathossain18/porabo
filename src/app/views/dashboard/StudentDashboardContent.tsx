import { useMemo } from "react";
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

  const usersById = useMemo(
    () => new Map(allUsers.map((user) => [user.id, user] as const)),
    [allUsers],
  );
  const postsById = useMemo(
    () => new Map(tuitionPosts.map((post) => [post.id, post] as const)),
    [tuitionPosts],
  );
  const applicantRatingsByTutorId = useMemo(() => {
    const ratings = new Map<
      string,
      ReturnType<typeof getTutorRatingSummary>
    >();
    studentReceivedApplications.forEach((application) => {
      if (!ratings.has(application.tutorId)) {
        ratings.set(
          application.tutorId,
          getTutorRatingSummary(usersById.get(application.tutorId)),
        );
      }
    });
    return ratings;
  }, [studentReceivedApplications, usersById]);
  const inboxSummary = useMemo(
    () => ({
      total: studentReceivedApplications.length,
      pending: studentReceivedApplications.filter(
        (application) => application.status === "PENDING",
      ).length,
      posts: new Set(
        studentReceivedApplications.map((application) => application.postId),
      ).size,
    }),
    [studentReceivedApplications],
  );
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
                    <div className="overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-[0_12px_36px_-20px_rgba(15,23,42,0.28)]">
                      <div className="flex flex-col gap-4 bg-gradient-to-r from-slate-950 via-blue-950 to-blue-900 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-inner">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
                              Applicant inbox
                            </h2>
                            <p className="mt-0.5 text-xs text-white/90">
                              {inboxSummary.posts} posts with applications to review
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <div className="rounded-2xl border border-white/10 bg-white/10 px-3.5 py-2 text-center">
                            <p className="text-lg font-bold leading-5 text-white">
                              {inboxSummary.total}
                            </p>
                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/90">
                              Applications
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/10 px-3.5 py-2 text-center">
                            <p className="text-lg font-bold leading-5 text-white">
                              {inboxSummary.pending}
                            </p>
                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/90">
                              Pending
                            </p>
                          </div>
                        </div>
                      </div>
        
                      {studentReceivedApplications.length === 0 ? (
                        <div className="space-y-3 p-8 text-center text-slate-500">
                          <EmptyInboxIllustration className="w-36 h-36 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-slate-600">
                            No applications received yet.
                          </p>
                          <p className="mx-auto max-w-md text-xs leading-5 text-slate-500">
                            When tutors apply to your tuition posts, their credentials
                            and proposals will appear here for your review.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 p-4 sm:p-5">
                          {studentReceivedApplications.map((app) => {
                            const post = postsById.get(app.postId);
                            const isAccepted = app.status === "ACCEPTED";
                            const isRejected = app.status === "REJECTED";
                            const isWithdrawn = app.status === "WITHDRAWN";
                            const tutorUser = usersById.get(app.tutorId);
                            const tutorRating =
                              applicantRatingsByTutorId.get(app.tutorId) ??
                              getTutorRatingSummary(tutorUser);
                            const statusStyle = isAccepted
                              ? {
                                  bar: "bg-emerald-500",
                                  badge:
                                    "border-emerald-200 bg-emerald-50 text-emerald-700",
                                  label: "Accepted",
                                }
                              : isRejected
                                ? {
                                    bar: "bg-rose-400",
                                    badge:
                                      "border-rose-200 bg-rose-50 text-rose-700",
                                    label: "Rejected",
                                  }
                                : isWithdrawn
                                  ? {
                                    bar: "bg-slate-300",
                                    badge:
                                      "border-slate-200 bg-slate-100 text-slate-600",
                                    label: "Withdrawn",
                                  }
                                  : {
                                    bar: "bg-amber-400",
                                    badge:
                                      "border-amber-200 bg-amber-50 text-amber-800",
                                    label: "Awaiting review",
                                  };
        
                            return (
                              <div
                                key={app.id}
                                className={`overflow-hidden rounded-3xl border shadow-sm transition-colors ${
                                  isAccepted
                                    ? "border-emerald-200 bg-emerald-50/50"
                                    : isRejected
                                      ? "border-slate-200 bg-slate-50/80"
                                      : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-md"
                                }`}
                              >
                                <div className={`h-1 w-full ${statusStyle.bar}`} />
                                <div className="p-4 sm:p-5">
                                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex min-w-0 items-start gap-3">
                                      <div className="shrink-0 rounded-2xl bg-white p-0.5 shadow-sm ring-1 ring-slate-200">
                                        <GenderAvatar
                                          gender={tutorUser?.gender || "MALE"}
                                          role="TUTOR"
                                          size="md"
                                          profilePicture={tutorUser?.profilePicture}
                                        />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (tutorUser) {
                                                setSelectedTutorForDetailModal(tutorUser);
                                                setSelectedApplicationForModal(app);
                                              } else {
                                                handleOpenTeacherProfile(app.tutorId);
                                              }
                                            }}
                                            className="inline-flex items-center gap-1 text-left text-sm font-bold text-slate-900 underline decoration-blue-300 decoration-dotted underline-offset-4 transition-colors hover:text-blue-700 hover:decoration-solid sm:text-base"
                                            title="View tutor qualifications, experience and ratings"
                                          >
                                            <span>{app.tutorName}</span>
                                            <Info className="h-3.5 w-3.5 text-blue-600" />
                                          </button>
                                          <span
                                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyle.badge}`}
                                          >
                                            {statusStyle.label}
                                          </span>
                                        </div>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                                          {tutorRating.reviewCount > 0 ? (
                                            <span
                                              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700"
                                              title={`${tutorRating.reviewCount} approved reviews`}
                                            >
                                              <Star className="h-3.5 w-3.5 fill-amber-400" />
                                              {tutorRating.average.toFixed(1)}
                                              <span className="font-normal text-slate-500">
                                                ({tutorRating.reviewCount} reviews)
                                              </span>
                                            </span>
                                          ) : (
                                            <span className="text-xs font-medium text-slate-500">
                                              New tutor
                                            </span>
                                          )}
                                          {typeof app.tutorDistanceKm === "number" &&
                                            Number.isFinite(app.tutorDistanceKm) && (
                                              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                                <MapPin className="h-3 w-3" />
                                                {app.tutorDistanceKm.toFixed(1)} km away
                                              </span>
                                            )}
                                        </div>
                                        {tutorUser?.institution?.trim() && (
                                          <span className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-800">
                                            <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate">
                                              {tutorUser.institution}
                                            </span>
                                          </span>
                                        )}
                                        {app.tutorQualifications?.trim() && (
                                          <p className="mt-2 text-xs leading-5 text-slate-600">
                                            {app.tutorQualifications}
                                          </p>
                                        )}
                                      </div>
                                    </div>
        
                                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleOpenTeacherProfile(app.tutorId)
                                      }
                                      className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                                      <span>View Full Profile</span>
                                    </button>
        
                                    {app.status === "PENDING" && (
                                      <button
                                        type="button"
                                        onClick={() => acceptTutorDirectly(app)}
                                        className="flex items-center gap-1 rounded-xl bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-900/20 transition-colors hover:bg-blue-800"
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
                                              className={`flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold ${colorMap[myReview.status || "APPROVED"]}`}
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
                                              className="flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100"
                                            >
                                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                                              <span>Rate Tutor</span>
                                            </button>
                                          );
                                        }
        
                                        return (
                                          <span className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Review in {30 - daysSince}d</span>
                                          </span>
                                        );
                                      })()}
                                  </div>
                                  </div>
        
                                {/* Proposal Details */}
                                <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
                                  <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-3.5 py-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700/70">
                                      Proposed monthly fee
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-slate-900">
                                      ৳ {app.proposedSalary.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                      Available schedule
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                      {app.availableSchedule}
                                    </p>
                                  </div>
                                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 sm:col-span-2">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                      Applying for
                                    </p>
                                    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                      {post?.title || "Tuition Post"}
                                    </p>
                                  </div>
                                </div>
                                {app.message.trim() && (
                                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                      Tutor's note
                                    </p>
                                    <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-700">
                                      {app.message}
                                    </p>
                                  </div>
                                )}
        
                                {/* Unlocked Contact Details on Acceptance */}
                                {isAccepted && (
                                  <div className="mt-4 space-y-1.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs">
                                    <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                                      <Unlock className="h-4 w-4 text-emerald-700" />
                                      <span>Mutual Contact Details Unlocked!</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 pt-1 text-slate-700 sm:grid-cols-2">
                                      {(app.tutorPhone || tutorUser?.phone) && (
                                        <div>
                                          <span className="text-slate-500">
                                            Tutor Phone:
                                          </span>{" "}
                                          <span className="font-mono font-bold text-slate-900">
                                            {app.tutorPhone || tutorUser?.phone}
                                          </span>
                                        </div>
                                      )}
                                      {(app.tutorWhatsapp ||
                                        tutorUser?.whatsapp ||
                                        app.tutorPhone ||
                                        tutorUser?.phone) && (
                                        <div>
                                          <span className="text-slate-500">
                                            Tutor WhatsApp:
                                          </span>{" "}
                                          <span className="font-mono font-bold text-emerald-800">
                                            {app.tutorWhatsapp ||
                                              tutorUser?.whatsapp ||
                                              app.tutorPhone ||
                                              tutorUser?.phone}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
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
                          <BookOpen className="w-5 h-5 text-blue-700" />
                          <h2 className="text-base sm:text-lg font-bold text-slate-900">
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
                                    ? "bg-blue-600 text-white shadow-sm"
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
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
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
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_12px_24px_-8px_rgba(15,23,42,0.12),0_4px_8px_-2px_rgba(15,23,42,0.06)] space-y-4"
                              >
                                {/* Header with countdown */}
                                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-2 flex-wrap">
                                      <h3 className="font-bold text-base sm:text-lg leading-snug text-slate-900">
                                        {post.title}
                                      </h3>
                                    </div>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
                                      <span className="font-medium text-blue-700">{post.subject}</span>
                                      <span aria-hidden="true">·</span>
                                      <span>{post.gradeLevel}</span>
                                    </div>
                                    <div className="mt-2">
                                      <PostCountdown createdAt={post.createdAt} />
                                    </div>
                                  </div>
                                  <div className="flex shrink-0 flex-col items-end gap-2">
                                    {isPendingApproval ? (
                                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Under Review
                                      </span>
                                    ) : isMatched ? (
                                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Matched
                                      </span>
                                    ) : (
                                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Live
                                      </span>
                                    )}
                                    <span className="text-xs text-slate-500">
                                      {postApps.length} {postApps.length === 1 ? "applicant" : "applicants"}
                                    </span>
                                  </div>
                                </div>
        
                                {/* Details grid */}
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                                    <div className="text-[11px] font-medium text-slate-500">
                                      Monthly budget
                                    </div>
                                    <div className="mt-1 text-base font-bold text-emerald-800">
                                      ৳ {post.salaryBudget.toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <div className="text-[11px] font-medium text-slate-500">
                                      Curriculum
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-slate-900 line-clamp-2">
                                      {post.curriculum}
                                    </div>
                                  </div>
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <div className="text-[11px] font-medium text-slate-500">
                                      Lesson mode
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-slate-900">
                                      {post.tuitionMode === "ONLINE"
                                        ? "Online"
                                        : post.tuitionMode === "OFFLINE"
                                          ? "In person"
                                          : post.tuitionMode === "BOTH"
                                            ? "Online or in person"
                                            : "Not specified"}
                                    </div>
                                  </div>
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <div className="text-[11px] font-medium text-slate-500">
                                      Weekly commitment
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-slate-900">
                                      {post.daysPerWeek} days · {post.hoursPerDay} hrs/session
                                    </div>
                                  </div>
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <div className="text-[11px] font-medium text-slate-500">
                                      Tutor preference
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-slate-900">
                                      {post.genderPreference === "MALE_ONLY"
                                        ? "Male tutor"
                                        : post.genderPreference === "FEMALE_ONLY"
                                          ? "Female tutor"
                                          : "Any tutor"}
                                    </div>
                                  </div>
                                </div>
        
                                {/* Address */}
                                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-800">
                                    <MapPin className="h-4 w-4" />
                                    Teaching location
                                  </div>
                                  <div className="mt-1 text-sm font-medium text-slate-800">
                                    {post.tuitionMode === "ONLINE"
                                      ? "Online · Nationwide (no home address)"
                                      : post.exactAddress ||
                                        `${post.areaName}, ${post.district}`}
                                  </div>
                                </div>
        
                                {/* Weekly schedule */}
                                {post.weeklySchedule &&
                                  post.weeklySchedule.length > 0 && (
                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                      <div className="text-xs font-semibold text-slate-700 mb-2">
                                        Weekly Schedule
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {post.weeklySchedule.map((slot, i) => (
                                          <span
                                            key={i}
                                            className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800"
                                          >
                                            {dayLabels[slot.day] || slot.day}{" "}
                                            {slot.startTime}–{slot.endTime}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
        
                                {post.specialRequirements && (
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <div className="text-xs font-semibold text-slate-700">
                                      Special Requirements
                                    </div>
                                    <p className="mt-1 text-sm leading-6 text-slate-600">
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
