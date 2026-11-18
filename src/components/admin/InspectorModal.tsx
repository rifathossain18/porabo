import React, { useEffect, useState } from "react";
import { Briefcase, Check, GraduationCap, MapPin, MessageSquare, ShieldCheck, User as UserIcon, X } from "lucide-react";
import { User, VerificationDocumentSet } from "../../lib/types";
import { GenderAvatar } from "../GenderAvatar";
import { cfD1 } from "../../lib/cloudflareD1";

// ============ HELPER: InfoField ============
export const InfoField: React.FC<{
  label: string;
  value?: string | number | null;
  span?: 1 | 2;
  mono?: boolean;
  danger?: boolean;
}> = ({ label, value, span, mono, danger }) => (
  <div
    className={`bg-[#111827] p-2.5 rounded-xl border border-slate-800 ${span === 2 ? "col-span-2" : ""}`}
  >
    <span className="text-[10px] text-slate-500 font-mono uppercase block mb-0.5">
      {label}
    </span>
    <span
      className={`text-xs font-semibold break-words ${danger ? "text-rose-400" : "text-white"} ${mono ? "font-mono" : ""}`}
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
  user,
  onClose,
  onApprove,
  onReject,
}) => {
  const approvedReviews = (user.reviews || []).filter(
    (r) => (r.status || "APPROVED") === "APPROVED",
  );
  const pendingReviews = (user.reviews || []).filter(
    (r) => r.status === "PENDING",
  );
  const isTutor = user.role === "TUTOR";
  const [verificationDocuments, setVerificationDocuments] =
    useState<VerificationDocumentSet | null>(null);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

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
  }, [user.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0B0F19] border border-blue-900/80 rounded-3xl p-5 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 border-b border-slate-800 pb-4">
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
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60 font-mono">
                {user.role}
              </span>
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase">
                    Private Verification Images
                  </h3>
                </div>
                {documentsLoading ? (
                  <p className="text-xs text-slate-400">Loading protected images...</p>
                ) : documentsError ? (
                  <p role="alert" className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-3 text-xs text-rose-300">
                    {documentsError}
                  </p>
                ) : verificationDocuments ? (
                  <>
                    <p className="mb-3 text-[11px] text-slate-400">
                      Government document: {verificationDocuments.identityDocumentType === "NID" ? "National ID (NID)" : "Birth certificate"}
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <VerificationImage label="Profile picture" src={user.profilePicture} />
                      <VerificationImage label="Live selfie" src={verificationDocuments.selfie} />
                      <VerificationImage label="Identity document — front" src={verificationDocuments.identityFront} />
                      <VerificationImage label="Identity document — back" src={verificationDocuments.identityBack} />
                      <VerificationImage label="School / institution ID — front" src={verificationDocuments.studentIdFront} />
                      <VerificationImage label="School / institution ID — back" src={verificationDocuments.studentIdBack} />
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">No verification images are on file.</p>
                )}
              </div>

              {isTutor && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${user.verificationStatus === "VERIFIED" ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60" : user.verificationStatus === "REJECTED" ? "bg-rose-950 text-rose-400 border border-rose-800/60" : "bg-amber-950 text-amber-400 border border-amber-800/60"}`}
                >
                  {user.verificationStatus || "PENDING"}
                </span>
              )}
            </div>
            {isTutor && (
              <p className="text-xs text-blue-400 mt-1">
                {user.institution || "—"} • {user.department || "—"}
              </p>
            )}
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" /> {user.areaName}, {user.district}
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <UserIcon className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase">
              Basic Information
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <InfoField label="Email" value={user.email} span={2} mono />
            <InfoField label="Phone" value={user.phone} mono />
            <InfoField
              label="WhatsApp"
              value={user.whatsapp || user.phone}
              mono
            />
            <InfoField label="Gender" value={user.gender} />
            <InfoField label="Role" value={user.role} />
            <InfoField label="User ID" value={user.id} span={2} mono />
          </div>
        </div>

        {/* Location */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase">Location</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
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

        {isTutor && (
          <>
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase">
                  Verification Dossier
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
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

            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase">
                  Professional
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
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
                  value={
                    user.totalReviews
                      ? `${(user.rating || 0).toFixed(1)} / 5`
                      : "0.0 / 5"
                  }
                />
                <InfoField
                  label="Total Reviews"
                  value={approvedReviews.length}
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
                        className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 text-xs border border-blue-800/50"
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
                        className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-xs border border-cyan-800/50"
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
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <UserIcon className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase">
                    Bio & Philosophy
                  </h3>
                </div>
                {user.bio && (
                  <div className="mb-3">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                      Bio
                    </span>
                    <p className="text-xs text-slate-300">{user.bio}</p>
                  </div>
                )}
                {user.teachingPhilosophy && (
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                      Philosophy
                    </span>
                    <p className="text-xs text-slate-300 italic">
                      "{user.teachingPhilosophy}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {(user.degrees || []).length > 0 && (
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase">
                    Degrees ({user.degrees!.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {user.degrees!.map((d, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-[#111827] rounded-xl border border-slate-800 text-xs"
                    >
                      <div className="font-semibold text-white">
                        {d.degreeName}
                      </div>
                      <div className="text-blue-400 text-[11px]">
                        {d.institution}
                      </div>
                      <div className="text-slate-400 text-[10px] mt-1">
                        Year: {d.passingYear}{" "}
                        {d.result ? `• Result: ${d.result}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(user.reviews || []).length > 0 && (
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
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
                      className="p-2.5 bg-[#111827] rounded-xl border border-slate-800 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">
                          {r.studentName}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${r.status === "APPROVED" ? "bg-emerald-950 text-emerald-400" : r.status === "REJECTED" ? "bg-rose-950 text-rose-400" : "bg-amber-950 text-amber-400"}`}
                        >
                          {r.status || "APPROVED"}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1 italic">
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

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 sticky bottom-0 bg-[#0B0F19] pb-1">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Close
          </button>
          {isTutor && user.verificationStatus !== "VERIFIED" && (
            <>
              <button
                onClick={onReject}
                className="px-4 py-2.5 bg-rose-950/80 text-rose-300 rounded-xl text-xs font-semibold border border-rose-800/50"
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
    <div className="rounded-xl border border-slate-800 bg-[#111827] p-2.5">
      <p className="mb-2 text-[10px] font-mono uppercase text-slate-400">{label}</p>
      {src ? (
        <a href={src} target="_blank" rel="noreferrer">
          <img
            src={src}
            alt={label}
            loading="lazy"
            decoding="async"
            className="h-44 w-full rounded-lg bg-slate-950 object-contain"
          />
        </a>
      ) : (
        <div className="flex h-44 items-center justify-center rounded-lg bg-slate-950 text-xs text-slate-500">
          Not provided
        </div>
      )}
    </div>
  );
}
