import { UserRound } from "lucide-react";
import type { UserGender, UserRole } from "../lib/types";

interface GenderAvatarProps {
  gender?: UserGender;
  role?: UserRole;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  name?: string;
  profilePicture?: string;
}

export function GenderAvatar({
  size = "md",
  className = "",
  name = "",
  profilePicture,
}: GenderAvatarProps) {
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-16 h-16",
    xl: "w-24 h-24 sm:w-28 sm:h-28",
  };

  if (profilePicture) {
    return (
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-emerald-500/30 bg-white ${sizeClasses[size]} ${className}`}
        title={name || "Profile picture"}
      >
        <img
          src={profilePicture}
          alt={name ? `${name} profile picture` : "Profile picture"}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-slate-500 ${sizeClasses[size]} ${className}`}
      title={name ? `${name} has not added a profile picture` : "No profile picture"}
      aria-label={name ? `${name} profile picture unavailable` : "Profile picture unavailable"}
    >
      <UserRound className="h-1/2 w-1/2" strokeWidth={1.5} />
    </div>
  );
}
