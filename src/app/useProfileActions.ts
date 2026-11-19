import type { Dispatch, FormEvent, SetStateAction } from "react";
import { cfD1 } from "../lib/cloudflareD1";
import type { User } from "../lib/types";

interface ProfileActionsOptions {
  currentUser: User | null;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
  setAllUsers: Dispatch<SetStateAction<User[]>>;
  showToast: (message: string) => void;
  editBio: string;
  editPhilosophy: string;
  editExpectedFee: number;
  editSubjects: string[];
  setIsEditProfileOpen: Dispatch<SetStateAction<boolean>>;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: Dispatch<SetStateAction<boolean>>;
  profileName: string;
  profilePhone: string;
  profileWhatsapp: string;
  profileDistrict: string;
  profileArea: string;
  profileAddress: string;
  profileBio: string;
  profilePhilosophy: string;
  profileExpectedFee: number;
  profileSubjects: string[];
  setProfileName: Dispatch<SetStateAction<string>>;
  setProfilePhone: Dispatch<SetStateAction<string>>;
  setProfileWhatsapp: Dispatch<SetStateAction<string>>;
  setProfileDistrict: Dispatch<SetStateAction<string>>;
  setProfileArea: Dispatch<SetStateAction<string>>;
  setProfileAddress: Dispatch<SetStateAction<string>>;
  setProfileBio: Dispatch<SetStateAction<string>>;
  setProfilePhilosophy: Dispatch<SetStateAction<string>>;
  setProfileExpectedFee: Dispatch<SetStateAction<number>>;
  setProfileSubjects: Dispatch<SetStateAction<string[]>>;
}

export function useProfileActions({
  currentUser,
  setCurrentUser,
  setAllUsers,
  showToast,
  editBio,
  editPhilosophy,
  editExpectedFee,
  editSubjects,
  setIsEditProfileOpen,
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
}: ProfileActionsOptions) {
  const persistUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setAllUsers((previous) =>
      previous.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    );
    localStorage.setItem("porabo_active_session", JSON.stringify(updatedUser));
  };

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
    persistUser(updatedUser);
    setIsEditProfileOpen(false);
    showToast("Professional bio and teaching profile updated successfully.");
    cfD1.saveUser(updatedUser).catch((error) =>
      console.warn("Cloudflare D1 saveUser error:", error),
    );
  };

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

  const handleSaveProfileModal = (event: FormEvent) => {
    event.preventDefault();
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

    persistUser(updatedUser);
    setIsProfileModalOpen(false);
    showToast(`Profile and location updated. Active district: ${profileDistrict}.`);
    cfD1.saveUser(updatedUser).catch((error) =>
      console.warn("Cloudflare D1 saveUser error:", error),
    );
  };

  const handleUpdateUserDistrict = (newDistrict: string) => {
    if (!currentUser || currentUser.district === newDistrict) return;
    const updatedUser: User = { ...currentUser, district: newDistrict };
    persistUser(updatedUser);
    showToast(`Active district updated to ${newDistrict}.`);
    cfD1.saveUser(updatedUser).catch((error) =>
      console.warn("Cloudflare D1 saveUser error:", error),
    );
  };

  return {
    handleSaveProfile,
    handleOpenProfileModal,
    handleSaveProfileModal,
    handleUpdateUserDistrict,
  };
}
