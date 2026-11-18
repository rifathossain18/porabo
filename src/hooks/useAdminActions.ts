import type { Dispatch, SetStateAction } from "react";
import { cfD1 } from "../lib/cloudflareD1";
import { cfLogout } from "../lib/cloudflareAuth";
import type {
  TuitionApplication,
  TuitionPost,
  User,
} from "../lib/types";

interface AdminActionOptions {
  currentUser: User | null;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
  setAllUsers: Dispatch<SetStateAction<User[]>>;
  setTuitionPosts: Dispatch<SetStateAction<TuitionPost[]>>;
  setApplications: Dispatch<SetStateAction<TuitionApplication[]>>;
  showToast: (message: string) => void;
}

export function useAdminActions({
  currentUser,
  setCurrentUser,
  setAllUsers,
  setTuitionPosts,
  setApplications,
  showToast,
}: AdminActionOptions) {
  const handleAdminApproveTutor = (tutorId: string) => {
    setAllUsers((prev) => {
      const updated = prev.map((user) =>
        user.id === tutorId
          ? {
              ...user,
              verificationStatus: "VERIFIED" as const,
              isVerified: true,
              verificationRejectionReason: undefined,
            }
          : user,
      );
      const target = updated.find((user) => user.id === tutorId);
      if (target) {
        cfD1.saveUser(target);
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
      const updated = prev.map((user) =>
        user.id === tutorId
          ? {
              ...user,
              verificationStatus: "REJECTED" as const,
              isVerified: false,
              verificationRejectionReason: reason,
            }
          : user,
      );
      const target = updated.find((user) => user.id === tutorId);
      if (target) {
        cfD1.saveUser(target);
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
      const updated = prev.map((post) =>
        post.id === postId
          ? { ...post, approvalStatus: "APPROVED" as const }
          : post,
      );
      const target = updated.find((post) => post.id === postId);
      if (target) cfD1.savePost(target);
      return updated;
    });
    showToast("Tuition post approved! Now visible on public feed & map.");
  };

  const handleAdminRejectPost = (postId: string) => {
    setTuitionPosts((prev) => prev.filter((post) => post.id !== postId));
    cfD1.deletePost(postId);
    showToast("Tuition post permanently purged from database.");
  };

  const handleAdminApproveReview = (tutorId: string, reviewId: string) => {
    setAllUsers((prev) =>
      prev.map((user) => {
        if (user.id !== tutorId) return user;

        const updatedReviews = (user.reviews || []).map((review) =>
          review.id === reviewId
            ? {
                ...review,
                status: "APPROVED" as const,
                approvedAt: new Date().toISOString(),
              }
            : review,
        );
        const approved = updatedReviews.filter(
          (review) => (review.status || "APPROVED") === "APPROVED",
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
              (approved.reduce((sum, review) => sum + review.punctuality, 0) /
                total) *
                10,
            ) / 10;
          const avgMast =
            Math.round(
              (approved.reduce((sum, review) => sum + review.subjectMastery, 0) /
                total) *
                10,
            ) / 10;
          const avgStyl =
            Math.round(
              (approved.reduce((sum, review) => sum + review.teachingStyle, 0) /
                total) *
                10,
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
          ...user,
          reviews: updatedReviews,
          rating: newRating,
          totalReviews: total,
          ratingsBreakdown: newBreakdown,
        };

        cfD1
          .saveUser(updatedUser)
          .catch((err) => console.warn("Cloudflare D1 saveUser error:", err));

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
      prev.map((user) => {
        if (user.id !== tutorId) return user;
        const updatedReviews = (user.reviews || []).map((review) =>
          review.id === reviewId
            ? { ...review, status: "REJECTED" as const, rejectedReason: reason }
            : review,
        );
        const updatedUser = { ...user, reviews: updatedReviews };
        cfD1
          .saveUser(updatedUser)
          .catch((err) => console.warn("Cloudflare D1 saveUser error:", err));
        return updatedUser;
      }),
    );
    showToast("Review rejected. It will not appear on the tutor profile.");
  };

  const handleAdminDeleteUser = (userId: string) => {
    setAllUsers((prev) => prev.filter((user) => user.id !== userId));
    cfD1.deleteUser(userId);
    setTuitionPosts((prev) => prev.filter((post) => post.studentId !== userId));
    setApplications((prev) =>
      prev.filter((application) => application.tutorId !== userId),
    );

    if (currentUser && currentUser.id === userId) {
      cfLogout();
      setCurrentUser(null);
      localStorage.removeItem("porabo_active_session");
    }
    showToast(
      "User record and associated data permanently purged from Cloudflare D1.",
    );
  };

  return {
    handleAdminApproveTutor,
    handleAdminRejectTutor,
    handleAdminApprovePost,
    handleAdminRejectPost,
    handleAdminApproveReview,
    handleAdminRejectReview,
    handleAdminDeleteUser,
  };
}
