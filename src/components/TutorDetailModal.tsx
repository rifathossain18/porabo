import React, { useState } from 'react';
import {
  X,
  Award,
  GraduationCap,
  Star,
  ExternalLink,
  ShieldCheck,
  Building2,
  MapPin,
  Clock,
  BookOpen,
  Info,
  Check,
  MessageSquare
} from 'lucide-react';
import { User, TuitionApplication } from '../lib/types';
import { GenderAvatar } from './GenderAvatar';

interface TutorDetailModalProps {
  tutor: User;
  application?: TuitionApplication;
  isOpen: boolean;
  onClose: () => void;
  onAcceptTutor?: (app: TuitionApplication) => void;
  onOpenFullProfile?: (tutorId: string) => void;
  isStudentViewer?: boolean;
  quizPoints?: number; // নতুন প্রপ
}

export const CATEGORY_TOOLTIPS = {
  punctuality: {
    title: 'Punctuality & Schedule Discipline',
    description:
      'Reflects on-time arrival rate, consistency across scheduled weekly sessions, and proactive communication without unexpected cancellations.',
    metric: '99% On-Time Record • 0 No-Shows'
  },
  subjectMastery: {
    title: 'Subject Mastery & Conceptual Clarity',
    description:
      'Evaluates syllabus mastery, clarity in breaking down advanced formulas and theorems, and verified student academic exam improvements.',
    metric: 'Verified Degree • Board & Cambridge Curriculum'
  },
  teachingStyle: {
    title: 'Teaching Pedagogy & Student Engagement',
    description:
      'Measures patience, adaptive pacing tailored to student learning speed, weekly evaluation tests, and motivational mentorship.',
    metric: '96% Positive Student Feedback • Regular Mock Tests'
  }
};

