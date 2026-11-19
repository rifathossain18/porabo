import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BookOpen,
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
  Users,
} from "lucide-react";
import { GenderAvatar } from "../../../components/GenderAvatar";
import { QRCodeModal } from "../../../components/QRCodeModal";
import { Toast } from "../../../components/Toast";
import { getTutorRatingSummary } from "../../../lib/ratings";
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

  const tutor = viewingTeacherProfile;
  const tutorQuizzes = useMemo(
    () => allQuizzes.filter((quiz) => quiz.teacherId === tutor?.id),
    [allQuizzes, tutor?.id],
  );
  const approvedReviews = useMemo(
    () =>
      (tutor?.reviews || []).filter(
        (review) => (review.status || "APPROVED") === "APPROVED",
      ),
    [tutor?.reviews],
  );
  const tutorRating = useMemo(
    () => getTutorRatingSummary(tutor),
    [tutor],
  );

  if (!currentUser || !viewingTeacherProfileId || !tutor) return null;

  const isStudentViewing = currentUser.role === "STUDENT";
  const isSelfViewing = currentUser.id === tutor.id;
  const isPending = tutor.verificationStatus === "PENDING";
  const isRejected = tutor.verificationStatus === "REJECTED";
  const isVerified = tutor.verificationStatus === "VERIFIED";
  const subjects = tutor.subjectsTaught || [];
  const degrees = tutor.degrees || [];
  const teachingHistory = tutor.teachingHistory || [];
  const studentsInMilestone = teachingHistory.reduce(
    (largestCount, milestone) => Math.max(largestCount, milestone.studentsCount),
    0,
  );
  const relevantApplication = isStudentViewing
    ? applications.find(
        (application) =>
          application.tutorId === tutor.id &&
          studentMyPosts.some((post) => post.id === application.postId),
      )
    : null;

  const openEditProfile = () => {
    setEditBio(tutor.bio || "");
    setEditPhilosophy(tutor.teachingPhilosophy || "");
    setEditExpectedFee(tutor.hourlyOrMonthlyRate ?? 0);
    setEditSubjects(subjects);
    setIsEditProfileOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setViewingTeacherProfileId(null)}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4 text-blue-700" />
            <span className="hidden sm:inline">
              Back to {isStudentViewing ? "My Posts" : "Tuition Feed"}
            </span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setQrModalData({
                  isOpen: true,
                  title: tutor.fullName,
                  subtitle: `${tutor.institution || "Tutor"} • ${tutor.department || tutor.district}`,
                  district: tutor.district,
                  areaName: tutor.areaName,
                  shareUrl: `${window.location.origin}/#tutor-${tutor.id}`,
                  type: "tutor",
                })
              }
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              title="Share via QR code"
            >
              <QrCode className="h-4 w-4 text-blue-700" />
              <span className="hidden sm:inline">QR Code</span>
            </button>
            <button
              type="button"
              onClick={(event) => handleShareTutorProfile(tutor, event)}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              title="Share profile link"
            >
              <Share2 className="h-4 w-4 text-blue-700" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadTeacherCard(tutor)}
              disabled={downloadingTeacherCardId === tutor.id}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
              title="Download teacher profile card"
            >
              <Download
                className={`h-4 w-4 ${downloadingTeacherCardId === tutor.id ? "animate-pulse" : ""}`}
              />
              <span className="hidden sm:inline">
                {downloadingTeacherCardId === tutor.id ? "Preparing..." : "Bio Card"}
              </span>
            </button>
            {isSelfViewing && (
              <button
                type="button"
                onClick={openEditProfile}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
              >
                <Edit3 className="h-4 w-4" />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {isSelfViewing && isPending && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-slate-900">Verification in progress</h2>
                  <span className="rounded-full border border-amber-200 bg-white px-2.5 py-1 text-xs font-medium text-amber-800">
                    Usually 24–48 hours
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Your academic and identity documents are being reviewed. Your profile remains visible while the review is completed.
                </p>
              </div>
            </div>
          </section>
        )}

        {isSelfViewing && isRejected && (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" />
                <div>
                  <h2 className="font-semibold text-slate-900">Verification needs attention</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {tutor.verificationRejectionReason ||
                      "Please review your submitted documents and send them again for verification."}
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
                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
              >
                <RefreshCw className="h-4 w-4" />
                Re-submit documents
              </button>
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 px-5 pb-6 pt-7 sm:px-8 sm:pb-8 sm:pt-9">
            <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-8 -top-20 h-56 w-56 rounded-full border border-white/10" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end">
              <GenderAvatar
                gender={tutor.gender || "MALE"}
                role="TUTOR"
                size="xl"
                name={tutor.fullName}
                profilePicture={tutor.profilePicture}
                className="rounded-3xl border-4 border-white shadow-lg"
              />
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {isVerified
                      ? "Verified tutor"
                      : isPending
                        ? "Verification in progress"
                        : "Tutor profile"}
                  </span>
                  {tutor.department && (
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white">
                      {tutor.department}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {tutor.fullName}
                </h1>
                {(tutor.institution || tutor.department) && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-blue-100">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span>
                      {[tutor.institution, tutor.department]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </p>
                )}
                <p className="mt-2 flex items-center gap-2 text-sm text-blue-100">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>
                    {[tutor.areaName, tutor.district].filter(Boolean).join(", ")}
                  </span>
                </p>
              </div>

              {isStudentViewing &&
                relevantApplication?.status === "PENDING" && (
                  <button
                    type="button"
                    onClick={() => setTutorToAccept(relevantApplication)}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
                  >
                    <Check className="h-4 w-4" />
                    Accept this tutor
                  </button>
                )}
            </div>

            <div className="relative mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5">
                <div className="flex items-center gap-2 text-blue-100">
                  <Star className="h-4 w-4 text-amber-300" />
                  <span className="text-xs font-medium">Student rating</span>
                </div>
                <p className="mt-1.5 text-lg font-semibold text-white">
                  {tutorRating.reviewCount
                    ? `${tutorRating.average.toFixed(1)} / 5`
                    : "New tutor"}
                </p>
                <p className="mt-0.5 text-xs text-blue-100">
                  {tutorRating.reviewCount
                    ? `${tutorRating.reviewCount} approved reviews`
                    : "No reviews yet"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5">
                <div className="flex items-center gap-2 text-blue-100">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium">Experience</span>
                </div>
                <p className="mt-1.5 text-lg font-semibold text-white">
                  {tutor.yearsOfExperience != null
                    ? `${tutor.yearsOfExperience} years`
                    : "Not listed"}
                </p>
                <p className="mt-0.5 text-xs text-blue-100">Teaching experience</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5">
                <div className="flex items-center gap-2 text-blue-100">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-xs font-medium">Subjects</span>
                </div>
                <p className="mt-1.5 text-lg font-semibold text-white">
                  {subjects.length}
                </p>
                <p className="mt-0.5 text-xs text-blue-100">Specializations</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5">
                <div className="flex items-center gap-2 text-blue-100">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs font-medium">Monthly fee</span>
                </div>
                <p className="mt-1.5 text-lg font-semibold text-white">
                  {tutor.hourlyOrMonthlyRate
                    ? `৳${tutor.hourlyOrMonthlyRate.toLocaleString()}`
                    : "Discuss"}
                </p>
                <p className="mt-0.5 text-xs text-blue-100">Expected rate</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]">
            <div className="space-y-6">
              <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <Users className="h-4 w-4" />
                    </span>
                    <div>
                      <h2 className="font-semibold text-slate-900">About the tutor</h2>
                      <p className="text-xs text-slate-500">Teaching approach and background</p>
                    </div>
                  </div>
                  {isSelfViewing && (
                    <button
                      type="button"
                      onClick={openEditProfile}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  )}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                    {tutor.bio || "This tutor has not added a professional bio yet."}
                  </p>
                  {tutor.teachingPhilosophy && (
                    <blockquote className="mt-4 border-l-2 border-blue-300 pl-4 text-sm italic leading-6 text-slate-600">
                      {tutor.teachingPhilosophy}
                    </blockquote>
                  )}
                  {studentsInMilestone > 0 && (
                    <p className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-3 text-xs font-medium text-slate-600">
                      <Users className="h-4 w-4 text-blue-700" />
                      {studentsInMilestone}+ students supported in teaching history
                    </p>
                  )}
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Tag className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="font-semibold text-slate-900">Subject expertise</h2>
                    <p className="text-xs text-slate-500">Select a subject to explore matching tuitions</p>
                  </div>
                </div>
                {subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subject) => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => {
                          setFilterSubject(subject);
                          setViewingTeacherProfileId(null);
                          setTeacherViewMode("feed");
                          showToast(`Filtered tuitions & tutors by "${subject}".`);
                        }}
                        className="rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-2 text-sm font-medium text-blue-800 transition-colors hover:border-blue-200 hover:bg-blue-100"
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
                    No subjects have been added to this profile yet.
                  </p>
                )}
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <GraduationCap className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="font-semibold text-slate-900">Education</h2>
                    <p className="text-xs text-slate-500">Academic background provided by the tutor</p>
                  </div>
                </div>
                {degrees.length > 0 ? (
                  <div className="space-y-3">
                    {degrees.map((degree, index) => (
                      <article
                        key={`${degree.degreeName}-${degree.institution}-${index}`}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-slate-900">{degree.degreeName}</h3>
                            <p className="mt-1 text-sm text-blue-700">{degree.institution}</p>
                          </div>
                          <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {degree.passingYear}
                          </span>
                        </div>
                        {degree.result && (
                          <p className="mt-2 text-xs text-slate-500">
                            Result: <span className="font-semibold text-emerald-700">{degree.result}</span>
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
                    No education details have been added yet.
                  </p>
                )}
              </section>
            </div>

            <aside className="space-y-6">
              <TeacherProfileRatings tutor={tutor} />

              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="font-semibold text-slate-900">Trust & verification</h2>
                    <p className="text-xs text-slate-500">
                      {isVerified
                        ? "Identity and credentials verified"
                        : isPending
                          ? "Documents are being reviewed"
                          : "Verification not completed"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
                  {isVerified ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-600" />
                  )}
                  {isVerified ? "Profile reviewed by Porabo" : "Review status shown transparently"}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-700" />
                    <h2 className="font-semibold text-slate-900">Quiz portfolio</h2>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                    {tutorQuizzes.length}
                  </span>
                </div>
                {tutorQuizzes.length === 0 ? (
                  <div className="mt-4 rounded-xl bg-slate-50 px-3 py-4 text-center">
                    <p className="text-sm text-slate-500">No quizzes published yet.</p>
                  </div>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {tutorQuizzes.map((quiz) => (
                      <li
                        key={quiz.id}
                        className="rounded-xl border border-slate-200 px-3.5 py-3"
                      >
                        <p className="line-clamp-2 text-sm font-medium text-slate-800">
                          {quiz.questionText}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {quiz.subject} · {quiz.gradeLevel}
                          {quiz.topic ? ` · ${quiz.topic}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </aside>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-700" />
              <div>
                <h2 className="font-semibold text-slate-900">Student reviews</h2>
                <p className="text-xs text-slate-500">Approved feedback from students</p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {tutorRating.reviewCount}
            </span>
          </div>

          {approvedReviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center">
              <MessageSquare className="mx-auto h-7 w-7 text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-700">No reviews yet</p>
              <p className="mt-1 text-xs text-slate-500">
                Approved reviews will appear here as students share feedback.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {approvedReviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <GenderAvatar
                        gender="FEMALE"
                        role="STUDENT"
                        size="sm"
                        name={review.studentName}
                        profilePicture={review.studentPhotoUrl}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {review.studentName}
                        </p>
                        <p className="text-xs text-slate-500">{review.studentRoleOrGrade}</p>
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-600" />
                      {review.overall.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <TeacherProfileEditModal />
      <QRCodeModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData((previous) => ({ ...previous, isOpen: false }))}
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
