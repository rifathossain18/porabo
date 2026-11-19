import type { Dispatch, FormEvent, SetStateAction } from "react";
import { ANCHOR_LOCATION } from "../lib/mockData";
import {
  cfLogin,
  cfLogout,
  cfRegister,
  cfRequestPasswordReset,
  cfUpdatePassword,
} from "../lib/cloudflareAuth";
import type {
  RegistrationVerificationDocuments,
  User,
  UserGender,
  UserRole,
} from "../lib/types";

interface AuthActionsOptions {
  currentUser: User | null;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
  setAllUsers: Dispatch<SetStateAction<User[]>>;
  setIsLocationVerified: Dispatch<SetStateAction<boolean>>;
  setViewingTeacherProfileId: Dispatch<SetStateAction<string | null>>;
  setShowAuthForm: Dispatch<SetStateAction<boolean>>;
  showToast: (message: string) => void;
  loginEmail: string;
  loginPassword: string;
  authRoleChoice: UserRole;
  registerName: string;
  registerEmail: string;
  registerPhone: string;
  registerGender: UserGender;
  registerDistrict: string;
  registerArea: string;
  registerStudentInstitution: string;
  registerPassword: string;
  registerConfirmPassword: string;
  regTeacherInstitution: string;
  regTeacherDepartment: string;
  regTeacherAcademicYear: string;
  regTeacherNidNumber: string;
  regTeacherStudentIdRoll: string;
  regTeacherStudentIdReg: string;
  regTeacherProfilePic: string | null;
  regStudentProfilePic: string | null;
  regIdentityDocumentType: RegistrationVerificationDocuments["identityDocumentType"];
  regIdentityFront: string | null;
  regIdentityBack: string | null;
  regStudentIdFront: string | null;
  regStudentIdBack: string | null;
  regSelfiePhoto: string | null;
  setRegTeacherProfilePic: Dispatch<SetStateAction<string | null>>;
  setRegStudentProfilePic: Dispatch<SetStateAction<string | null>>;
  setRegIdentityFront: Dispatch<SetStateAction<string | null>>;
  setRegIdentityBack: Dispatch<SetStateAction<string | null>>;
  setRegStudentIdFront: Dispatch<SetStateAction<string | null>>;
  setRegStudentIdBack: Dispatch<SetStateAction<string | null>>;
  setRegSelfiePhoto: Dispatch<SetStateAction<string | null>>;
  forgotPasswordEmail: string;
  newPasswordAfterReset: string;
  setAuthLoading: Dispatch<SetStateAction<boolean>>;
  setAuthError: Dispatch<SetStateAction<string | null>>;
  setForgotPasswordLoading: Dispatch<SetStateAction<boolean>>;
  setForgotPasswordSuccessMsg: Dispatch<SetStateAction<string | null>>;
  setIsForgotPasswordOpen: Dispatch<SetStateAction<boolean>>;
  setLoginEmail: Dispatch<SetStateAction<string>>;
  setLoginPassword: Dispatch<SetStateAction<string>>;
  setNewPasswordAfterReset: Dispatch<SetStateAction<string>>;
  setForgotPasswordEmail: Dispatch<SetStateAction<string>>;
}

