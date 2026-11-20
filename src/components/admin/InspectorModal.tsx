import React, { useEffect, useState } from "react";
import { Briefcase, Check, GraduationCap, MapPin, MessageSquare, ShieldCheck, User as UserIcon, X } from "lucide-react";
import { User, VerificationDocumentSet } from "../../lib/types";
import { GenderAvatar } from "../GenderAvatar";
import { cfD1 } from "../../lib/cloudflareD1";
import { getTutorRatingSummary } from "../../lib/ratings";

// ============ HELPER: InfoField ============
export const InfoField: React.FC<{
  label: string;
  value?: string | number | null;
  span?: 1 | 2;
  mono?: boolean;
  danger?: boolean;
}> = ({ label, value, span, mono, danger }) => (
  <div
    className={`bg-white p-2.5 rounded-xl border border-slate-200 ${span === 2 ? "sm:col-span-2" : ""}`}
  >
    <span className="text-[10px] text-slate-500 font-mono uppercase block mb-0.5">
      {label}
    </span>
    <span
      className={`text-xs font-semibold break-words ${danger ? "text-rose-700" : "text-white"} ${mono ? "font-mono" : ""}`}
    >
      {value ? (
        value
      ) : (
        <span className="text-slate-500 italic font-normal">Not provided</span>
      )}
    </span>
  </div>
);

// ============ HELPER: InspectorModal ============
interface InspectorModalProps {
  user: User;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}
