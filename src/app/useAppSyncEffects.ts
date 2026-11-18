import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { cfD1 } from "../lib/cloudflareD1";
import { cfValidateAndRefreshSession } from "../lib/cloudflareAuth";
import { filterActive70DayPosts } from "../lib/mockData";
import type { NotificationItem, TuitionApplication, TuitionPost, User } from "../lib/types";

interface AppSyncOptions {
  notifications: NotificationItem[];
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
  allUsers: User[];
  tuitionPosts: TuitionPost[];
  applications: TuitionApplication[];
  setAllUsers: Dispatch<SetStateAction<User[]>>;
  setTuitionPosts: Dispatch<SetStateAction<TuitionPost[]>>;
  setApplications: Dispatch<SetStateAction<TuitionApplication[]>>;
}

export function useAppSyncEffects({
  notifications,
  setCurrentUser,
  allUsers,
  tuitionPosts,
  applications,
  setAllUsers,
  setTuitionPosts,
  setApplications,
}: AppSyncOptions) {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [apiUsers, apiPosts, apiApplications] = await Promise.all([
          cfD1.getUsers(),
          cfD1.getPosts(),
          cfD1.getApplications(),
        ]);
        setAllUsers((previous) =>
          JSON.stringify(previous) !== JSON.stringify(apiUsers)
            ? apiUsers
            : previous,
        );
        setTuitionPosts((previous) =>
          JSON.stringify(previous) !== JSON.stringify(apiPosts)
            ? filterActive70DayPosts(apiPosts)
            : previous,
        );
        setApplications((previous) =>
          JSON.stringify(previous) !== JSON.stringify(apiApplications)
            ? apiApplications
            : previous,
        );
      } catch {
        // Retry on the next polling interval.
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("porabo_notifications", JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    const refreshSession = async () => {
      try {
        const result = await cfValidateAndRefreshSession();
        if (result.valid && result.user) {
          setCurrentUser((previous) => {
            if (!previous) return result.user!;
            if (
              previous.verificationStatus !== result.user!.verificationStatus ||
              previous.rating !== result.user!.rating ||
              previous.totalReviews !== result.user!.totalReviews
            ) {
              return result.user!;
            }
            return previous;
          });
        }
      } catch (error) {
        console.debug("Periodic session refresh:", error);
      }
    };

    refreshSession();
    const interval = setInterval(refreshSession, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (
      allUsers.length === 0 &&
      tuitionPosts.length === 0 &&
      applications.length === 0
    ) {
      return;
    }

    const timer = setTimeout(() => {
      Promise.all([cfD1.getUsers(), cfD1.getPosts(), cfD1.getApplications()])
        .then(([users, posts, loadedApplications]) => {
          setAllUsers(users);
          setTuitionPosts(filterActive70DayPosts(posts));
          setApplications(loadedApplications);
        })
        .catch(() => {});
    }, 2000);

    return () => clearTimeout(timer);
  }, [allUsers.length, tuitionPosts.length, applications.length]);
}
