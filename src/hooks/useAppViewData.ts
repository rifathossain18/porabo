import { useMemo } from "react";
import {
  NotificationItem,
  TuitionApplication,
  TuitionPost,
  User,
} from "../lib/types";
import { calculateDistanceKm } from "../lib/geo";
import { ANCHOR_LOCATION } from "../lib/mockData";

type StudentPostStatusFilter = "ALL" | "OPEN" | "PENDING" | "MATCHED";

interface AppViewDataOptions {
  currentUser: User | null;
  applications: TuitionApplication[];
  notifications: NotificationItem[];
  tuitionPosts: TuitionPost[];
  allQuizzes: { teacherId: string }[];
  allUsers: User[];
  bookmarkedPostIds: string[];
  hiddenPostIds: string[];
  isDistanceFilterEnabled: boolean;
  distanceRadiusKm: number;
  globalSearchQuery: string;
  filterOnlyBookmarked: boolean;
  filterDistrict: string;
  filterSubject: string;
  filterMinBudget: number;
  filterMaxBudget: number;
  filterGrade: string;
  studentPostStatusFilter: StudentPostStatusFilter;
  viewingTeacherProfileId: string | null;
}

export function useAppViewData({
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
}: AppViewDataOptions) {
  const baseLat = currentUser?.latitude || ANCHOR_LOCATION.latitude;
  const baseLng = currentUser?.longitude || ANCHOR_LOCATION.longitude;

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
      const countOnDay = tutorApps.filter((a) => {
        const aDate = a.createdAt ? a.createdAt.split("T")[0] : "";
        return aDate === dateIsoPrefix;
      }).length;
      const views = countOnDay > 0 ? countOnDay * 5 + 4 : i % 4 === 0 ? 2 : 1;

      data.push({
        date: dayStr,
        applications: countOnDay,
        profileViews: views,
      });
    }
    return data;
  }, [applications, currentUser]);

  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter((n) => n.userId === currentUser.id);
  }, [notifications, currentUser]);

  const unreadNotifCount = useMemo(
    () => userNotifications.filter((n) => !n.isRead).length,
    [userNotifications],
  );

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

  const postsWithDistance = useMemo(() => {
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

  const filteredTutorPosts = useMemo(() => {
    const myAppliedIds =
      currentUser?.role === "TUTOR"
        ? applications
            .filter((a) => a.tutorId === currentUser.id)
            .map((a) => a.postId)
        : [];

    return postsWithDistance.filter((post) => {
      if (myAppliedIds.includes(post.id)) return false;
      if (hiddenPostIds.includes(post.id)) return false;

      if (isDistanceFilterEnabled && post.distanceKm !== undefined) {
        if (post.distanceKm > distanceRadiusKm) return false;
      }

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

      if (filterOnlyBookmarked && !post.isBookmarked) return false;

      if (currentUser?.role === "TUTOR") {
        const teacherDistrict = (currentUser.district || "Dhaka")
          .trim()
          .toLowerCase();
        const postDistrict = (post.district || "").trim().toLowerCase();
        if (teacherDistrict !== postDistrict) return false;
      } else if (
        filterDistrict !== "All Districts" &&
        post.district !== filterDistrict
      ) {
        return false;
      }

      if (
        filterSubject !== "All Subjects" &&
        !post.subject.toLowerCase().includes(filterSubject.toLowerCase())
      ) {
        return false;
      }

      if (
        post.salaryBudget < filterMinBudget ||
        post.salaryBudget > filterMaxBudget
      ) {
        return false;
      }

      if (filterGrade !== "All Grades" && post.gradeLevel !== filterGrade) {
        return false;
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
    applications,
    currentUser,
  ]);

  const studentMyPosts = useMemo(() => {
    if (!currentUser || currentUser.role !== "STUDENT") return [];
    return tuitionPosts.filter((p) => p.studentId === currentUser.id);
  }, [tuitionPosts, currentUser]);

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

  const studentReceivedApplications = useMemo(() => {
    if (!currentUser || currentUser.role !== "STUDENT") return [];
    const myPostIds = new Set(studentMyPosts.map((post) => post.id));
    const rawApps = applications.filter((application) =>
      myPostIds.has(application.postId),
    );
    const quizCountByTeacher = new Map<string, number>();
    allQuizzes.forEach((quiz) => {
      quizCountByTeacher.set(
        quiz.teacherId,
        (quizCountByTeacher.get(quiz.teacherId) || 0) + 1,
      );
    });

    return rawApps.sort(
      (a, b) =>
        (quizCountByTeacher.get(b.tutorId) || 0) -
        (quizCountByTeacher.get(a.tutorId) || 0),
    );
  }, [applications, studentMyPosts, allQuizzes, currentUser]);

  const myAcceptedApplications = useMemo(() => {
    if (!currentUser || currentUser.role !== "STUDENT") return [];
    return applications.filter((a) => {
      if (a.status !== "ACCEPTED") return false;
      if (a.studentId) return a.studentId === currentUser.id;
      const post = tuitionPosts.find((p) => p.id === a.postId);
      return post ? post.studentId === currentUser.id : false;
    });
  }, [applications, tuitionPosts, currentUser]);

  const tutorMyApplications = useMemo(() => {
    if (!currentUser || currentUser.role !== "TUTOR") return [];
    return applications
      .filter((a) => a.tutorId === currentUser.id)
      .map((app) => {
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

  const viewingTeacherProfile = useMemo(() => {
    if (!viewingTeacherProfileId) return null;
    return allUsers.find((t) => t.id === viewingTeacherProfileId) || null;
  }, [viewingTeacherProfileId, allUsers]);

  return {
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
  };
}
