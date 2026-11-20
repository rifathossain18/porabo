import { QuizDashboard } from "../../../components/QuizDashboard";
import { MapPin, Phone, Navigation, GraduationCap, Search, Check, Send, Star, X, Info, Activity, RefreshCw, User as UserIcon, History, CalendarDays, Clock3, ShieldCheck, Wallet } from "lucide-react";
import { Area } from "recharts";
import { cfD1 } from "../../../lib/cloudflareD1";
import { TutorDetailModal } from "../../../components/TutorDetailModal";
import { DistrictSelect } from "../../../components/DistrictSelect";
import { QRCodeModal } from "../../../components/QRCodeModal";
import { ActivityLog } from "../../../components/ActivityLog";
import { TuitionPostForm } from "../../../components/TuitionPostForm";
import { TeacherVerificationResubmissionModal } from "../../../components/TeacherVerificationResubmissionModal";
import { useAppContext } from "../../AppContext";

export function DashboardModals() {
  const {
    allQuizzes,
    setAllQuizzes,
    isQuizDashboardOpen,
    setIsQuizDashboardOpen,
    currentUser,
    selectedTutorForDetailModal,
    setSelectedTutorForDetailModal,
    selectedApplicationForModal,
    setSelectedApplicationForModal,
    isResubmitModalOpen,
    setIsResubmitModalOpen,
    allUsers,
    setAllUsers,
    setCurrentUser,
    showToast,
    tuitionPosts,
    applications,
    qrModalData,
    setQrModalData,
    profileModalTab,
    setProfileModalTab,
    selectedPostForApply,
    setSelectedPostForApply,
    applyProposedSalary,
    setApplyProposedSalary,
    applySchedule,
    setApplySchedule,
    applyMessage,
    setApplyMessage,
    isCreatePostOpen,
    setIsCreatePostOpen,
    setTutorToAccept,
    isRatingModalOpen,
    setIsRatingModalOpen,
    ratingApplication,
    setRatingApplication,
    ratingPunctuality,
    setRatingPunctuality,
    ratingSubjectMastery,
    setRatingSubjectMastery,
    ratingTeachingStyle,
    setRatingTeachingStyle,
    ratingComment,
    setRatingComment,
    ratingReviewerRole,
    setRatingReviewerRole,
    isProfileModalOpen,
    setIsProfileModalOpen,
    profileName,
    setProfileName,
    profilePhone,
    setProfilePhone,
    profileWhatsapp,
    setProfileWhatsapp,
    profileDistrict,
    setProfileDistrict,
    profileArea,
    setProfileArea,
    profileAddress,
    setProfileAddress,
    profileBio,
    setProfileBio,
    profilePhilosophy,
    setProfilePhilosophy,
    profileExpectedFee,
    setProfileExpectedFee,
    profileSubjects,
    setProfileSubjects,
    profileNewSubject,
    setProfileNewSubject,
    studentMyPosts,
    studentReceivedApplications,
    tutorMyApplications,
    handleSubmitCategoricalRating,
    handleApplyToPost,
    handleCreatePostSubmit,
    handleOpenTeacherProfile,
    handleSaveProfileModal,
  } = useAppContext();
  if (!currentUser) return null;
  return (
    <>
              {/* MODAL: APPLY TO TUITION POST */}
              {selectedPostForApply && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-5">
                  <section
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="apply-modal-title"
                    className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.35)] sm:max-h-[92vh]"
                  >
                    <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 px-5 py-5 text-white sm:px-7 sm:py-6">
                      <div
                        aria-hidden="true"
                        className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10"
                      />
                      <div className="relative flex items-start justify-between gap-4">
                        <div>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-50">
                            <Send className="h-3.5 w-3.5" />
                            Tuition application
                          </span>
                          <h2
                            id="apply-modal-title"
                            className="mt-3 text-xl font-bold tracking-tight sm:text-2xl"
                          >
                            Apply for this tuition
                          </h2>
                          <p className="mt-1 max-w-lg text-sm leading-5 text-blue-100">
                            Review the request and share a clear proposal with the student.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPostForApply(null)}
                          aria-label="Close application form"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5 sm:p-4">
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-bold leading-5 sm:text-base">
                            {selectedPostForApply.title}
                          </p>
                          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-blue-100">
                            <GraduationCap className="h-3.5 w-3.5" />
                            <span>{selectedPostForApply.subject}</span>
                            <span aria-hidden="true">·</span>
                            <span>{selectedPostForApply.gradeLevel}</span>
                          </p>
                        </div>
                        <div className="min-w-32 rounded-xl bg-white px-3 py-2 text-right text-blue-900 shadow-sm">
                          <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Student budget
                          </span>
                          <span className="mt-0.5 block text-base font-extrabold tracking-tight">
                            ৳ {selectedPostForApply.salaryBudget.toLocaleString()}
                            <span className="ml-1 text-xs font-semibold text-slate-500">/mo</span>
                          </span>
                        </div>
                      </div>
                    </header>

                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-7 sm:py-6">
                      <section
                        aria-label="Tuition request details"
                        className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm ring-1 ring-slate-200">
                            <Info className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">
                              Request overview
                            </h3>
                            <p className="mt-0.5 text-xs leading-5 text-slate-500">
                              Make sure the schedule and requirements work for you.
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {[
                            ["Curriculum", selectedPostForApply.curriculum],
                            ["Lesson mode", selectedPostForApply.tuitionMode || "Not specified"],
                            ["Days per week", `${selectedPostForApply.daysPerWeek} days`],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className="min-w-0 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5"
                            >
                              <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                {label}
                              </span>
                              <span className="mt-1 block break-words text-xs font-semibold leading-4 text-slate-800">
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>

                        {selectedPostForApply.weeklySchedule &&
                          selectedPostForApply.weeklySchedule.length > 0 && (
                            <div className="mt-4">
                              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
                                <Clock3 className="h-4 w-4 text-blue-600" />
                                Preferred weekly schedule
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {selectedPostForApply.weeklySchedule.map((slot, index) => (
                                  <span
                                    key={`${slot.day}-${slot.startTime}-${index}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-800"
                                  >
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    {slot.day}, {slot.startTime}–{slot.endTime}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {selectedPostForApply.specialRequirements && (
                          <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/80 p-3">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                              Special requirements
                            </span>
                            <p className="mt-1 text-sm leading-5 text-slate-700">
                              {selectedPostForApply.specialRequirements}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/80 p-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                            <ShieldCheck className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800">
                              Approximate area only
                            </p>
                            <p className="mt-0.5 text-xs leading-5 text-slate-600">
                              {selectedPostForApply.areaName}, {selectedPostForApply.district}. Exact address is shared only after acceptance.
                            </p>
                          </div>
                        </div>
                      </section>

                      <form
                        id="tuition-application-form"
                        onSubmit={handleApplyToPost}
                        className="mt-6"
                      >
                        <div className="mb-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                            Your application
                          </p>
                          <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900">
                            Share your proposal
                          </h3>
                          <p className="mt-1 text-sm leading-5 text-slate-500">
                            Explain your fee, availability, and why you are a good fit.
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="apply-proposed-salary"
                              className="mb-1.5 block text-sm font-semibold text-slate-700"
                            >
                              Proposed monthly fee
                            </label>
                            <div className="flex min-h-12 items-center rounded-xl border border-slate-300 bg-white transition-colors focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                              <span className="pl-3.5 text-sm font-semibold text-slate-500">৳</span>
                              <input
                                id="apply-proposed-salary"
                                type="number"
                                min="1"
                                step="1"
                                inputMode="numeric"
                                value={applyProposedSalary}
                                onChange={(event) =>
                                  setApplyProposedSalary(Number(event.target.value))
                                }
                                required
                                aria-describedby="apply-fee-hint"
                                className="min-w-0 flex-1 rounded-xl bg-transparent px-2.5 py-3 text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                              />
                              <span className="pr-3.5 text-xs font-medium text-slate-500">/month</span>
                            </div>
                            <p id="apply-fee-hint" className="mt-1.5 text-xs leading-5 text-slate-500">
                              Student budget: ৳ {selectedPostForApply.salaryBudget.toLocaleString()} per month.
                            </p>
                          </div>

                          <div>
                            <label
                              htmlFor="apply-available-schedule"
                              className="mb-1.5 block text-sm font-semibold text-slate-700"
                            >
                              Your available schedule
                            </label>
                            <input
                              id="apply-available-schedule"
                              type="text"
                              value={applySchedule}
                              onChange={(event) => setApplySchedule(event.target.value)}
                              placeholder="e.g. Sun, Tue, Thu after 5 PM"
                              required
                              className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                            <p className="mt-1.5 text-xs leading-5 text-slate-500">
                              Mention your preferred days and time.
                            </p>
                          </div>

                          <div className="sm:col-span-2">
                            <label
                              htmlFor="apply-cover-message"
                              className="mb-1.5 block text-sm font-semibold text-slate-700"
                            >
                              A short introduction
                            </label>
                            <textarea
                              id="apply-cover-message"
                              rows={4}
                              value={applyMessage}
                              onChange={(event) => setApplyMessage(event.target.value)}
                              placeholder="Share relevant experience, your teaching approach, and how you can help this student."
                              required
                              className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                            <p className="mt-1.5 text-xs leading-5 text-slate-500">
                              Your verified profile and proposal will be shared with the student.
                            </p>
                          </div>
                        </div>
                      </form>
                    </div>

                    <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-3.5 sm:px-7 sm:py-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs leading-5 text-slate-500">
                          <span className="font-semibold text-slate-700">Your privacy matters.</span>{" "}
                          Student contact details stay hidden unless your application is accepted.
                        </p>
                        <div className="flex w-full gap-2 sm:w-auto sm:shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedPostForApply(null)}
                            className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 sm:flex-none"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            form="tuition-application-form"
                            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:min-w-44 sm:flex-none"
                          >
                            <Send className="h-4 w-4" />
                            Send application
                          </button>
                        </div>
                      </div>
                    </footer>
                  </section>
                </div>
              )}
        
              {/* MODAL: CREATE NEW TUITION POST */}
              {/* MODAL: CREATE NEW TUITION POST */}
              {isCreatePostOpen && (
                <TuitionPostForm
                  onClose={() => setIsCreatePostOpen(false)}
                  onSubmit={handleCreatePostSubmit}
                />
              )}
        
              {/* MODAL: 1-MONTH RATING MODAL */}
              {isRatingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                  <div className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl sm:max-h-[92vh] sm:rounded-3xl sm:p-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRatingModalOpen(false);
                        setRatingApplication(null);
                      }}
                      className="absolute right-5 top-5 text-slate-500 hover:text-slate-900"
                    >
                      <X className="w-5 h-5" />
                    </button>
        
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
                        <Star className="w-5 h-5 fill-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white">
                          Rate Tutor after 1 Month
                        </h3>
                        <p className="text-xs text-slate-500">
                          Student &amp; Guardian Authentic Evaluation
                        </p>
                      </div>
                    </div>
        
                    {/* Application context */}
                    {ratingApplication && (
                      <div className="mb-4 p-3 bg-white border border-emerald-200 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tutor:</span>
                          <span className="text-white font-semibold">
                            {allUsers.find((u) => u.id === ratingApplication.tutorId)
                              ?.fullName || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Post:</span>
                          <span className="text-slate-600 truncate">
                            {tuitionPosts.find((p) => p.id === ratingApplication.postId)
                              ?.title || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Accepted:</span>
                          <span className="text-emerald-700 font-mono">
                            {ratingApplication.acceptedAt
                              ? new Date(
                                  ratingApplication.acceptedAt,
                                ).toLocaleDateString()
                              : "recent"}
                          </span>
                        </div>
                        <div className="flex justify-between text-amber-700 pt-1 border-t border-slate-200 text-[10px] font-mono">
                          <span>
                            Review will be sent to admin for approval before publishing.
                          </span>
                        </div>
                      </div>
                    )}
        
                    <form
                      onSubmit={handleSubmitCategoricalRating}
                      className="space-y-4 mt-3"
                    >
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Your Guardian or Student Title
                        </label>
                        <input
                          type="text"
                          value={ratingReviewerRole}
                          onChange={(e) => setRatingReviewerRole(e.target.value)}
                          placeholder="e.g. Mrs. Nasreen (Guardian, Class 10)"
                          required
                          className="w-full bg-white border border-emerald-200 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
        
                      {/* Categorical Ratings */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-700">
                            1. Punctuality (Time consistency)
                          </span>
                          <span className="font-bold text-emerald-700">
                            {ratingPunctuality} / 5 Stars
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingPunctuality(star)}
                              className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                ratingPunctuality >= star
                                  ? "bg-emerald-600 border-emerald-500 text-white"
                                  : "bg-white border-slate-200 text-slate-500"
                              }`}
                            >
                              ★ {star}
                            </button>
                          ))}
                        </div>
                      </div>
        
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-700">
                            2. Subject Mastery (Syllabus depth)
                          </span>
                          <span className="font-bold text-emerald-700">
                            {ratingSubjectMastery} / 5 Stars
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingSubjectMastery(star)}
                              className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                ratingSubjectMastery >= star
                                  ? "bg-emerald-500 border-emerald-400 text-black"
                                  : "bg-white border-slate-200 text-slate-500"
                              }`}
                            >
                              ★ {star}
                            </button>
                          ))}
                        </div>
                      </div>
        
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-700">
                            3. Teaching Style (Patience &amp; clarity)
                          </span>
                          <span className="font-bold text-blue-700">
                            {ratingTeachingStyle} / 5 Stars
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingTeachingStyle(star)}
                              className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                ratingTeachingStyle >= star
                                  ? "bg-blue-600 border-blue-500 text-white"
                                  : "bg-white border-slate-200 text-slate-500"
                              }`}
                            >
                              ★ {star}
                            </button>
                          ))}
                        </div>
                      </div>
        
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Written Feedback
                        </label>
                        <textarea
                          rows={3}
                          value={ratingComment}
                          onChange={(e) => setRatingComment(e.target.value)}
                          required
                          className="w-full bg-white border border-emerald-200 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
        
                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 mt-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Submit Evaluation</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
        
              {/* MODAL: TUTOR DETAIL MODAL (WHEN STUDENT CLICKS TUTOR NAME IN APPLICANT INBOX) */}
              {selectedTutorForDetailModal && (
                <TutorDetailModal
                  isOpen={!!selectedTutorForDetailModal}
                  tutor={selectedTutorForDetailModal}
                  application={selectedApplicationForModal || undefined}
                  onClose={() => {
                    setSelectedTutorForDetailModal(null);
                    setSelectedApplicationForModal(null);
                  }}
                  onAcceptTutor={(app) => {
                    setSelectedTutorForDetailModal(null);
                    setSelectedApplicationForModal(null);
                    setTutorToAccept(app);
                  }}
                  onOpenFullProfile={(tutorId) => {
                    setSelectedTutorForDetailModal(null);
                    setSelectedApplicationForModal(null);
                    handleOpenTeacherProfile(tutorId);
                  }}
                  isStudentViewer={currentUser?.role === "STUDENT"}
                  quizPoints={
                    allQuizzes.filter(
                      (q) => q.teacherId === selectedTutorForDetailModal.id,
                    ).length
                  }
                />
              )}
        
              {/* MODAL: RE-SUBMIT VERIFICATION DOCUMENTS (FOR REJECTED TUTORS) */}
              {isResubmitModalOpen && currentUser && (
                <TeacherVerificationResubmissionModal
                  user={currentUser}
                  onClose={() => setIsResubmitModalOpen(false)}
                  onSubmitted={(updatedUser) => {
                    setCurrentUser(updatedUser);
                    setAllUsers((users) =>
                      users.map((user) =>
                        user.id === updatedUser.id ? updatedUser : user,
                      ),
                    );
                    localStorage.setItem(
                      "porabo_active_session",
                      JSON.stringify(updatedUser),
                    );
                    showToast(
                      "All verification details were submitted. Your account is back in the review queue.",
                    );
                  }}
                />
              )}
        
              {/* MODAL: UNIFIED PROFILE & LOCATION MODAL (STUDENT & TUTOR) WITH ACTIVITY LOG */}
              {isProfileModalOpen && currentUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
                  <div className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl sm:max-h-[92vh] sm:rounded-3xl sm:p-7">
                    {/* Close Button */}
                    <button
                      type="button"
                      onClick={() => setIsProfileModalOpen(false)}
                      className="absolute right-5 top-5 text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
        
                    {/* Modal Header */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-700 flex items-center justify-center border border-emerald-500/30">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg sm:text-xl text-white">
                          {currentUser.role === "STUDENT"
                            ? "Student & Guardian Profile"
                            : "Teacher Professional Profile"}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Manage your verified identity, district location, and view
                          your platform activity
                        </p>
                      </div>
                    </div>
        
                    {/* Profile Navigation Tabs: Information vs Activity Log */}
                    <div className="grid grid-cols-2 p-1 bg-white rounded-2xl border border-emerald-200 mb-5">
                      <button
                        type="button"
                        onClick={() => setProfileModalTab("info")}
                        className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                          profileModalTab === "info"
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>Profile &amp; Location</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setProfileModalTab("activity")}
                        className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                          profileModalTab === "activity"
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        <History className="w-4 h-4" />
                        <span>Activity Timeline Log</span>
                      </button>
                    </div>
        
                    {/* TAB 1: PROFILE & LOCATION INFO FORM */}
                    {profileModalTab === "info" ? (
                      <form onSubmit={handleSaveProfileModal} className="space-y-4">
                        {/* Personal Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              required
                              placeholder="e.g. Farhana Yasmin"
                              className="w-full bg-white border border-emerald-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
        
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Phone Number (+880)
                            </label>
                            <input
                              type="tel"
                              value={profilePhone}
                              onChange={(e) => setProfilePhone(e.target.value)}
                              required
                              placeholder="+880 1712-XXXXXX"
                              className="w-full bg-white border border-emerald-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                            />
                          </div>
                        </div>
        
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            WhatsApp Contact Number
                          </label>
                          <input
                            type="tel"
                            value={profileWhatsapp}
                            onChange={(e) => setProfileWhatsapp(e.target.value)}
                            placeholder="e.g. +880 1712-XXXXXX"
                            className="w-full bg-white border border-emerald-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                          />
                          <span className="text-[10px] text-slate-500 mt-0.5 block">
                            Used for direct WhatsApp chat upon confirmed tuition match.
                          </span>
                        </div>
        
                        {/* Location Settings: District Combobox & Area */}
                        <div className="p-4 bg-white rounded-2xl border border-emerald-200 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                            <MapPin className="w-4 h-4" />
                            <span>Location &amp; District Matching</span>
                          </div>
        
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <DistrictSelect
                                value={profileDistrict}
                                onChange={setProfileDistrict}
                                label="Home District (Strict Matching)"
                                placeholder="Search Bangladesh districts..."
                              />
                            </div>
        
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Neighborhood / Area Name
                              </label>
                              <input
                                type="text"
                                value={profileArea}
                                onChange={(e) => setProfileArea(e.target.value)}
                                placeholder="e.g. Dhanmondi, Mirpur 10, Agrabad"
                                required
                                className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                          </div>
        
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Exact Address (Private - Unlocks Only Upon Match)
                            </label>
                            <input
                              type="text"
                              value={profileAddress}
                              onChange={(e) => setProfileAddress(e.target.value)}
                              placeholder="e.g. House 42, Road 8/A, Block D"
                              className="w-full bg-white border border-emerald-200 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
        
                        {/* Tutor Specific Professional Information */}
                        {currentUser.role === "TUTOR" && (
                          <div className="p-4 bg-white rounded-2xl border border-emerald-200 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                              <GraduationCap className="w-4 h-4" />
                              <span>Professional Educator Profile</span>
                            </div>
        
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Expected Monthly Salary / Rate (৳)
                              </label>
                              <input
                                type="number"
                                value={profileExpectedFee}
                                onChange={(e) =>
                                  setProfileExpectedFee(Number(e.target.value))
                                }
                                className="w-full bg-white border border-emerald-200 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>
        
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Professional Bio
                              </label>
                              <textarea
                                rows={2}
                                value={profileBio}
                                onChange={(e) => setProfileBio(e.target.value)}
                                placeholder="Describe your background and teaching focus..."
                                className="w-full bg-white border border-emerald-200 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>
        
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Teaching Philosophy
                              </label>
                              <textarea
                                rows={2}
                                value={profilePhilosophy}
                                onChange={(e) => setProfilePhilosophy(e.target.value)}
                                placeholder="Your pedagogy, conceptual explanation method, evaluation style..."
                                className="w-full bg-white border border-emerald-200 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>
        
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Specialized Subjects
                              </label>
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {profileSubjects.map((s, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-1.5"
                                  >
                                    <span>{s}</span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setProfileSubjects(
                                          profileSubjects.filter((_, i) => i !== idx),
                                        )
                                      }
                                      className="hover:text-rose-700"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
        
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={profileNewSubject}
                                  onChange={(e) => setProfileNewSubject(e.target.value)}
                                  placeholder="Add subject (e.g. Higher Math, Physics)"
                                  className="flex-1 bg-white border border-emerald-200 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      profileNewSubject.trim() &&
                                      !profileSubjects.includes(
                                        profileNewSubject.trim(),
                                      )
                                    ) {
                                      setProfileSubjects([
                                        ...profileSubjects,
                                        profileNewSubject.trim(),
                                      ]);
                                      setProfileNewSubject("");
                                    }
                                  }}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
        
                        {/* Form Buttons */}
                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsProfileModalOpen(false)}
                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl text-xs sm:text-sm transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* TAB 2: ACTIVITY TIMELINE LOG */
                      <div className="space-y-4">
                        <ActivityLog
                          posts={studentMyPosts}
                          applications={
                            currentUser.role === "STUDENT"
                              ? studentReceivedApplications
                              : tutorMyApplications
                          }
                        />
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setIsProfileModalOpen(false)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl text-xs"
                          >
                            Close Activity Log
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
        
              {/* MODAL: QR CODE NEIGHBORHOOD SHARING */}
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
        
              {/* MODAL: QUIZ DASHBOARD */}
              {isQuizDashboardOpen && currentUser?.role === "TUTOR" && (
                <QuizDashboard
                  isOpen={isQuizDashboardOpen}
                  onClose={() => setIsQuizDashboardOpen(false)}
                  currentUser={currentUser}
                  allQuizzes={allQuizzes}
                  onRefresh={async () => {
                    const freshQuizzes = await cfD1.getQuizzes();
                    setAllQuizzes(freshQuizzes);
                  }}
                />
              )}
        
      
    </>
  );
}
