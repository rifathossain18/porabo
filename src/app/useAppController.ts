import { useEffect, useState } from "react";
import { filterActive70DayPosts } from "../lib/mockData";
import {
  TuitionPost,
  TuitionApplication,
  User,
  UserRole,
  UserGender,
  IdentityDocumentType,
  VerificationStatus,
  EducationalDegree,
  CategoricalRating,
  TeachingHistoryMilestone,
  NotificationItem,
} from "../lib/types";
import { cfD1 } from "../lib/cloudflareD1";
import { useAppViewData } from "../hooks/useAppViewData";
import { useAdminActions } from "../hooks/useAdminActions";
import { useAuthActions } from "./useAuthActions";
import { useProfileActions } from "./useProfileActions";
import { usePostApplicationActions } from "./usePostApplicationActions";
import { useAdminRoute } from "./useAdminRoute";
import { useFeedPreferences } from "./useFeedPreferences";
import { useAppInteractionActions } from "./useAppInteractionActions";
import { useAppSyncEffects } from "./useAppSyncEffects";

export function useAppController() {
  const [allQuizzes, setAllQuizzes] = useState<any[]>([]);
  const [isQuizDashboardOpen, setIsQuizDashboardOpen] = useState(false);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);

  // Sync exam ID with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.startsWith("#/exam/")) {
        setActiveExamId(window.location.hash.replace("#/exam/", ""));
      } else {
        setActiveExamId(null);
      }
    };

    handleHashChange(); // Check on initial load
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const { checkIsAdminRoute, isAdminView, setIsAdminView } = useAdminRoute();

  // Global Real-time Search Query (Displayed only for tutors in Teacher View)
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>("");

  // Teacher Dashboard View Mode: 'feed' (Grid) vs 'map' (Google Maps) vs 'trends' vs 'my_applications'
  const [teacherViewMode, setTeacherViewMode] = useState<
    "feed" | "map" | "trends" | "my_applications"
  >("feed");

  // Dedicated Teacher Profile Page Route state (holds tutor ID when active)
  const [viewingTeacherProfileId, setViewingTeacherProfileId] = useState<
    string | null
  >(null);

  // Authentication State with persistent role retention
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("porabo_active_session");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authViewTab, setAuthViewTab] = useState<"login" | "register">("login");
  const [authRoleChoice, setAuthRoleChoice] = useState<UserRole>("STUDENT");

  // Login form fields
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);

  // Register form fields
  const [registerName, setRegisterName] = useState<string>("");
  const [registerEmail, setRegisterEmail] = useState<string>("");
  const [registerPhone, setRegisterPhone] = useState<string>("");
  const [registerGuardianName, setRegisterGuardianName] = useState<string>("");
  const [registerGuardianPhone, setRegisterGuardianPhone] = useState<string>("");
  const [registerGender, setRegisterGender] = useState<UserGender>("MALE");
  const [registerDistrict, setRegisterDistrict] = useState<string>("Dhaka");
  const [registerArea, setRegisterArea] = useState<string>("Dhanmondi");
  const [registerStudentInstitution, setRegisterStudentInstitution] =
    useState<string>("");
  const [registerPassword, setRegisterPassword] = useState<string>("");
  const [registerConfirmPassword, setRegisterConfirmPassword] =
    useState<string>("");
  const [showRegisterPassword, setShowRegisterPassword] =
    useState<boolean>(false);

  // Teacher specific registration verification fields
  const [regTeacherInstitution, setRegTeacherInstitution] =
    useState<string>("");
  const [regTeacherDepartment, setRegTeacherDepartment] = useState<string>(
    "Department of Mathematics",
  );
  const [regTeacherAcademicYear, setRegTeacherAcademicYear] = useState<string>(
    "4th Year (Graduating 2025)",
  );
  const [regTeacherNidNumber, setRegTeacherNidNumber] = useState<string>("");
  const [regTeacherStudentIdRoll, setRegTeacherStudentIdRoll] =
    useState<string>("");
  const [regTeacherStudentIdReg, setRegTeacherStudentIdReg] =
    useState<string>("");

  const [regTeacherProfilePic, setRegTeacherProfilePic] = useState<
    string | null
  >(null);
  const [regStudentProfilePic, setRegStudentProfilePic] = useState<
    string | null
  >(null);
  const [regIdentityDocumentType, setRegIdentityDocumentType] =
    useState<IdentityDocumentType>("NID");
  const [regIdentityFront, setRegIdentityFront] = useState<string | null>(null);
  const [regIdentityBack, setRegIdentityBack] = useState<string | null>(null);
  const [regStudentIdFront, setRegStudentIdFront] = useState<string | null>(null);
  const [regStudentIdBack, setRegStudentIdBack] = useState<string | null>(null);
  const [regSelfiePhoto, setRegSelfiePhoto] = useState<string | null>(null);

  // Teacher verification credential stepper (1: Campus & Dept, 2: National ID, 3: Student ID Roll/Reg, 4: Experience & Subjects)
  const [regTeacherDocStep, setRegTeacherDocStep] = useState<1 | 2 | 3 | 4>(1);

  // Notifications State & Header Dropdown Panel
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] =
    useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem("porabo_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Tutor Detail Modal state (for Student clicking on Tutor in Applicant Inbox)
  const [selectedTutorForDetailModal, setSelectedTutorForDetailModal] =
    useState<User | null>(null);
  const [selectedApplicationForModal, setSelectedApplicationForModal] =
    useState<TuitionApplication | null>(null);

  // Re-submission Modal State for Rejected Teachers (Text Credentials only)
  const [isResubmitModalOpen, setIsResubmitModalOpen] =
    useState<boolean>(false);
  // Tooltip state for Teacher Profile Page ratings
  const [profileActiveTooltip, setProfileActiveTooltip] = useState<
    string | null
  >(null);

  // Forgot Password modal state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] =
    useState<boolean>(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>("");
  const [forgotPasswordSuccessMsg, setForgotPasswordSuccessMsg] = useState<
    string | null
  >(null);
  const [newPasswordAfterReset, setNewPasswordAfterReset] =
    useState<string>("");
  const [showResetPassword, setShowResetPassword] = useState<boolean>(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] =
    useState<boolean>(false);

  // Auth Loading & Error state
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // 🆕 Premium landing page state (shown before auth form)
  const [showAuthForm, setShowAuthForm] = useState<boolean>(false);

  // 🆕 Card download state
  const [downloadingPostId, setDownloadingPostId] = useState<string | null>(
    null,
  );

  // 🆕 Teacher bio card download state
  const [downloadingTeacherCardId, setDownloadingTeacherCardId] = useState<
    string | null
  >(null);

  // Location Gate disabled per user requirement - matching is strictly profile district-based
  const [isLocationVerified, setIsLocationVerified] = useState<boolean>(true);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);

  // ✅ Pure Cloudflare D1 — no localStorage for data. Filled by API bootstrap effect below.
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [tuitionPosts, setTuitionPosts] = useState<TuitionPost[]>([]);
  const [applications, setApplications] = useState<TuitionApplication[]>([]);

  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<string[]>([]);

  // Initial data load from API (Cloudflare Worker) — runs once on mount.
  // This is what enables cross-device sync: all phones see the same data.
  // ✅ Pure API bootstrap — every load fetches from Cloudflare D1.
  // Auto-polls every 30s so all devices stay in sync.
  useEffect(() => {
    let cancelled = false;

    const refreshFromAPI = async () => {
      try {
        const [apiUsers, apiPosts, apiApps, apiQuizzes] = await Promise.all([
          cfD1.getUsers(),
          cfD1.getPosts(),
          cfD1.getApplications(),
          cfD1.getQuizzes(),
        ]);
        setAllQuizzes(apiQuizzes);
        if (cancelled) return;
        setAllUsers(apiUsers);
        setTuitionPosts(filterActive70DayPosts(apiPosts));
        setApplications(apiApps);
      } catch (err) {
        console.warn("[Porabo] API refresh failed:", err);
      }
    };

    // First load
    refreshFromAPI();

    // Poll every 15s (cross-device live sync)
    const interval = setInterval(refreshFromAPI, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useAppSyncEffects({
    notifications,
    setCurrentUser,
    allUsers,
    tuitionPosts,
    applications,
    setAllUsers,
    setTuitionPosts,
    setApplications,
  });

  // Helper to push a new persistent notification
  const sendNotification = (
    item: Omit<NotificationItem, "id" | "isRead" | "createdAt">,
  ) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };


  // Distance Range Slider (1km to 5km, with District-wide toggle)
  const [distanceRadiusKm, setDistanceRadiusKm] = useState<number>(5);
  const [isDistanceFilterEnabled, setIsDistanceFilterEnabled] =
    useState<boolean>(true);

  // QR Code Sharing Modal state
  const [qrModalData, setQrModalData] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    district?: string;
    areaName?: string;
    shareUrl: string;
    type: "post" | "tutor";
  }>({
    isOpen: false,
    title: "",
    subtitle: "",
    shareUrl: "",
    type: "post",
  });

  // Mobile Responsive 3-Dot Drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Student 'My Tuition Posts' Status Filter ('ALL' | 'OPEN' | 'PENDING' | 'MATCHED')
  const [studentPostStatusFilter, setStudentPostStatusFilter] = useState<
    "ALL" | "OPEN" | "PENDING" | "MATCHED"
  >("ALL");

  // Unified Profile Modal Tab ('info' | 'activity')
  const [profileModalTab, setProfileModalTab] = useState<"info" | "activity">(
    "info",
  );

  // Tutor Feed Filters
  const [selectedRadius, setSelectedRadius] = useState<number>(3);
  const [filterSubject, setFilterSubject] = useState<string>("All Subjects");
  const [filterMinBudget, setFilterMinBudget] = useState<number>(0);
  const [filterMaxBudget, setFilterMaxBudget] = useState<number>(25000);
  const [filterGrade, setFilterGrade] = useState<string>("All Grades");
  const [filterDistrict, setFilterDistrict] = useState<string>("All Districts");
  const [filterOnlyBookmarked, setFilterOnlyBookmarked] =
    useState<boolean>(false);

  // Modals
  const [selectedPostForApply, setSelectedPostForApply] =
    useState<TuitionPost | null>(null);
  const [applyProposedSalary, setApplyProposedSalary] = useState<number>(9000);
  const [applySchedule, setApplySchedule] = useState<string>(
    "Mon, Wed, Fri (4:30 PM - 6:00 PM)",
  );
  const [applyMessage, setApplyMessage] = useState<string>(
    "I am an experienced tutor with a verified academic background in this syllabus.",
  );

  // Student Post Creation Modal
  const [isCreatePostOpen, setIsCreatePostOpen] = useState<boolean>(false);
  const [newPostTitle, setNewPostTitle] = useState<string>("");
  const [newPostSubject, setNewPostSubject] = useState<string>("Higher Math");
  const [newPostGrade, setNewPostGrade] = useState<string>("Class 9-10 (SSC)");
  const [newPostCurriculum, setNewPostCurriculum] =
    useState<string>("English Version");
  const [newPostBudget, setNewPostBudget] = useState<number>(9000);
  const [newPostDays, setNewPostDays] = useState<number>(3);
  const [newPostArea, setNewPostArea] = useState<string>("Dhanmondi 27");
  const [newPostAddress, setNewPostAddress] = useState<string>(
    "House 42, Road 8/A, Block D, Apt 3-B",
  );
  const [newPostDistrict, setNewPostDistrict] = useState<string>("Dhaka");

  // Confirmation modal for Student accepting a tutor
  const [tutorToAccept, setTutorToAccept] = useState<TuitionApplication | null>(
    null,
  );

  // 1-Month Rating Simulation State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState<boolean>(false);
  const [ratingTutorId, setRatingTutorId] = useState<string>("");
  const [ratingApplication, setRatingApplication] =
    useState<TuitionApplication | null>(null);
  const [ratingPunctuality, setRatingPunctuality] = useState<number>(0);
  const [ratingSubjectMastery, setRatingSubjectMastery] = useState<number>(0);
  const [ratingTeachingStyle, setRatingTeachingStyle] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState<string>(
    "Outstanding mentor! Highly punctual, excellent conceptual clarity, and weekly practice exams.",
  );
  const [ratingReviewerRole, setRatingReviewerRole] = useState<string>(
    "Mrs. Nasreen (Guardian, Class 10)",
  );

  // Teacher Profile: Edit Bio & Professional Profile Modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [editBio, setEditBio] = useState<string>("");
  const [editPhilosophy, setEditPhilosophy] = useState<string>("");
  const [editExpectedFee, setEditExpectedFee] = useState<number>(8500);
  const [editSubjects, setEditSubjects] = useState<string[]>([]);
  const [newSubjectInput, setNewSubjectInput] = useState<string>("");

  // Unified Profile & Location Modal State (For Both Teacher and Student)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [profileName, setProfileName] = useState<string>("");
  const [profilePhone, setProfilePhone] = useState<string>("");
  const [profileWhatsapp, setProfileWhatsapp] = useState<string>("");
  const [profileDistrict, setProfileDistrict] = useState<string>("Dhaka");
  const [profileArea, setProfileArea] = useState<string>("");
  const [profileAddress, setProfileAddress] = useState<string>("");
  const [profileBio, setProfileBio] = useState<string>("");
  const [profilePhilosophy, setProfilePhilosophy] = useState<string>("");
  const [profileExpectedFee, setProfileExpectedFee] = useState<number>(8500);
  const [profileSubjects, setProfileSubjects] = useState<string[]>([]);
  const [profileNewSubject, setProfileNewSubject] = useState<string>("");

  // Toast Alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    // Auto-clear after 3800ms — toast internally has its own progress bar
    // so if the user dismisses earlier via X, the onClose handler clears it.
  };
  const {
    theme,
    setTheme,
    toggleTheme,
    hiddenPostIds,
    setHiddenPostIds,
    handleHidePost,
    handleUnhideAllPosts,
    recentSearches,
    setRecentSearches,
    addRecentSearch,
  } = useFeedPreferences(showToast);

  const {
    handleLoginSubmit,
    handleRegisterSubmit,
    handleForgotPasswordSubmit,
    handleApplyNewPassword,
    handleLogout,
  } = useAuthActions({
    currentUser,
    setCurrentUser,
    setAllUsers,
    setIsLocationVerified,
    setViewingTeacherProfileId,
    setShowAuthForm,
    showToast,
    loginEmail,
    loginPassword,
    authRoleChoice,
    registerName,
    registerEmail,
    registerPhone,
    registerGuardianName,
    registerGuardianPhone,
    registerGender,
    registerDistrict,
    registerArea,
    registerStudentInstitution,
    registerPassword,
    registerConfirmPassword,
    regTeacherInstitution,
    regTeacherDepartment,
    regTeacherAcademicYear,
    regTeacherNidNumber,
    regTeacherStudentIdRoll,
    regTeacherStudentIdReg,
    regTeacherProfilePic,
    regStudentProfilePic,
    regIdentityDocumentType,
    regIdentityFront,
    regIdentityBack,
    regStudentIdFront,
    regStudentIdBack,
    regSelfiePhoto,
    setRegTeacherProfilePic,
    setRegStudentProfilePic,
    setRegIdentityFront,
    setRegIdentityBack,
    setRegStudentIdFront,
    setRegStudentIdBack,
    setRegSelfiePhoto,
    forgotPasswordEmail,
    newPasswordAfterReset,
    setAuthLoading,
    setAuthError,
    setForgotPasswordLoading,
    setForgotPasswordSuccessMsg,
    setIsForgotPasswordOpen,
    setLoginEmail,
    setLoginPassword,
    setNewPasswordAfterReset,
    setForgotPasswordEmail,
  });

  const {
    handleSaveProfile,
    handleOpenProfileModal,
    handleSaveProfileModal,
    handleUpdateUserDistrict,
  } = useProfileActions({
    currentUser,
    setCurrentUser,
    setAllUsers,
    showToast,
    editBio,
    editPhilosophy,
    editExpectedFee,
    editSubjects,
    setIsEditProfileOpen,
    isProfileModalOpen,
    setIsProfileModalOpen,
    profileName,
    profilePhone,
    profileWhatsapp,
    profileDistrict,
    profileArea,
    profileAddress,
    profileBio,
    profilePhilosophy,
    profileExpectedFee,
    profileSubjects,
    setProfileName,
    setProfilePhone,
    setProfileWhatsapp,
    setProfileDistrict,
    setProfileArea,
    setProfileAddress,
    setProfileBio,
    setProfilePhilosophy,
    setProfileExpectedFee,
    setProfileSubjects,
  });

  const {
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
  } = useAppViewData({
    currentUser,
    applications,
    notifications,
    tuitionPosts,
    allQuizzes,
    allUsers,
    bookmarkedPostIds,
    hiddenPostIds,
    isDistanceFilterEnabled,
    distanceRadiusKm,
    globalSearchQuery,
    filterOnlyBookmarked,
    filterDistrict,
    filterSubject,
    filterMinBudget,
    filterMaxBudget,
    filterGrade,
    studentPostStatusFilter,
    viewingTeacherProfileId,
  });

  const {
    handleApplyToPost,
    handleQuickApplyToPost,
    acceptTutorDirectly,
    handleMarkTutorFound,
    handleCreatePostSubmit,
  } = usePostApplicationActions({
    currentUser,
    baseLat,
    baseLng,
    tuitionPosts,
    applications,
    setTuitionPosts,
    setApplications,
    setIsCreatePostOpen,
    selectedPostForApply,
    setSelectedPostForApply,
    applyProposedSalary,
    applySchedule,
    applyMessage,
    showToast,
    sendNotification,
    setRatingTutorId,
    setRatingApplication,
  });

  const {
    handleToggleBookmark,
    handleSubmitCategoricalRating,
    handleSharePost,
    handleShareTutorProfile,
    handleDownloadCard,
    handleDownloadTeacherCard,
    handleOpenTeacherProfile,
  } = useAppInteractionActions({
    currentUser,
    allUsers,
    setAllUsers,
    ratingApplication,
    setRatingApplication,
    ratingTutorId,
    ratingPunctuality,
    ratingSubjectMastery,
    ratingTeachingStyle,
    ratingComment,
    ratingReviewerRole,
    setIsRatingModalOpen,
    showToast,
    bookmarkedPostIds,
    setBookmarkedPostIds,
    downloadingPostId,
    setDownloadingPostId,
    downloadingTeacherCardId,
    setDownloadingTeacherCardId,
    setViewingTeacherProfileId,
  });

  // =========================================================================
  // DISTRICT SELECTION (BROWSER GEOLOCATION ACCESS CANCELLED / REMOVED)
  // =========================================================================
  const handleDetectGPS = () => {
    // Browser location access cancelled per requirement; location operates strictly on profile district
    showToast(`Active District: ${currentUser?.district || "Dhaka"}`);
  };

  const {
    handleAdminApproveTutor,
    handleAdminRejectTutor,
    handleAdminApprovePost,
    handleAdminRejectPost,
    handleAdminApproveReview,
    handleAdminRejectReview,
    handleAdminDeleteUser,
  } = useAdminActions({
    currentUser,
    setCurrentUser,
    setAllUsers,
    setTuitionPosts,
    setApplications,
    showToast,
  });


  return {
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
    registerGuardianName,
    setRegisterGuardianName,
    registerGuardianPhone,
    setRegisterGuardianPhone,
    registerGender,
    setRegisterGender,
    registerDistrict,
    setRegisterDistrict,
    registerArea,
    setRegisterArea,
    registerStudentInstitution,
    setRegisterStudentInstitution,
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
    regStudentProfilePic,
    setRegStudentProfilePic,
    regIdentityDocumentType,
    setRegIdentityDocumentType,
    regIdentityFront,
    setRegIdentityFront,
    regIdentityBack,
    setRegIdentityBack,
    regStudentIdFront,
    setRegStudentIdFront,
    regStudentIdBack,
    setRegStudentIdBack,
    regSelfiePhoto,
    setRegSelfiePhoto,
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
    handleAdminApproveTutor,
    handleAdminRejectTutor,
    handleAdminApprovePost,
    handleAdminRejectPost,
    handleAdminApproveReview,
    handleAdminRejectReview,
    handleAdminDeleteUser,
  };
}
