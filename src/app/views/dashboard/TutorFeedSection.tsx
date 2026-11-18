import { MapPin, Compass, Download, Check, Send, Filter, Heart, Bookmark, Zap, EyeOff, Share2, Radio, Sun, QrCode, Sliders, History } from "lucide-react";
import { Bar } from "recharts";
import { SUBJECT_OPTIONS, GRADE_OPTIONS } from "../../../lib/mockData";
import { formatDistanceAnnotation } from "../../../lib/geo";
import { EmptyFeedIllustration } from "../../../components/EmptyStateIllustrations";
import { PostCountdown } from "../../../components/PostCountdown";
import { useAppContext } from "../../AppContext";

export function TutorFeedSection() {
  const {
    globalSearchQuery,
    setGlobalSearchQuery,
    teacherViewMode,
    setTeacherViewMode,
    currentUser,
    downloadingPostId,
    bookmarkedPostIds,
    distanceRadiusKm,
    setDistanceRadiusKm,
    isDistanceFilterEnabled,
    setIsDistanceFilterEnabled,
    hiddenPostIds,
    handleHidePost,
    handleUnhideAllPosts,
    recentSearches,
    setRecentSearches,
    addRecentSearch,
    setQrModalData,
    filterSubject,
    setFilterSubject,
    filterGrade,
    setFilterGrade,
    filterOnlyBookmarked,
    setFilterOnlyBookmarked,
    setSelectedPostForApply,
    setApplyProposedSalary,
    handleToggleBookmark,
    filteredTutorPosts,
    tutorMyApplications,
    handleQuickApplyToPost,
    handleSharePost,
    handleDownloadCard,
  } = useAppContext();
  if (!currentUser || currentUser.role !== "TUTOR") return null;
  return (
    <>
      {/* VIEW MODE: TUITION FEED (GRID CARDS) */}
                    {teacherViewMode === "feed" && (
                      <div className="space-y-5">
                        {/* District Active Tuition Feed Banner (Centralized Location - Standalone buttons removed) */}
                        <div className="bg-[#111827] border border-blue-900/40 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center shrink-0">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                                <span>
                                  Active District Feed:{" "}
                                  <span className="text-cyan-400 font-extrabold">
                                    {currentUser.district}
                                  </span>
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                                  {filteredTutorPosts.length} Tuitions
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Showing all tuition posts available exclusively within
                                your registered district ({currentUser.district})
                              </p>
                            </div>
                          </div>
        
                          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={() => setTeacherViewMode("map")}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all"
                            >
                              <Radio className="w-3.5 h-3.5 animate-pulse text-white" />
                              <span>View District Radar Blips</span>
                            </button>
                          </div>
                        </div>
        
                        {/* Recent Searches Chip Bar */}
                        {recentSearches.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap text-xs bg-[#111827] border border-blue-900/40 rounded-2xl p-2.5 sm:p-3 shadow-md">
                            <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px] shrink-0">
                              <History className="w-3.5 h-3.5 text-blue-400" /> Recent:
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap flex-1">
                              {recentSearches.map((term, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setGlobalSearchQuery(term);
                                    addRecentSearch(term);
                                  }}
                                  className={`px-2.5 py-1 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
                                    globalSearchQuery.toLowerCase() ===
                                    term.toLowerCase()
                                      ? "bg-blue-600 border-blue-500 text-white font-semibold"
                                      : "bg-[#0B0F19] hover:bg-blue-950 text-slate-300 hover:text-blue-300 border-blue-950/80"
                                  }`}
                                >
                                  <span>{term}</span>
                                </button>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => setRecentSearches([])}
                              className="text-[11px] text-slate-500 hover:text-slate-300 underline shrink-0 ml-auto"
                              title="Clear search history"
                            >
                              Clear
                            </button>
                          </div>
                        )}
        
                        {/* Hidden Posts Alert Banner */}
                        {hiddenPostIds.length > 0 && (
                          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#111827] border border-amber-500/30 text-xs text-slate-300 shadow-md">
                            <div className="flex items-center gap-2">
                              <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>
                                {hiddenPostIds.length} tuition post
                                {hiddenPostIds.length > 1 ? "s" : ""} hidden from your
                                feed.
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleUnhideAllPosts}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                            >
                              Restore All
                            </button>
                          </div>
                        )}
        
                        {/* Filter Controls Bar with Distance Range Slider (1km to 5km) */}
                        <div className="bg-[#111827] border border-blue-900/40 rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2.5 flex-1">
                            {/* Distance Range Slider (1km to 5km) */}
                            <div className="flex items-center gap-2.5 bg-[#0B0F19] border border-blue-950/80 rounded-xl px-3 py-1.5 text-xs">
                              <Sliders className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-400 font-medium">
                                  Radius:
                                </span>
                                <span className="font-bold text-cyan-300 font-mono w-11">
                                  {distanceRadiusKm} km
                                </span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="5"
                                step="0.5"
                                value={distanceRadiusKm}
                                onChange={(e) => {
                                  setDistanceRadiusKm(Number(e.target.value));
                                  setIsDistanceFilterEnabled(true);
                                }}
                                className="w-20 sm:w-28 accent-cyan-400 cursor-pointer"
                                title={`Filter tuition posts within ${distanceRadiusKm} km of your location`}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setIsDistanceFilterEnabled(!isDistanceFilterEnabled)
                                }
                                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                                  isDistanceFilterEnabled
                                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-semibold"
                                    : "bg-slate-800 text-slate-400 border border-slate-700"
                                }`}
                                title="Toggle distance filtering on or off"
                              >
                                {isDistanceFilterEnabled
                                  ? "1-5km Active"
                                  : "District All"}
                              </button>
                            </div>
        
                            <select
                              value={filterSubject}
                              onChange={(e) => setFilterSubject(e.target.value)}
                              className="bg-[#0B0F19] border border-blue-950/70 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                            >
                              {SUBJECT_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
        
                            <select
                              value={filterGrade}
                              onChange={(e) => setFilterGrade(e.target.value)}
                              className="bg-[#0B0F19] border border-blue-950/70 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                            >
                              {GRADE_OPTIONS.map((g) => (
                                <option key={g} value={g}>
                                  {g}
                                </option>
                              ))}
                            </select>
        
                            <button
                              type="button"
                              onClick={() =>
                                setFilterOnlyBookmarked(!filterOnlyBookmarked)
                              }
                              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                filterOnlyBookmarked
                                  ? "bg-rose-600/20 text-rose-400 border border-rose-500/40"
                                  : "bg-[#0B0F19] text-slate-400 border border-blue-950/70 hover:text-white"
                              }`}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${filterOnlyBookmarked ? "fill-rose-400" : ""}`}
                              />
                              <span>Bookmarked Only ({bookmarkedPostIds.length})</span>
                            </button>
                          </div>
        
                          <div className="text-xs text-slate-400 font-mono self-end lg:self-auto">
                            Showing{" "}
                            <span className="font-bold text-blue-400">
                              {filteredTutorPosts.length}
                            </span>{" "}
                            matching tuition posts
                          </div>
                        </div>
        
                        {/* Tuition Post Cards Grid */}
                        {filteredTutorPosts.length === 0 ? (
                          <div className="p-12 text-center bg-[#111827] border border-blue-900/30 rounded-3xl space-y-3">
                            <EmptyFeedIllustration className="w-36 h-36 mx-auto mb-2" />
                            <p className="text-base font-bold text-white">
                              No tuition posts found in this range.
                            </p>
                            <p className="text-xs text-slate-400 max-w-md mx-auto">
                              Try expanding your distance slider up to 5km, toggling off
                              distance limit, or clearing specific search keywords.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setDistanceRadiusKm(5);
                                setIsDistanceFilterEnabled(false);
                                setFilterSubject("All Subjects");
                                setFilterGrade("All Grades");
                                setFilterOnlyBookmarked(false);
                                setGlobalSearchQuery("");
                              }}
                              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-md"
                            >
                              Reset Filters &amp; View All District Posts
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTutorPosts.map((post) => {
                              const alreadyApplied = tutorMyApplications.some(
                                (a) => a.postId === post.id,
                              );
        
                              const dayLabels: Record<string, string> = {
                                SAT: "Sat",
                                SUN: "Sun",
                                MON: "Mon",
                                TUE: "Tue",
                                WED: "Wed",
                                THU: "Thu",
                                FRI: "Fri",
                              };
        
                              return (
                                <div
                                  key={post.id}
                                  className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5 shadow-xl hover:border-blue-700/60 transition-all flex flex-col justify-between space-y-4 relative group"
                                >
                                  <div>
                                    {/* Card Header with countdown */}
                                    <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="px-2.5 py-1 rounded-full bg-blue-950 text-blue-400 text-[11px] font-mono font-semibold border border-blue-800/60 flex items-center gap-1">
                                          <MapPin className="w-3 h-3 text-blue-400" />
                                          <span>
                                            {post.distanceKm !== undefined
                                              ? formatDistanceAnnotation(
                                                  post.distanceKm,
                                                ).badgeText
                                              : "Nearby"}
                                          </span>
                                        </span>
                                        <PostCountdown createdAt={post.createdAt} />
                                      </div>
        
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setQrModalData({
                                              isOpen: true,
                                              title: post.title,
                                              subtitle: `${post.subject} • ${post.gradeLevel}`,
                                              district: post.district,
                                              areaName: post.areaName,
                                              shareUrl: `${window.location.origin}/#post-${post.id}`,
                                              type: "post",
                                            });
                                          }}
                                          title="Share via QR Code"
                                          className="w-7 h-7 rounded-full bg-[#0B0F19] hover:bg-blue-950/80 flex items-center justify-center border border-blue-950/70 text-slate-400 hover:text-cyan-300 transition-colors"
                                        >
                                          <QrCode className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => handleSharePost(post, e)}
                                          title="Share"
                                          className="w-7 h-7 rounded-full bg-[#0B0F19] hover:bg-blue-950/80 flex items-center justify-center border border-blue-950/70 text-slate-400 hover:text-white transition-colors"
                                        >
                                          <Share2 className="w-3.5 h-3.5" />
                                        </button>
        
                                        {/* 🆕 Download Premium Card */}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadCard(post);
                                          }}
                                          disabled={downloadingPostId === post.id}
                                          title="Download beautiful PNG card"
                                          className="w-7 h-7 rounded-full bg-[#0B0F19] hover:bg-blue-950/80 flex items-center justify-center border border-blue-950/70 text-slate-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                                        >
                                          <Download
                                            className={`w-3.5 h-3.5 ${downloadingPostId === post.id ? "animate-pulse" : ""}`}
                                          />
                                        </button>
        
                                        <button
                                          type="button"
                                          onClick={(e) => handleHidePost(post.id, e)}
                                          title="Hide"
                                          className="w-7 h-7 rounded-full bg-[#0B0F19] hover:bg-slate-800 flex items-center justify-center border border-blue-950/70 text-slate-400 hover:text-rose-400 transition-colors"
                                        >
                                          <EyeOff className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) =>
                                            handleToggleBookmark(post.id, e)
                                          }
                                          title="Bookmark"
                                          className="w-7 h-7 rounded-full bg-[#0B0F19] hover:bg-slate-800 flex items-center justify-center border border-blue-950/70 transition-colors"
                                        >
                                          <Heart
                                            className={`w-3.5 h-3.5 ${post.isBookmarked ? "text-rose-500 fill-rose-500" : "text-slate-400 hover:text-white"}`}
                                          />
                                        </button>
                                      </div>
                                    </div>
        
                                    <h3 className="font-bold text-base text-white line-clamp-2 leading-snug">
                                      {post.title}
                                    </h3>
                                    <p className="text-xs text-blue-400 font-medium mt-1">
                                      {post.subject} • {post.gradeLevel}
                                    </p>
        
                                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                                      <span className="px-2 py-0.5 rounded bg-[#0B0F19] text-slate-300 text-[10px] border border-slate-800">
                                        {post.curriculum}
                                      </span>
                                      <span className="px-2 py-0.5 rounded bg-[#0B0F19] text-slate-300 text-[10px] border border-slate-800">
                                        {post.daysPerWeek} days/wk
                                      </span>
                                      {post.tuitionMode && (
                                        <span
                                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${post.tuitionMode === "ONLINE" ? "bg-cyan-950 text-cyan-400 border-cyan-800/60" : post.tuitionMode === "OFFLINE" ? "bg-emerald-950 text-emerald-400 border-emerald-800/60" : "bg-purple-950 text-purple-400 border-purple-800/60"}`}
                                        >
                                          {post.tuitionMode === "ONLINE"
                                            ? "🌐 Online"
                                            : post.tuitionMode === "OFFLINE"
                                              ? "🏠 Offline"
                                              : "🔄 Both"}
                                        </span>
                                      )}
                                    </div>
        
                                    {/* Location (area only — exact address hidden) */}
                                    <div className="mt-3 text-xs text-slate-400 space-y-1.5">
                                      <div className="flex items-center gap-1 text-slate-300">
                                        <Compass className="w-3.5 h-3.5 text-slate-500" />
                                        <span>
                                          {post.areaName}, {post.district}
                                        </span>
                                        <span className="text-[9px] text-slate-600 ml-1 italic">
                                          (exact address unlocks after acceptance)
                                        </span>
                                      </div>
        
                                      {/* Weekly schedule preview */}
                                      {post.weeklySchedule &&
                                        post.weeklySchedule.length > 0 && (
                                          <div className="p-2 rounded-lg bg-[#0B0F19] border border-slate-800">
                                            <div className="text-[9px] text-cyan-400 font-mono uppercase mb-1">
                                              Schedule
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                              {post.weeklySchedule.map((slot, i) => (
                                                <span
                                                  key={i}
                                                  className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 text-[9px] font-mono"
                                                >
                                                  {dayLabels[slot.day] || slot.day}{" "}
                                                  {slot.startTime}–{slot.endTime}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
        
                                      {post.specialRequirements && (
                                        <div className="p-2 rounded-lg bg-[#0B0F19] border border-slate-800">
                                          <div className="text-[9px] text-slate-500 font-mono uppercase mb-0.5">
                                            Special Requirements
                                          </div>
                                          <p className="text-[10px] text-slate-300 italic line-clamp-2">
                                            {post.specialRequirements}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
        
                                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                                    <div>
                                      <span className="text-[10px] text-slate-500 uppercase font-mono block">
                                        Monthly Budget
                                      </span>
                                      <span className="text-base font-extrabold text-emerald-400">
                                        ৳ {post.salaryBudget.toLocaleString()}
                                      </span>
                                    </div>
        
                                    {alreadyApplied ? (
                                      <span className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/30 flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5" /> Applied
                                      </span>
                                    ) : currentUser.verificationStatus !==
                                      "VERIFIED" ? (
                                      <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/30">
                                        Pending Verification
                                      </span>
                                    ) : (
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={(e) =>
                                            handleQuickApplyToPost(post, e)
                                          }
                                          className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1"
                                          title="Quick Apply"
                                        >
                                          <Zap className="w-3.5 h-3.5" />
                                          <span>Quick</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedPostForApply(post);
                                            setApplyProposedSalary(post.salaryBudget);
                                          }}
                                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1"
                                        >
                                          <Send className="w-3.5 h-3.5" />
                                          <span>Apply</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
    </>
  );
}
