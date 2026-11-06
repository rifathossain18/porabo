import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  MapPin,
  CheckCircle2,
  Lock,
  Unlock,
  Phone,
  MessageSquare,
  Navigation,
  Compass,
  GraduationCap,
  Sparkles,
  Users,
  Search,
  PlusCircle,
  Check,
  ChevronRight,
  Send,
  SlidersHorizontal,
  ExternalLink,
  LogOut,
  LogIn,
  UserPlus,
  ShieldAlert,
  Award,
  BookOpen,
  Calendar,
  DollarSign,
  Star,
  Clock,
  Briefcase,
  Layers,
  X,
  Filter,
  CheckCircle,
  Building2,
  Heart,
  Bookmark,
  ShieldCheck,
  AlertTriangle,
  LocateFixed,
  Zap,
  BarChart3,
  Mail,
  Info,
  TrendingUp,
  Eye,
  EyeOff,
  Activity,
  ArrowUpRight,
  RefreshCw,
  HelpCircle,
  Camera,
  Upload,
  ArrowLeft,
  KeyRound,
  FileText,
  UserCheck,
  Map as MapIcon,
  ListFilter,
  LayoutGrid,
  Shield,
  Edit3,
  Tag,
  Share2,
  User as UserIcon,
  Radio,
  CheckSquare,
  Bell,
  CheckCheck,
  Sun,
  Moon,
  MoreVertical,
  QrCode,
  Sliders,
  History,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  MOCK_STUDENT,
  MOCK_TUTORS,
  INITIAL_TUITION_POSTS,
  INITIAL_APPLICATIONS,
  PRESET_ACCOUNTS,
  DISTRICTS,
  POPULAR_AREAS_DHAKA,
  SUBJECT_OPTIONS,
  GRADE_OPTIONS,
  ANCHOR_LOCATION,
  filterActive70DayPosts,
} from "./lib/mockData";
import {
  calculateDistanceKm,
  formatDistanceAnnotation,
  reverseGeocodeLiveCoords,
  LOCAL_NEIGHBORHOOD_CENTROIDS,
  BANGLADESH_DISTRICT_COORDINATES,
} from "./lib/geo";
import {
  TuitionPost,
  TuitionApplication,
  User,
  UserRole,
  UserGender,
  VerificationStatus,
  EducationalDegree,
  CategoricalRating,
  StudentReview,
  TeachingHistoryMilestone,
  NotificationItem,
} from "./lib/types";
import { cfD1, CLOUDFLARE_D1_SCHEMA, cloudflareKV } from "./lib/cloudflareD1";
import {
  cfRegister,
  cfLogin,
  cfLogout,
  cfGetSession,
  cfRequestPasswordReset,
  cfUpdatePassword,
  cfValidateAndRefreshSession,
} from "./lib/cloudflareAuth";
import { GenderAvatar } from "./components/GenderAvatar";
import { DistrictRadarView } from "./components/DistrictRadarView";
import { AdminPanel } from "./components/AdminPanel";
import {
  TutorDetailModal,
  CATEGORY_TOOLTIPS,
} from "./components/TutorDetailModal";
import { NotificationPanel } from "./components/NotificationPanel";
import { DistrictSelect } from "./components/DistrictSelect";
import {
  EmptyFeedIllustration,
  EmptyApplicationsIllustration,
  EmptyInboxIllustration,
} from "./components/EmptyStateIllustrations";
import { QRCodeModal } from "./components/QRCodeModal";
import { ActivityLog } from "./components/ActivityLog";
import { Toast } from './components/Toast';
import { MobileMenuDrawer } from "./components/MobileMenuDrawer";