export const TutorDetailModal: React.FC<TutorDetailModalProps> = ({
  tutor,
  application,
  isOpen,
  onClose,
  onAcceptTutor,
  onOpenFullProfile,
  isStudentViewer = true,
  quizPoints = 0 // ডিফল্ট 0
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const approvedReviews = (tutor.reviews || []).filter(
    r => (r.status || 'APPROVED') === 'APPROVED'
  );
  const hasReviews = approvedReviews.length > 0;
  const punctualityScore = hasReviews
    ? tutor.ratingsBreakdown?.punctuality ?? (tutor.rating || 0.0)
    : 0.0;
  const masteryScore = hasReviews
    ? tutor.ratingsBreakdown?.subjectMastery ?? (tutor.rating || 0.0)
    : 0.0;
  const styleScore = hasReviews
    ? tutor.ratingsBreakdown?.teachingStyle ?? (tutor.rating || 0.0)
    : 0.0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#111827] border border-blue-600/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 sm:right-5 sm:top-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-5 pb-5 border-b border-blue-950/60">
          <GenderAvatar
            gender={tutor.gender || 'MALE'}
            role="TUTOR"
            size="lg"
            className="border-2 border-blue-500/40 shadow-lg shrink-0 self-start sm:self-auto"
          />

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {tutor.fullName}
              </h2>
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                  tutor.verificationStatus === 'VERIFIED'
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                    : 'bg-amber-950/80 text-amber-400 border-amber-800/60'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                {tutor.verificationStatus === 'VERIFIED'
                  ? 'Admin Verified Scholar'
                  : 'Pending Verification'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-blue-400 flex items-center gap-1.5 mt-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>
                {tutor.institution || 'University of Dhaka'} &bull;{' '}
                {tutor.department || 'Science & Mathematics'}
              </span>
            </p>

            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {tutor.areaName}, {tutor.district}
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-slate-300 font-medium">
                {tutor.yearsOfExperience || 4}+ Years Experience
              </span>
              {quizPoints > 0 && (
                <>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/30 flex items-center gap-1">
                    🏆 {quizPoints} Quiz Points
                  </span>
                </>
              )}
            </p>

            {application && (
              <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 bg-blue-950/40 border border-blue-800/50 rounded-xl text-xs text-slate-300">
                <span className="text-blue-400 font-semibold">Applied Fee:</span>
                <span className="text-emerald-400 font-bold">
                  ৳ {application.proposedSalary.toLocaleString()} / month
                </span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-slate-300">{application.availableSchedule}</span>
              </div>
            )}
          </div>
        </div>

        {/* Categorical Ratings */}
        <div className="bg-[#0B0F19] border border-blue-950/80 rounded-2xl p-4 sm:p-5 mb-5 shadow-inner space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                Categorical Ratings &amp; Authenticity Metrics
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>{hasReviews ? `${approvedReviews.length} approved` : 'New Tutor'}</span>
            </span>
          </div>

          <div className="space-y-4">
            {/* Punctuality */}
            <div
              className="relative group cursor-pointer"
              onMouseEnter={() => setActiveTooltip('punctuality')}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={() =>
                setActiveTooltip(activeTooltip === 'punctuality' ? null : 'punctuality')
              }
            >
              <div className="flex justify-between items-center text-xs mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-200">1. Punctuality</span>
                  <span className="text-[10px] text-blue-400 font-mono hidden sm:inline">
                    (Time discipline)
                  </span>
                  <Info className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="font-bold text-blue-400">
                  {hasReviews ? `${punctualityScore.toFixed(1)} / 5.0` : '0.0 / 5.0'}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-blue-950/60 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500 group-hover:brightness-125"
                  style={{ width: `${hasReviews ? (punctualityScore / 5) * 100 : 0}%` }}
                />
              </div>
              {activeTooltip === 'punctuality' && (
                <div className="mt-2 p-3 bg-blue-950 border border-blue-500/50 rounded-xl text-xs text-slate-200 shadow-2xl">
                  <div className="font-bold text-white flex items-center gap-1.5 mb-1 text-xs">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>{CATEGORY_TOOLTIPS.punctuality.title}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {CATEGORY_TOOLTIPS.punctuality.description}
                  </p>
                </div>
              )}
            </div>

            {/* Subject Mastery */}
            <div
              className="relative group cursor-pointer"
              onMouseEnter={() => setActiveTooltip('subjectMastery')}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={() =>
                setActiveTooltip(
                  activeTooltip === 'subjectMastery' ? null : 'subjectMastery'
                )
              }
            >
              <div className="flex justify-between items-center text-xs mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-200">2. Subject Mastery</span>
                  <span className="text-[10px] text-cyan-400 font-mono hidden sm:inline">
                    (Curriculum depth)
                  </span>
                  <Info className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
                <span className="font-bold text-cyan-400">
                  {hasReviews ? `${masteryScore.toFixed(1)} / 5.0` : '0.0 / 5.0'}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-blue-950/60 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-500 group-hover:brightness-125"
                  style={{ width: `${hasReviews ? (masteryScore / 5) * 100 : 0}%` }}
                />
              </div>
              {activeTooltip === 'subjectMastery' && (
                <div className="mt-2 p-3 bg-blue-950 border border-cyan-500/50 rounded-xl text-xs text-slate-200 shadow-2xl">
                  <div className="font-bold text-white flex items-center gap-1.5 mb-1 text-xs">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{CATEGORY_TOOLTIPS.subjectMastery.title}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {CATEGORY_TOOLTIPS.subjectMastery.description}
                  </p>
                </div>
              )}
            </div>

            {/* Teaching Style */}
            <div
              className="relative group cursor-pointer"
              onMouseEnter={() => setActiveTooltip('teachingStyle')}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={() =>
                setActiveTooltip(
                  activeTooltip === 'teachingStyle' ? null : 'teachingStyle'
                )
              }
            >
              <div className="flex justify-between items-center text-xs mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-200">3. Teaching Style</span>
                  <span className="text-[10px] text-indigo-400 font-mono hidden sm:inline">
                    (Patience &amp; clarity)
                  </span>
                  <Info className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>
                <span className="font-bold text-indigo-400">
                  {hasReviews ? `${styleScore.toFixed(1)} / 5.0` : '0.0 / 5.0'}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-blue-950/60 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full transition-all duration-500 group-hover:brightness-125"
                  style={{ width: `${hasReviews ? (styleScore / 5) * 100 : 0}%` }}
                />
              </div>
              {activeTooltip === 'teachingStyle' && (
                <div className="mt-2 p-3 bg-blue-950 border border-indigo-500/50 rounded-xl text-xs text-slate-200 shadow-2xl">
                  <div className="font-bold text-white flex items-center gap-1.5 mb-1 text-xs">
                    <Star className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{CATEGORY_TOOLTIPS.teachingStyle.title}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {CATEGORY_TOOLTIPS.teachingStyle.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Approved Student Reviews */}
        {hasReviews && (
          <div className="bg-[#0B0F19] border border-blue-950/80 rounded-2xl p-4 sm:p-5 mb-5 shadow-inner space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Verified Student Reviews ({approvedReviews.length})</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                Admin Approved
              </span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {approvedReviews.slice(0, 5).map(rev => (
                <div
                  key={rev.id}
                  className="p-3 bg-[#111827] rounded-xl border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-xs text-white">
                      {rev.studentName}
                    </div>
                    <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20 text-xs font-bold text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{rev.overall.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {rev.studentRoleOrGrade}
                  </div>
                  <p className="text-[11px] text-slate-300 italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Degrees */}
        <div className="mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Verified Educational Background</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              Admin Audited
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(tutor.degrees || [
              {
                degreeName: 'B.Sc (Hons) in Mathematics',
                institution: tutor.institution || 'University of Dhaka',
                passingYear: '2024',
                result: 'CGPA 3.88 / 4.00'
              }
            ]).map((deg, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#0B0F19] rounded-xl border border-blue-950/70 text-xs"
              >
                <div className="font-semibold text-white">{deg.degreeName}</div>
                <div className="text-blue-400 text-[11px] mt-0.5">{deg.institution}</div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-800">
                  <span>Year: {deg.passingYear}</span>
                  <span className="font-semibold text-emerald-400">{deg.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects */}
        <div className="mb-6 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Specialized Subjects Taught</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(tutor.subjectsTaught || ['Higher Math', 'Physics', 'General Science', 'ICT']).map(
              (sub, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-300 text-xs font-medium"
                >
                  #{sub}
                </span>
              )
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-4 border-t border-slate-800">
          {onOpenFullProfile && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFullProfile(tutor.id);
              }}
              className="w-full sm:flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <span>View Full Teacher Profile</span>
            </button>
          )}

          {isStudentViewer && application && onAcceptTutor && application.status !== 'ACCEPTED' && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onAcceptTutor(application);
              }}
              className="w-full sm:flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Accept Tutor &amp; Unlock Contact</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#0B0F19] hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs sm:text-sm font-medium border border-blue-950 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};