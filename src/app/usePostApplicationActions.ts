import type { Dispatch, FormEvent, MouseEvent, SetStateAction } from "react";
import { cfD1 } from "../lib/cloudflareD1";
import { calculateDistanceKm } from "../lib/geo";
import { getTutorRatingSummary } from "../lib/ratings";
import type {
  NotificationItem,
  TuitionApplication,
  TuitionPost,
  User,
} from "../lib/types";

interface PostApplicationActionsOptions {
  currentUser: User | null;
  baseLat: number;
  baseLng: number;
  tuitionPosts: TuitionPost[];
  applications: TuitionApplication[];
  setTuitionPosts: Dispatch<SetStateAction<TuitionPost[]>>;
  setApplications: Dispatch<SetStateAction<TuitionApplication[]>>;
  setIsCreatePostOpen: Dispatch<SetStateAction<boolean>>;
  selectedPostForApply: TuitionPost | null;
  setSelectedPostForApply: Dispatch<SetStateAction<TuitionPost | null>>;
  applyProposedSalary: number;
  applySchedule: string;
  applyMessage: string;
  showToast: (message: string) => void;
  sendNotification: (
    item: Omit<NotificationItem, "id" | "isRead" | "createdAt">,
  ) => void;
  setRatingTutorId: Dispatch<SetStateAction<string>>;
  setRatingApplication: Dispatch<SetStateAction<TuitionApplication | null>>;
}