export default function App() {
  // Fast Admin Route Checker (Immediate response to /admin, #/admin, #admin, ?admin)
  const checkIsAdminRoute = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const search = window.location.search;
    return (
      path === "/admin" ||
      path === "/admin/" ||
      path.startsWith("/admin") ||
      hash === "#/admin" ||
      hash === "#admin" ||
      search.includes("admin=true") ||
      search.includes("admin=1") ||
      search === "?admin"
    );
  };

  // Navigation & Admin State (Accessible strictly via /admin or #admin)
  const [isAdminView, setIsAdminView] = useState<boolean>(() =>
    checkIsAdminRoute(),
  );

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
  const [registerGender, setRegisterGender] = useState<UserGender>("MALE");
  const [registerDistrict, setRegisterDistrict] = useState<string>("Dhaka");
  const [registerArea, setRegisterArea] = useState<string>("Dhanmondi");
  const [registerPassword, setRegisterPassword] = useState<string>("");
  const [registerConfirmPassword, setRegisterConfirmPassword] =
    useState<string>("");
  const [showRegisterPassword, setShowRegisterPassword] =
    useState<boolean>(false);

  // Teacher specific registration verification fields
  const [regTeacherInstitution, setRegTeacherInstitution] = useState<string>(
    "University of Dhaka",
  );
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
  const [resubmitNidNumber, setResubmitNidNumber] = useState<string>("");
  const [resubmitRoll, setResubmitRoll] = useState<string>("");
  const [resubmitReg, setResubmitReg] = useState<string>("");

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

  // Location Gate disabled per user requirement - matching is strictly profile district-based
  const [isLocationVerified, setIsLocationVerified] = useState<boolean>(true);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);

  // Primary Data State (Cloudflare D1 & Workers KV, Real Data Only)
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      cfD1.cleanLegacyDemoData();
      const saved =
        localStorage.getItem("porabo_d1_users") ||
        localStorage.getItem("porabo_all_users");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tuitionPosts, setTuitionPosts] = useState<TuitionPost[]>(() => {
    try {
      const saved =
        localStorage.getItem("porabo_d1_posts") ||
        localStorage.getItem("porabo_tuition_posts");
      const initial = saved ? JSON.parse(saved) : [];
      return filterActive70DayPosts(initial);
    } catch {
      return [];
    }
  });

  const [applications, setApplications] = useState<TuitionApplication[]>(() => {
    try {
      const saved =
        localStorage.getItem("porabo_d1_applications") ||
        localStorage.getItem("porabo_applications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<string[]>([]);

  // Sync state to Cloudflare D1 / Local persistence
  useEffect(() => {
    try {
      localStorage.setItem("porabo_d1_posts", JSON.stringify(tuitionPosts));
      localStorage.setItem(
        "porabo_tuition_posts",
        JSON.stringify(tuitionPosts),
      );
    } catch {}
  }, [tuitionPosts]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "porabo_d1_applications",
        JSON.stringify(applications),
      );
      localStorage.setItem("porabo_applications", JSON.stringify(applications));
    } catch {}
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem("porabo_d1_users", JSON.stringify(allUsers));
      localStorage.setItem("porabo_all_users", JSON.stringify(allUsers));
    } catch {}
  }, [allUsers]);

  // Persist notifications
  useEffect(() => {
    try {
      localStorage.setItem(
        "porabo_notifications",
        JSON.stringify(notifications),
      );
    } catch {}
  }, [notifications]);

  // Session refresh hook: Periodically validates JWT & Cloudflare Access session
  useEffect(() => {
    const refreshSession = async () => {
      try {
        const res = await cfValidateAndRefreshSession();
        if (res.valid && res.user) {
          setCurrentUser((prev) => {
            if (!prev) return res.user!;
            if (
              prev.verificationStatus !== res.user!.verificationStatus ||
              prev.rating !== res.user!.rating ||
              prev.totalReviews !== res.user!.totalReviews
            ) {
              return res.user!;
            }
            return prev;
          });
        }
      } catch (err) {
        console.debug("Periodic session refresh:", err);
      }
    };

    refreshSession();
    const interval = setInterval(refreshSession, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // Global CSS Theme Toggle ('dark' vs 'light' with persistent localStorage)
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("porabo_theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
    localStorage.setItem("porabo_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Distance Range Slider (1km to 5km, with District-wide toggle)
  const [distanceRadiusKm, setDistanceRadiusKm] = useState<number>(5);
  const [isDistanceFilterEnabled, setIsDistanceFilterEnabled] =
    useState<boolean>(true);

  // Hidden Posts state (Persisted in localStorage)
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("porabo_hidden_posts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "porabo_hidden_posts",
        JSON.stringify(hiddenPostIds),
      );
    } catch {}
  }, [hiddenPostIds]);

  const handleHidePost = (postId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setHiddenPostIds((prev) => [...prev.filter((id) => id !== postId), postId]);
    showToast("Tuition post hidden from your feed.");
  };

  const handleUnhideAllPosts = () => {
    setHiddenPostIds([]);
    showToast("All hidden tuition posts restored!");
  };

  // Recent Searches state (Persisted top 5 unique queries)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("porabo_recent_searches");
      return saved
        ? JSON.parse(saved)
        : ["Higher Math", "Physics", "English Version", "Dhanmondi", "Mirpur"];
    } catch {
      return [];
    }
  });

  const addRecentSearch = (query: string) => {
    const q = query.trim();
    if (!q) return;
    setRecentSearches((prev) =>
      [
        q,
        ...prev.filter((item) => item.toLowerCase() !== q.toLowerCase()),
      ].slice(0, 5),
    );
  };

  useEffect(() => {
    try {
      localStorage.setItem(
        "porabo_recent_searches",
        JSON.stringify(recentSearches),
      );
    } catch {}
  }, [recentSearches]);

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
  const [ratingPunctuality, setRatingPunctuality] = useState<number>(5);
  const [ratingSubjectMastery, setRatingSubjectMastery] = useState<number>(5);
  const [ratingTeachingStyle, setRatingTeachingStyle] = useState<number>(5);
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

  // Listen to browser URL changes for /admin (Instant & Non-blocking)
  useEffect(() => {
    const handleLocationChange = () => {
      const isAdmin = checkIsAdminRoute();
      setIsAdminView(isAdmin);
    };

    handleLocationChange();

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);

    // Fast URL watcher for zero-delay response to manual URL edits
    const timer = setInterval(() => {
      const match = checkIsAdminRoute();
      setIsAdminView((prev) => (prev !== match ? match : prev));
    }, 150);

    // Instant Hotkey Toggle (Ctrl+Alt+A or Cmd+Alt+A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.altKey &&
        (e.key === "a" || e.key === "A")
      ) {
        e.preventDefault();
        setIsAdminView((prev) => {
          const next = !prev;
          if (next) {
            window.history.pushState({}, "", "/admin");
          } else {
            window.history.pushState({}, "", "/");
          }
          return next;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(timer);
    };
  }, []);

  // Base coordinates of current user
  const baseLat = currentUser?.latitude || ANCHOR_LOCATION.latitude;
  const baseLng = currentUser?.longitude || ANCHOR_LOCATION.longitude;

  // Real Trends Data computed directly from teacher's actual applications
  const trends30Days = useMemo(() => {
    const data = [];
    const now = new Date();
    const tutorApps =
      currentUser?.role === "TUTOR"
        ? applications.filter((a) => a.tutorId === currentUser.id)
        : [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const dateIsoPrefix = d.toISOString().split("T")[0];

      // Actual applications on this date
      const countOnDay = tutorApps.filter((a) => {
        const aDate = a.createdAt ? a.createdAt.split("T")[0] : "";
        return aDate === dateIsoPrefix;
      }).length;

      // Realistic views derived from active application inquiries
      const views = countOnDay > 0 ? countOnDay * 5 + 4 : i % 4 === 0 ? 2 : 1;

      data.push({
        date: dayStr,
        applications: countOnDay,
        profileViews: views,
      });
    }
    return data;
  }, [applications, currentUser]);

  // Notifications filtering for active session
  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter((n) => n.userId === currentUser.id);
  }, [notifications, currentUser]);

  const unreadNotifCount = useMemo(() => {
    return userNotifications.filter((n) => !n.isRead).length;
  }, [userNotifications]);

  // Comprehensive Teacher Analytics Data (Funnel, Views, Hourly Patterns)
  const analyticsData = useMemo(() => {
    if (currentUser?.role !== "TUTOR") {
      return {
        totalApplied: 0,
        inReviewCount: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        conversionRate: "0.0",
        funnelData: [] as {
          stage: string;
          count: number;
          fill: string;
          label: string;
        }[],
        hourlyData: [] as {
          period: string;
          inquiries: number;
          engagementScore: number;
        }[],
      };
    }

    const tutorApps = applications.filter((a) => a.tutorId === currentUser.id);
    const totalApplied = tutorApps.length;
    const acceptedCount = tutorApps.filter(
      (a) => a.status === "ACCEPTED",
    ).length;
    const inReviewCount = tutorApps.filter(
      (a) => a.status === "PENDING",
    ).length;
    const rejectedCount = tutorApps.filter(
      (a) => a.status === "REJECTED",
    ).length;

    const conversionRate =
      totalApplied > 0
        ? ((acceptedCount / totalApplied) * 100).toFixed(1)
        : "0.0";

    const funnelData = [
      {
        stage: "Applied",
        count: totalApplied,
        fill: "#3b82f6",
        label: "Proposals Submitted",
      },
      {
        stage: "Under Review",
        count: inReviewCount,
        fill: "#06b6d4",
        label: "Guardian Screening",
      },
      {
        stage: "Accepted Match",
        count: acceptedCount,
        fill: "#10b981",
        label: "Direct Hires",
      },
    ];

    const hourlyData = [
      {
        period: "Morning (06:00 - 12:00)",
        inquiries: Math.max(1, Math.round(totalApplied * 0.2) + 2),
        engagementScore: 32,
      },
      {
        period: "Afternoon (12:00 - 17:00)",
        inquiries: Math.max(2, Math.round(totalApplied * 0.35) + 4),
        engagementScore: 58,
      },
      {
        period: "Prime Evening (17:00 - 21:00)",
        inquiries: Math.max(4, Math.round(totalApplied * 0.7) + 9),
        engagementScore: 94,
      },
      {
        period: "Late Night (21:00 - 01:00)",
        inquiries: Math.max(1, Math.round(totalApplied * 0.25) + 3),
        engagementScore: 41,
      },
    ];

    return {
      totalApplied,
      inReviewCount,
      acceptedCount,
      rejectedCount,
      conversionRate,
      funnelData,
      hourlyData,
    };
  }, [applications, currentUser]);

  // Toggle Bookmark for Tutors
  const handleToggleBookmark = (postId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarkedPostIds((prev) => {
      const isAlready = prev.includes(postId);
      if (isAlready) {
        showToast("Removed tuition post from bookmarks.");
        return prev.filter((id) => id !== postId);
      } else {
        showToast("Saved tuition post to bookmarks! ❤️");
        return [...prev, postId];
      }
    });
  };

  // Compute live distance & bookmark status for all open, unmatched APPROVED posts relative to user position
  const postsWithDistance = useMemo(() => {
    // Hide posts that are matched or have tutor found
    const openApprovedList = tuitionPosts.filter((p) => {
      const isApproved = p.approvalStatus === "APPROVED" || !p.approvalStatus;
      const isMatched =
        p.status === "MATCHED" ||
        p.isFoundTutor ||
        applications.some((a) => a.postId === p.id && a.status === "ACCEPTED");
      return isApproved && !isMatched;
    });

    return openApprovedList
      .map((post) => {
        const dist = calculateDistanceKm(
          baseLat,
          baseLng,
          post.latitude,
          post.longitude,
        );
        const postApps = applications.filter((a) => a.postId === post.id);
        return {
          ...post,
          distanceKm: dist,
          applicationsCount: postApps.length,
          isBookmarked: bookmarkedPostIds.includes(post.id),
        };
      })
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [tuitionPosts, applications, baseLat, baseLng, bookmarkedPostIds]);

  // Filtered posts for Tutor View based on Global Search, Radius, Distance Slider, and Filters
  const filteredTutorPosts = useMemo(() => {
    const myAppliedIds =
      currentUser?.role === "TUTOR"
        ? applications
            .filter((a) => a.tutorId === currentUser.id)
            .map((a) => a.postId)
        : [];

    return postsWithDistance.filter((post) => {
      // 0. Exclude posts teacher has already applied to (visible exclusively in "My Applications")
      if (myAppliedIds.includes(post.id)) {
        return false;
      }

      // 0.1 Exclude posts hidden by the teacher
      if (hiddenPostIds.includes(post.id)) {
        return false;
      }

      // 0.2 Real-time Distance Slider Filter (1km to 5km)
      if (isDistanceFilterEnabled && post.distanceKm !== undefined) {
        if (post.distanceKm > distanceRadiusKm) {
          return false;
        }
      }

      // 1. Real-time Global Search matching across title, subject, area, gradeLevel
      if (globalSearchQuery.trim()) {
        const q = globalSearchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesSubject = post.subject.toLowerCase().includes(q);
        const matchesArea = post.areaName.toLowerCase().includes(q);
        const matchesGrade = post.gradeLevel.toLowerCase().includes(q);
        const matchesCurriculum = post.curriculum.toLowerCase().includes(q);
        if (
          !matchesTitle &&
          !matchesSubject &&
          !matchesArea &&
          !matchesGrade &&
          !matchesCurriculum
        ) {
          return false;
        }
      }

      // 2. Bookmarked filter
      if (filterOnlyBookmarked && !post.isBookmarked) {
        return false;
      }

      // 3. Strict District Match: Teacher only sees and connects with posts in their profile district
      if (currentUser?.role === "TUTOR") {
        const teacherDistrict = (currentUser.district || "Dhaka")
          .trim()
          .toLowerCase();
        const postDistrict = (post.district || "").trim().toLowerCase();
        if (teacherDistrict !== postDistrict) {
          return false;
        }
      } else if (
        filterDistrict !== "All Districts" &&
        post.district !== filterDistrict
      ) {
        return false;
      }

      // 4. Subject filter
      if (filterSubject !== "All Subjects") {
        if (!post.subject.toLowerCase().includes(filterSubject.toLowerCase())) {
          return false;
        }
      }

      // 5. Budget filter
      if (
        post.salaryBudget < filterMinBudget ||
        post.salaryBudget > filterMaxBudget
      ) {
        return false;
      }

      // 6. Grade level filter
      if (filterGrade !== "All Grades") {
        if (post.gradeLevel !== filterGrade) return false;
      }

      return true;
    });
  }, [
    postsWithDistance,
    globalSearchQuery,
    currentUser?.role,
    currentUser?.district,
    filterSubject,
    filterMinBudget,
    filterMaxBudget,
    filterGrade,
    filterDistrict,
    filterOnlyBookmarked,
    hiddenPostIds,
    isDistanceFilterEnabled,
    distanceRadiusKm,
  ]);

  // Student's own posts (both pending and approved)
  const studentMyPosts = useMemo(() => {
    if (!currentUser || currentUser.role !== "STUDENT") return [];
    return tuitionPosts.filter((p) => p.studentId === currentUser.id);
  }, [tuitionPosts, currentUser]);

  // Filtered Student posts based on status filter chips ('ALL' | 'OPEN' | 'PENDING' | 'MATCHED')
  const filteredStudentPosts = useMemo(() => {
    if (!currentUser || currentUser.role !== "STUDENT") return [];
    return studentMyPosts.filter((post) => {
      if (studentPostStatusFilter === "ALL") return true;
      if (studentPostStatusFilter === "PENDING")
        return post.approvalStatus === "PENDING";
      if (studentPostStatusFilter === "MATCHED")
        return post.status === "MATCHED" || post.isFoundTutor;
      if (studentPostStatusFilter === "OPEN")
        return (
          (post.approvalStatus === "APPROVED" || !post.approvalStatus) &&
          post.status !== "MATCHED" &&
          !post.isFoundTutor
        );
      return true;
    });
  }, [studentMyPosts, studentPostStatusFilter, currentUser]);

  // Applications received for student's posts
  const studentReceivedApplications = useMemo(() => {
    if (!currentUser || currentUser.role !== "STUDENT") return [];
    const myPostIds = studentMyPosts.map((p) => p.id);
    return applications.filter((a) => myPostIds.includes(a.postId));
  }, [applications, studentMyPosts]);

  // Tutor's own submitted applications with dynamic status tracking
  const tutorMyApplications = useMemo(() => {
    if (!currentUser || currentUser.role !== "TUTOR") return [];
    return applications
      .filter((a) => a.tutorId === currentUser.id)
      .map((app) => {
        // Dynamic tracking logic based on days since application
        const createdDate = new Date(app.createdAt).getTime();
        const now = Date.now();
        const daysElapsed = Math.floor(
          (now - createdDate) / (1000 * 60 * 60 * 24),
        );

        let dynamicStatusReason =
          app.statusReason || "Application under guardian review";
        if (app.status === "PENDING") {
          if (daysElapsed <= 4) {
            dynamicStatusReason =
              "Application Under Review by Guardian (Initial Screening)";
          } else if (daysElapsed <= 8) {
            dynamicStatusReason =
              "Guardian is reviewing applicant credentials and schedules";
          } else {
            dynamicStatusReason =
              "Guardian may have shortlisted candidates; post remains active";
          }
        } else if (app.status === "ACCEPTED") {
          dynamicStatusReason =
            "Congratulations! You have been accepted by the student/guardian.";
        } else if (app.status === "REJECTED") {
          dynamicStatusReason =
            "Student selected another tutor for this requirement.";
        }

        return {
          ...app,
          daysElapsed,
          dynamicStatusReason,
        };
      });
  }, [applications, currentUser]);

  // Target tutor for dedicated profile page
  const viewingTeacherProfile = useMemo(() => {
    if (!viewingTeacherProfileId) return null;
    return allUsers.find((t) => t.id === viewingTeacherProfileId) || null;
  }, [viewingTeacherProfileId, allUsers]);

  // =========================================================================
  // DISTRICT SELECTION (BROWSER GEOLOCATION ACCESS CANCELLED / REMOVED)
  // =========================================================================
  const handleDetectGPS = () => {
    // Browser location access cancelled per requirement; location operates strictly on profile district
    showToast(`Active District: ${currentUser?.district || "Dhaka"}`);
  };

  // =========================================================================
  // AUTHENTICATION: CLOUDFLARE WORKERS JWT AUTH (REAL ACCOUNTS ONLY)
  // =========================================================================
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const emailTrim = loginEmail.trim().toLowerCase();
    if (!emailTrim || !emailTrim.includes("@")) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    if (!loginPassword || loginPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    setAuthLoading(true);

    try {
      const res = await cfLogin(emailTrim, loginPassword);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setIsLocationVerified(true);
        setAuthLoading(false);
        showToast(`Welcome back, ${res.user.fullName}. Signed in as ${res.user.role === 'TUTOR' ? 'Teacher' : 'Student'}.`);
      } else {
        setAuthLoading(false);
        setAuthError(
          res.error || "Invalid email or password. Please verify credentials.",
        );
      }
    } catch (err: any) {
      setAuthLoading(false);
      setAuthError(
        "Sign in failed. Please check network connection and try again.",
      );
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const emailTrim = registerEmail.trim().toLowerCase();

    if (!registerName.trim()) {
      setAuthError("Please enter your full name.");
      return;
    }
    if (!emailTrim || !emailTrim.includes("@")) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    if (!registerPhone || registerPhone.length < 9) {
      setAuthError("Please enter a valid phone number (e.g. +880 17...).");
      return;
    }
    if (!registerPassword || registerPassword.length < 6) {
      setAuthError("Password must be at least 6 characters long.");
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setAuthError("Passwords do not match. Please re-enter.");
      return;
    }

    // Teacher-specific verification requirements (Strict textual credentials, zero files)
    if (authRoleChoice === "TUTOR") {
      if (!regTeacherInstitution.trim()) {
        setAuthError(
          "Please enter your current University or College institution.",
        );
        return;
      }
      if (!regTeacherDepartment.trim()) {
        setAuthError("Please enter your academic Department.");
        return;
      }
      if (!regTeacherNidNumber.trim()) {
        setAuthError(
          "Please provide your National ID (NID) or Birth Certificate registration number.",
        );
        return;
      }
      if (!regTeacherStudentIdRoll.trim()) {
        setAuthError(
          "Please enter your Institution Student ID Card Roll Number.",
        );
        return;
      }
      if (!regTeacherStudentIdReg.trim()) {
        setAuthError(
          "Please enter your Institution Student ID Card Registration Number.",
        );
        return;
      }
    }

    setAuthLoading(true);

    try {
      const res = await cfRegister({
        email: emailTrim,
        password: registerPassword,
        fullName: registerName,
        phone: registerPhone,
        role: authRoleChoice,
        gender: registerGender,
        district: registerDistrict,
        areaName: registerArea,
        exactAddress: `${registerArea}, ${registerDistrict}`,
        latitude: ANCHOR_LOCATION.latitude + (Math.random() * 0.008 - 0.004),
        longitude: ANCHOR_LOCATION.longitude + (Math.random() * 0.008 - 0.004),
        teacherDetails:
          authRoleChoice === "TUTOR"
            ? {
                institution: regTeacherInstitution,
                department: regTeacherDepartment,
                academicYear: regTeacherAcademicYear,
                nidNumber: regTeacherNidNumber,
                studentIdCardRoll: regTeacherStudentIdRoll,
                studentIdCardReg: regTeacherStudentIdReg,
                qualifications: `${regTeacherInstitution} - ${regTeacherDepartment}`,
                yearsOfExperience: 2,
                subjectsTaught: ["Higher Math", "Physics", "General Science"],
                gradesTaught: ["Class 9-10 (SSC)", "Class 11-12 (HSC)"],
                degrees: [
                  {
                    degreeName: "Undergraduate Program",
                    institution: regTeacherInstitution,
                    passingYear: "2025",
                    result: "In Progress",
                  },
                ],
                rating: 0.0,
                totalReviews: 0,
                ratingsBreakdown: {
                  punctuality: 0.0,
                  subjectMastery: 0.0,
                  teachingStyle: 0.0,
                  overall: 0.0,
                  totalReviews: 0,
                },
                teachingHistory: [
                  {
                    year: "2024 - Present",
                    title: "Private Academic Tutor",
                    organizationOrArea: registerArea,
                    studentsCount: 4,
                    highlight:
                      "Individualized coaching with weekly structured evaluations.",
                  },
                ],
                reviews: [],
                verificationSubmittedAt: new Date().toISOString(),
              }
            : undefined,
      });

      if (res.success && res.user) {
        setAllUsers((prev) => [res.user!, ...prev]);
        setCurrentUser(res.user);
        setIsLocationVerified(true);
        setAuthLoading(false);
        showToast(`Account created successfully. Signed in as ${authRoleChoice === 'STUDENT' ? 'Student' : 'Teacher'}.`);
      } else {
        setAuthLoading(false);
        setAuthError(
          res.error || "Registration failed. Please check your information.",
        );
      }
    } catch (err: any) {
      setAuthLoading(false);
      setAuthError(
        "Registration failed. Please check your information and try again.",
      );
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrim = forgotPasswordEmail.trim().toLowerCase();
    if (!emailTrim || !emailTrim.includes("@")) {
      showToast("Please enter your registered email address.");
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordSuccessMsg(null);

    try {
      const res = await cfRequestPasswordReset(emailTrim);
      if (res.success) {
        setForgotPasswordSuccessMsg(
          `Cloudflare JWT verification token generated for ${emailTrim}. You may now set your new password directly below.`,
        );
      } else {
        setForgotPasswordSuccessMsg(res.message);
      }
    } catch (err) {
      setForgotPasswordSuccessMsg(
        `Reset instructions prepared for ${emailTrim}.`,
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleApplyNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordAfterReset || newPasswordAfterReset.length < 6) {
      showToast("New password must be at least 6 characters.");
      return;
    }

    const emailTrim = forgotPasswordEmail.trim().toLowerCase();
    const res = await cfUpdatePassword(emailTrim, newPasswordAfterReset);
    if (res.success) {
      setAllUsers((prev) =>
        prev.map((u) =>
          u.email.toLowerCase() === emailTrim
            ? { ...u, password: newPasswordAfterReset }
            : u,
        ),
      );
      setLoginEmail(emailTrim);
      setLoginPassword(newPasswordAfterReset);
      setIsForgotPasswordOpen(false);
      setForgotPasswordSuccessMsg(null);
      setNewPasswordAfterReset("");
      showToast('Password updated successfully. Please sign in with your new password.');
    } else {
      showToast(res.error || "Failed to update password.");
    }
  };

  const handleLogout = async () => {
    cfLogout();
    setCurrentUser(null);
    setIsLocationVerified(false);
    setViewingTeacherProfileId(null);
    showToast('You have been signed out.');
  };

  // Submit Categorical Rating after 1 Month
  const handleSubmitCategoricalRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !ratingApplication) {
      showToast("No active tuition selected for review.");
      return;
    }

    // 30-day rule
    const acceptedAtIso =
      ratingApplication.acceptedAt ||
      ratingApplication.statusUpdatedAt ||
      ratingApplication.createdAt;
    const acceptedAtMs = new Date(acceptedAtIso).getTime();
    const daysSinceAccepted = Math.floor(
      (Date.now() - acceptedAtMs) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceAccepted < 30) {
      showToast(
        `Review will be available after 30 days of acceptance. ${
          30 - daysSinceAccepted
        } days remaining.`,
      );
      return;
    }

    // One-review-per-application rule
    const targetTutor = allUsers.find((u) => u.id === ratingTutorId);
    const existingReviewForThisApp = (targetTutor?.reviews || []).find(
      (r) => r.applicationId === ratingApplication.id,
    );
    if (existingReviewForThisApp) {
      showToast("You have already submitted a review for this tuition match.");
      return;
    }

    const overall =
      Math.round(
        ((ratingPunctuality + ratingSubjectMastery + ratingTeachingStyle) / 3) *
          10,
      ) / 10;

    const newReview: StudentReview = {
      id: `rev_${Date.now()}`,
      tutorId: ratingTutorId,
      postId: ratingApplication.postId,
      applicationId: ratingApplication.id,
      studentId: currentUser.id,
      studentName: currentUser.fullName,
      studentRoleOrGrade: ratingReviewerRole || "Student / Guardian",
      punctuality: ratingPunctuality,
      subjectMastery: ratingSubjectMastery,
      teachingStyle: ratingTeachingStyle,
      overall,
      comment: ratingComment,
      status: "PENDING",
      acceptedAt: acceptedAtIso,
      createdAt: new Date().toISOString(),
    };

    // Add review with PENDING status — rating NOT updated yet (admin approves first)
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === ratingTutorId) {
          return {
            ...u,
            reviews: [newReview, ...(u.reviews || [])],
          };
        }
        return u;
      }),
    );

    setIsRatingModalOpen(false);
    setRatingApplication(null);
    showToast(
    'Review submitted. It will appear on the tutor profile after admin approval.'
  );
  };

  // Handle Tutor applying to post (Strict check: MUST be VERIFIED by Admin)
  const handleApplyToPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPostForApply || !currentUser) return;

    if (currentUser.verificationStatus !== "VERIFIED") {
      showToast(
        "Your account is pending verification. Only verified tutors can apply to tuitions.",
      );
      return;
    }

    const dist = calculateDistanceKm(
      baseLat,
      baseLng,
      selectedPostForApply.latitude,
      selectedPostForApply.longitude,
    );

    const newApp: TuitionApplication = {
      id: `app_${Date.now()}`,
      postId: selectedPostForApply.id,
      tutorId: currentUser.id,
      tutorName: currentUser.fullName,
      tutorQualifications: currentUser.qualifications || "B.Sc Graduate",
      tutorInstitution: currentUser.institution || "University of Dhaka",
      tutorRating: currentUser.rating || 5.0,
      tutorExperienceYears: currentUser.yearsOfExperience || 3,
      tutorSubjects: currentUser.subjectsTaught || ["Higher Math", "Physics"],
      tutorDistanceKm: dist,
      proposedSalary: applyProposedSalary,
      availableSchedule: applySchedule,
      message: applyMessage,
      status: "PENDING",
      statusReason: "Application Under Review by Guardian (Initial Screening)",
      createdAt: new Date().toISOString(),
      tutorPhone: currentUser.phone,
      tutorWhatsapp: currentUser.whatsapp || currentUser.phone,
    };

    setApplications((prev) => [newApp, ...prev]);
    setSelectedPostForApply(null);
    showToast('Application submitted. The student will review your verified profile.');
    cfD1
      .saveApplication(newApp)
      .catch((err) =>
        console.warn("Cloudflare D1 saveApplication error:", err),
      );

    // Send real-time notification to the student/guardian
    sendNotification({
      userId: selectedPostForApply.studentId,
      title: "Tutor Applied to your post",
      message: `${currentUser.fullName} (${currentUser.institution || "Verified Scholar"}) applied for "${selectedPostForApply.title}" with proposed fee ৳ ${applyProposedSalary.toLocaleString()}/mo.`,
      type: "APPLICATION_RECEIVED",
      postId: selectedPostForApply.id,
      linkText: "Review in Applicant Inbox",
    });
  };

  // Quick Apply: Bypasses proposal modal for fully verified teachers
  const handleQuickApplyToPost = (post: TuitionPost, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentUser || currentUser.role !== "TUTOR") return;

    if (currentUser.verificationStatus !== "VERIFIED") {
      showToast("Profile verification required before quick-applying.");
      return;
    }

    const proposedSalary = post.salaryBudget;
    const defaultSchedule = "Mon, Wed, Fri (4:30 PM - 6:00 PM)";
    const defaultMessage = `I am a verified tutor in ${currentUser.district} (${currentUser.areaName || ""}) with proven academic credentials. Ready to begin coaching for ${post.subject}.`;

    const dist = calculateDistanceKm(
      baseLat,
      baseLng,
      post.latitude,
      post.longitude,
    );

    const newApp: TuitionApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      postId: post.id,
      tutorId: currentUser.id,
      tutorName: currentUser.fullName,
      tutorQualifications:
        currentUser.qualifications ||
        `${currentUser.institution || "University"} Graduate`,
      tutorInstitution: currentUser.institution || "University of Dhaka",
      tutorRating: currentUser.rating || 5.0,
      tutorExperienceYears: currentUser.yearsOfExperience || 2,
      tutorSubjects: currentUser.subjectsTaught || [post.subject],
      tutorDistanceKm: dist,
      proposedSalary,
      availableSchedule: defaultSchedule,
      message: defaultMessage,
      status: "PENDING",
      statusReason: "Application Under Review by Guardian (Initial Screening)",
      createdAt: new Date().toISOString(),
      tutorPhone: currentUser.phone,
      tutorWhatsapp: currentUser.whatsapp || currentUser.phone,
    };

    setApplications((prev) => [newApp, ...prev]);
    showToast(`Application submitted for "${post.title}". Proposed fee: ৳${proposedSalary.toLocaleString()}/month.`);
    cfD1
      .saveApplication(newApp)
      .catch((err) =>
        console.warn("Cloudflare D1 saveApplication error:", err),
      );

    sendNotification({
      userId: post.studentId,
      title: "Quick Application Received! 🚀",
      message: `${currentUser.fullName} (${currentUser.institution || "Verified Educator"}) quick-applied to your tuition post "${post.title}" at ৳ ${proposedSalary.toLocaleString()}/mo.`,
      type: "APPLICATION_RECEIVED",
      postId: post.id,
      linkText: "Review in Applicant Inbox",
    });
  };

  // Web Share API handler for tuition posts
  const handleSharePost = async (post: TuitionPost, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}/#post-${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tuition: ${post.title}`,
          text: `Tuition opportunity in ${post.areaName}, ${post.district} for ${post.subject} (${post.gradeLevel}) - Budget ৳ ${post.salaryBudget.toLocaleString()}/mo. Details on Porabo:`,
          url: shareUrl,
        });
      } catch (err) {
        // User dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          `${post.title} • ${post.areaName}, ${post.district} (৳ ${post.salaryBudget.toLocaleString()}/mo) • ${shareUrl}`,
        );
        showToast('Tuition opportunity link copied to clipboard.');
      } catch {
        showToast("Link ready to share!");
      }
    }
  };

  // Web Share API handler for tutor profiles
  const handleShareTutorProfile = async (tutor: User, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}/#tutor-${tutor.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Verified Educator: ${tutor.fullName}`,
          text: `Hire ${tutor.fullName} (${tutor.institution || "Verified Teacher"}) on Porabo Tuition Match:`,
          url: shareUrl,
        });
      } catch (err) {
        // User dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          `${tutor.fullName} - Verified Educator on Porabo - ${shareUrl}`,
        );
        showToast('Tutor profile link copied to clipboard.');
      } catch {
        showToast("Link ready to share!");
      }
    }
  };

  // Handle Student confirming tutor acceptance
  const handleConfirmAcceptTutor = () => {
    if (!tutorToAccept) return;

    const targetPost = tuitionPosts.find((p) => p.id === tutorToAccept.postId);

    setApplications((prev) =>
      prev.map((app) => {
        if (app.postId === tutorToAccept.postId) {
          if (app.id === tutorToAccept.id) {
            const acceptedApp: TuitionApplication = {
              ...app,
              status: "ACCEPTED",
              acceptedAt: new Date().toISOString(),
              statusReason: "Accepted & Contact Unlocked! 🎉",
              studentName: currentUser?.fullName || targetPost?.studentName,
              studentPhone:
                currentUser?.phone ||
                targetPost?.studentPhone ||
                "+880 1712-345678",
              studentWhatsapp:
                currentUser?.whatsapp ||
                currentUser?.phone ||
                targetPost?.studentWhatsapp ||
                "+880 1712-345678",
              studentExactAddress:
                targetPost?.exactAddress ||
                `${targetPost?.areaName}, ${targetPost?.district}`,
              studentAreaName: targetPost?.areaName,
              studentDistrict: targetPost?.district,
            };
            cfD1
              .saveApplication(acceptedApp)
              .catch((err) =>
                console.warn("Cloudflare D1 saveApplication error:", err),
              );
            return acceptedApp;
          } else {
            const rejectedApp: TuitionApplication = {
              ...app,
              status: "REJECTED",
              statusReason: "Student selected another tutor for this tuition.",
            };
            cfD1
              .saveApplication(rejectedApp)
              .catch((err) =>
                console.warn("Cloudflare D1 saveApplication error:", err),
              );
            return rejectedApp;
          }
        }
        return app;
      }),
    );

    const updatedPost = {
      ...(targetPost || {}),
      id: tutorToAccept.postId,
      status: "MATCHED" as const,
      isFoundTutor: true,
      acceptedTutorId: tutorToAccept.tutorId,
      acceptedAt: new Date().toISOString(),
    };

    setTuitionPosts((prev) =>
      prev.map((p) =>
        p.id === tutorToAccept.postId ? (updatedPost as TuitionPost) : p,
      ),
    );

    cfD1
      .savePost(updatedPost as TuitionPost)
      .catch((err) => console.warn("Cloudflare D1 savePost error:", err));

    // Send real-time notification to the accepted tutor
    sendNotification({
      userId: tutorToAccept.tutorId,
      title: "Application Accepted! 🎉",
      message: `Congratulations! ${currentUser?.fullName} accepted your application for "${targetPost?.title || "tuition"}". Phone: ${currentUser?.phone} / Address: ${targetPost?.exactAddress || targetPost?.areaName}.`,
      type: "APPLICATION_ACCEPTED",
      postId: tutorToAccept.postId,
      linkText: "View in My Applications",
    });

    // Notify other applicant tutors that post was filled
    const otherApplicants = applications.filter(
      (a) => a.postId === tutorToAccept.postId && a.id !== tutorToAccept.id,
    );
    otherApplicants.forEach((other) => {
      sendNotification({
        userId: other.tutorId,
        title: "Application Status Updated",
        message: `The student selected another tutor for "${targetPost?.title || "this tuition post"}".`,
        type: "APPLICATION_REJECTED",
        postId: tutorToAccept.postId,
        linkText: "Browse available tuitions",
      });
    });

    const acceptedName = tutorToAccept.tutorName;
    setRatingTutorId(tutorToAccept.tutorId);
    setTutorToAccept(null);
    showToast(`Tutor accepted. Contact details and address are now unlocked.`);
  };

  // Handle Student marking post as Tutor Found
  const handleMarkTutorFound = (postId: string) => {
    setTuitionPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, status: "MATCHED", isFoundTutor: true } : p,
      ),
    );
    showToast("Post updated: Marked as Tutor Found.");
  };

  // Handle Student creating new post (Sent for Admin Moderation)
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !currentUser) return;

    const newPost: TuitionPost = {
      id: `post_${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.fullName,
      title: newPostTitle,
      subject: newPostSubject,
      gradeLevel: newPostGrade,
      curriculum: newPostCurriculum,
      daysPerWeek: newPostDays,
      hoursPerDay: 1.5,
      salaryBudget: newPostBudget,
      genderPreference: "ANY",
      district: newPostDistrict,
      areaName: newPostArea,
      exactAddress: newPostAddress,
      latitude: baseLat + (Math.random() * 0.01 - 0.005),
      longitude: baseLng + (Math.random() * 0.01 - 0.005),
      status: "OPEN",
      approvalStatus: "PENDING", // Awaiting Admin Approval
      isSystemPost: false,
      isFoundTutor: false,
      createdAt: new Date().toISOString(),
      applicationsCount: 0,
    };

    setTuitionPosts((prev) => [newPost, ...prev]);
    setIsCreatePostOpen(false);
    setNewPostTitle("");
    showToast('Tuition request submitted. It is under review and will go live once approved.');
    cfD1
      .savePost(newPost)
      .catch((err) => console.warn("Cloudflare D1 savePost error:", err));
  };

  // Helper to open teacher profile page
  const handleOpenTeacherProfile = (tutorId: string) => {
    setViewingTeacherProfileId(tutorId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle saving edited profile (Bio, Philosophy, Subjects)
  const handleSaveProfile = () => {
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      bio: editBio,
      teachingPhilosophy: editPhilosophy,
      hourlyOrMonthlyRate: editExpectedFee,
      subjectsTaught:
        editSubjects.length > 0 ? editSubjects : currentUser.subjectsTaught,
    };

    setCurrentUser(updatedUser);
    setAllUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedUser : u)),
    );
    localStorage.setItem("porabo_active_session", JSON.stringify(updatedUser));
    setIsEditProfileOpen(false);
    showToast('Professional bio and teaching profile updated successfully.');
    cfD1
      .saveUser(updatedUser)
      .catch((err) => console.warn("Cloudflare D1 saveUser error:", err));
  };

  // Open unified Profile & Location modal (Student & Teacher)
  const handleOpenProfileModal = () => {
    if (!currentUser) return;
    setProfileName(currentUser.fullName || "");
    setProfilePhone(currentUser.phone || "");
    setProfileWhatsapp(currentUser.whatsapp || currentUser.phone || "");
    setProfileDistrict(currentUser.district || "Dhaka");
    setProfileArea(currentUser.areaName || "");
    setProfileAddress(currentUser.exactAddress || "");
    if (currentUser.role === "TUTOR") {
      setProfileBio(currentUser.bio || "");
      setProfilePhilosophy(currentUser.teachingPhilosophy || "");
      setProfileExpectedFee(currentUser.hourlyOrMonthlyRate || 8500);
      setProfileSubjects(
        currentUser.subjectsTaught || ["Higher Math", "Physics"],
      );
    }
    setIsProfileModalOpen(true);
  };

  // Save unified Profile & Location modal
  const handleSaveProfileModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!profileDistrict) {
      showToast("Please select your district.");
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      fullName: profileName.trim() || currentUser.fullName,
      phone: profilePhone.trim() || currentUser.phone,
      whatsapp:
        profileWhatsapp.trim() || currentUser.whatsapp || profilePhone.trim(),
      district: profileDistrict,
      areaName: profileArea.trim() || currentUser.areaName,
      exactAddress: profileAddress.trim() || currentUser.exactAddress,
      ...(currentUser.role === "TUTOR"
        ? {
            bio: profileBio,
            teachingPhilosophy: profilePhilosophy,
            hourlyOrMonthlyRate: profileExpectedFee,
            subjectsTaught:
              profileSubjects.length > 0
                ? profileSubjects
                : currentUser.subjectsTaught,
          }
        : {}),
    };

    setCurrentUser(updatedUser);
    setAllUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedUser : u)),
    );
    localStorage.setItem("porabo_active_session", JSON.stringify(updatedUser));
    setIsProfileModalOpen(false);
    showToast(`Profile and location updated. Active district: ${profileDistrict}.`);
    cfD1
      .saveUser(updatedUser)
      .catch((err) => console.warn("Cloudflare D1 saveUser error:", err));
  };

  // Direct District switch (from radar or quick selector)
  const handleUpdateUserDistrict = (newDistrict: string) => {
    if (!currentUser || currentUser.district === newDistrict) return;
    const updatedUser: User = {
      ...currentUser,
      district: newDistrict,
    };
    setCurrentUser(updatedUser);
    setAllUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedUser : u)),
    );
    localStorage.setItem("porabo_active_session", JSON.stringify(updatedUser));
    showToast(`Active district updated to ${newDistrict}.`);
    cfD1
      .saveUser(updatedUser)
      .catch((err) => console.warn("Cloudflare D1 saveUser error:", err));
  };

  // Handle Teacher Re-submitting Verification Documents after Rejection
  const handleResubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!resubmitNidNumber.trim() && !currentUser.nidNumber) {
      showToast("Please provide your National ID or Birth Certificate number.");
      return;
    }
    if (!resubmitRoll.trim() && !currentUser.studentIdCardRoll) {
      showToast("Please provide your Student ID Roll number.");
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      verificationStatus: "PENDING",
      verificationRejectionReason: undefined,
      verificationSubmittedAt: new Date().toISOString(),
      nidNumber: resubmitNidNumber.trim() || currentUser.nidNumber,
      studentIdCardRoll: resubmitRoll.trim() || currentUser.studentIdCardRoll,
      studentIdCardReg: resubmitReg.trim() || currentUser.studentIdCardReg,
    };

    setCurrentUser(updatedUser);
    setAllUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedUser : u)),
    );
    localStorage.setItem("porabo_active_session", JSON.stringify(updatedUser));
    setIsResubmitModalOpen(false);
    showToast('Corrected verification dossier submitted. Your application is now in the admin review queue.');
    cfD1
      .saveUser(updatedUser)
      .catch((err) => console.warn("Cloudflare D1 saveUser error:", err));
  };

  // Admin Actions (Instant Live Updates across Session & Cloudflare D1)
  const handleAdminApproveTutor = (tutorId: string) => {
    setAllUsers((prev) => {
      const updated = prev.map((u) =>
        u.id === tutorId
          ? {
              ...u,
              verificationStatus: "VERIFIED" as const,
              isVerified: true,
              verificationRejectionReason: undefined,
            }
          : u,
      );
      const target = updated.find((u) => u.id === tutorId);
      if (target) {
        cfD1.saveUser(target);
        // Instant Live session update if currently signed in as this tutor
        if (currentUser && currentUser.id === tutorId) {
          setCurrentUser(target);
          localStorage.setItem("porabo_active_session", JSON.stringify(target));
        }
      }
      return updated;
    });
    showToast("Tutor verified successfully! Verification badge awarded.");
  };

  const handleAdminRejectTutor = (tutorId: string, reason: string) => {
    setAllUsers((prev) => {
      const updated = prev.map((u) =>
        u.id === tutorId
          ? {
              ...u,
              verificationStatus: "REJECTED" as const,
              isVerified: false,
              verificationRejectionReason: reason,
            }
          : u,
      );
      const target = updated.find((u) => u.id === tutorId);
      if (target) {
        cfD1.saveUser(target);
        // Instant Live session update if currently signed in as this tutor
        if (currentUser && currentUser.id === tutorId) {
          setCurrentUser(target);
          localStorage.setItem("porabo_active_session", JSON.stringify(target));
        }
      }
      return updated;
    });
    showToast("Tutor verification rejected with feedback note.");
  };

  const handleAdminApprovePost = (postId: string) => {
    setTuitionPosts((prev) => {
      const updated = prev.map((p) =>
        p.id === postId ? { ...p, approvalStatus: "APPROVED" as const } : p,
      );
      const target = updated.find((p) => p.id === postId);
      if (target) cfD1.savePost(target);
      return updated;
    });
    showToast("Tuition post approved! Now visible on public feed & map.");
  };

  const handleAdminRejectPost = (postId: string) => {
    setTuitionPosts((prev) => prev.filter((p) => p.id !== postId));
    cfD1.deletePost(postId);
    showToast("Tuition post permanently purged from database.");
  };

  // ---- Admin Review Moderation Handlers ----
  const handleAdminApproveReview = (tutorId: string, reviewId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id !== tutorId) return u;

        const updatedReviews = (u.reviews || []).map((r) =>
          r.id === reviewId
            ? {
                ...r,
                status: "APPROVED" as const,
                approvedAt: new Date().toISOString(),
              }
            : r,
        );

        // Recalculate rating from APPROVED reviews only
        const approved = updatedReviews.filter(
          (r) => (r.status || "APPROVED") === "APPROVED",
        );
        const total = approved.length;

        let newRating = 0;
        let newBreakdown = {
          punctuality: 0,
          subjectMastery: 0,
          teachingStyle: 0,
          overall: 0,
          totalReviews: 0,
        };

        if (total > 0) {
          const avgPunc =
            Math.round(
              (approved.reduce((s, r) => s + r.punctuality, 0) / total) * 10,
            ) / 10;
          const avgMast =
            Math.round(
              (approved.reduce((s, r) => s + r.subjectMastery, 0) / total) * 10,
            ) / 10;
          const avgStyl =
            Math.round(
              (approved.reduce((s, r) => s + r.teachingStyle, 0) / total) * 10,
            ) / 10;
          newRating = Math.round(((avgPunc + avgMast + avgStyl) / 3) * 10) / 10;
          newBreakdown = {
            punctuality: avgPunc,
            subjectMastery: avgMast,
            teachingStyle: avgStyl,
            overall: newRating,
            totalReviews: total,
          };
        }

        const updatedUser = {
          ...u,
          reviews: updatedReviews,
          rating: newRating,
          totalReviews: total,
          ratingsBreakdown: newBreakdown,
        };

        cfD1
          .saveUser(updatedUser)
          .catch((err) => console.warn("Cloudflare D1 saveUser error:", err));

        // If the tutor is currently logged in, refresh their session
        if (currentUser && currentUser.id === tutorId) {
          setCurrentUser(updatedUser);
          localStorage.setItem(
            "porabo_active_session",
            JSON.stringify(updatedUser),
          );
        }

        return updatedUser;
      }),
    );
    showToast("Review approved and published to tutor profile!");
  };

  const handleAdminRejectReview = (
    tutorId: string,
    reviewId: string,
    reason: string,
  ) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id !== tutorId) return u;
        const updatedReviews = (u.reviews || []).map((r) =>
          r.id === reviewId
            ? { ...r, status: "REJECTED" as const, rejectedReason: reason }
            : r,
        );
        const updatedUser = { ...u, reviews: updatedReviews };
        cfD1
          .saveUser(updatedUser)
          .catch((err) => console.warn("Cloudflare D1 saveUser error:", err));
        return updatedUser;
      }),
    );
    showToast("Review rejected. It will not appear on the tutor profile.");
  };

  // Admin permanent purge of a user (Teacher or Student) from Cloudflare D1
  const handleAdminDeleteUser = (userId: string) => {
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    cfD1.deleteUser(userId);
    setTuitionPosts((prev) => prev.filter((p) => p.studentId !== userId));
    setApplications((prev) => prev.filter((a) => a.tutorId !== userId));

    if (currentUser && currentUser.id === userId) {
      cfLogout();
      setCurrentUser(null);
      localStorage.removeItem("porabo_active_session");
    }
    showToast(
      "User record and associated data permanently purged from Cloudflare D1.",
    );
  };

  // =========================================================================
  // VIEW: ADMIN PANEL ROUTE (ACCESSIBLE ONLY VIA /admin or #/admin)
  // =========================================================================
  if (isAdminView) {
    return (
      <AdminPanel
        allUsers={allUsers}
        tuitionPosts={tuitionPosts}
        applications={applications}
        onApproveTutor={handleAdminApproveTutor}
        onRejectTutor={handleAdminRejectTutor}
        onApprovePost={handleAdminApprovePost}
        onRejectPost={handleAdminRejectPost}
        onDeleteUser={handleAdminDeleteUser}
        onDeletePost={handleAdminRejectPost}
        onApproveReview={handleAdminApproveReview}
        onRejectReview={handleAdminRejectReview}
        onExitAdmin={() => {
          setIsAdminView(false);
          window.history.pushState({}, "", "/");
          window.location.hash = "";
        }}
      />
    );
  }

  // =========================================================================
  // VIEW: AUTHENTICATION GATE (EMAIL & PASSWORD)
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
                {/* Toast Notification */}
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

        {/* Top Minimal Branding Header */}
        <header className="border-b border-blue-950/40 bg-[#0B0F19]/90 backdrop-blur-md px-4 py-3 sm:px-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/porabo_logo_transparent_90065b0b.svg"
                alt="Porabo Logo"
                className="w-9 h-9 object-contain shrink-0"
              />
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">
                  Porabo
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/50">
                  Hyper-Local Tutor Network
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-blue-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Credentials Only</span>
              </span>
            </div>
          </div>
        </header>

        {/* Auth Body */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
          <div className="w-full max-w-lg bg-[#111827] border border-blue-900/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/40">
            {/* Header */}
            <div className="text-center mb-6">
              <img
                src="/assets/porabo_logo_transparent_90065b0b.svg"
                alt="Porabo Logo"
                className="w-14 h-14 mx-auto object-contain mb-2"
              />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {authViewTab === "login"
                  ? "Sign In to Porabo"
                  : "Create Porabo Account"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
                {authViewTab === "login"
                  ? "Enter your registered email and password to access the tuition portal."
                  : "Join as a Student to post tuitions or as a Teacher to teach in your neighborhood."}
              </p>
            </div>

            {/* Error Notification */}
            {authError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="flex-1">{authError}</div>
              </div>
            )}

            {/* Tab Switcher: Login vs Register */}
            <div className="grid grid-cols-2 p-1 bg-[#0B0F19] rounded-2xl border border-blue-950/50 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthViewTab("login");
                  setAuthError(null);
                }}
                className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  authViewTab === "login"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthViewTab("register");
                  setAuthError(null);
                }}
                className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  authViewTab === "register"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Register
              </button>
            </div>

            {/* LOGIN FORM */}
            {authViewTab === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. farhana.math@example.com"
                      required
                      className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordEmail(loginEmail);
                        setIsForgotPasswordOpen(true);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {authLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-400">
                    Don't have an account yet?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthViewTab("register");
                        setAuthError(null);
                      }}
                      className="text-blue-400 hover:underline font-medium"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Strict Role Selection */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Select Your Strict Role (Permanent)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthRoleChoice("STUDENT")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        authRoleChoice === "STUDENT"
                          ? "bg-blue-600/20 border-blue-500 text-white"
                          : "bg-[#0B0F19] border-blue-950/60 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Users className="w-4 h-4 text-blue-400" />
                        {authRoleChoice === "STUDENT" && (
                          <Check className="w-3.5 h-3.5 text-blue-400" />
                        )}
                      </div>
                      <div className="font-semibold text-xs text-white">
                        Student / Guardian
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Post tuition requirements
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAuthRoleChoice("TUTOR")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        authRoleChoice === "TUTOR"
                          ? "bg-blue-600/20 border-blue-500 text-white"
                          : "bg-[#0B0F19] border-blue-950/60 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <GraduationCap className="w-4 h-4 text-cyan-400" />
                        {authRoleChoice === "TUTOR" && (
                          <Check className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                      </div>
                      <div className="font-semibold text-xs text-white">
                        Teacher / Tutor
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Apply to local tuitions
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="e.g. Farhana Khanom"
                      required
                      className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={registerGender}
                      onChange={(e) =>
                        setRegisterGender(e.target.value as UserGender)
                      }
                      className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="MALE">Male (Vector Scholar Avatar)</option>
                      <option value="FEMALE">
                        Female (Vector Scholar Avatar)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Phone (+880)
                    </label>
                    <input
                      type="tel"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      placeholder="+880 1712-XXXXXX"
                      required
                      className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      District (64 Real)
                    </label>
                    <DistrictSelect
                      value={registerDistrict}
                      onChange={setRegisterDistrict}
                      placeholder="Select District"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Neighborhood Area
                    </label>
                    <input
                      type="text"
                      value={registerArea}
                      onChange={(e) => setRegisterArea(e.target.value)}
                      placeholder="e.g. Dhanmondi 27"
                      required
                      className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* TEACHER STRICT VERIFICATION CREDENTIALS STEPPER (100% TEXTUAL, ZERO FILES) */}
                {authRoleChoice === "TUTOR" && (
                  <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/50 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                        <span>Teacher Credentials Guide</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/60">
                        Step {regTeacherDocStep} of 4
                      </span>
                    </div>

                    {/* Step Tabs Navigation */}
                    <div className="grid grid-cols-4 gap-1 p-1 bg-[#0B0F19] rounded-xl border border-blue-950/80">
                      {[
                        {
                          step: 1,
                          label: "Campus",
                          complete: !!(
                            regTeacherInstitution && regTeacherDepartment
                          ),
                        },
                        {
                          step: 2,
                          label: "NID No",
                          complete: !!regTeacherNidNumber,
                        },
                        {
                          step: 3,
                          label: "Student ID",
                          complete: !!(
                            regTeacherStudentIdRoll && regTeacherStudentIdReg
                          ),
                        },
                        {
                          step: 4,
                          label: "Academic",
                          complete: !!regTeacherAcademicYear,
                        },
                      ].map((s) => (
                        <button
                          key={s.step}
                          type="button"
                          onClick={() => setRegTeacherDocStep(s.step as any)}
                          className={`py-1.5 rounded-lg text-[10px] font-mono transition-all text-center flex items-center justify-center gap-1 ${
                            regTeacherDocStep === s.step
                              ? "bg-blue-600 text-white font-bold shadow"
                              : s.complete
                                ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                                : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <span>{s.label}</span>
                          {s.complete && <Check className="w-2.5 h-2.5" />}
                        </button>
                      ))}
                    </div>

                    {/* STEP 1: Campus & Department */}
                    {regTeacherDocStep === 1 && (
                      <div className="space-y-2.5 animate-in fade-in duration-150">
                        <div className="p-2.5 rounded-xl bg-blue-900/20 border border-blue-800/40 text-[11px] text-blue-200">
                          Step 1: Enter your current university/college and
                          enrolled department.
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-300 mb-1">
                              Institution Name
                            </label>
                            <input
                              type="text"
                              value={regTeacherInstitution}
                              onChange={(e) =>
                                setRegTeacherInstitution(e.target.value)
                              }
                              placeholder="e.g. University of Dhaka"
                              required
                              className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-300 mb-1">
                              Department
                            </label>
                            <input
                              type="text"
                              value={regTeacherDepartment}
                              onChange={(e) =>
                                setRegTeacherDepartment(e.target.value)
                              }
                              placeholder="e.g. Mathematics / Physics"
                              required
                              className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setRegTeacherDocStep(2)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1"
                          >
                            <span>Next: National ID Number</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: National ID / Birth Certificate Number (Text Only) */}
                    {regTeacherDocStep === 2 && (
                      <div className="space-y-2.5 animate-in fade-in duration-150">
                        <div className="p-2.5 rounded-xl bg-blue-900/20 border border-blue-800/40 text-[11px] text-blue-200">
                          Step 2: Enter your 10, 13, or 17 digit National ID
                          (NID) or official Birth Certificate number.
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">
                            National ID / Birth Registration Number
                          </label>
                          <input
                            type="text"
                            value={regTeacherNidNumber}
                            onChange={(e) =>
                              setRegTeacherNidNumber(e.target.value)
                            }
                            placeholder="e.g. 19984729104829"
                            required
                            className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono tracking-wider"
                          />
                        </div>

                        <div className="flex justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => setRegTeacherDocStep(1)}
                            className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-xl"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegTeacherDocStep(3)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1"
                          >
                            <span>Next: Campus Student ID Roll</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Student ID Roll & Reg Number (Text Only) */}
                    {regTeacherDocStep === 3 && (
                      <div className="space-y-2.5 animate-in fade-in duration-150">
                        <div className="p-2.5 rounded-xl bg-blue-900/20 border border-blue-800/40 text-[11px] text-blue-200">
                          Step 3: Enter your current institution student roll
                          number and registration number.
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-300 mb-1">
                              Student ID Roll Number
                            </label>
                            <input
                              type="text"
                              value={regTeacherStudentIdRoll}
                              onChange={(e) =>
                                setRegTeacherStudentIdRoll(e.target.value)
                              }
                              placeholder="e.g. 2021-MAT-042"
                              required
                              className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-300 mb-1">
                              Student ID Reg Number
                            </label>
                            <input
                              type="text"
                              value={regTeacherStudentIdReg}
                              onChange={(e) =>
                                setRegTeacherStudentIdReg(e.target.value)
                              }
                              placeholder="e.g. DU-849201"
                              required
                              className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => setRegTeacherDocStep(2)}
                            className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-xl"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegTeacherDocStep(4)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1"
                          >
                            <span>Next: Academic Status</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Academic Status & Year */}
                    {regTeacherDocStep === 4 && (
                      <div className="space-y-2.5 animate-in fade-in duration-150">
                        <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-[11px] text-emerald-300">
                          Step 4: Confirm your academic year / graduating batch
                          status.
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">
                            Academic Year / Status
                          </label>
                          <input
                            type="text"
                            value={regTeacherAcademicYear}
                            onChange={(e) =>
                              setRegTeacherAcademicYear(e.target.value)
                            }
                            placeholder="e.g. 4th Year (Graduating 2025)"
                            required
                            className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="flex justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => setRegTeacherDocStep(3)}
                            className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-xl"
                          >
                            Back
                          </button>
                          <span className="text-[11px] text-emerald-400 font-medium self-center flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Ready to register</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Password
                    </label>
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      required
                      className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerConfirmPassword}
                      onChange={(e) =>
                        setRegisterConfirmPassword(e.target.value)
                      }
                      placeholder="Re-enter"
                      required
                      className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                >
                  {authLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Registering Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>
                        Register as{" "}
                        {authRoleChoice === "STUDENT" ? "Student" : "Teacher"}
                      </span>
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <p className="text-xs text-slate-400">
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthViewTab("login");
                        setAuthError(null);
                      }}
                      className="text-blue-400 hover:underline font-medium"
                    >
                      Sign In here
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </main>

        {/* FORGOT PASSWORD MODAL */}
        {isForgotPasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#111827] border border-blue-900/40 rounded-3xl p-6 shadow-2xl relative">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPasswordOpen(false);
                  setForgotPasswordSuccessMsg(null);
                }}
                className="absolute right-5 top-5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    Reset Password
                  </h3>
                  <p className="text-xs text-slate-400">
                    Recover your account credentials
                  </p>
                </div>
              </div>

              {forgotPasswordSuccessMsg ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-300 text-xs sm:text-sm">
                    {forgotPasswordSuccessMsg}
                  </div>

                  <form onSubmit={handleApplyNewPassword} className="space-y-3">
                    <label className="block text-xs font-medium text-slate-300">
                      Create New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showResetPassword ? "text" : "password"}
                        value={newPasswordAfterReset}
                        onChange={(e) =>
                          setNewPasswordAfterReset(e.target.value)
                        }
                        placeholder="Minimum 6 characters"
                        required
                        className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        title={
                          showResetPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showResetPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition-colors shadow-lg shadow-blue-600/20"
                    >
                      Save New Password &amp; Continue
                    </button>
                  </form>
                </div>
              ) : (
                <form
                  onSubmit={handleForgotPasswordSubmit}
                  className="space-y-4"
                >
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Enter the email address registered with your Porabo account
                    to receive password reset instructions.
                  </p>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Registered Email
                    </label>
                    <input
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="e.g. farhana.math@example.com"
                      required
                      className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(false)}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotPasswordLoading}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-1.5"
                    >
                      {forgotPasswordLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        "Send Reset Link"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Footer (No Admin Panel link in UI) */}
        <footer className="border-t border-blue-950/40 bg-[#0B0F19] py-4 text-center text-xs text-slate-500 font-mono">
          Porabo &copy; 2026 &bull; Hyper-Local Radius Tuition Platform &bull;
          All Rights Reserved
        </footer>
      </div>
    );
  }

  // =========================================================================
  // VIEW: DEDICATED TEACHER PROFILE PAGE (HIGH-TECH PERFORMANCE COVER, NO PHOTOS)
  // =========================================================================
  if (viewingTeacherProfileId && viewingTeacherProfile) {
    const tutor = viewingTeacherProfile;
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

          {/* Categorical Ratings Breakdown with Interactive Hover Tooltips */}
          {(() => {
            const hasTutorReviews = Boolean(
              tutor.totalReviews && tutor.totalReviews > 0,
            );
            const punc = hasTutorReviews
              ? (tutor.ratingsBreakdown?.punctuality ?? (tutor.rating || 0.0))
              : 0.0;
            const mast = hasTutorReviews
              ? (tutor.ratingsBreakdown?.subjectMastery ??
                (tutor.rating || 0.0))
              : 0.0;
            const styl = hasTutorReviews
              ? (tutor.ratingsBreakdown?.teachingStyle ?? (tutor.rating || 0.0))
              : 0.0;

            return (
              <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-400" />
                    <h2 className="text-base font-bold text-white">
                      Categorical Ratings
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span>
                      {hasTutorReviews
                        ? "Hover bars for details"
                        : "New Tutor (0 Reviews)"}
                    </span>
                  </span>
                </div>

                <div className="space-y-4">
                  {/* 1. Punctuality with Tooltip */}
                  <div
                    className="relative group cursor-pointer"
                    onMouseEnter={() => setProfileActiveTooltip("punctuality")}
                    onMouseLeave={() => setProfileActiveTooltip(null)}
                    onClick={() =>
                      setProfileActiveTooltip(
                        profileActiveTooltip === "punctuality"
                          ? null
                          : "punctuality",
                      )
                    }
                  >
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-300 flex items-center gap-1.5">
                        <span>1. Punctuality</span>
                        <Info className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
                      </span>
                      <span className="font-bold text-blue-400">
                        {hasTutorReviews
                          ? `${punc.toFixed(1)} / 5.0`
                          : "0.0 / 5.0"}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#0B0F19] rounded-full overflow-hidden border border-blue-950">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all group-hover:brightness-125"
                        style={{
                          width: `${hasTutorReviews ? (punc / 5) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    {profileActiveTooltip === "punctuality" && (
                      <div className="mt-2 p-2.5 bg-blue-950 border border-blue-500/50 rounded-xl text-xs text-slate-200 shadow-xl animate-in fade-in duration-150">
                        <div className="font-bold text-white text-[11px] mb-0.5">
                          {CATEGORY_TOOLTIPS.punctuality.title}
                        </div>
                        <p className="text-slate-300 text-[10px] leading-relaxed">
                          {CATEGORY_TOOLTIPS.punctuality.description}
                        </p>
                        <div className="text-[9px] font-mono text-blue-300 mt-1 pt-0.5 border-t border-blue-800/40">
                          {hasTutorReviews
                            ? CATEGORY_TOOLTIPS.punctuality.metric
                            : "Awaiting initial student ratings."}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Subject Mastery with Tooltip */}
                  <div
                    className="relative group cursor-pointer"
                    onMouseEnter={() =>
                      setProfileActiveTooltip("subjectMastery")
                    }
                    onMouseLeave={() => setProfileActiveTooltip(null)}
                    onClick={() =>
                      setProfileActiveTooltip(
                        profileActiveTooltip === "subjectMastery"
                          ? null
                          : "subjectMastery",
                      )
                    }
                  >
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-300 flex items-center gap-1.5">
                        <span>2. Subject Mastery</span>
                        <Info className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </span>
                      <span className="font-bold text-cyan-400">
                        {hasTutorReviews
                          ? `${mast.toFixed(1)} / 5.0`
                          : "0.0 / 5.0"}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#0B0F19] rounded-full overflow-hidden border border-blue-950">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all group-hover:brightness-125"
                        style={{
                          width: `${hasTutorReviews ? (mast / 5) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    {profileActiveTooltip === "subjectMastery" && (
                      <div className="mt-2 p-2.5 bg-blue-950 border border-cyan-500/50 rounded-xl text-xs text-slate-200 shadow-xl animate-in fade-in duration-150">
                        <div className="font-bold text-white text-[11px] mb-0.5">
                          {CATEGORY_TOOLTIPS.subjectMastery.title}
                        </div>
                        <p className="text-slate-300 text-[10px] leading-relaxed">
                          {CATEGORY_TOOLTIPS.subjectMastery.description}
                        </p>
                        <div className="text-[9px] font-mono text-cyan-300 mt-1 pt-0.5 border-t border-cyan-800/40">
                          {hasTutorReviews
                            ? CATEGORY_TOOLTIPS.subjectMastery.metric
                            : "Awaiting initial student ratings."}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Teaching Style with Tooltip */}
                  <div
                    className="relative group cursor-pointer"
                    onMouseEnter={() =>
                      setProfileActiveTooltip("teachingStyle")
                    }
                    onMouseLeave={() => setProfileActiveTooltip(null)}
                    onClick={() =>
                      setProfileActiveTooltip(
                        profileActiveTooltip === "teachingStyle"
                          ? null
                          : "teachingStyle",
                      )
                    }
                  >
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-300 flex items-center gap-1.5">
                        <span>3. Teaching Style</span>
                        <Info className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                      </span>
                      <span className="font-bold text-indigo-400">
                        {hasTutorReviews
                          ? `${styl.toFixed(1)} / 5.0`
                          : "0.0 / 5.0"}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#0B0F19] rounded-full overflow-hidden border border-blue-950">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all group-hover:brightness-125"
                        style={{
                          width: `${hasTutorReviews ? (styl / 5) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    {profileActiveTooltip === "teachingStyle" && (
                      <div className="mt-2 p-2.5 bg-blue-950 border border-indigo-500/50 rounded-xl text-xs text-slate-200 shadow-xl animate-in fade-in duration-150">
                        <div className="font-bold text-white text-[11px] mb-0.5">
                          {CATEGORY_TOOLTIPS.teachingStyle.title}
                        </div>
                        <p className="text-slate-300 text-[10px] leading-relaxed">
                          {CATEGORY_TOOLTIPS.teachingStyle.description}
                        </p>
                        <div className="text-[9px] font-mono text-indigo-300 mt-1 pt-0.5 border-t border-indigo-800/40">
                          {hasTutorReviews
                            ? CATEGORY_TOOLTIPS.teachingStyle.metric
                            : "Awaiting initial student ratings."}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

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
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-lg bg-[#111827] border border-blue-900/50 rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="absolute right-5 top-5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    Edit Professional Profile
                  </h3>
                  <p className="text-xs text-slate-400">
                    Update your public biography and tutoring offerings
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Professional Bio
                  </label>
                  <textarea
                    rows={4}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Describe your academic expertise, teaching experience, and methodology..."
                    className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Teaching Philosophy / Slogan
                  </label>
                  <input
                    type="text"
                    value={editPhilosophy}
                    onChange={(e) => setEditPhilosophy(e.target.value)}
                    placeholder="e.g. Conceptual understanding through step-by-step problem dissection."
                    className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Expected Monthly Fee (৳)
                  </label>
                  <input
                    type="number"
                    value={editExpectedFee}
                    onChange={(e) => setEditExpectedFee(Number(e.target.value))}
                    className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Subject Specializations
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {editSubjects.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-blue-950 border border-blue-800 text-blue-300 text-xs flex items-center gap-1.5"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditSubjects(
                              editSubjects.filter((_, i) => i !== idx),
                            )
                          }
                          className="hover:text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubjectInput}
                      onChange={(e) => setNewSubjectInput(e.target.value)}
                      placeholder="Add subject (e.g. Calculus, Physics)"
                      className="flex-1 bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          newSubjectInput.trim() &&
                          !editSubjects.includes(newSubjectInput.trim())
                        ) {
                          setEditSubjects([
                            ...editSubjects,
                            newSubjectInput.trim(),
                          ]);
                          setNewSubjectInput("");
                        }
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
  // VIEW: MAIN APPLICATION DASHBOARD (STUDENT / TEACHER)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
              {/* Toast Notification */}
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 border-b border-blue-950/60 bg-[#0B0F19]/90 backdrop-blur-md px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img
              src="/assets/porabo_logo_transparent_90065b0b.svg"
              alt="Porabo Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
            />
            <div>
              <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                Porabo
              </span>
              <span className="hidden lg:inline-block ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/50">
                Neighborhood Tutor Network
              </span>
            </div>
          </div>

          {/* REAL-TIME GLOBAL SEARCH BAR IN HEADER (ONLY FOR TUTOR ROLE) */}
          {currentUser.role === "TUTOR" ? (
            <div className="flex-1 max-w-md mx-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  placeholder="Search by subject, title, area, or curriculum..."
                  className="w-full bg-[#111827] border border-blue-950/80 hover:border-blue-800/60 focus:border-blue-500 rounded-full pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
                />
                {globalSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setGlobalSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* User Status, Notifications, Role Badge & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notification Bell Button & Dropdown Panel */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationPanelOpen((prev) => !prev)}
                className={`p-2 rounded-xl border transition-all relative ${
                  isNotificationPanelOpen
                    ? "bg-blue-600/30 text-blue-400 border-blue-500/50"
                    : "bg-[#111827] text-slate-300 hover:text-white border-blue-900/40 hover:border-blue-700/60"
                }`}
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse shadow-lg shadow-rose-600/50">
                    {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                  </span>
                )}
              </button>

              <NotificationPanel
                isOpen={isNotificationPanelOpen}
                onClose={() => setIsNotificationPanelOpen(false)}
                notifications={userNotifications}
                onMarkAsRead={(id) =>
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
                  )
                }
                onMarkAllAsRead={() =>
                  setNotifications((prev) =>
                    prev.map((n) =>
                      n.userId === currentUser.id ? { ...n, isRead: true } : n,
                    ),
                  )
                }
                onDeleteNotification={(id) =>
                  setNotifications((prev) => prev.filter((n) => n.id !== id))
                }
                onClearAll={() =>
                  setNotifications((prev) =>
                    prev.filter((n) => n.userId !== currentUser.id),
                  )
                }
                onNotificationClick={() => {
                  if (currentUser.role === "TUTOR") {
                    setTeacherViewMode("my_applications");
                  }
                  setIsNotificationPanelOpen(false);
                }}
              />
            </div>

            {/* Global CSS Theme Toggle (Sun / Moon) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[#111827] text-slate-300 hover:text-white border border-blue-900/40 hover:border-blue-700/60 transition-all shadow-sm"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode for better accessibility`}
              aria-label={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-blue-500" />
              )}
            </button>

            {/* Strict Role Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#111827] border border-blue-900/40 text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-slate-400">Role:</span>
              <span className="font-semibold text-white">
                {currentUser.role === "STUDENT" ? "Student" : "Tutor"}
              </span>
            </div>

            {/* Profile & Location Button for BOTH Student and Teacher */}
            <button
              type="button"
              onClick={handleOpenProfileModal}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold transition-colors"
              title="Edit Profile & Location (District, Area, Contact)"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Profile &amp; Location</span>
            </button>

            {/* If Tutor: View My Public Profile Button */}
            {currentUser.role === "TUTOR" && (
              <button
                type="button"
                onClick={() => handleOpenTeacherProfile(currentUser.id)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 rounded-xl text-xs font-medium transition-colors"
                title="View Public Teacher Dossier"
              >
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Public Profile</span>
              </button>
            )}

            {/* Feedback / Complain Button (Direct WhatsApp to +8801642695161) */}
            <a
              href="https://wa.me/8801642695161?text=Hello%20Porabo%20Support%2C%20I%20have%20a%20feedback%20or%20complain"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-400 hover:text-emerald-300 border border-emerald-600/60 text-xs font-semibold items-center gap-1.5 transition-all shadow-sm"
              title="Direct WhatsApp Support: +8801642695161"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Feedback &amp; Complaints</span>
            </a>

            {/* Logout on Desktop */}
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="hidden sm:flex p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>

            {/* Mobile 3-Dot Overflow Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="sm:hidden p-2 rounded-xl bg-[#111827] text-slate-300 hover:text-white border border-blue-900/40 hover:border-blue-700/60 transition-colors"
              title="More options"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

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
        {currentUser.role === "STUDENT" ? (
          <div className="space-y-6">
            {/* Student Top Banner */}
            <div className="bg-gradient-to-r from-[#111827] via-[#162032] to-[#111827] border border-blue-900/40 rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-950 text-blue-400 text-xs font-mono border border-blue-800/60">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      Your Location: {currentUser.areaName || "Area"},{" "}
                      {currentUser.district}
                    </span>
                  </div>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Student &amp; Guardian Tuition Portal
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Post your tuition requirements. Every post is reviewed for
                  student safety before going live. Verified teachers in your
                  neighborhood will review and apply. Accept your preferred
                  tutor to unlock mutual contact details.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleOpenProfileModal}
                  className="px-4 py-3 bg-[#0B0F19] hover:bg-slate-800 text-slate-200 font-semibold rounded-2xl text-xs sm:text-sm transition-all border border-slate-700 flex items-center justify-center gap-2 shrink-0 shadow-md"
                >
                  <UserIcon className="w-4 h-4 text-blue-400" />
                  <span>Profile Section</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreatePostOpen(true)}
                  className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Tuition Need</span>
                </button>
              </div>
            </div>

            {/* Applicant Inbox Section */}
            <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      Applicant Inbox
                    </h2>
                    <p className="text-xs text-slate-400">
                      Verified teachers who applied to your tuition posts
                    </p>
                  </div>
                </div>
              </div>

              {studentReceivedApplications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-3">
                  <EmptyInboxIllustration className="w-36 h-36 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-slate-300">
                    No applications received yet.
                  </p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
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

                    return (
                      <div
                        key={app.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                          isAccepted
                            ? "bg-blue-950/20 border-blue-500/50 shadow-lg shadow-blue-950/40"
                            : "bg-[#0B0F19] border-blue-950/70 hover:border-blue-800/50"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <GenderAvatar
                              gender="MALE"
                              role="TUTOR"
                              size="md"
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
                                  className="font-bold text-sm sm:text-base text-white hover:text-blue-400 cursor-pointer underline decoration-blue-500/40 decoration-dotted hover:decoration-solid transition-colors inline-flex items-center gap-1"
                                  title="Click to view detailed qualifications, degrees, experience & ratings"
                                >
                                  <span>{app.tutorName}</span>
                                  <Info className="w-3.5 h-3.5 text-blue-400" />
                                </span>
                                <span className="text-xs text-amber-400 flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-amber-400" />
                                  <span>{app.tutorRating || 5.0}</span>
                                </span>
                                <span className="text-xs text-slate-400">
                                  &bull; {app.tutorDistanceKm || 0.8} km away
                                </span>
                              </div>
                              <p className="text-xs text-blue-400 mt-0.5">
                                {app.tutorQualifications}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Applying for:{" "}
                                <span className="text-slate-300 font-medium">
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
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-400" />
                              <span>View Full Profile</span>
                            </button>

                            {!isAccepted && app.status !== "REJECTED" && (
                              <button
                                type="button"
                                onClick={() => setTutorToAccept(app)}
                                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1"
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
                                      "bg-amber-500/20 text-amber-400 border-amber-500/30",
                                    APPROVED:
                                      "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                                    REJECTED:
                                      "bg-rose-500/20 text-rose-400 border-rose-500/30",
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
                                        setIsRatingModalOpen(true);
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-semibold border border-amber-500/40 flex items-center gap-1 transition-colors"
                                    >
                                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                                      <span>Rate Tutor</span>
                                    </button>
                                  );
                                }

                                return (
                                  <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-400 text-xs font-semibold border border-slate-700 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Review in {30 - daysSince}d</span>
                                  </span>
                                );
                              })()}
                          </div>
                        </div>

                        {/* Proposal Details */}
                        <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                          <div>
                            <span className="text-slate-500">
                              Proposed Fee:
                            </span>{" "}
                            <span className="font-semibold text-emerald-400">
                              ৳ {app.proposedSalary} / month
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">
                              Available Schedule:
                            </span>{" "}
                            <span className="text-slate-300">
                              {app.availableSchedule}
                            </span>
                          </div>
                        </div>

                        {/* Unlocked Contact Details on Acceptance */}
                        {isAccepted && (
                          <div className="mt-3 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs space-y-1.5">
                            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                              <Unlock className="w-4 h-4 text-emerald-400" />
                              <span>Mutual Contact Details Unlocked!</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-200 pt-1">
                              <div>
                                <span className="text-slate-400">
                                  Tutor Phone:
                                </span>{" "}
                                <span className="font-mono font-bold text-white">
                                  {app.tutorPhone || "+880 1712-345678"}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400">
                                  Tutor WhatsApp:
                                </span>{" "}
                                <span className="font-mono font-bold text-emerald-300">
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

            {/* Student's My Posts List with Status Filter & Full Tracking */}
            <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    My Tuition Posts ({studentMyPosts.length})
                  </h2>
                </div>

                {/* Status-Based Filter Chips */}
                <div className="flex items-center gap-1.5 p-1 bg-[#0B0F19] rounded-xl border border-blue-950/60 overflow-x-auto scrollbar-none">
                  {(["ALL", "OPEN", "PENDING", "MATCHED"] as const).map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStudentPostStatusFilter(status)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                          studentPostStatusFilter === status
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
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
                  <p className="text-sm font-semibold text-slate-300">
                    {studentMyPosts.length === 0
                      ? "You haven't posted any tuition needs yet."
                      : `No tuition posts found in "${studentPostStatusFilter}".`}
                  </p>
                  <p className="text-xs text-slate-400">
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

                    return (
                      <div
                        key={post.id}
                        className="p-4 rounded-2xl bg-[#0B0F19] border border-blue-950/70 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-sm sm:text-base text-white">
                              {post.title}
                            </span>
                            <div className="text-xs text-blue-400 mt-0.5">
                              {post.subject} &bull; {post.gradeLevel}
                            </div>
                          </div>

                          {/* Dynamic Verification & Match Badge */}
                          <div className="shrink-0">
                            {isPendingApproval ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Under Admin Review</span>
                              </span>
                            ) : isMatched ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>Matched / Tutor Found</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Approved &amp; Live</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60">
                          <span>{post.curriculum}</span>
                          <span>&bull;</span>
                          <span>{post.daysPerWeek} days/wk</span>
                          <span>&bull;</span>
                          <span className="text-emerald-400 font-semibold">
                            ৳ {post.salaryBudget}/mo
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                          <span className="text-slate-500">
                            {post.applicationsCount || 0} applicant(s)
                          </span>

                          {!isMatched && (
                            <button
                              type="button"
                              onClick={() => handleMarkTutorFound(post.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium border border-slate-700 transition-colors flex items-center gap-1"
                            >
                              <CheckSquare className="w-3 h-3 text-emerald-400" />
                              <span>Mark Tutor Found</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* =================================================================== */
          /* TEACHER MODE: Distance Radar, Google Maps View, Feed, Trends        */
          /* =================================================================== */
          <div className="space-y-6">
            {/* Verification Status Warning if Pending or Rejected */}
            {currentUser.verificationStatus !== "VERIFIED" && (
              <div className="p-4 rounded-3xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111827] border border-blue-900/40 rounded-2xl p-2.5">
              <div className="flex items-center gap-1.5 p-1 bg-[#0B0F19] rounded-xl border border-blue-950/60 w-full sm:w-auto overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setTeacherViewMode("feed")}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                    teacherViewMode === "feed"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white"
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
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>District Radar ({filteredTutorPosts.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTeacherViewMode("my_applications")}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                    teacherViewMode === "my_applications"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white"
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
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Activity Trends</span>
                </button>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleOpenTeacherProfile(currentUser.id)}
                  className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View My Profile</span>
                </button>
              </div>
            </div>

            {/* VIEW MODE: MY APPLICATIONS WITH DYNAMIC TRACKING */}
            {teacherViewMode === "my_applications" && (
              <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Send className="w-5 h-5 text-blue-400" />
                      <span>
                        My Submitted Applications ({tutorMyApplications.length})
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Real-time status tracking for each submitted tuition
                      proposal
                    </p>
                  </div>
                </div>

                {tutorMyApplications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 space-y-3">
                    <EmptyApplicationsIllustration className="w-36 h-36 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-slate-300">
                      You haven't applied to any tuitions yet.
                    </p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
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
                          className="p-4 rounded-2xl bg-[#0B0F19] border border-blue-950/70 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-sm sm:text-base text-white">
                                {post?.title || "Tuition Post"}
                              </h3>
                              <p className="text-xs text-blue-400 mt-0.5">
                                {post?.subject} &bull; {post?.gradeLevel} &bull;{" "}
                                {post?.areaName}, {post?.district}
                              </p>
                            </div>

                            <span
                              className={`text-[11px] font-mono px-3 py-1 rounded-full self-start sm:self-center border flex items-center gap-1.5 ${
                                isAccepted
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : isRejected
                                    ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                                    : "bg-blue-500/20 text-blue-400 border-blue-500/30"
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
                          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                              <Activity className="w-3.5 h-3.5 text-blue-400" />
                              <span>Status Tracking:</span>
                            </div>
                            <p className="text-slate-200 font-medium">
                              {app.dynamicStatusReason}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-400 pt-1">
                            <div>
                              Proposed Fee:{" "}
                              <span className="text-emerald-400 font-semibold">
                                ৳ {app.proposedSalary}/mo
                              </span>
                            </div>
                            <div>
                              Schedule:{" "}
                              <span className="text-slate-300">
                                {app.availableSchedule}
                              </span>
                            </div>
                            <div>
                              Applied:{" "}
                              <span className="text-slate-300">
                                {new Date(app.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {isAccepted && (
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-[#0B1A16] to-[#071310] border border-emerald-500/50 text-emerald-300 space-y-3 shadow-lg">
                              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                                <div className="flex items-center gap-2">
                                  <Unlock className="w-4 h-4 text-emerald-400" />
                                  <span className="font-bold text-sm text-emerald-200">
                                    Student &amp; Guardian Contact Unlocked
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                  Mutual Match Verified
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/50">
                                  <span className="text-[10px] text-emerald-400 font-mono block">
                                    Guardian / Student Name
                                  </span>
                                  <span className="text-white font-semibold text-sm">
                                    {app.studentName ||
                                      post?.studentName ||
                                      "Guardian"}
                                  </span>
                                </div>
                                <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/50">
                                  <span className="text-[10px] text-emerald-400 font-mono block">
                                    Direct Phone
                                  </span>
                                  <span className="text-white font-semibold text-sm">
                                    {app.studentPhone ||
                                      post?.studentPhone ||
                                      "+880 1712-345678"}
                                  </span>
                                </div>
                                <div className="sm:col-span-2 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/50 flex flex-col gap-1">
                                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-emerald-400" />{" "}
                                    Exact Neighborhood &amp; Home Address
                                  </span>
                                  <span className="text-slate-100 font-medium">
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
                                  className="flex-1 py-2 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-[#25D366]/30"
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

            {/* VIEW MODE: COMPREHENSIVE TEACHER ANALYTICS SUITE (RECHARTS) */}
            {teacherViewMode === "trends" && (
              <div className="space-y-6">
                {/* 1. KPI Conversion & Engagement Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-[#111827] border border-blue-900/40 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                      <span>Total Applied</span>
                      <Send className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-white">
                        {analyticsData.totalApplied}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Submitted tuition bids
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#111827] border border-cyan-900/40 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                      <span>In Review</span>
                      <Clock className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">
                        {analyticsData.inReviewCount}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Guardian screening queue
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#111827] border border-emerald-900/40 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                      <span>Matches Accepted</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                        {analyticsData.acceptedCount}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Direct contact unlocked
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#111827] border border-violet-900/40 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                      <span>Conversion Rate</span>
                      <TrendingUp className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-violet-400">
                        {analyticsData.conversionRate}%
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Application acceptance yield
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Visual Funnel: Application Conversion Stages */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="font-bold text-base text-white flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-blue-400" />
                          <span>Application Conversion Funnel</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Stage-by-stage progression from proposal to student
                          match
                        </p>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/50">
                        Real-time Data
                      </span>
                    </div>

                    <div className="w-full h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analyticsData.funnelData}
                          margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#1e293b"
                          />
                          <XAxis
                            dataKey="stage"
                            stroke="#64748b"
                            tick={{ fontSize: 11 }}
                          />
                          <YAxis
                            stroke="#64748b"
                            tick={{ fontSize: 11 }}
                            allowDecimals={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#0f172a",
                              borderColor: "#1e3a8a",
                              borderRadius: "12px",
                              color: "#fff",
                              fontSize: "12px",
                            }}
                          />
                          <Bar
                            dataKey="count"
                            name="Count"
                            radius={[8, 8, 0, 0]}
                          >
                            {analyticsData.funnelData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                      {analyticsData.funnelData.map((f) => (
                        <div
                          key={f.stage}
                          className="p-2 rounded-xl bg-[#0B0F19] border border-blue-950/60"
                        >
                          <div className="font-bold text-white">{f.count}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {f.stage}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Hourly Engagement Patterns */}
                  <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="font-bold text-base text-white flex items-center gap-2">
                          <Clock className="w-4 h-4 text-cyan-400" />
                          <span>Hourly Engagement &amp; Inquiry Windows</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Peak neighborhood tuition activity &amp; proposal
                          submission response
                        </p>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                        Peak: 17:00 - 21:00
                      </span>
                    </div>

                    <div className="w-full h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analyticsData.hourlyData}
                          margin={{ top: 20, right: 20, left: -10, bottom: 25 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#1e293b"
                          />
                          <XAxis
                            dataKey="period"
                            stroke="#64748b"
                            tick={{ fontSize: 10 }}
                            interval={0}
                            angle={-15}
                            textAnchor="end"
                          />
                          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#0f172a",
                              borderColor: "#1e3a8a",
                              borderRadius: "12px",
                              color: "#fff",
                              fontSize: "12px",
                            }}
                          />
                          <Bar
                            dataKey="engagementScore"
                            name="Engagement Index %"
                            fill="#06b6d4"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-300 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        <strong>Pro Tip:</strong> 68% of guardians review and
                        accept proposals between 5:00 PM and 9:00 PM. Submitting
                        proposals during this window increases your matching
                        speed.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Profile View Trends by Date (30-Day Area Chart) */}
                <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        <span>
                          Profile View Trends &amp; Guardian Reach (30 Days)
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Daily student and parent impressions on your verified
                        teacher dossier
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-blue-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />{" "}
                        Applications
                      </span>
                      <span className="flex items-center gap-1.5 text-cyan-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />{" "}
                        Profile Views
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-72 sm:h-80 -ml-2 sm:ml-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={trends30Days}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorViews"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#06b6d4"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor="#06b6d4"
                              stopOpacity={0.0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorApps"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3b82f6"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3b82f6"
                              stopOpacity={0.0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                          dataKey="date"
                          stroke="#64748b"
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#1e3a8a",
                            borderRadius: "12px",
                            color: "#fff",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="profileViews"
                          name="Profile Views"
                          stroke="#06b6d4"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorViews)"
                        />
                        <Area
                          type="monotone"
                          dataKey="applications"
                          name="Proposals Submitted"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorApps)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODE: TUITION FEED (GRID CARDS) */}
            {teacherViewMode === "feed" && (
              <div className="space-y-5">
                {/* District Active Tuition Feed Banner (Centralized Location - Standalone buttons removed) */}
                <div className="bg-[#111827] border border-blue-900/40 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                        <span>
                          Active District Feed:{" "}
                          <span className="text-cyan-400 font-extrabold">
                            {currentUser.district}
                          </span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                          {filteredTutorPosts.length} Tuitions
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Showing all tuition posts available exclusively within
                        your registered district ({currentUser.district})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setTeacherViewMode("map")}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all"
                    >
                      <Radio className="w-3.5 h-3.5 animate-pulse text-white" />
                      <span>View District Radar Blips</span>
                    </button>
                  </div>
                </div>

                {/* Recent Searches Chip Bar */}
                {recentSearches.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap text-xs bg-[#111827] border border-blue-900/40 rounded-2xl p-2.5 sm:p-3 shadow-md">
                    <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px] shrink-0">
                      <History className="w-3.5 h-3.5 text-blue-400" /> Recent:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap flex-1">
                      {recentSearches.map((term, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setGlobalSearchQuery(term);
                            addRecentSearch(term);
                          }}
                          className={`px-2.5 py-1 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
                            globalSearchQuery.toLowerCase() ===
                            term.toLowerCase()
                              ? "bg-blue-600 border-blue-500 text-white font-semibold"
                              : "bg-[#0B0F19] hover:bg-blue-950 text-slate-300 hover:text-blue-300 border-blue-950/80"
                          }`}
                        >
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setRecentSearches([])}
                      className="text-[11px] text-slate-500 hover:text-slate-300 underline shrink-0 ml-auto"
                      title="Clear search history"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Hidden Posts Alert Banner */}
                {hiddenPostIds.length > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#111827] border border-amber-500/30 text-xs text-slate-300 shadow-md">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        {hiddenPostIds.length} tuition post
                        {hiddenPostIds.length > 1 ? "s" : ""} hidden from your
                        feed.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleUnhideAllPosts}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                    >
                      Restore All
                    </button>
                  </div>
                )}

                {/* Filter Controls Bar with Distance Range Slider (1km to 5km) */}
                <div className="bg-[#111827] border border-blue-900/40 rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5 flex-1">
                    {/* Distance Range Slider (1km to 5km) */}
                    <div className="flex items-center gap-2.5 bg-[#0B0F19] border border-blue-950/80 rounded-xl px-3 py-1.5 text-xs">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-medium">
                          Radius:
                        </span>
                        <span className="font-bold text-cyan-300 font-mono w-11">
                          {distanceRadiusKm} km
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="0.5"
                        value={distanceRadiusKm}
                        onChange={(e) => {
                          setDistanceRadiusKm(Number(e.target.value));
                          setIsDistanceFilterEnabled(true);
                        }}
                        className="w-20 sm:w-28 accent-cyan-400 cursor-pointer"
                        title={`Filter tuition posts within ${distanceRadiusKm} km of your location`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setIsDistanceFilterEnabled(!isDistanceFilterEnabled)
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                          isDistanceFilterEnabled
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-semibold"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                        title="Toggle distance filtering on or off"
                      >
                        {isDistanceFilterEnabled
                          ? "1-5km Active"
                          : "District All"}
                      </button>
                    </div>

                    <select
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                      className="bg-[#0B0F19] border border-blue-950/70 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      {SUBJECT_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filterGrade}
                      onChange={(e) => setFilterGrade(e.target.value)}
                      className="bg-[#0B0F19] border border-blue-950/70 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      {GRADE_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        setFilterOnlyBookmarked(!filterOnlyBookmarked)
                      }
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        filterOnlyBookmarked
                          ? "bg-rose-600/20 text-rose-400 border border-rose-500/40"
                          : "bg-[#0B0F19] text-slate-400 border border-blue-950/70 hover:text-white"
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${filterOnlyBookmarked ? "fill-rose-400" : ""}`}
                      />
                      <span>Bookmarked Only ({bookmarkedPostIds.length})</span>
                    </button>
                  </div>

                  <div className="text-xs text-slate-400 font-mono self-end lg:self-auto">
                    Showing{" "}
                    <span className="font-bold text-blue-400">
                      {filteredTutorPosts.length}
                    </span>{" "}
                    matching tuition posts
                  </div>
                </div>

                {/* Tuition Post Cards Grid */}
                {filteredTutorPosts.length === 0 ? (
                  <div className="p-12 text-center bg-[#111827] border border-blue-900/30 rounded-3xl space-y-3">
                    <EmptyFeedIllustration className="w-36 h-36 mx-auto mb-2" />
                    <p className="text-base font-bold text-white">
                      No tuition posts found in this range.
                    </p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Try expanding your distance slider up to 5km, toggling off
                      distance limit, or clearing specific search keywords.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setDistanceRadiusKm(5);
                        setIsDistanceFilterEnabled(false);
                        setFilterSubject("All Subjects");
                        setFilterGrade("All Grades");
                        setFilterOnlyBookmarked(false);
                        setGlobalSearchQuery("");
                      }}
                      className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-md"
                    >
                      Reset Filters &amp; View All District Posts
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTutorPosts.map((post) => {
                      const alreadyApplied = tutorMyApplications.some(
                        (a) => a.postId === post.id,
                      );

                      return (
                        <div
                          key={post.id}
                          className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5 shadow-xl hover:border-blue-700/60 transition-all flex flex-col justify-between space-y-4 relative group"
                        >
                          <div>
                            {/* Card Header with Badges & Action Buttons */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2.5 py-1 rounded-full bg-blue-950 text-blue-400 text-[11px] font-mono font-semibold border border-blue-800/60 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-blue-400" />
                                <span>
                                  {post.distanceKm !== undefined
                                    ? formatDistanceAnnotation(post.distanceKm)
                                        .badgeText
                                    : "Nearby"}
                                </span>
                              </span>

                              <div className="flex items-center gap-1">
                                {/* Share via QR Code */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setQrModalData({
                                      isOpen: true,
                                      title: post.title,
                                      subtitle: `${post.subject} • ${post.gradeLevel}`,
                                      district: post.district,
                                      areaName: post.areaName,
                                      shareUrl: `${window.location.origin}/#post-${post.id}`,
                                      type: "post",
                                    });
                                  }}
                                  title="Share via QR Code for offline neighborhood matching"
                                  className="w-7 h-7 rounded-full bg-[#0B0F19] hover:bg-blue-950/80 flex items-center justify-center border border-blue-950/70 text-slate-400 hover:text-cyan-300 transition-colors"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                </button>

                                {/* Web Share API */}
                                <button
                                  type="button"
                                  onClick={(e) => handleSharePost(post, e)}
                                  title="Share tuition post link"
                                  className="w-7 h-7 rounded-full bg-[#0B0F19] hover:bg-blue-950/80 flex items-center justify-center border border-blue-950/70 text-slate-400 hover:text-white transition-colors"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Hide Post */}
                                <button
                                  type="button"
                                  onClick={(e) => handleHidePost(post.id, e)}
                                  title="Hide this post from your feed"
                                  className="w-7 h-7 rounded-full bg-[#0B0F19] hover:bg-slate-800 flex items-center justify-center border border-blue-950/70 text-slate-400 hover:text-rose-400 transition-colors"
                                >
                                  <EyeOff className="w-3.5 h-3.5" />
                                </button>

                                {/* Bookmark */}
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    handleToggleBookmark(post.id, e)
                                  }
                                  title={
                                    post.isBookmarked
                                      ? "Remove Bookmark"
                                      : "Bookmark this post"
                                  }
                                  className="w-7 h-7 rounded-full bg-[#0B0F19] hover:bg-slate-800 flex items-center justify-center border border-blue-950/70 transition-colors"
                                >
                                  <Heart
                                    className={`w-3.5 h-3.5 ${
                                      post.isBookmarked
                                        ? "text-rose-500 fill-rose-500"
                                        : "text-slate-400 hover:text-white"
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>

                            <h3 className="font-bold text-base text-white line-clamp-2 leading-snug">
                              {post.title}
                            </h3>
                            <p className="text-xs text-blue-400 font-medium mt-1">
                              {post.subject} &bull; {post.gradeLevel}
                            </p>

                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              <span className="px-2 py-0.5 rounded bg-[#0B0F19] text-slate-300 text-[10px] border border-slate-800">
                                {post.curriculum}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-[#0B0F19] text-slate-300 text-[10px] border border-slate-800">
                                {post.daysPerWeek} days/week
                              </span>
                            </div>

                            <div className="mt-3 text-xs text-slate-400 space-y-1">
                              <div className="flex items-center gap-1 text-slate-300">
                                <Compass className="w-3.5 h-3.5 text-slate-500" />
                                <span>
                                  {post.areaName}, {post.district}
                                </span>
                              </div>
                              {post.specialRequirements && (
                                <p className="text-[11px] text-slate-400 italic line-clamp-2 mt-1">
                                  "{post.specialRequirements}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-mono block">
                                Monthly Budget
                              </span>
                              <span className="text-base font-extrabold text-emerald-400">
                                ৳ {post.salaryBudget.toLocaleString()}
                              </span>
                            </div>

                            {alreadyApplied ? (
                              <span className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/30 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                <span>Applied</span>
                              </span>
                            ) : currentUser.verificationStatus !==
                              "VERIFIED" ? (
                              <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/30">
                                Verification Pending
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                {/* Quick Apply Button (Bypasses modal for verified tutors) */}
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    handleQuickApplyToPost(post, e)
                                  }
                                  className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1"
                                  title="Quick Apply using verified default profile &amp; salary"
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>Quick Apply</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPostForApply(post);
                                    setApplyProposedSalary(post.salaryBudget);
                                  }}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>Apply</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: APPLY TO TUITION POST */}
      {selectedPostForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#111827] border border-blue-900/40 rounded-3xl p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedPostForApply(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-white mb-1">
              Apply to Tuition Post
            </h3>
            <p className="text-xs text-blue-400 mb-4">
              {selectedPostForApply.title} &bull;{" "}
              {selectedPostForApply.areaName}
            </p>

            <form onSubmit={handleApplyToPost} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Proposed Monthly Salary (৳)
                </label>
                <input
                  type="number"
                  value={applyProposedSalary}
                  onChange={(e) =>
                    setApplyProposedSalary(Number(e.target.value))
                  }
                  required
                  className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Available Schedule
                </label>
                <input
                  type="text"
                  value={applySchedule}
                  onChange={(e) => setApplySchedule(e.target.value)}
                  placeholder="e.g. Mon, Wed, Fri (4:30 PM - 6:00 PM)"
                  required
                  className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cover Message
                </label>
                <textarea
                  rows={3}
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  required
                  className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPostForApply(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW TUITION POST */}
      {isCreatePostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#111827] border border-blue-900/40 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsCreatePostOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-white mb-1">
              Post Tuition Requirement
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your curriculum details and budget. Posts are reviewed by
              admin for safety.
            </p>

            <form onSubmit={handleCreatePost} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="e.g. Class 10 Higher Math & Physics Mentor"
                  required
                  className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={newPostSubject}
                    onChange={(e) => setNewPostSubject(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {SUBJECT_OPTIONS.filter((s) => s !== "All Subjects").map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Grade Level
                  </label>
                  <select
                    value={newPostGrade}
                    onChange={(e) => setNewPostGrade(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {GRADE_OPTIONS.filter((g) => g !== "All Grades").map(
                      (g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Curriculum
                  </label>
                  <select
                    value={newPostCurriculum}
                    onChange={(e) => setNewPostCurriculum(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="English Version">English Version</option>
                    <option value="Bangla Medium">Bangla Medium</option>
                    <option value="Cambridge International">
                      Cambridge International
                    </option>
                    <option value="Edexcel">Edexcel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Monthly Budget (৳)
                  </label>
                  <input
                    type="number"
                    value={newPostBudget}
                    onChange={(e) => setNewPostBudget(Number(e.target.value))}
                    required
                    className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <DistrictSelect
                    value={newPostDistrict}
                    onChange={setNewPostDistrict}
                    label="District (Search 64 Districts)"
                    placeholder="Search Bangladesh districts..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Neighborhood Area
                  </label>
                  <input
                    type="text"
                    value={newPostArea}
                    onChange={(e) => setNewPostArea(e.target.value)}
                    placeholder="e.g. Dhanmondi 27"
                    required
                    className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Exact Address (Protected - Unlocks only when tutor accepted)
                </label>
                <input
                  type="text"
                  value={newPostAddress}
                  onChange={(e) => setNewPostAddress(e.target.value)}
                  placeholder="e.g. House 42, Road 8/A, Apt 3-B"
                  required
                  className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mt-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Tuition Request</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM ACCEPT TUTOR */}
      {tutorToAccept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111827] border border-blue-500/40 rounded-3xl p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-lg text-white mb-2">
              Accept {tutorToAccept.tutorName}?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              By accepting this tutor, your tuition request will be matched.
              Both parties will unlock mutual direct phone and WhatsApp contact
              numbers.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTutorToAccept(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAcceptTutor}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm &amp; Unlock</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: 1-MONTH RATING MODAL */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#111827] border border-blue-900/50 rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setIsRatingModalOpen(false);
                setRatingApplication(null);
              }}
              className="absolute right-5 top-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">
                  Rate Tutor after 1 Month
                </h3>
                <p className="text-xs text-slate-400">
                  Student &amp; Guardian Authentic Evaluation
                </p>
              </div>
            </div>

            {/* Application context */}
            {ratingApplication && (
              <div className="mb-4 p-3 bg-[#0B0F19] border border-blue-950 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tutor:</span>
                  <span className="text-white font-semibold">
                    {allUsers.find((u) => u.id === ratingApplication.tutorId)
                      ?.fullName || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Post:</span>
                  <span className="text-slate-300 truncate">
                    {tuitionPosts.find((p) => p.id === ratingApplication.postId)
                      ?.title || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Accepted:</span>
                  <span className="text-emerald-400 font-mono">
                    {ratingApplication.acceptedAt
                      ? new Date(
                          ratingApplication.acceptedAt,
                        ).toLocaleDateString()
                      : "recent"}
                  </span>
                </div>
                <div className="flex justify-between text-amber-400 pt-1 border-t border-slate-800 text-[10px] font-mono">
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
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Your Guardian or Student Title
                </label>
                <input
                  type="text"
                  value={ratingReviewerRole}
                  onChange={(e) => setRatingReviewerRole(e.target.value)}
                  placeholder="e.g. Mrs. Nasreen (Guardian, Class 10)"
                  required
                  className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Categorical Ratings */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">
                    1. Punctuality (Time consistency)
                  </span>
                  <span className="font-bold text-blue-400">
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
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-[#0B0F19] border-slate-800 text-slate-500"
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">
                    2. Subject Mastery (Syllabus depth)
                  </span>
                  <span className="font-bold text-cyan-400">
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
                          ? "bg-cyan-500 border-cyan-400 text-black"
                          : "bg-[#0B0F19] border-slate-800 text-slate-500"
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">
                    3. Teaching Style (Patience &amp; clarity)
                  </span>
                  <span className="font-bold text-indigo-400">
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
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "bg-[#0B0F19] border-slate-800 text-slate-500"
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Written Feedback
                </label>
                <textarea
                  rows={3}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  required
                  className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
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
        />
      )}

      {/* MODAL: RE-SUBMIT VERIFICATION DOCUMENTS (FOR REJECTED TUTORS) */}
      {isResubmitModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#111827] border border-rose-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsResubmitModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">
                  Re-submit Verification Documents
                </h3>
                <p className="text-xs text-slate-400">
                  Correct your documentation dossier for administrative re-audit
                </p>
              </div>
            </div>

            {/* Rejection Note */}
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs mb-4">
              <span className="font-bold text-white block mb-0.5">
                Previous Rejection Note from Admin:
              </span>
              {currentUser.verificationRejectionReason ||
                "Submitted selfie was not clear or ID documents did not meet legibility requirements."}
            </div>

            <form onSubmit={handleResubmitVerification} className="space-y-4">
              {/* 1. National ID Number */}
              <div className="p-3.5 bg-[#0B0F19] rounded-2xl border border-blue-950/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    1. National ID / Birth Certificate Number
                  </span>
                  <span className="text-[10px] text-blue-400 font-mono">
                    Official Gov Record
                  </span>
                </div>
                <input
                  type="text"
                  value={resubmitNidNumber}
                  onChange={(e) => setResubmitNidNumber(e.target.value)}
                  placeholder={currentUser.nidNumber || "e.g. 19984729104829"}
                  className="w-full bg-[#111827] border border-blue-950 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* 2. Institution Roll & Reg Numbers */}
              <div className="p-3.5 bg-[#0B0F19] rounded-2xl border border-blue-950/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    2. Institution Student ID Credentials
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Academic Verification
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Student ID Roll No.
                    </label>
                    <input
                      type="text"
                      value={resubmitRoll}
                      onChange={(e) => setResubmitRoll(e.target.value)}
                      placeholder={
                        currentUser.studentIdCardRoll || "e.g. 2021-MAT-042"
                      }
                      className="w-full bg-[#111827] border border-blue-950 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Student ID Reg No.
                    </label>
                    <input
                      type="text"
                      value={resubmitReg}
                      onChange={(e) => setResubmitReg(e.target.value)}
                      placeholder={
                        currentUser.studentIdCardReg || "e.g. DU-849201"
                      }
                      className="w-full bg-[#111827] border border-blue-950 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResubmitModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Corrected Dossier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UNIFIED PROFILE & LOCATION MODAL (STUDENT & TUTOR) WITH ACTIVITY LOG */}
      {isProfileModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#111827] border border-blue-900/50 rounded-3xl p-5 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl text-white">
                  {currentUser.role === "STUDENT"
                    ? "Student & Guardian Profile"
                    : "Teacher Professional Profile"}
                </h3>
                <p className="text-xs text-slate-400">
                  Manage your verified identity, district location, and view
                  your platform activity
                </p>
              </div>
            </div>

            {/* Profile Navigation Tabs: Information vs Activity Log */}
            <div className="grid grid-cols-2 p-1 bg-[#0B0F19] rounded-2xl border border-blue-950/70 mb-5">
              <button
                type="button"
                onClick={() => setProfileModalTab("info")}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  profileModalTab === "info"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
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
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
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
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      placeholder="e.g. Farhana Yasmin"
                      className="w-full bg-[#0B0F19] border border-blue-950/70 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Phone Number (+880)
                    </label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      required
                      placeholder="+880 1712-XXXXXX"
                      className="w-full bg-[#0B0F19] border border-blue-950/70 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    WhatsApp Contact Number
                  </label>
                  <input
                    type="tel"
                    value={profileWhatsapp}
                    onChange={(e) => setProfileWhatsapp(e.target.value)}
                    placeholder="e.g. +880 1712-XXXXXX"
                    className="w-full bg-[#0B0F19] border border-blue-950/70 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Used for direct WhatsApp chat upon confirmed tuition match.
                  </span>
                </div>

                {/* Location Settings: District Combobox & Area */}
                <div className="p-4 bg-[#0B0F19] rounded-2xl border border-blue-950/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
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
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Neighborhood / Area Name
                      </label>
                      <input
                        type="text"
                        value={profileArea}
                        onChange={(e) => setProfileArea(e.target.value)}
                        placeholder="e.g. Dhanmondi, Mirpur 10, Agrabad"
                        required
                        className="w-full bg-[#111827] border border-blue-950/70 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Exact Address (Private - Unlocks Only Upon Match)
                    </label>
                    <input
                      type="text"
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="e.g. House 42, Road 8/A, Block D"
                      className="w-full bg-[#111827] border border-blue-950/70 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Tutor Specific Professional Information */}
                {currentUser.role === "TUTOR" && (
                  <div className="p-4 bg-[#0B0F19] rounded-2xl border border-blue-950/80 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                      <GraduationCap className="w-4 h-4" />
                      <span>Professional Educator Profile</span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Expected Monthly Salary / Rate (৳)
                      </label>
                      <input
                        type="number"
                        value={profileExpectedFee}
                        onChange={(e) =>
                          setProfileExpectedFee(Number(e.target.value))
                        }
                        className="w-full bg-[#111827] border border-blue-950/70 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Professional Bio
                      </label>
                      <textarea
                        rows={2}
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        placeholder="Describe your background and teaching focus..."
                        className="w-full bg-[#111827] border border-blue-950/70 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Teaching Philosophy
                      </label>
                      <textarea
                        rows={2}
                        value={profilePhilosophy}
                        onChange={(e) => setProfilePhilosophy(e.target.value)}
                        placeholder="Your pedagogy, conceptual explanation method, evaluation style..."
                        className="w-full bg-[#111827] border border-blue-950/70 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Specialized Subjects
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {profileSubjects.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-blue-950 border border-blue-800 text-blue-300 text-xs flex items-center gap-1.5"
                          >
                            <span>{s}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setProfileSubjects(
                                  profileSubjects.filter((_, i) => i !== idx),
                                )
                              }
                              className="hover:text-rose-400"
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
                          className="flex-1 bg-[#111827] border border-blue-950/70 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
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
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
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
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs sm:text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5"
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
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs"
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
