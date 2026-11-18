import { Phone, PlusCircle, Send, BookOpen, BarChart3, LayoutGrid, User as UserIcon, Radio, Bell } from "lucide-react";
import { Toast } from "../../components/Toast";
import { MobileMenuDrawer } from "../../components/MobileMenuDrawer";
import { useAppContext } from "../AppContext";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DashboardModals } from "./dashboard/DashboardModals";
import { StudentDashboardContent } from "./dashboard/StudentDashboardContent";
import { TutorDashboardContent } from "./dashboard/TutorDashboardContent";

export function MainDashboard() {
  const {
    checkIsAdminRoute,
    allQuizzes,
    setAllQuizzes,
    isQuizDashboardOpen,
    setIsQuizDashboardOpen,
    activeExamId,
    setActiveExamId,
    isAdminView,
    setIsAdminView,
    globalSearchQuery,
    setGlobalSearchQuery,
    teacherViewMode,
    setTeacherViewMode,
    viewingTeacherProfileId,
    setViewingTeacherProfileId,
    currentUser,
    setCurrentUser,
    authViewTab,
    setAuthViewTab,
    authRoleChoice,
    setAuthRoleChoice,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    showLoginPassword,
    setShowLoginPassword,
    registerName,
    setRegisterName,
    registerEmail,
    setRegisterEmail,
    registerPhone,
    setRegisterPhone,
    registerGender,
    setRegisterGender,
    registerDistrict,
    setRegisterDistrict,
    registerArea,
    setRegisterArea,
    registerPassword,
    setRegisterPassword,
    registerConfirmPassword,
    setRegisterConfirmPassword,
    showRegisterPassword,
    setShowRegisterPassword,
    regTeacherInstitution,
    setRegTeacherInstitution,
    regTeacherDepartment,
    setRegTeacherDepartment,
    regTeacherAcademicYear,
    setRegTeacherAcademicYear,
    regTeacherNidNumber,
    setRegTeacherNidNumber,
    regTeacherStudentIdRoll,
    setRegTeacherStudentIdRoll,
    regTeacherStudentIdReg,
    setRegTeacherStudentIdReg,
    regTeacherProfilePic,
    setRegTeacherProfilePic,
    regTeacherDocStep,
    setRegTeacherDocStep,
    isNotificationPanelOpen,
    setIsNotificationPanelOpen,
    notifications,
    setNotifications,
    selectedTutorForDetailModal,
    setSelectedTutorForDetailModal,
    selectedApplicationForModal,
    setSelectedApplicationForModal,
    isResubmitModalOpen,
    setIsResubmitModalOpen,
    resubmitNidNumber,
    setResubmitNidNumber,
    resubmitRoll,
    setResubmitRoll,
    resubmitReg,
    setResubmitReg,
    profileActiveTooltip,
    setProfileActiveTooltip,
    isForgotPasswordOpen,
    setIsForgotPasswordOpen,
    forgotPasswordEmail,
    setForgotPasswordEmail,
    forgotPasswordSuccessMsg,
    setForgotPasswordSuccessMsg,
    newPasswordAfterReset,
    setNewPasswordAfterReset,
    showResetPassword,
    setShowResetPassword,
    forgotPasswordLoading,
    setForgotPasswordLoading,
    authLoading,
    setAuthLoading,
    authError,
    setAuthError,
    showAuthForm,
    setShowAuthForm,
    downloadingPostId,
    setDownloadingPostId,
    downloadingTeacherCardId,
    setDownloadingTeacherCardId,
    isLocationVerified,
    setIsLocationVerified,
    gpsLoading,
    setGpsLoading,
    gpsErrorMsg,
    setGpsErrorMsg,
    allUsers,
    setAllUsers,
    tuitionPosts,
    setTuitionPosts,
    applications,
    setApplications,
    bookmarkedPostIds,
    setBookmarkedPostIds,
    sendNotification,
    theme,
    setTheme,
    toggleTheme,
    distanceRadiusKm,
    setDistanceRadiusKm,
    isDistanceFilterEnabled,
    setIsDistanceFilterEnabled,
    hiddenPostIds,
    setHiddenPostIds,
    handleHidePost,
    handleUnhideAllPosts,
    recentSearches,
    setRecentSearches,
    addRecentSearch,
    qrModalData,
    setQrModalData,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    studentPostStatusFilter,
    setStudentPostStatusFilter,
    profileModalTab,
    setProfileModalTab,
    selectedRadius,
    setSelectedRadius,
    filterSubject,
    setFilterSubject,
    filterMinBudget,
    setFilterMinBudget,
    filterMaxBudget,
    setFilterMaxBudget,
    filterGrade,
    setFilterGrade,
    filterDistrict,
    setFilterDistrict,
    filterOnlyBookmarked,
    setFilterOnlyBookmarked,
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
    newPostTitle,
    setNewPostTitle,
    newPostSubject,
    setNewPostSubject,
    newPostGrade,
    setNewPostGrade,
    newPostCurriculum,
    setNewPostCurriculum,
    newPostBudget,
    setNewPostBudget,
    newPostDays,
    setNewPostDays,
    newPostArea,
    setNewPostArea,
    newPostAddress,
    setNewPostAddress,
    newPostDistrict,
    setNewPostDistrict,
    tutorToAccept,
    setTutorToAccept,
    isRatingModalOpen,
    setIsRatingModalOpen,
    ratingTutorId,
    setRatingTutorId,
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
    isEditProfileOpen,
    setIsEditProfileOpen,
    editBio,
    setEditBio,
    editPhilosophy,
    setEditPhilosophy,
    editExpectedFee,
    setEditExpectedFee,
    editSubjects,
    setEditSubjects,
    newSubjectInput,
    setNewSubjectInput,
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
    toastMessage,
    setToastMessage,
    showToast,
    handleToggleBookmark,
    baseLat,
    baseLng,
    trends30Days,
    userNotifications,
    unreadNotifCount,
    analyticsData,
    filteredTutorPosts,
    studentMyPosts,
    filteredStudentPosts,
    studentReceivedApplications,
    myAcceptedApplications,
    tutorMyApplications,
    viewingTeacherProfile,
    handleDetectGPS,
    handleLoginSubmit,
    handleRegisterSubmit,
    handleForgotPasswordSubmit,
    handleApplyNewPassword,
    handleLogout,
    handleSubmitCategoricalRating,
    handleApplyToPost,
    handleQuickApplyToPost,
    handleSharePost,
    handleShareTutorProfile,
    acceptTutorDirectly,
    handleMarkTutorFound,
    handleCreatePostSubmit,
    handleDownloadCard,
    handleDownloadTeacherCard,
    handleOpenTeacherProfile,
    handleSaveProfile,
    handleOpenProfileModal,
    handleSaveProfileModal,
    handleUpdateUserDistrict,
    handleResubmitVerification,
    handleAdminApproveTutor,
    handleAdminRejectTutor,
    handleAdminApprovePost,
    handleAdminRejectPost,
    handleAdminApproveReview,
    handleAdminRejectReview,
    handleAdminDeleteUser,
  } = useAppContext();
  if (!currentUser) return null;

  // VIEW: MAIN APPLICATION DASHBOARD (STUDENT / TEACHER)
    // =========================================================================
    return (
      <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
        {/* Toast Notification */}
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
  
<DashboardHeader />
  
        {/* Mobile Menu Drawer — Portal-based, rendered at document.body */}
        <MobileMenuDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          currentUser={currentUser}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenProfileModal={handleOpenProfileModal}
          onOpenTeacherProfile={handleOpenTeacherProfile}
          onLogout={handleLogout}
        />
  
        {/* Main Container */}
        <div className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8 space-y-5">
          {/* =================================================================== */}
          {/* STUDENT MODE VIEW: Post Tuitions, Inspect Applicants, Accept Tutor */}
          {/* =================================================================== */}
          {currentUser.role === "STUDENT" ? <StudentDashboardContent /> : <TutorDashboardContent />}
        </div>
  
<DashboardModals />
          {/* MOBILE STICKY BOTTOM NAVIGATION BAR */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F19]/95 backdrop-blur-xl border-t border-blue-900/50 py-2 px-3 shadow-2xl flex items-center justify-around">
          {currentUser.role === "TUTOR" ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setTeacherViewMode("feed");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
                  teacherViewMode === "feed"
                    ? "text-blue-400 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-[10px]">Feed</span>
              </button>
  
              <button
                type="button"
                onClick={() => {
                  setTeacherViewMode("map");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
                  teacherViewMode === "map"
                    ? "text-cyan-400 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-[10px]">Radar</span>
              </button>
  
              <button
                type="button"
                onClick={() => {
                  setTeacherViewMode("my_applications");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors relative ${
                  teacherViewMode === "my_applications"
                    ? "text-blue-400 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Send className="w-4 h-4" />
                <span className="text-[10px]">Applications</span>
                {tutorMyApplications.length > 0 && (
                  <span className="absolute -top-0.5 right-1 w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow">
                    {tutorMyApplications.length}
                  </span>
                )}
              </button>
  
              <button
                type="button"
                onClick={() => {
                  setTeacherViewMode("trends");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
                  teacherViewMode === "trends"
                    ? "text-blue-400 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-[10px]">Analytics</span>
              </button>
  
              <button
                type="button"
                onClick={() => handleOpenTeacherProfile(currentUser.id)}
                className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-slate-400 hover:text-blue-400 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span className="text-[10px]">Profile</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="flex flex-col items-center gap-1 py-1 px-3 text-blue-400 font-bold"
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-[10px]">My Tuitions</span>
              </button>
  
              <button
                type="button"
                onClick={() => setIsCreatePostOpen(true)}
                className="flex flex-col items-center gap-1 py-1 px-3 text-white bg-blue-600 rounded-xl font-bold shadow-lg shadow-blue-600/40"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="text-[10px]">Post Tuition</span>
              </button>
  
              <button
                type="button"
                onClick={() => setIsNotificationPanelOpen(true)}
                className="flex flex-col items-center gap-1 py-1 px-3 text-slate-400 hover:text-white relative"
              >
                <Bell className="w-4 h-4" />
                <span className="text-[10px]">Alerts</span>
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-0.5 right-2 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </button>
            </>
          )}
        </nav>
  
        {/* Floating Direct WhatsApp Feedback / Complain Button */}
        <a
          href="https://wa.me/8801642695161?text=Hello%20Porabo%20Support%2C%20I%20have%20a%20feedback%20or%20complain"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-3.5 sm:px-4 py-2.5 rounded-full shadow-2xl shadow-emerald-600/40 border border-emerald-400/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group font-medium text-xs"
          title="WhatsApp Support & Complain: +8801642695161"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
          <Phone className="w-4 h-4 fill-white" />
          <span className="hidden sm:inline font-bold">
            Feedback & Complaints
          </span>
          <span className="sm:hidden font-bold">Complaints</span>
        </a>
  
        {/* Clean Footer (No Admin Panel link in UI - only accessible via /admin) */}
        <footer className="border-t border-blue-950/60 bg-[#0B0F19] py-4 px-4 text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-2">
          <div>
            Porabo &bull; Hyper-Local Neighborhood Tuition Marketplace &bull;
            Black &amp; Electric Blue Edition
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span>Verified Student &amp; Teacher Accounts Only</span>
          </div>
        </footer>
      </div>
    );
 }
