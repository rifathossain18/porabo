import { Award, Info } from "lucide-react";
import { CATEGORY_TOOLTIPS } from "../../../components/TutorDetailModal";
import type { User } from "../../../lib/types";
import { useAppContext } from "../../AppContext";

interface TeacherProfileRatingsProps {
  tutor: User;
}

export function TeacherProfileRatings({ tutor }: TeacherProfileRatingsProps) {
  const { profileActiveTooltip, setProfileActiveTooltip } = useAppContext();

  return (
    <>
      {(() => {
              const hasTutorReviews = Boolean(
                tutor.totalReviews && tutor.totalReviews > 0,
              );
              const punc = hasTutorReviews
                ? (tutor.ratingsBreakdown?.punctuality ?? (tutor.rating || 0.0))
                : 0.0;
              const mast = hasTutorReviews
                ? (tutor.ratingsBreakdown?.subjectMastery ??
                  (tutor.rating || 0.0))
                : 0.0;
              const styl = hasTutorReviews
                ? (tutor.ratingsBreakdown?.teachingStyle ?? (tutor.rating || 0.0))
                : 0.0;
  
              return (
                <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-400" />
                      <h2 className="text-base font-bold text-white">
                        Categorical Ratings
                      </h2>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-blue-400" />
                      <span>
                        {hasTutorReviews
                          ? "Hover bars for details"
                          : "New Tutor (0 Reviews)"}
                      </span>
                    </span>
                  </div>
  
                  <div className="space-y-4">
                    {/* 1. Punctuality with Tooltip */}
                    <div
                      className="relative group cursor-pointer"
                      onMouseEnter={() => setProfileActiveTooltip("punctuality")}
                      onMouseLeave={() => setProfileActiveTooltip(null)}
                      onClick={() =>
                        setProfileActiveTooltip(
                          profileActiveTooltip === "punctuality"
                            ? null
                            : "punctuality",
                        )
                      }
                    >
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-300 flex items-center gap-1.5">
                          <span>1. Punctuality</span>
                          <Info className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        </span>
                        <span className="font-bold text-blue-400">
                          {hasTutorReviews
                            ? `${punc.toFixed(1)} / 5.0`
                            : "0.0 / 5.0"}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-[#0B0F19] rounded-full overflow-hidden border border-blue-950">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all group-hover:brightness-125"
                          style={{
                            width: `${hasTutorReviews ? (punc / 5) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      {profileActiveTooltip === "punctuality" && (
                        <div className="mt-2 p-2.5 bg-blue-950 border border-blue-500/50 rounded-xl text-xs text-slate-200 shadow-xl animate-in fade-in duration-150">
                          <div className="font-bold text-white text-[11px] mb-0.5">
                            {CATEGORY_TOOLTIPS.punctuality.title}
                          </div>
                          <p className="text-slate-300 text-[10px] leading-relaxed">
                            {CATEGORY_TOOLTIPS.punctuality.description}
                          </p>
                          <div className="text-[9px] font-mono text-blue-300 mt-1 pt-0.5 border-t border-blue-800/40">
                            {hasTutorReviews
                              ? CATEGORY_TOOLTIPS.punctuality.metric
                              : "Awaiting initial student ratings."}
                          </div>
                        </div>
                      )}
                    </div>
  
                    {/* 2. Subject Mastery with Tooltip */}
                    <div
                      className="relative group cursor-pointer"
                      onMouseEnter={() =>
                        setProfileActiveTooltip("subjectMastery")
                      }
                      onMouseLeave={() => setProfileActiveTooltip(null)}
                      onClick={() =>
                        setProfileActiveTooltip(
                          profileActiveTooltip === "subjectMastery"
                            ? null
                            : "subjectMastery",
                        )
                      }
                    >
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-300 flex items-center gap-1.5">
                          <span>2. Subject Mastery</span>
                          <Info className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                        </span>
                        <span className="font-bold text-cyan-400">
                          {hasTutorReviews
                            ? `${mast.toFixed(1)} / 5.0`
                            : "0.0 / 5.0"}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-[#0B0F19] rounded-full overflow-hidden border border-blue-950">
                        <div
                          className="h-full bg-cyan-400 rounded-full transition-all group-hover:brightness-125"
                          style={{
                            width: `${hasTutorReviews ? (mast / 5) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      {profileActiveTooltip === "subjectMastery" && (
                        <div className="mt-2 p-2.5 bg-blue-950 border border-cyan-500/50 rounded-xl text-xs text-slate-200 shadow-xl animate-in fade-in duration-150">
                          <div className="font-bold text-white text-[11px] mb-0.5">
                            {CATEGORY_TOOLTIPS.subjectMastery.title}
                          </div>
                          <p className="text-slate-300 text-[10px] leading-relaxed">
                            {CATEGORY_TOOLTIPS.subjectMastery.description}
                          </p>
                          <div className="text-[9px] font-mono text-cyan-300 mt-1 pt-0.5 border-t border-cyan-800/40">
                            {hasTutorReviews
                              ? CATEGORY_TOOLTIPS.subjectMastery.metric
                              : "Awaiting initial student ratings."}
                          </div>
                        </div>
                      )}
                    </div>
  
                    {/* 3. Teaching Style with Tooltip */}
                    <div
                      className="relative group cursor-pointer"
                      onMouseEnter={() =>
                        setProfileActiveTooltip("teachingStyle")
                      }
                      onMouseLeave={() => setProfileActiveTooltip(null)}
                      onClick={() =>
                        setProfileActiveTooltip(
                          profileActiveTooltip === "teachingStyle"
                            ? null
                            : "teachingStyle",
                        )
                      }
                    >
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-300 flex items-center gap-1.5">
                          <span>3. Teaching Style</span>
                          <Info className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                        </span>
                        <span className="font-bold text-indigo-400">
                          {hasTutorReviews
                            ? `${styl.toFixed(1)} / 5.0`
                            : "0.0 / 5.0"}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-[#0B0F19] rounded-full overflow-hidden border border-blue-950">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all group-hover:brightness-125"
                          style={{
                            width: `${hasTutorReviews ? (styl / 5) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      {profileActiveTooltip === "teachingStyle" && (
                        <div className="mt-2 p-2.5 bg-blue-950 border border-indigo-500/50 rounded-xl text-xs text-slate-200 shadow-xl animate-in fade-in duration-150">
                          <div className="font-bold text-white text-[11px] mb-0.5">
                            {CATEGORY_TOOLTIPS.teachingStyle.title}
                          </div>
                          <p className="text-slate-300 text-[10px] leading-relaxed">
                            {CATEGORY_TOOLTIPS.teachingStyle.description}
                          </p>
                          <div className="text-[9px] font-mono text-indigo-300 mt-1 pt-0.5 border-t border-indigo-800/40">
                            {hasTutorReviews
                              ? CATEGORY_TOOLTIPS.teachingStyle.metric
                              : "Awaiting initial student ratings."}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
      })()}
    </>
  );
}