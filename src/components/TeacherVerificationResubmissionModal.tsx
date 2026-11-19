import { useEffect, useState } from "react";
import { AlertTriangle, Check, LoaderCircle, RefreshCw, X } from "lucide-react";
import { cfD1 } from "../lib/cloudflareD1";
import type {
  IdentityDocumentType,
  RegistrationVerificationDocuments,
  User,
} from "../lib/types";
import {
  ImageUploadField,
  SelfieCapture,
} from "../app/views/auth/RegistrationMediaFields";

interface TeacherVerificationResubmissionModalProps {
  user: User;
  onClose: () => void;
  onSubmitted: (updatedUser: User) => void;
}

export function TeacherVerificationResubmissionModal({
  user,
  onClose,
  onSubmitted,
}: TeacherVerificationResubmissionModalProps) {
  const [institution, setInstitution] = useState(user.institution || "");
  const [department, setDepartment] = useState(user.department || "");
  const [academicYear, setAcademicYear] = useState(user.academicYear || "");
  const [nidNumber, setNidNumber] = useState(user.nidNumber || "");
  const [studentIdCardRoll, setStudentIdCardRoll] = useState(
    user.studentIdCardRoll || "",
  );
  const [studentIdCardReg, setStudentIdCardReg] = useState(
    user.studentIdCardReg || "",
  );
  const [profilePicture, setProfilePicture] = useState<string | null>(
    user.profilePicture || null,
  );
  const [identityDocumentType, setIdentityDocumentType] =
    useState<IdentityDocumentType>("NID");
  const [identityFront, setIdentityFront] = useState<string | null>(null);
  const [identityBack, setIdentityBack] = useState<string | null>(null);
  const [studentIdFront, setStudentIdFront] = useState<string | null>(null);
  const [studentIdBack, setStudentIdBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsLoadError, setDocumentsLoadError] = useState<string | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    cfD1
      .getOwnVerificationDocuments(user.id)
      .then((documents) => {
        if (!active || !documents) return;
        setIdentityDocumentType(documents.identityDocumentType);
        setIdentityFront(documents.identityFront || null);
        setIdentityBack(documents.identityBack || null);
        setStudentIdFront(documents.studentIdFront || null);
        setStudentIdBack(documents.studentIdBack || null);
        setSelfie(documents.selfie || null);
      })
      .catch((error: unknown) => {
        if (active) {
          setDocumentsLoadError(
            error instanceof Error
              ? error.message
              : "Could not load your previous verification images.",
          );
        }
      })
      .finally(() => {
        if (active) setDocumentsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user.id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (
      !institution.trim() ||
      !department.trim() ||
      !academicYear.trim() ||
      !nidNumber.trim() ||
      !studentIdCardRoll.trim() ||
      !studentIdCardReg.trim()
    ) {
      setFormError("Complete all teacher and academic details before submitting.");
      return;
    }
    if (
      !profilePicture ||
      !identityFront ||
      !studentIdFront ||
      !selfie
    ) {
      setFormError(
        "A profile photo, identity document front, institution ID front, and selfie are required.",
      );
      return;
    }

    const imageSize = [
      profilePicture,
      identityFront,
      identityBack,
      studentIdFront,
      studentIdBack,
      selfie,
    ].reduce((total, image) => total + (image?.length || 0), 0);
    if (imageSize > 1_500_000) {
      setFormError(
        "The compressed images exceed the upload limit. Replace one or more images with smaller files.",
      );
      return;
    }

    const verificationDocuments: RegistrationVerificationDocuments = {
      identityDocumentType,
      identityFront,
      identityBack: identityBack || undefined,
      studentIdFront,
      studentIdBack: studentIdBack || undefined,
      selfie,
    };
    setIsSubmitting(true);
    try {
      const updatedUser = await cfD1.resubmitTutorVerification(user.id, {
        profilePicture,
        institution: institution.trim(),
        department: department.trim(),
        academicYear: academicYear.trim(),
        nidNumber: nidNumber.trim(),
        studentIdCardRoll: studentIdCardRoll.trim(),
        studentIdCardReg: studentIdCardReg.trim(),
        verificationDocuments,
      });
      onSubmitted(updatedUser);
      onClose();
    } catch (error: unknown) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not submit your verification details. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-5">
      <div className="relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-rose-200 bg-white p-5 shadow-2xl sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close verification resubmission"
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex items-start gap-3 pr-9">
          <div className="rounded-2xl bg-rose-100 p-2.5 text-rose-700">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Resubmit teacher verification
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Review and correct every detail below. Your current information is
              prefilled; replace any document that needs correction.
            </p>
          </div>
        </div>

        <div
          role="note"
          className="mb-5 flex gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs leading-relaxed text-rose-800"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong className="block">Admin rejection note</strong>
            {user.verificationRejectionReason ||
              "Please check that your identity and institution documents are clear and match the information entered below."}
          </div>
        </div>

        {documentsLoadError && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"
          >
            Previous images could not be loaded. Upload all required images
            again to continue. ({documentsLoadError})
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-900">
              Teacher and academic details
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Institution"
                value={institution}
                onChange={setInstitution}
                maxLength={200}
              />
              <TextField
                label="Department"
                value={department}
                onChange={setDepartment}
                maxLength={120}
              />
              <TextField
                label="Academic year / status"
                value={academicYear}
                onChange={setAcademicYear}
                maxLength={100}
              />
              <TextField
                label="NID / birth registration number"
                value={nidNumber}
                onChange={setNidNumber}
                maxLength={40}
              />
              <TextField
                label="Institution student ID roll"
                value={studentIdCardRoll}
                onChange={setStudentIdCardRoll}
                maxLength={60}
              />
              <TextField
                label="Institution student ID registration"
                value={studentIdCardReg}
                onChange={setStudentIdCardReg}
                maxLength={60}
              />
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Profile and verification images
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                Replace any unclear image. Front sides and selfie are required;
                back sides are optional.
              </p>
            </div>
            <ImageUploadField
              id="resubmit-profile-picture"
              label="Teacher profile picture"
              value={profilePicture}
              required
              onChange={setProfilePicture}
              setError={setFormError}
              maxDimension={200}
              quality={0.6}
            />
            <label className="block text-xs font-medium text-slate-700">
              Identity document type
              <select
                value={identityDocumentType}
                onChange={(event) =>
                  setIdentityDocumentType(
                    event.target.value as IdentityDocumentType,
                  )
                }
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-600"
              >
                <option value="NID">National ID (NID)</option>
                <option value="BIRTH_CERTIFICATE">Birth certificate</option>
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <ImageUploadField
                id="resubmit-identity-front"
                label={`${identityDocumentType === "NID" ? "NID" : "Birth certificate"} front`}
                value={identityFront}
                required
                onChange={setIdentityFront}
                setError={setFormError}
              />
              <ImageUploadField
                id="resubmit-identity-back"
                label={`${identityDocumentType === "NID" ? "NID" : "Birth certificate"} back`}
                value={identityBack}
                onChange={setIdentityBack}
                setError={setFormError}
              />
              <ImageUploadField
                id="resubmit-student-id-front"
                label="Institution ID front"
                value={studentIdFront}
                required
                onChange={setStudentIdFront}
                setError={setFormError}
              />
              <ImageUploadField
                id="resubmit-student-id-back"
                label="Institution ID back"
                value={studentIdBack}
                onChange={setStudentIdBack}
                setError={setFormError}
              />
            </div>
            <SelfieCapture
              value={selfie}
              onChange={setSelfie}
              setError={setFormError}
            />
            <p className="text-[11px] text-slate-500">
              Images are compressed before upload. Total image upload must stay
              within 1.5 MB.
            </p>
          </section>

          {formError && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
            >
              {formError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={documentsLoading || isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {documentsLoading
                ? "Loading saved documents..."
                : isSubmitting
                  ? "Submitting..."
                  : "Submit all verification details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
}

function TextField({ label, value, maxLength, onChange }: TextFieldProps) {
  return (
    <label className="block text-xs font-medium text-slate-700">
      {label}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        required
        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-600"
      />
    </label>
  );
}