export const InspectorModal: React.FC<InspectorModalProps> = ({
  user: initialUser,
  onClose,
  onApprove,
  onReject,
}) => {
  const [freshUser, setFreshUser] = useState<User | null>(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(true);
  const [userDetailsError, setUserDetailsError] = useState<string | null>(null);
  const user =
    freshUser?.id === initialUser.id ? freshUser : initialUser;
  const approvedReviews = (user.reviews || []).filter(
    (r) => (r.status || "APPROVED") === "APPROVED",
  );
  const pendingReviews = (user.reviews || []).filter(
    (r) => r.status === "PENDING",
  );
  const ratingSummary = getTutorRatingSummary(user);
  const isTutor = user.role === "TUTOR";
  const [verificationDocuments, setVerificationDocuments] =
    useState<VerificationDocumentSet | null>(null);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setFreshUser(null);
    setUserDetailsLoading(true);
    setUserDetailsError(null);
    cfD1.getAdminUser(initialUser.id)
      .then((freshUserRecord) => {
        if (active) setFreshUser(freshUserRecord);
      })
      .catch((error: unknown) => {
        if (active) {
          setUserDetailsError(
            error instanceof Error
              ? error.message
              : "Could not load the latest user information.",
          );
        }
      })
      .finally(() => {
        if (active) setUserDetailsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialUser.id]);

  useEffect(() => {
    let active = true;
    setDocumentsLoading(true);
    setDocumentsError(null);
    setVerificationDocuments(null);
    cfD1.getVerificationDocuments(user.id)
      .then((documents) => {
        if (active) setVerificationDocuments(documents);
      })
      .catch((error: unknown) => {
        if (active) {
          setDocumentsError(
            error instanceof Error
              ? error.message
              : "Could not load verification documents.",
          );
        }
      })
      .finally(() => {
        if (active) setDocumentsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialUser.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl space-y-5 overflow-y-auto rounded-2xl border border-blue-200 bg-white p-4 sm:max-h-[92vh] sm:rounded-3xl sm:p-7">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 border-b border-slate-200 pb-4">
          <GenderAvatar
            gender={user.gender || "MALE"}
            role={user.role}
            size="lg"
            profilePicture={user.profilePicture}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white truncate">
                {user.fullName}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                {user.role}
              </span>
              {isTutor && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${user.verificationStatus === "VERIFIED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : user.verificationStatus === "REJECTED" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}
                >
                  {user.verificationStatus || "PENDING"}
                </span>
              )}
            </div>
            {isTutor && (
              <p className="text-xs text-blue-700 mt-1">
                {user.institution || "—"} • {user.department || "—"}
              </p>
            )}
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" /> {user.areaName}, {user.district}
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <UserIcon className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold text-white uppercase">
              Basic Information
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <InfoField label="Email" value={user.email} span={2} mono />
            <InfoField label="Phone" value={user.phone} mono />
            <InfoField
              label="Guardian Name"
              value={userDetailsLoading ? "Loading..." : user.guardianName}
            />
            <InfoField
              label="Guardian Mobile"
              value={userDetailsLoading ? "Loading..." : user.guardianPhone}
              mono
            />
            <InfoField
              label="WhatsApp"
              value={user.whatsapp || user.phone}
              mono
            />
            <InfoField label="Gender" value={user.gender} />
            <InfoField label="Role" value={user.role} />
            {!isTutor && (
              <InfoField
                label="School / College / University"
                value={user.institution}
                span={2}
              />
            )}
            <InfoField label="User ID" value={user.id} span={2} mono />
          </div>
          {userDetailsError && (
            <p
              role="alert"
              className="mt-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
            >
              Could not refresh the user's private details: {userDetailsError}
            </p>
          )}
        </div>

        {/* Location */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <MapPin className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold text-white uppercase">Location</h3>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <InfoField label="District" value={user.district} />
            <InfoField label="Area" value={user.areaName} />
            <InfoField
              label="Exact Address"
              value={user.exactAddress}
              span={2}
            />
            <InfoField
              label="Coordinates"
              value={
                user.latitude && user.longitude
                  ? `${user.latitude.toFixed(4)}, ${user.longitude.toFixed(4)}`
                  : undefined
              }
              span={2}
              mono
            />
          </div>
        </div>

        <div className="border-b border-slate-200 pb-4">
          <div className="mb-2.5 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <h3 className="text-xs font-bold uppercase text-white">
              Photos & verification documents
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <VerificationImage label="Profile picture" src={user.profilePicture} />
            {documentsLoading ? (
              <p className="self-center text-xs text-slate-500">
                Loading protected verification images...
              </p>
            ) : documentsError ? (
              <p
                role="alert"
                className="self-center rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
              >
                {documentsError}
              </p>
            ) : verificationDocuments ? (
              <>
                <VerificationImage
                  label="Live selfie"
                  src={verificationDocuments.selfie}
                />
                <VerificationImage
                  label={`${verificationDocuments.identityDocumentType === "NID" ? "NID" : "Birth certificate"} — front`}
                  src={verificationDocuments.identityFront}
                />
                <VerificationImage
                  label={`${verificationDocuments.identityDocumentType === "NID" ? "NID" : "Birth certificate"} — back`}
                  src={verificationDocuments.identityBack}
                />
                <VerificationImage
                  label="School / institution ID — front"
                  src={verificationDocuments.studentIdFront}
                />
                <VerificationImage
                  label="School / institution ID — back"
                  src={verificationDocuments.studentIdBack}
                />
              </>
            ) : (
              <p className="self-center text-xs text-slate-500">
                No verification documents are on file for this profile.
              </p>
            )}
          </div>
        </div>

        {isTutor && (
          <>
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold text-white uppercase">
                  Verification Dossier
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <InfoField
                  label="NID / Birth Cert No."
                  value={user.nidNumber}
                  mono
                />
                <InfoField
                  label="Student ID Roll"
                  value={user.studentIdCardRoll}
                  mono
                />
                <InfoField
                  label="Student ID Reg"
                  value={user.studentIdCardReg}
                  mono
                />
                <InfoField label="Academic Year" value={user.academicYear} />
                <InfoField
                  label="Institution"
                  value={user.institution}
                  span={2}
                />
                <InfoField
                  label="Department"
                  value={user.department}
                  span={2}
                />
                <InfoField
                  label="Submitted At"
                  value={
                    user.verificationSubmittedAt
                      ? new Date(user.verificationSubmittedAt).toLocaleString()
                      : undefined
                  }
                  span={2}
                />
                {user.verificationRejectionReason && (
                  <InfoField
                    label="Rejection Reason"
                    value={user.verificationRejectionReason}
                    span={2}
                    danger
                  />
                )}
              </div>
            </div>

            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Briefcase className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold text-white uppercase">
                  Professional
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <InfoField
                  label="Qualifications"
                  value={user.qualifications}
                  span={2}
                />
                <InfoField
                  label="Experience"
                  value={
                    user.yearsOfExperience
                      ? `${user.yearsOfExperience} years`
                      : undefined
                  }
                />
                <InfoField
                  label="Expected Rate"
                  value={
                    user.hourlyOrMonthlyRate
                      ? `৳ ${user.hourlyOrMonthlyRate.toLocaleString()}/mo`
                      : undefined
                  }
                />
                <InfoField
                  label="Rating"
                  value={`${ratingSummary.average.toFixed(1)} / 5`}
                />
                <InfoField
                  label="Total Reviews"
                  value={ratingSummary.reviewCount}
                />
              </div>
              <div className="mt-3">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1.5">
                  Subjects
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(user.subjectsTaught || []).length > 0 ? (
                    (user.subjectsTaught || []).map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs border border-blue-200"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">None</span>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1.5">
                  Grades
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(user.gradesTaught || []).length > 0 ? (
                    (user.gradesTaught || []).map((g, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs border border-blue-200"
                      >
                        {g}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">None</span>
                  )}
                </div>
              </div>
            </div>

            {(user.bio || user.teachingPhilosophy) && (
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <UserIcon className="w-4 h-4 text-blue-700" />
                  <h3 className="text-xs font-bold text-white uppercase">
                    Bio & Philosophy
                  </h3>
                </div>
                {user.bio && (
                  <div className="mb-3">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                      Bio
                    </span>
                    <p className="text-xs text-slate-600">{user.bio}</p>
                  </div>
                )}
                {user.teachingPhilosophy && (
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                      Philosophy
                    </span>
                    <p className="text-xs text-slate-600 italic">
                      "{user.teachingPhilosophy}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {(user.degrees || []).length > 0 && (
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <GraduationCap className="w-4 h-4 text-blue-700" />
                  <h3 className="text-xs font-bold text-white uppercase">
                    Degrees ({user.degrees!.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {user.degrees!.map((d, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs"
                    >
                      <div className="font-semibold text-white">
                        {d.degreeName}
                      </div>
                      <div className="text-blue-700 text-[11px]">
                        {d.institution}
                      </div>
                      <div className="text-slate-500 text-[10px] mt-1">
                        Year: {d.passingYear}{" "}
                        {d.result ? `• Result: ${d.result}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(user.reviews || []).length > 0 && (
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <MessageSquare className="w-4 h-4 text-blue-700" />
                  <h3 className="text-xs font-bold text-white uppercase">
                    Reviews ({approvedReviews.length} approved
                    {pendingReviews.length > 0
                      ? `, ${pendingReviews.length} pending`
                      : ""}
                    )
                  </h3>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {(user.reviews || []).slice(0, 10).map((r) => (
                    <div
                      key={r.id}
                      className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">
                          {r.studentName}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${r.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" : r.status === "REJECTED" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}
                        >
                          {r.status || "APPROVED"}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1 italic">
                        "{r.comment}"
                      </p>
                      <div className="text-slate-500 text-[10px] mt-1">
                        ★ {(r.overall || 0).toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 sticky bottom-0 bg-white pb-1">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold"
          >
            Close
          </button>
          {isTutor && user.verificationStatus !== "VERIFIED" && (
            <>
              <button
                onClick={onReject}
                className="px-4 py-2.5 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Verify
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function VerificationImage({ label, src }: { label: string; src?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2.5">
      <p className="mb-2 text-[10px] font-mono uppercase text-slate-500">{label}</p>
      {src ? (
        <a href={src} target="_blank" rel="noreferrer">
          <img
            src={src}
            alt={label}
            loading="eager"
            decoding="async"
            className="h-44 w-full rounded-lg bg-white object-contain"
          />
        </a>
      ) : (
        <div className="flex h-44 items-center justify-center rounded-lg bg-white text-xs text-slate-500">
          Not provided
        </div>
      )}
    </div>
  );
}
