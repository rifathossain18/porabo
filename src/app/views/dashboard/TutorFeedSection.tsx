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
                        <div className="bg-white border border-blue-200 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-700 flex items-center justify-center shrink-0">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                                <span>
                                  Active District Feed:{" "}
                                  <span className="text-blue-700 font-extrabold">
                                    {currentUser.district}
                                  </span>
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                  {filteredTutorPosts.length} Tuitions
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Showing all tuition posts available exclusively within
                                your registered district ({currentUser.district})
                              </p>
                            </div>
                          </div>
        
                          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={() => setTeacherViewMode("map")}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
                            >
                              <Radio className="w-3.5 h-3.5 animate-pulse text-white" />
                              <span>View District Radar Blips</span>
                            </button>
                          </div>
                        </div>
        
                        {/* Recent Searches Chip Bar */}
                        {recentSearches.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap text-xs bg-white border border-blue-200 rounded-2xl p-2.5 sm:p-3 shadow-md">
                            <span className="text-slate-500 flex items-center gap-1.5 font-mono text-[11px] shrink-0">
                              <History className="w-3.5 h-3.5 text-blue-700" /> Recent:
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
                                      : "bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 border-blue-200"
                                  }`}
                                >
                                  <span>{term}</span>
                                </button>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => setRecentSearches([])}
                              className="text-[11px] text-slate-500 hover:text-slate-600 underline shrink-0 ml-auto"
                              title="Clear search history"
                            >
                              Clear
                            </button>
                          </div>
                        )}
        
                        {/* Hidden Posts Alert Banner */}
                        {hiddenPostIds.length > 0 && (
                          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-amber-500/30 text-xs text-slate-600 shadow-md">
                            <div className="flex items-center gap-2">
                              <EyeOff className="w-4 h-4 text-amber-700 shrink-0" />
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
                        <div className="bg-white border border-blue-200 rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2.5 flex-1">
                            {/* Distance Range Slider (1km to 5km) */}
                            <div className="flex items-center gap-2.5 bg-white border border-blue-200 rounded-xl px-3 py-1.5 text-xs">
                              <Sliders className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-500 font-medium">
                                  Radius:
                                </span>
                                <span className="font-bold text-blue-700 font-mono w-11">
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
                                    ? "bg-blue-500/20 text-blue-700 border border-blue-500/40 font-semibold"
                                    : "bg-slate-100 text-slate-500 border border-slate-300"
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
                              className="bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
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
                              className="bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
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
                                  ? "bg-rose-600/20 text-rose-700 border border-rose-500/40"
                                  : "bg-white text-slate-500 border border-blue-200 hover:text-slate-900"
                              }`}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${filterOnlyBookmarked ? "fill-rose-400" : ""}`}
                              />
                              <span>Bookmarked Only ({bookmarkedPostIds.length})</span>
                            </button>
                          </div>
        
                          <div className="text-xs text-slate-500 font-mono self-end lg:self-auto">
                            Showing{" "}
                            <span className="font-bold text-blue-700">
                              {filteredTutorPosts.length}
                            </span>{" "}
                            matching tuition posts
                          </div>
                        </div>
        
                        {/* Tuition Post Cards Grid */}
                        {filteredTutorPosts.length === 0 ? (
                          <div className="p-12 text-center bg-white border border-blue-200 rounded-3xl space-y-3">
                            <EmptyFeedIllustration className="w-36 h-36 mx-auto mb-2" />
                            <p className="text-base font-bold text-white">
                              No tuition posts found in this range.
                            </p>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
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
                          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
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
                                  className="relative flex flex-col justify-between space-y-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_12px_24px_-8px_rgba(15,23,42,0.12),0_4px_8px_-2px_rgba(15,23,42,0.06)]"
                                >
                                  <div>
                                    {/* Card Header with countdown */}
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">
                                          <MapPin className="h-3.5 w-3.5" />
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
        
                                      <div className="flex shrink-0 items-center gap-1">
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
                                          aria-label="Share tuition post by QR code"
                                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                        >
                                          <QrCode className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => handleSharePost(post, e)}
                                          title="Share"
                                          aria-label="Share tuition post"
                                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
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
                                          aria-label="Download tuition post card"
                                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                                        >
                                          <Download
                                            className={`w-3.5 h-3.5 ${downloadingPostId === post.id ? "animate-pulse" : ""}`}
                                          />
                                        </button>
        
                                        <button
                                          type="button"
                                          onClick={(e) => handleHidePost(post.id, e)}
                                          title="Hide"
                                          aria-label="Hide tuition post"
                                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                                        >
                                          <EyeOff className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) =>
                                            handleToggleBookmark(post.id, e)
                                          }
                                          title="Bookmark"
                                          aria-label={post.isBookmarked ? "Remove bookmark" : "Bookmark tuition post"}
                                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:bg-rose-50"
                                        >
                                          <Heart
                                            className={`w-3.5 h-3.5 ${post.isBookmarked ? "text-rose-500 fill-rose-500" : "text-slate-500 hover:text-slate-900"}`}
                                          />
                                        </button>
                                      </div>
                                    </div>
        
                                    <h3 className="text-lg font-bold leading-snug text-slate-900 line-clamp-2">
                                      {post.title}
                                    </h3>
                                    <p className="mt-1.5 text-sm leading-5 text-slate-600">
                                      <span className="font-semibold text-blue-800">{post.subject}</span>
                                      <span className="mx-1.5 text-slate-400" aria-hidden="true">·</span>
                                      {post.gradeLevel}
                                    </p>
        
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                                        {post.curriculum}
                                      </span>
                                      {post.tuitionMode && (
                                        <span
                                          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${post.tuitionMode === "ONLINE" ? "border-blue-100 bg-blue-50 text-blue-800" : post.tuitionMode === "OFFLINE" ? "border-emerald-100 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-700"}`}
                                        >
                                          {post.tuitionMode === "ONLINE"
                                            ? "Online"
                                            : post.tuitionMode === "OFFLINE"
                                              ? "In person"
                                              : "Online or in person"}
                                        </span>
                                      )}
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <div className="text-xs font-medium text-slate-500">Schedule</div>
                                        <div className="mt-1 text-sm font-semibold text-slate-900">
                                          {post.daysPerWeek} days · {post.hoursPerDay} hrs/session
                                        </div>
                                      </div>
                                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <div className="text-xs font-medium text-slate-500">Tutor preference</div>
                                        <div className="mt-1 text-sm font-semibold text-slate-900">
                                          {post.genderPreference === "MALE_ONLY"
                                            ? "Male tutor"
                                            : post.genderPreference === "FEMALE_ONLY"
                                              ? "Female tutor"
                                              : "Any tutor"}
                                        </div>
                                      </div>
                                    </div>
        
                                    {/* Location (area only — exact address hidden) */}
                                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                                      <Compass className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                                      <div>
                                        <div className="text-sm font-semibold text-slate-800">
                                          {post.areaName}, {post.district}
                                        </div>
                                        <p className="mt-0.5 text-xs leading-5 text-slate-600">
                                          Approximate area only; exact address is shared after acceptance.
                                        </p>
                                      </div>
                                    </div>
        
                                      {/* Weekly schedule preview */}
                                      {post.weeklySchedule &&
                                        post.weeklySchedule.length > 0 && (
                                          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                                            <div className="mb-2 text-xs font-semibold text-slate-700">
                                              Schedule
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                              {post.weeklySchedule.map((slot, i) => (
                                                <span
                                                  key={i}
                                                  className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800"
                                                >
                                                  {dayLabels[slot.day] || slot.day}{" "}
                                                  {slot.startTime}–{slot.endTime}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
        
                                      {post.specialRequirements && (
                                        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                          <div className="text-xs font-semibold text-slate-700">
                                            Special Requirements
                                          </div>
                                          <p className="mt-1 text-sm leading-6 text-slate-600 line-clamp-3">
                                            {post.specialRequirements}
                                          </p>
                                        </div>
                                      )}
                                  </div>
        
                                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
                                    <div className="flex items-center justify-between gap-4 sm:block">
                                      <div>
                                        <span className="block text-xs font-medium text-slate-500">
                                          Monthly budget
                                        </span>
                                        <span className="mt-0.5 block text-xl font-bold text-emerald-800">
                                          ৳ {post.salaryBudget.toLocaleString()}
                                        </span>
                                      </div>
                                      {post.applicationsCount !== undefined && (
                                        <span className="text-xs text-slate-500 sm:mt-1 sm:block">
                                          {post.applicationsCount} {post.applicationsCount === 1 ? "applicant" : "applicants"}
                                        </span>
                                      )}
                                    </div>
        
                                    {alreadyApplied ? (
                                      <span className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-700 text-xs font-semibold border border-blue-500/30 flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5" /> Applied
                                      </span>
                                    ) : currentUser.verificationStatus !==
                                      "VERIFIED" ? (
                                      <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 text-xs font-medium border border-amber-500/30">
                                        Pending Verification
                                      </span>
                                    ) : (
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={(e) =>
                                            handleQuickApplyToPost(post, e)
                                          }
                                          className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1"
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
