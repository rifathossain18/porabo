import { MapPin, CheckCircle2, Unlock, Phone, MessageSquare, Send, BookOpen, Clock, TrendingUp, Eye, Activity, LayoutGrid, Radio } from "lucide-react";
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
      {/* Verification Status Warning if Pending or Rejected */}
                    {currentUser.verificationStatus !== "VERIFIED" && (
                      <div className="p-4 rounded-3xl bg-amber-500/15 border border-amber-500/40 text-amber-700 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
                        <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-white block mb-0.5">
                            Verification in Progress
                          </span>
                          Your profile documents and institutional student roll (
                          {currentUser.studentIdCardRoll || "Submitted"}) are under
                          review. You will be able to apply to tuition posts once
                          verified by the Porabo administrative team (within 24–48
                          hours).
                        </div>
                      </div>
                    )}
        
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
                                  className="p-4 rounded-2xl bg-white border border-blue-200 space-y-3"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                      <h3 className="font-bold text-sm sm:text-base text-white">
                                        {post?.title || "Tuition Post"}
                                      </h3>
                                      <p className="text-xs text-blue-700 mt-0.5">
                                        {post?.subject} &bull; {post?.gradeLevel} &bull;{" "}
                                        {post?.areaName}, {post?.district}
                                      </p>
                                    </div>
        
                                    <span
                                      className={`text-[11px] font-mono px-3 py-1 rounded-full self-start sm:self-center border flex items-center gap-1.5 ${
                                        isAccepted
                                          ? "bg-emerald-500/20 text-emerald-700 border-emerald-500/30"
                                          : isRejected
                                            ? "bg-rose-500/20 text-rose-700 border-rose-500/30"
                                            : "bg-blue-500/20 text-blue-700 border-blue-500/30"
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
                                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                                    <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                                      <Activity className="w-3.5 h-3.5 text-blue-700" />
                                      <span>Status Tracking:</span>
                                    </div>
                                    <p className="text-slate-700 font-medium">
                                      {app.dynamicStatusReason}
                                    </p>
                                  </div>
        
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-500 pt-1">
                                    <div>
                                      Proposed Fee:{" "}
                                      <span className="text-emerald-700 font-semibold">
                                        ৳ {app.proposedSalary}/mo
                                      </span>
                                    </div>
                                    <div>
                                      Schedule:{" "}
                                      <span className="text-slate-600">
                                        {app.availableSchedule}
                                      </span>
                                    </div>
                                    <div>
                                      Applied:{" "}
                                      <span className="text-slate-600">
                                        {new Date(app.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
        
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
