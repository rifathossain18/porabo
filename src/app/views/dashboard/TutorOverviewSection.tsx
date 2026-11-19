import { AlertTriangle, MapPin, CheckCircle2, Unlock, Phone, MessageSquare, Send, BookOpen, Clock, TrendingUp, Eye, Activity, LayoutGrid, Radio, RefreshCw } from "lucide-react";
import { DistrictRadarView } from "../../../components/DistrictRadarView";
import { EmptyApplicationsIllustration } from "../../../components/EmptyStateIllustrations";
import { useAppContext } from "../../AppContext";

export function TutorOverviewSection() {
  const {
    allQuizzes,
    setIsQuizDashboardOpen,
    teacherViewMode,
    setTeacherViewMode,
    currentUser,
    setIsResubmitModalOpen,
    tuitionPosts,
    setSelectedPostForApply,
    setApplyProposedSalary,
    handleToggleBookmark,
    filteredTutorPosts,
    tutorMyApplications,
    handleOpenTeacherProfile,
    handleUpdateUserDistrict,
  } = useAppContext();
  if (!currentUser || currentUser.role !== "TUTOR") return null;
  return (
    <>
      {currentUser.verificationStatus === "REJECTED" ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 shadow-sm sm:flex-row sm:items-start sm:text-sm"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <span className="mb-0.5 block font-bold text-rose-800">
              Verification rejected
            </span>
            {currentUser.verificationRejectionReason ||
              "Please review your submitted documents and send them again for verification."}
          </div>
          <button
            type="button"
            onClick={() => setIsResubmitModalOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-700 sm:ml-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Resubmit
          </button>
        </div>
      ) : currentUser.verificationStatus !== "VERIFIED" ? (
        <div className="flex items-start gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 shadow-sm sm:text-sm">
          <Clock className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <span className="mb-0.5 block font-bold text-amber-800">
              Verification in Progress
            </span>
            Your profile documents and institutional student roll (
            {currentUser.studentIdCardRoll || "Submitted"}) are under review. You
            will be able to apply to tuition posts once verified by the Porabo
            administrative team (within 24–48 hours).
          </div>
        </div>
      ) : null}
        
                    {/* Teacher Dashboard View Switcher */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-blue-200 rounded-2xl p-2.5">
                      <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-blue-200 w-full sm:w-auto overflow-x-auto scrollbar-none">
                        <button
                          type="button"
                          onClick={() => setTeacherViewMode("feed")}
                          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                            teacherViewMode === "feed"
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                          <span>Tuition Feed ({filteredTutorPosts.length})</span>
                        </button>
        
                        <button
                          type="button"
                          onClick={() => setTeacherViewMode("map")}
                          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                            teacherViewMode === "map"
                              ? "bg-gradient-to-r from-blue-600 to-blue-600 text-white shadow-md shadow-blue-600/30"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          <Radio className="w-3.5 h-3.5 text-blue-700 animate-pulse" />
                          <span>District Radar ({filteredTutorPosts.length})</span>
                        </button>
        
                        <button
                          type="button"
                          onClick={() => setTeacherViewMode("my_applications")}
                          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                            teacherViewMode === "my_applications"
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>My Applications ({tutorMyApplications.length})</span>
                        </button>
        
                        <button
                          type="button"
                          onClick={() => setTeacherViewMode("trends")}
                          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                            teacherViewMode === "trends"
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Activity Trends</span>
                        </button>
                      </div>
        
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setIsQuizDashboardOpen(true)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>
                            My Quizzes (
                            {
                              allQuizzes.filter((q) => q.teacherId === currentUser.id)
                                .length
                            }
                            )
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenTeacherProfile(currentUser.id)}
                          className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-700 border border-blue-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View My Profile</span>
                        </button>
                      </div>
                    </div>
        
                    {/* VIEW MODE: MY APPLICATIONS WITH DYNAMIC TRACKING */}
                    {teacherViewMode === "my_applications" && (
                      <div className="bg-white border border-blue-200 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                              <Send className="w-5 h-5 text-blue-700" />
                              <span>
                                My Submitted Applications ({tutorMyApplications.length})
                              </span>
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Real-time status tracking for each submitted tuition
                              proposal
                            </p>
                          </div>
                        </div>
        
                        {tutorMyApplications.length === 0 ? (
                          <div className="p-8 text-center text-slate-500 space-y-3">
                            <EmptyApplicationsIllustration className="w-36 h-36 mx-auto mb-1" />
                            <p className="text-sm font-semibold text-slate-600">
                              You haven't applied to any tuitions yet.
                            </p>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                              Browse the neighborhood tuition feed and submit proposals
                              to local students.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {tutorMyApplications.map((app) => {
                              const post = tuitionPosts.find(
                                (p) => p.id === app.postId,
                              );
                              const isAccepted = app.status === "ACCEPTED";
                              const isRejected = app.status === "REJECTED";
        
                              return (
                                <div
                                  key={app.id}
                                  className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)]"
                                >
                                  <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                      <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                                        {post?.title || "Tuition Post"}
                                      </h3>
                                      <p className="mt-1 text-sm text-slate-600">
                                        <span className="font-semibold text-blue-800">{post?.subject || "Subject not specified"}</span>
                                        {post?.gradeLevel && <> · {post.gradeLevel}</>}
                                      </p>
                                      <p className="mt-1 text-xs text-slate-500">
                                        {post?.areaName || "Area unavailable"}, {post?.district || "District unavailable"}
                                      </p>
                                    </div>
        
                                    <span
                                      className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border px-3 py-1.5 text-xs font-semibold ${
                                        isAccepted
                                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                          : isRejected
                                            ? "bg-rose-50 text-rose-800 border-rose-200"
                                            : "bg-amber-50 text-amber-800 border-amber-200"
                                      }`}
                                    >
                                      {isAccepted ? (
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      ) : (
                                        <Clock className="w-3.5 h-3.5" />
                                      )}
                                      <span>
                                        {isAccepted
                                          ? "Accepted"
                                          : isRejected
                                            ? "Closed"
                                            : "Under Review"}
                                      </span>
                                    </span>
                                  </div>
        
                                  {/* Dynamic Tracking Status Box */}
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                      <Activity className="w-3.5 h-3.5 text-blue-700" />
                                      <span>Application update</span>
                                    </div>
                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                      {app.dynamicStatusReason}
                                    </p>
                                  </div>
        
                                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                                      <span className="text-xs font-medium text-slate-500">Your proposed fee</span>
                                      <span className="mt-1 block text-sm font-bold text-emerald-800">৳ {app.proposedSalary.toLocaleString()} / mo</span>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                      <span className="text-xs font-medium text-slate-500">Student's budget</span>
                                      <span className="mt-1 block text-sm font-semibold text-slate-900">
                                        {post?.salaryBudget ? `৳ ${post.salaryBudget.toLocaleString()} / mo` : "Not listed"}
                                      </span>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                      <span className="text-xs font-medium text-slate-500">Class / curriculum</span>
                                      <span className="mt-1 block text-sm font-semibold text-slate-900">
                                        {[post?.gradeLevel, post?.curriculum].filter(Boolean).join(" · ") || "Not listed"}
                                      </span>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                      <span className="text-xs font-medium text-slate-500">Weekly commitment</span>
                                      <span className="mt-1 block text-sm font-semibold text-slate-900">
                                        {post ? `${post.daysPerWeek} days · ${post.hoursPerDay} hrs/session` : "Not listed"}
                                      </span>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                      <span className="text-xs font-medium text-slate-500">Student schedule</span>
                                      <span className="mt-1 block text-sm font-semibold text-slate-900">{app.availableSchedule}</span>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                      <span className="text-xs font-medium text-slate-500">Applied</span>
                                      <span className="mt-1 block text-sm font-semibold text-slate-900">
                                        {new Date(app.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>

                                  {post?.specialRequirements && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                      <span className="text-xs font-semibold text-slate-700">Special requirements</span>
                                      <p className="mt-1 text-sm leading-6 text-slate-600">{post.specialRequirements}</p>
                                    </div>
                                  )}
        
                                  {isAccepted && (
                                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-emerald-50 to-emerald-50 border border-emerald-500/50 text-emerald-700 space-y-3 shadow-lg">
                                      <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                                        <div className="flex items-center gap-2">
                                          <Unlock className="w-4 h-4 text-emerald-700" />
                                          <span className="font-bold text-sm text-emerald-700">
                                            Student &amp; Guardian Contact Unlocked
                                          </span>
                                        </div>
                                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 border border-emerald-500/40">
                                          Mutual Match Verified
                                        </span>
                                      </div>
        
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                                          <span className="text-[10px] text-emerald-700 font-mono block">
                                            Guardian / Student Name
                                          </span>
                                          <span className="text-white font-semibold text-sm">
                                            {app.studentName ||
                                              post?.studentName ||
                                              "Guardian"}
                                          </span>
                                        </div>
                                        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                                          <span className="text-[10px] text-emerald-700 font-mono block">
                                            Direct Phone
                                          </span>
                                          <span className="text-white font-semibold text-sm">
                                            {app.studentPhone ||
                                              post?.studentPhone ||
                                              "+880 1712-345678"}
                                          </span>
                                        </div>
                                        <div className="sm:col-span-2 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex flex-col gap-1">
                                          <span className="text-[10px] text-emerald-700 font-mono flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-emerald-700" />{" "}
                                            Exact Neighborhood &amp; Home Address
                                          </span>
                                          <span className="text-slate-900 font-medium">
                                            {app.studentExactAddress ||
                                              post?.exactAddress ||
                                              `${post?.areaName || "Local"}, ${post?.district || "Dhaka"}`}
                                          </span>
                                        </div>
                                      </div>
        
                                      <div className="flex flex-wrap gap-2 pt-1">
                                        <a
                                          href={`tel:${app.studentPhone || post?.studentPhone || "+8801712345678"}`}
                                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-600/30"
                                        >
                                          <Phone className="w-3.5 h-3.5" />
                                          <span>Call Student Directly</span>
                                        </a>
                                        <a
                                          href={`https://wa.me/${(app.studentWhatsapp || app.studentPhone || post?.studentWhatsapp || post?.studentPhone || "8801712345678").replace(/[^0-9]/g, "")}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-[#25D366]/30"
                                        >
                                          <MessageSquare className="w-3.5 h-3.5" />
                                          <span>Open WhatsApp Chat</span>
                                        </a>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
        
                    {/* VIEW MODE: DISTRICT RADAR (IMAGINARY BLIPS FOR DISTRICT TUITIONS) */}
                    {teacherViewMode === "map" && (
                      <DistrictRadarView
                        posts={filteredTutorPosts}
                        appliedPostIds={tutorMyApplications.map((a) => a.postId)}
                        district={currentUser.district || "Dhaka"}
                        areaName={currentUser.areaName || ""}
                        onApply={(post) => {
                          setSelectedPostForApply(post);
                          setApplyProposedSalary(post.salaryBudget);
                        }}
                        onBookmarkToggle={(postId) => handleToggleBookmark(postId)}
                        onDistrictChange={handleUpdateUserDistrict}
                      />
                    )}
    </>
  );
}
