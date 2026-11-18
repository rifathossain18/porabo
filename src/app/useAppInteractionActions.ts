import type { Dispatch, FormEvent, MouseEvent, SetStateAction } from "react";
import { downloadTeacherCard, downloadTuitionCard } from "../lib/cardGenerator";
import type {
  StudentReview,
  TuitionApplication,
  TuitionPost,
  User,
} from "../lib/types";

interface AppInteractionActionsOptions {
  currentUser: User | null;
  allUsers: User[];
  setAllUsers: Dispatch<SetStateAction<User[]>>;
  ratingApplication: TuitionApplication | null;
  setRatingApplication: Dispatch<SetStateAction<TuitionApplication | null>>;
  ratingTutorId: string;
  ratingPunctuality: number;
  ratingSubjectMastery: number;
  ratingTeachingStyle: number;
  ratingComment: string;
  ratingReviewerRole: string;
  setIsRatingModalOpen: Dispatch<SetStateAction<boolean>>;
  showToast: (message: string) => void;
  bookmarkedPostIds: string[];
  setBookmarkedPostIds: Dispatch<SetStateAction<string[]>>;
  downloadingPostId: string | null;
  setDownloadingPostId: Dispatch<SetStateAction<string | null>>;
  downloadingTeacherCardId: string | null;
  setDownloadingTeacherCardId: Dispatch<SetStateAction<string | null>>;
  setViewingTeacherProfileId: Dispatch<SetStateAction<string | null>>;
}

export function useAppInteractionActions({
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
}: AppInteractionActionsOptions) {
  const handleToggleBookmark = (postId: string, event?: MouseEvent) => {
    event?.stopPropagation();
    setBookmarkedPostIds((previous) => {
      if (previous.includes(postId)) {
        showToast("Removed tuition post from bookmarks.");
        return previous.filter((id) => id !== postId);
      }
      showToast("Saved tuition post to bookmarks! ❤️");
      return [...previous, postId];
    });
  };

  const handleSubmitCategoricalRating = (event: FormEvent) => {
    event.preventDefault();
    if (!currentUser || !ratingApplication) {
      showToast("No active tuition selected for review.");
      return;
    }

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

    const targetTutor = allUsers.find((user) => user.id === ratingTutorId);
    const existingReview = (targetTutor?.reviews || []).find(
      (review) => review.applicationId === ratingApplication.id,
    );
    if (existingReview) {
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

    setAllUsers((previous) =>
      previous.map((user) =>
        user.id === ratingTutorId
          ? { ...user, reviews: [newReview, ...(user.reviews || [])] }
          : user,
      ),
    );
    setIsRatingModalOpen(false);
    setRatingApplication(null);
    showToast(
      "Review submitted. It will appear on the tutor profile after admin approval.",
    );
  };

  const handleSharePost = async (post: TuitionPost, event?: MouseEvent) => {
    event?.stopPropagation();
    const shareUrl = `${window.location.origin}/#post-${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tuition: ${post.title}`,
          text: `Tuition opportunity in ${post.areaName}, ${post.district} for ${post.subject} (${post.gradeLevel}) - Budget ৳ ${post.salaryBudget.toLocaleString()}/mo. Details on Porabo:`,
          url: shareUrl,
        });
      } catch {
        // The share dialog can be dismissed by the user.
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          `${post.title} • ${post.areaName}, ${post.district} (৳ ${post.salaryBudget.toLocaleString()}/mo) • ${shareUrl}`,
        );
        showToast("Tuition opportunity link copied to clipboard.");
      } catch {
        showToast("Link ready to share!");
      }
    }
  };

  const handleShareTutorProfile = async (tutor: User, event?: MouseEvent) => {
    event?.stopPropagation();
    const shareUrl = `${window.location.origin}/#tutor-${tutor.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Verified Educator: ${tutor.fullName}`,
          text: `Hire ${tutor.fullName} (${tutor.institution || "Verified Teacher"}) on Porabo Tuition Match:`,
          url: shareUrl,
        });
      } catch {
        // The share dialog can be dismissed by the user.
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          `${tutor.fullName} - Verified Educator on Porabo - ${shareUrl}`,
        );
        showToast("Tutor profile link copied to clipboard.");
      } catch {
        showToast("Link ready to share!");
      }
    }
  };

  const handleDownloadCard = async (post: TuitionPost) => {
    if (downloadingPostId) return;
    setDownloadingPostId(post.id);
    try {
      await downloadTuitionCard(post);
      showToast(`✅ Premium card downloaded for "${post.title.slice(0, 30)}..."`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Try again";
      console.error("Card download failed:", error);
      showToast(`❌ Download failed: ${message}`);
    } finally {
      setDownloadingPostId(null);
    }
  };

  const handleDownloadTeacherCard = async (tutor: User) => {
    if (downloadingTeacherCardId) return;
    setDownloadingTeacherCardId(tutor.id);
    try {
      await downloadTeacherCard(tutor);
      showToast(`✅ Bio card downloaded for ${tutor.fullName}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Try again";
      console.error("Teacher card download failed:", error);
      showToast(`❌ Download failed: ${message}`);
    } finally {
      setDownloadingTeacherCardId(null);
    }
  };

  const handleOpenTeacherProfile = (tutorId: string) => {
    setViewingTeacherProfileId(tutorId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    handleToggleBookmark,
    handleSubmitCategoricalRating,
    handleSharePost,
    handleShareTutorProfile,
    handleDownloadCard,
    handleDownloadTeacherCard,
    handleOpenTeacherProfile,
  };
}
