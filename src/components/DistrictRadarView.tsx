import React, { useState, useMemo } from 'react';
import {
  Compass,
  Radio,
  MapPin,
  DollarSign,
  BookOpen,
  Send,
  Heart,
  CheckCircle,
  Layers,
  Sparkles,
  Filter,
  Globe2,
  ArrowRight,
} from 'lucide-react';
import { TuitionPost } from '../lib/types';

interface DistrictRadarViewProps {
  posts: TuitionPost[];
  appliedPostIds: ReadonlySet<string>;
  district: string;
  areaName: string;
  onApply: (post: TuitionPost) => void;
  onBookmarkToggle: (postId: string) => void;
}

const MAX_RADAR_MARKERS = 60;
const PRIORITIZED_LOCAL_MARKERS = 40;
const PRIORITIZED_ONLINE_MARKERS = 20;
const INITIAL_LIST_LIMIT = 24;

export const DistrictRadarView: React.FC<DistrictRadarViewProps> = ({
  posts,
  appliedPostIds,
  district,
  areaName,
  onApply,
  onBookmarkToggle,
}) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(() => {
    return posts[0]?.id || null;
  });
  const [radarFilterSubject, setRadarFilterSubject] = useState<string>('ALL');
  const [visibleListCount, setVisibleListCount] = useState(INITIAL_LIST_LIMIT);

  const visiblePosts = useMemo(() => {
    if (radarFilterSubject === 'ALL') return posts;
    return posts.filter(p => p.subject.toLowerCase().includes(radarFilterSubject.toLowerCase()));
  }, [posts, radarFilterSubject]);

  const activePost = useMemo(() => {
    return visiblePosts.find(p => p.id === selectedPostId) || visiblePosts[0] || null;
  }, [visiblePosts, selectedPostId]);

  const radarBlips = useMemo(() => {
    const localPosts = visiblePosts.filter((post) => post.tuitionMode !== "ONLINE");
    const onlinePosts = visiblePosts.filter((post) => post.tuitionMode === "ONLINE");
    const plottedPosts = [
      ...localPosts.slice(0, PRIORITIZED_LOCAL_MARKERS),
      ...onlinePosts.slice(0, PRIORITIZED_ONLINE_MARKERS),
      ...localPosts.slice(PRIORITIZED_LOCAL_MARKERS),
      ...onlinePosts.slice(PRIORITIZED_ONLINE_MARKERS),
    ].slice(0, MAX_RADAR_MARKERS);
    const total = plottedPosts.length;
    return plottedPosts.map((post, idx) => {
      let hash = 0;
      for (let i = 0; i < post.id.length; i++) {
        hash = (hash * 31 + post.id.charCodeAt(i)) & 0xffffffff;
      }
      const absHash = Math.abs(hash);
      const baseAngle = (idx * (360 / total) + (absHash % 30)) % 360;
      const angleRad = (baseAngle * Math.PI) / 180;
      const radiusPercent =
        post.tuitionMode === "ONLINE"
          ? 97
          : 20 + (Math.min(post.distanceKm ?? 0, 5) / 5) * 65;
      const maxR = 160;
      const r = (radiusPercent / 100) * maxR;
      const x = 200 + r * Math.cos(angleRad);
      const y = 200 + r * Math.sin(angleRad);
      const isApplied = appliedPostIds.has(post.id);

      return {
        post,
        x,
        y,
        isApplied
      };
    });
  }, [visiblePosts, appliedPostIds]);

  const subjects = useMemo(() => {
    const set = new Set<string>();
    posts.forEach(p => {
      if (p.subject) set.add(p.subject.split(',')[0].trim());
    });
    return Array.from(set).slice(0, 5);
  }, [posts]);
  const onlinePostCount = useMemo(
    () => visiblePosts.filter((post) => post.tuitionMode === "ONLINE").length,
    [visiblePosts],
  );
  const displayedPosts = visiblePosts.slice(0, visibleListCount);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)] sm:p-6">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400"
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-800">
              <Radio className="h-3.5 w-3.5" />
              Tutor discovery radar
            </div>
            <h2 className="flex flex-wrap items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Tuition opportunities
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {visiblePosts.length} available
              </span>
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600 sm:text-sm">
              Discover in-person requests near {areaName || district} and online tuitions open to verified tutors across Bangladesh.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:shrink-0 sm:justify-end">
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <MapPin className="h-4 w-4 text-blue-700" />
              <span className="text-xs font-semibold text-slate-700">
                Local · {areaName || district}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2">
              <Globe2 className="h-4 w-4 text-indigo-700" />
              <span className="text-xs font-semibold text-indigo-800">
                Online · Bangladesh ({onlinePostCount})
              </span>
            </div>
          </div>
        </div>

        {/* Quick Subject Chips */}
        {subjects.length > 0 && (
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 pt-3 scrollbar-none">
            <span className="mr-1 flex shrink-0 items-center gap-1 text-[11px] font-semibold text-slate-500">
              <Filter className="h-3 w-3 text-blue-700" /> Subject:
            </span>
            <button
              type="button"
              onClick={() => {
                setRadarFilterSubject('ALL');
                setVisibleListCount(INITIAL_LIST_LIMIT);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                radarFilterSubject === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              All subjects ({posts.length})
            </button>
            {subjects.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setRadarFilterSubject(s);
                  setVisibleListCount(INITIAL_LIST_LIMIT);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  radarFilterSubject === s
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Radar Screen & Interactive Panel Grid */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12 lg:gap-5">
        {/* Radar Screen (7 cols) */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)] sm:p-6 lg:col-span-7">

          {/* Top radar metrics */}
          <div className="relative z-10 mb-2 flex w-full items-center justify-between gap-3 px-1 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                Sonar ready
              </span>
            </div>
            <div className="text-right text-[11px] font-medium text-slate-500">
              Nearby range + nationwide online
            </div>
          </div>

          {/* SVG Radar Canvas */}
          <div className="relative w-full max-w-[310px] sm:max-w-[420px] aspect-square flex items-center justify-center my-2 mx-auto">
            <svg
              viewBox="0 0 400 400"
              role="img"
              aria-label="Tuition radar with distance rings for local posts and an outer ring for nationwide online posts"
              className="h-full w-full select-none"
            >
              <defs>
                {/* Sonar sweep gradient */}
                <radialGradient id="radarSweepGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                  <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </radialGradient>

                {/* Sweep sector clip */}
                <linearGradient id="sweepLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Background dark radar disc */}
              <circle cx="200" cy="200" r="185" fill="#070D18" stroke="#1E293B" strokeWidth="2" />
              <circle cx="200" cy="200" r="180" fill="#0A1120" stroke="#0E3B68" strokeWidth="1.5" />

              {/* Concentric Sector Rings */}
              <circle cx="200" cy="200" r="145" fill="none" stroke="#1E3A8A" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="200" cy="200" r="105" fill="none" stroke="#0E7490" strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />
              <circle cx="200" cy="200" r="65" fill="none" stroke="#0284C7" strokeWidth="1.2" opacity="0.8" />
              <circle cx="200" cy="200" r="25" fill="#0369A1" fillOpacity="0.2" stroke="#38BDF8" strokeWidth="1.5" />

              {/* Crosshair Axes */}
              <line x1="200" y1="20" x2="200" y2="380" stroke="#1E3A8A" strokeWidth="1" opacity="0.4" />
              <line x1="20" y1="200" x2="380" y2="200" stroke="#1E3A8A" strokeWidth="1" opacity="0.4" />
              <line x1="72" y1="72" x2="328" y2="328" stroke="#1E3A8A" strokeWidth="0.8" strokeDasharray="2 4" opacity="0.3" />
              <line x1="72" y1="328" x2="328" y2="72" stroke="#1E3A8A" strokeWidth="0.8" strokeDasharray="2 4" opacity="0.3" />

              {/* Sector Labels */}
              <text x="205" y="52" fill="#94A3B8" fontSize="9" fontFamily="monospace">5 KM</text>
              <text x="205" y="94" fill="#94A3B8" fontSize="9" fontFamily="monospace">3 KM</text>
              <text x="205" y="134" fill="#7DD3FC" fontSize="9" fontFamily="monospace">1 KM</text>

              {/* Rotating Sonar Scanner Sweep */}
              <g className="origin-center motion-safe:animate-[spin_8s_linear_infinite]">
                <path
                  d="M 200 200 L 200 20 A 180 180 0 0 1 350 90 Z"
                  fill="url(#radarSweepGradient)"
                />
                <line
                  x1="200"
                  y1="200"
                  x2="200"
                  y2="20"
                  stroke="url(#sweepLineGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>

              {/* Teacher Center Blip (Base Anchor) */}
              <circle cx="200" cy="200" r="7" fill="#38BDF8" />
              <text x="200" y="222" fill="#E2E8F0" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                YOU
              </text>

              {/* Online requests use the outer ring; local requests use distance bands. */}
              {radarBlips.map(({ post, x, y, isApplied }) => {
                const isSelected = activePost?.id === post.id;
                const color = isSelected
                  ? "#34D399"
                  : isApplied
                    ? "#F59E0B"
                    : post.tuitionMode === "ONLINE"
                      ? "#A78BFA"
                      : "#60A5FA";
                const description =
                  post.tuitionMode === "ONLINE"
                    ? "Online nationwide"
                    : `${(post.distanceKm || 0).toFixed(1)} km away`;

                return (
                  <g
                    key={post.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${post.title}, ${description}`}
                    className="cursor-pointer outline-none"
                    onClick={() => setSelectedPostId(post.id)}
                    onFocus={() => setSelectedPostId(post.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedPostId(post.id);
                      }
                    }}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 11 : 8}
                      fill="#0B0F19"
                      stroke={color}
                      strokeWidth={isSelected ? 3 : 2}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 5 : 4}
                      fill={color}
                    />
                    <title>{post.title} — {description}</title>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Radar Legend */}
          <div className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-400" /> In person
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-400" /> Online nationwide
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Applied
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Selected
            </span>
          </div>
          {visiblePosts.length > MAX_RADAR_MARKERS && (
            <p className="mt-2 text-center text-[11px] leading-5 text-slate-500">
              Showing up to {MAX_RADAR_MARKERS} markers for speed. Browse the full list below.
            </p>
          )}
        </div>

        {/* Selected Tuition Details & Action Card (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          {activePost ? (
            <div className="relative space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)] sm:p-5">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                      <Sparkles className="h-3.5 w-3.5" />
                      Selected opportunity
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {activePost.tuitionMode === "ONLINE" ? (
                        <Globe2 className="h-3.5 w-3.5 text-violet-600" />
                      ) : (
                        <MapPin className="h-3.5 w-3.5 text-blue-600" />
                      )}
                      {activePost.tuitionMode === "ONLINE" ? "Nationwide online" : "Nearby"}
                    </span>
                  </div>
                  <h3 className="break-words text-lg font-bold tracking-tight text-slate-900">
                    {activePost.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-blue-800">{activePost.subject}</span>
                    <span className="mx-1.5 text-slate-400" aria-hidden="true">·</span>
                    {activePost.gradeLevel}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onBookmarkToggle(activePost.id)}
                  aria-label={activePost.isBookmarked ? "Remove bookmark" : "Bookmark tuition"}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                    activePost.isBookmarked
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${activePost.isBookmarked ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              {/* Salary & Details Pill Matrix */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                  <span className="block text-xs font-medium text-slate-500">Monthly budget</span>
                  <div className="mt-1 flex items-center gap-1 text-lg font-bold tracking-tight text-emerald-800">
                    <DollarSign className="w-4 h-4" />
                    <span>৳ {activePost.salaryBudget.toLocaleString()}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="block text-xs font-medium text-slate-500">Subject</span>
                  <div className="mt-1 text-sm font-semibold text-slate-900 line-clamp-2">
                    {activePost.subject}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="block text-xs font-medium text-slate-500">Curriculum</span>
                  <div className="mt-1 text-sm font-semibold text-slate-900 line-clamp-2">
                    {activePost.curriculum}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="block text-xs font-medium text-slate-500">Weekly schedule</span>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {activePost.daysPerWeek} days · {activePost.hoursPerDay} hrs/session
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="block text-xs font-medium text-slate-500">Tutor preference</span>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {activePost.genderPreference === "MALE_ONLY"
                      ? "Male tutor"
                      : activePost.genderPreference === "FEMALE_ONLY"
                        ? "Female tutor"
                        : "Any tutor"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                {activePost.tuitionMode === "ONLINE" ? (
                  <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" />
                ) : (
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-800">
                    {activePost.tuitionMode === "ONLINE"
                      ? "Open to verified tutors across Bangladesh"
                      : activePost.tuitionMode === "OFFLINE"
                        ? "In-person lessons"
                        : activePost.tuitionMode === "BOTH"
                          ? "Online or in-person lessons"
                          : "Lesson mode not specified"}
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-slate-600">
                    {activePost.tuitionMode === "ONLINE"
                      ? "No district or home address is attached to this request."
                      : `${activePost.areaName}, ${activePost.district}. Exact address is shared only after acceptance.`}
                  </p>
                </div>
              </div>

              {/* Requirement Note */}
              {activePost.specialRequirements && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="block text-xs font-semibold text-slate-700">Special requirements</span>
                  <p className="mt-1 text-sm leading-6 text-slate-600 line-clamp-3">{activePost.specialRequirements}</p>
                </div>
              )}

              {/* Action Button: Apply or Applied */}
              <div>
                {appliedPostIds.has(activePost.id) ? (
                  <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 py-3 text-xs font-semibold text-blue-800">
                    <CheckCircle className="h-4 w-4 text-blue-700" />
                    <span>Application Submitted (Under Review)</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onApply(activePost)}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                    <span>Apply for this tuition</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              <Compass className="mx-auto h-10 w-10 text-blue-600" />
              <h4 className="text-sm font-semibold text-slate-900">Select an opportunity</h4>
              <p className="mx-auto max-w-xs text-xs leading-5">
                Choose a marker or a request below to review its details and apply.
              </p>
            </div>
          )}

          {/* Opportunity list */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <Layers className="h-4 w-4 text-blue-700" />
                Opportunities ({visiblePosts.length})
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {Math.min(displayedPosts.length, visiblePosts.length)} shown
              </span>
            </div>

            <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
              {visiblePosts.length === 0 ? (
                <div className="p-6 text-center text-xs leading-5 text-slate-500">
                  No tuition requests match this subject. Try another subject or check the feed filters.
                </div>
              ) : (
                displayedPosts.map((post) => {
                  const isSelected = activePost?.id === post.id;
                  const isApplied = appliedPostIds.has(post.id);
                  const isOnline = post.tuitionMode === "ONLINE";

                  return (
                    <button
                      key={post.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedPostId(post.id)}
                      className={`flex min-h-16 w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors ${
                        isSelected
                          ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-100'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <span className="truncate text-sm font-semibold text-slate-900">{post.title}</span>
                          {isOnline && (
                            <span className="shrink-0 rounded-full border border-violet-100 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                              Nationwide online
                            </span>
                          )}
                          {isApplied && (
                            <span className="shrink-0 rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                              Applied
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                          <span className="font-medium text-blue-800">{post.subject}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">
                            {isOnline
                              ? "Open to tutors across Bangladesh"
                              : `${post.areaName}, ${post.district}`}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-sm font-bold text-emerald-800">
                          ৳ {post.salaryBudget.toLocaleString()}
                        </div>
                        <span className="text-xs text-slate-500">{post.gradeLevel}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            {displayedPosts.length < visiblePosts.length && (
              <button
                type="button"
                onClick={() =>
                  setVisibleListCount((count) =>
                    Math.min(count + INITIAL_LIST_LIMIT, visiblePosts.length),
                  )
                }
                className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50"
              >
                Show more opportunities
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