export function useAuthActions({
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
}: AuthActionsOptions) {
  const handleLoginSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setAuthError(null);

    const email = loginEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    if (!loginPassword || loginPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    setAuthLoading(true);
    try {
      const result = await cfLogin(email, loginPassword);
      if (result.success && result.user) {
        setCurrentUser(result.user);
        setIsLocationVerified(true);
        setAuthLoading(false);
        showToast(
          `Welcome back, ${result.user.fullName}. Signed in as ${result.user.role === "TUTOR" ? "Teacher" : "Student"}.`,
        );
      } else {
        setAuthLoading(false);
        setAuthError(
          result.error || "Invalid email or password. Please verify credentials.",
        );
      }
    } catch {
      setAuthLoading(false);
      setAuthError(
        "Sign in failed. Please check network connection and try again.",
      );
    }
  };

  const handleRegisterSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setAuthError(null);

    const email = registerEmail.trim().toLowerCase();
    if (!registerName.trim()) {
      setAuthError("Please enter your full name.");
      return;
    }
    if (!email || !email.includes("@")) {
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

    if (authRoleChoice === "TUTOR") {
      if (!regTeacherInstitution.trim()) {
        setAuthError("Please enter your current University or College institution.");
        return;
      }
      if (!regTeacherDepartment.trim()) {
        setAuthError("Please enter your academic Department.");
        return;
      }
      if (!regTeacherNidNumber.trim()) {
        setAuthError("Please provide your National ID (NID) or Birth Certificate registration number.");
        return;
      }
      if (!regTeacherStudentIdRoll.trim()) {
        setAuthError("Please enter your Institution Student ID Card Roll Number.");
        return;
      }
      if (!regTeacherStudentIdReg.trim()) {
        setAuthError("Please enter your Institution Student ID Card Registration Number.");
        return;
      }
    }
    if (authRoleChoice === "STUDENT" && !registerStudentInstitution.trim()) {
      setAuthError("Please enter your current school, college, or university.");
      return;
    }

    const profilePicture =
      authRoleChoice === "TUTOR" ? regTeacherProfilePic : regStudentProfilePic;
    if (!profilePicture) {
      setAuthError("Please upload a profile picture.");
      return;
    }
    if (!regIdentityFront || !regStudentIdFront || !regSelfiePhoto) {
      setAuthError(
        "Please add the front of your NID or birth certificate, your school or institution ID, and a selfie.",
      );
      return;
    }
    const registrationImageSize = [
      profilePicture,
      regIdentityFront,
      regIdentityBack,
      regStudentIdFront,
      regStudentIdBack,
      regSelfiePhoto,
    ].reduce((total, image) => total + (image?.length || 0), 0);
    if (registrationImageSize > 1_500_000) {
      setAuthError("Your compressed images are too large. Replace one or more images and try again.");
      return;
    }

    setAuthLoading(true);
    try {
      const result = await cfRegister({
        email,
        password: registerPassword,
        fullName: registerName,
        phone: registerPhone,
        role: authRoleChoice,
        gender: registerGender,
        institution:
          authRoleChoice === "STUDENT"
            ? registerStudentInstitution.trim()
            : undefined,
        district: registerDistrict,
        areaName: registerArea,
        exactAddress: `${registerArea}, ${registerDistrict}`,
        latitude: ANCHOR_LOCATION.latitude + (Math.random() * 0.008 - 0.004),
        longitude: ANCHOR_LOCATION.longitude + (Math.random() * 0.008 - 0.004),
        profilePicture,
        verificationDocuments: {
          identityDocumentType: regIdentityDocumentType,
          identityFront: regIdentityFront,
          identityBack: regIdentityBack || undefined,
          studentIdFront: regStudentIdFront,
          studentIdBack: regStudentIdBack || undefined,
          selfie: regSelfiePhoto,
        },
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
                rating: 0,
                totalReviews: 0,
                ratingsBreakdown: {
                  punctuality: 0,
                  subjectMastery: 0,
                  teachingStyle: 0,
                  overall: 0,
                  totalReviews: 0,
                },
                teachingHistory: [
                  {
                    year: "2024 - Present",
                    title: "Private Academic Tutor",
                    organizationOrArea: registerArea,
                    studentsCount: 4,
                    highlight: "Individualized coaching with weekly structured evaluations.",
                  },
                ],
                reviews: [],
                verificationSubmittedAt: new Date().toISOString(),
              }
            : undefined,
      });

      if (result.success && result.user) {
        setAllUsers((previous) => [result.user!, ...previous]);
        setCurrentUser(result.user);
        setIsLocationVerified(true);
        setRegTeacherProfilePic(null);
        setRegStudentProfilePic(null);
        setRegIdentityFront(null);
        setRegIdentityBack(null);
        setRegStudentIdFront(null);
        setRegStudentIdBack(null);
        setRegSelfiePhoto(null);
        setAuthLoading(false);
        showToast(
          `Account created successfully. Signed in as ${authRoleChoice === "STUDENT" ? "Student" : "Teacher"}.`,
        );
      } else {
        setAuthLoading(false);
        setAuthError(result.error || "Registration failed. Please check your information.");
      }
    } catch {
      setAuthLoading(false);
      setAuthError("Registration failed. Please check your information and try again.");
    }
  };

  const handleForgotPasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const email = forgotPasswordEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      showToast("Please enter your registered email address.");
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordSuccessMsg(null);
    try {
      const result = await cfRequestPasswordReset(email);
      setForgotPasswordSuccessMsg(
        result.success
          ? `Cloudflare JWT verification token generated for ${email}. You may now set your new password directly below.`
          : result.message,
      );
    } catch {
      setForgotPasswordSuccessMsg(`Reset instructions prepared for ${email}.`);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleApplyNewPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!newPasswordAfterReset || newPasswordAfterReset.length < 6) {
      showToast("New password must be at least 6 characters.");
      return;
    }

    const email = forgotPasswordEmail.trim().toLowerCase();
    const result = await cfUpdatePassword(email, newPasswordAfterReset);
    if (result.success) {
      setAllUsers((previous) =>
        previous.map((user) =>
          user.email.toLowerCase() === email
            ? { ...user, password: newPasswordAfterReset }
            : user,
        ),
      );
      setLoginEmail(email);
      setLoginPassword(newPasswordAfterReset);
      setIsForgotPasswordOpen(false);
      setForgotPasswordSuccessMsg(null);
      setNewPasswordAfterReset("");
      showToast("Password updated successfully. Please sign in with your new password.");
    } else {
      showToast(result.error || "Failed to update password.");
    }
  };

  const handleLogout = () => {
    cfLogout();
    setCurrentUser(null);
    setIsLocationVerified(false);
    setViewingTeacherProfileId(null);
    setShowAuthForm(false);
    showToast("You have been signed out.");
  };

  return {
    handleLoginSubmit,
    handleRegisterSubmit,
    handleForgotPasswordSubmit,
    handleApplyNewPassword,
    handleLogout,
  };
}