export function usePostApplicationActions({
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
}: PostApplicationActionsOptions) {
  const handleApplyToPost = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedPostForApply || !currentUser) return;
    if (currentUser.verificationStatus !== "VERIFIED") {
      showToast("Your account is pending verification. Only verified tutors can apply to tuitions.");
      return;
    }

    const distance = calculateDistanceKm(
      baseLat,
      baseLng,
      selectedPostForApply.latitude,
      selectedPostForApply.longitude,
    );
    const application: TuitionApplication = {
      id: `app_${Date.now()}`,
      postId: selectedPostForApply.id,
      tutorId: currentUser.id,
      tutorName: currentUser.fullName,
      tutorQualifications: currentUser.qualifications || "B.Sc Graduate",
      tutorInstitution: currentUser.institution?.trim() || undefined,
      tutorRating: getTutorRatingSummary(currentUser).average,
      tutorExperienceYears: currentUser.yearsOfExperience || 3,
      tutorSubjects: currentUser.subjectsTaught || ["Higher Math", "Physics"],
      tutorDistanceKm: distance,
      proposedSalary: applyProposedSalary,
      availableSchedule: applySchedule,
      message: applyMessage,
      status: "PENDING",
      statusReason: "Application Under Review by Guardian (Initial Screening)",
      createdAt: new Date().toISOString(),
      tutorPhone: currentUser.phone,
      tutorWhatsapp: currentUser.whatsapp || currentUser.phone,
    };
    setApplications((previous) => [application, ...previous]);
    setSelectedPostForApply(null);
    showToast("Application submitted. The student will review your verified profile.");
    cfD1.saveApplication(application).catch((error) =>
      console.warn("Cloudflare D1 saveApplication error:", error),
    );
    sendNotification({
      userId: selectedPostForApply.studentId,
      title: "Tutor Applied to your post",
      message: `${currentUser.fullName} (${currentUser.institution || "Verified Scholar"}) applied for "${selectedPostForApply.title}" with proposed fee ৳ ${applyProposedSalary.toLocaleString()}/mo.`,
      type: "APPLICATION_RECEIVED",
      postId: selectedPostForApply.id,
      linkText: "Review in Applicant Inbox",
    });
  };

  const handleQuickApplyToPost = (
    post: TuitionPost,
    event?: MouseEvent,
  ) => {
    event?.stopPropagation();
    if (!currentUser || currentUser.role !== "TUTOR") return;
    if (currentUser.verificationStatus !== "VERIFIED") {
      showToast("Profile verification required before quick-applying.");
      return;
    }

    const proposedSalary = post.salaryBudget;
    const distance = calculateDistanceKm(
      baseLat,
      baseLng,
      post.latitude,
      post.longitude,
    );
    const application: TuitionApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      postId: post.id,
      tutorId: currentUser.id,
      tutorName: currentUser.fullName,
      tutorQualifications:
        currentUser.qualifications ||
        `${currentUser.institution || "University"} Graduate`,
      tutorInstitution: currentUser.institution?.trim() || undefined,
      tutorRating: getTutorRatingSummary(currentUser).average,
      tutorExperienceYears: currentUser.yearsOfExperience || 2,
      tutorSubjects: currentUser.subjectsTaught || [post.subject],
      tutorDistanceKm: distance,
      proposedSalary,
      availableSchedule: "Mon, Wed, Fri (4:30 PM - 6:00 PM)",
      message: `I am a verified tutor in ${currentUser.district} (${currentUser.areaName || ""}) with proven academic credentials. Ready to begin coaching for ${post.subject}.`,
      status: "PENDING",
      statusReason: "Application Under Review by Guardian (Initial Screening)",
      createdAt: new Date().toISOString(),
      tutorPhone: currentUser.phone,
      tutorWhatsapp: currentUser.whatsapp || currentUser.phone,
    };
    setApplications((previous) => [application, ...previous]);
    showToast(
      `Application submitted for "${post.title}". Proposed fee: ৳${proposedSalary.toLocaleString()}/month.`,
    );
    cfD1.saveApplication(application).catch((error) =>
      console.warn("Cloudflare D1 saveApplication error:", error),
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

  const acceptTutorDirectly = async (
    applicationToAccept: TuitionApplication,
  ) => {
    if (!currentUser) {
      showToast("❌ You must be logged in to accept tutors.");
      return;
    }
    const targetPost = tuitionPosts.find(
      (post) => post.id === applicationToAccept.postId,
    );
    if (!targetPost) {
      showToast("❌ This tuition post no longer exists.");
      return;
    }
    if (
      !confirm(
        `Accept ${applicationToAccept.tutorName}?\n\nThis will unlock their contact details and mark your tuition as matched.`,
      )
    ) {
      return;
    }

    showToast("⏳ Accepting tutor, please wait...");
    try {
      const acceptedApplication: TuitionApplication = {
        ...applicationToAccept,
        status: "ACCEPTED",
        acceptedAt: new Date().toISOString(),
        statusReason: "Accepted & Contact Unlocked! 🎉",
        studentId: currentUser.id,
        studentName: currentUser.fullName,
        studentPhone:
          currentUser.phone || targetPost.studentPhone || "+880 1712-345678",
        studentWhatsapp:
          currentUser.whatsapp || currentUser.phone || "+880 1712-345678",
        studentExactAddress:
          targetPost.exactAddress ||
          `${targetPost.areaName}, ${targetPost.district}`,
        studentAreaName: targetPost.areaName,
        studentDistrict: targetPost.district,
      };
      await cfD1.saveApplication(acceptedApplication);

      const otherApplications = applications.filter(
        (application) =>
          application.postId === applicationToAccept.postId &&
          application.id !== applicationToAccept.id,
      );
      for (const otherApplication of otherApplications) {
        const rejectedApplication: TuitionApplication = {
          ...otherApplication,
          status: "REJECTED",
          statusReason: "Student selected another tutor for this tuition.",
        };
        await cfD1.saveApplication(rejectedApplication).catch((error) =>
          console.warn("[accept] Reject other failed (non-fatal):", error),
        );
      }

      const updatedPost: TuitionPost = {
        ...targetPost,
        status: "MATCHED",
        isFoundTutor: true,
        acceptedTutorId: applicationToAccept.tutorId,
        acceptedAt: new Date().toISOString(),
      };
      await cfD1.savePost(updatedPost);
      setApplications((previous) =>
        previous.map((application) => {
          if (application.postId !== applicationToAccept.postId) return application;
          if (application.id === applicationToAccept.id) {
            return acceptedApplication;
          }
          return {
            ...application,
            status: "REJECTED",
            statusReason: "Student selected another tutor for this tuition.",
          };
        }),
      );
      setTuitionPosts((previous) =>
        previous.map((post) =>
          post.id === applicationToAccept.postId ? updatedPost : post,
        ),
      );
      sendNotification({
        userId: applicationToAccept.tutorId,
        title: "Application Accepted! 🎉",
        message: `Congratulations! ${currentUser.fullName} accepted your application for "${targetPost.title}". Phone: ${currentUser.phone}. Address: ${targetPost.exactAddress || targetPost.areaName}`,
        type: "APPLICATION_ACCEPTED",
        postId: applicationToAccept.postId,
        linkText: "View in My Applications",
      });
      setRatingTutorId(applicationToAccept.tutorId);
      showToast(
        `✅ ${applicationToAccept.tutorName} accepted! Contact details unlocked.`,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      alert(
        `❌ Failed to accept tutor.\n\nError: ${message}\n\nTry:\n1. Refresh page (Ctrl+Shift+R)\n2. Log out and log in again\n3. Then click Accept Tutor again`,
      );
      showToast(`❌ Accept failed: ${message}`);
    }
  };

  const handleMarkTutorFound = (postId: string) => {
    setTuitionPosts((previous) =>
      previous.map((post) =>
        post.id === postId
          ? { ...post, status: "MATCHED", isFoundTutor: true }
          : post,
      ),
    );
    showToast("Post updated: Marked as Tutor Found.");
  };

  const handleCreatePostSubmit = (
    postData: Omit<
      TuitionPost,
      | "id"
      | "createdAt"
      | "studentId"
      | "studentName"
      | "status"
      | "approvalStatus"
      | "isSystemPost"
      | "isFoundTutor"
      | "latitude"
      | "longitude"
    >,
  ) => {
    if (!currentUser) return;
    const newPost: TuitionPost = {
      ...postData,
      id: `post_${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.fullName,
      latitude: baseLat + (Math.random() * 0.01 - 0.005),
      longitude: baseLng + (Math.random() * 0.01 - 0.005),
      status: "OPEN",
      approvalStatus: "PENDING",
      isSystemPost: false,
      isFoundTutor: false,
      createdAt: new Date().toISOString(),
      applicationsCount: 0,
    };
    setTuitionPosts((previous) => [newPost, ...previous]);
    setIsCreatePostOpen(false);
    showToast(
      "Tuition request submitted. It is under review and will go live once approved.",
    );
    cfD1.savePost(newPost).catch((error) =>
      console.warn("Cloudflare D1 savePost error:", error),
    );
  };

  return {
    handleApplyToPost,
    handleQuickApplyToPost,
    acceptTutorDirectly,
    handleMarkTutorFound,
    handleCreatePostSubmit,
  };
}
