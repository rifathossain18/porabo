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
  Eye,
  Calendar,
  Layers,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { TuitionPost } from '../lib/types';
import { DISTRICTS } from '../lib/mockData';

interface DistrictRadarViewProps {
  posts: TuitionPost[];
  appliedPostIds: string[];
  district: string;
  areaName: string;
  onApply: (post: TuitionPost) => void;
  onBookmarkToggle: (postId: string) => void;
  onDistrictChange?: (newDistrict: string) => void;
}

export const DistrictRadarView: React.FC<DistrictRadarViewProps> = ({
  posts,
  appliedPostIds,
  district,
  areaName,
  onApply,
  onBookmarkToggle,
  onDistrictChange,
}) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(() => {
    return posts.length > 0 ? posts[0].id : null;
  });
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);
  const [radarFilterSubject, setRadarFilterSubject] = useState<string>('ALL');

  // Filter posts if subject filter is selected
  const visiblePosts = useMemo(() => {
    if (radarFilterSubject === 'ALL') return posts;
    return posts.filter(p => p.subject.toLowerCase().includes(radarFilterSubject.toLowerCase()));
  }, [posts, radarFilterSubject]);

  // Selected post object
  const activePost = useMemo(() => {
    return posts.find(p => p.id === (hoveredPostId || selectedPostId)) || null;
  }, [posts, hoveredPostId, selectedPostId]);

  // Generate deterministic, pleasing geometric radar positions for imaginary dots
  // Each post in the district gets an angle (0 to 360) and radius (25% to 85% from center)
  const radarBlips = useMemo(() => {
    const total = visiblePosts.length;
    if (total === 0) return [];

    return visiblePosts.map((post, idx) => {
      // Create deterministic angle and radius from post ID and index
      let hash = 0;
      for (let i = 0; i < post.id.length; i++) {
        hash = (hash * 31 + post.id.charCodeAt(i)) & 0xffffffff;
      }
      const absHash = Math.abs(hash);

      // Distribute evenly around the circle with jitter
      const baseAngle = (idx * (360 / total) + (absHash % 30)) % 360;
      const angleRad = (baseAngle * Math.PI) / 180;

      // Distance from center: between 28% and 82% of radar radius
      const radiusPercent = 28 + ((absHash >> 3) % 52);

      // SVG coordinates (radar center is at 200, 200 with radius 170)
      const maxR = 160;
      const r = (radiusPercent / 100) * maxR;
      const x = 200 + r * Math.cos(angleRad);
      const y = 200 + r * Math.sin(angleRad);

      const isApplied = appliedPostIds.includes(post.id);

      return {
        post,
        x,
        y,
        angleDeg: baseAngle,
        radiusPercent,
        isApplied
      };
    });
  }, [visiblePosts, appliedPostIds]);

  // Distinct subjects in this district's posts for quick filter
  const subjects = useMemo(() => {
    const set = new Set<string>();
    posts.forEach(p => {
      if (p.subject) set.add(p.subject.split(',')[0].trim());
    });
    return Array.from(set).slice(0, 5);
  }, [posts]);

  return (
    <div className="space-y-4">
      {/* Top Banner: District Tuition Radar Status */}
      <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-400 text-xs font-mono mb-2 border border-cyan-800/60">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>District Tuition Radar &bull; {district} District Sonar</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>{district} District Tuition Radar</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60">
                {visiblePosts.length} Live Blips
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Active tuition posts in your selected district (<span className="text-cyan-400 font-semibold">{district}</span>) are tracked on this radar as blips. Click any blip to inspect tuition details and apply directly.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
            <div className="bg-[#0B0F19] border border-cyan-500/30 px-3.5 py-2 rounded-2xl flex items-center gap-2.5 shadow-sm">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Scanning District</span>
                <span className="text-xs sm:text-sm font-bold text-cyan-300 font-mono">
                  {district}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Subject Chips */}
        {subjects.length > 0 && (
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mr-1 shrink-0">
              <Filter className="w-3 h-3 text-cyan-400" /> Filter:
            </span>
            <button
              type="button"
              onClick={() => setRadarFilterSubject('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                radarFilterSubject === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'bg-[#0B0F19] text-slate-400 hover:text-white border border-blue-950'
              }`}
            >
              All Subjects ({posts.length})
            </button>
            {subjects.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setRadarFilterSubject(s)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  radarFilterSubject === s
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'bg-[#0B0F19] text-slate-400 hover:text-white border border-blue-950'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Radar Screen & Interactive Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Radar Screen (7 cols) */}
        <div className="lg:col-span-7 bg-[#0B0F19] border border-blue-900/50 rounded-3xl p-4 sm:p-6 shadow-2xl relative flex flex-col items-center justify-center overflow-hidden">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Top radar metrics */}
          <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 mb-2 relative z-10 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">Sonar Scanning Active</span>
            </div>
            <div className="text-[11px] text-cyan-400 font-mono">
              District: {district.toUpperCase()}
            </div>
          </div>

          {/* SVG Radar Canvas */}
          <div className="relative w-full max-w-[310px] sm:max-w-[420px] aspect-square flex items-center justify-center my-2 mx-auto">
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 0 25px rgba(6, 182, 212, 0.15))' }}
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
              <text x="205" y="60" fill="#64748B" fontSize="9" fontFamily="monospace">OUTER ZONE</text>
              <text x="205" y="100" fill="#64748B" fontSize="9" fontFamily="monospace">MID SECTOR</text>
              <text x="205" y="140" fill="#06B6D4" fontSize="9" fontFamily="monospace">INNER ZONE</text>

              {/* Rotating Sonar Scanner Sweep */}
              <g className="origin-center animate-[spin_5s_linear_infinite]" style={{ transformOrigin: '200px 200px' }}>
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
              <circle cx="200" cy="200" r="14" fill="none" stroke="#38BDF8" strokeWidth="1.5" className="animate-ping opacity-60" style={{ transformOrigin: '200px 200px' }} />
              <text x="200" y="222" fill="#E2E8F0" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                YOU ({district})
              </text>

              {/* Imaginary Radar Dots (Kalponik Blips for District Tuitions) */}
              {radarBlips.map(({ post, x, y, isApplied }) => {
                const isSelected = selectedPostId === post.id;
                const isHovered = hoveredPostId === post.id;
                const color = isApplied ? '#A855F7' : isSelected ? '#10B981' : '#38BDF8';

                return (
                  <g
                    key={post.id}
                    className="cursor-pointer transition-transform duration-200"
                    onClick={() => setSelectedPostId(post.id)}
                    onMouseEnter={() => setHoveredPostId(post.id)}
                    onMouseLeave={() => setHoveredPostId(null)}
                  >
                    {/* Pulsing Ripple */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected || isHovered ? 16 : 10}
                      fill={color}
                      fillOpacity={0.25}
                      className="animate-ping"
                      style={{ transformOrigin: `${x}px ${y}px`, animationDuration: '2.5s' }}
                    />

                    {/* Outer Ring */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected || isHovered ? 10 : 7}
                      fill="#0B0F19"
                      stroke={color}
                      strokeWidth={isSelected || isHovered ? 2.5 : 1.8}
                    />

                    {/* Core Glowing Dot */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected || isHovered ? 5.5 : 3.5}
                      fill={color}
                    />

                    {/* Mini Label */}
                    <text
                      x={x}
                      y={y - 12}
                      fill={isSelected || isHovered ? '#FFFFFF' : '#94A3B8'}
                      fontSize="9"
                      fontWeight={isSelected || isHovered ? 'bold' : 'normal'}
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      ৳{post.salaryBudget >= 1000 ? `${Math.round(post.salaryBudget / 1000)}k` : post.salaryBudget}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Radar Legend */}
          <div className="w-full flex items-center justify-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" /> Available Tuition
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" /> Already Applied
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" /> Selected
            </span>
          </div>
        </div>

        {/* Selected Tuition Details & Action Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {activePost ? (
            <div className="bg-[#111827] border border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Radar Target Acquired</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      ID: {activePost.id.substring(0, 8)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {activePost.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{activePost.areaName}, <strong className="text-white">{activePost.district}</strong></span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onBookmarkToggle(activePost.id)}
                  className={`p-2 rounded-xl border transition-colors ${
                    activePost.isBookmarked
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-[#0B0F19] text-slate-400 hover:text-white border-blue-950'
                  }`}
                  title="Bookmark post"
                >
                  <Heart className={`w-4 h-4 ${activePost.isBookmarked ? 'fill-rose-400' : ''}`} />
                </button>
              </div>

              {/* Salary & Details Pill Matrix */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#0B0F19] border border-blue-950/80">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Monthly Budget</span>
                  <div className="text-base font-extrabold text-emerald-400 flex items-center gap-1 mt-0.5">
                    <DollarSign className="w-4 h-4" />
                    <span>৳ {activePost.salaryBudget.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#0B0F19] border border-blue-950/80">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Grade / Class</span>
                  <div className="text-xs font-bold text-white mt-1 truncate">
                    {activePost.gradeLevel}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#0B0F19] border border-blue-950/80">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Subject Focus</span>
                  <div className="text-xs font-bold text-cyan-300 mt-1 truncate">
                    {activePost.subject}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#0B0F19] border border-blue-950/80">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Schedule</span>
                  <div className="text-xs font-bold text-white mt-1 truncate">
                    {activePost.daysPerWeek || 3} Days/Week
                  </div>
                </div>
              </div>

              {/* Requirement Note */}
              {activePost.specialRequirements && (
                <div className="p-3 rounded-2xl bg-[#0B0F19]/80 border border-slate-800 text-xs text-slate-300">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Guardian Requirement</span>
                  <p className="line-clamp-3 text-slate-300 leading-relaxed">{activePost.specialRequirements}</p>
                </div>
              )}

              {/* Action Button: Apply or Applied */}
              <div>
                {appliedPostIds.includes(activePost.id) ? (
                  <div className="w-full py-3 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-300 font-semibold text-xs flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                    <span>Application Submitted (Under Review)</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onApply(activePost)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Apply for this Tuition Now</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-8 text-center text-slate-500 space-y-3">
              <Compass className="w-10 h-10 mx-auto text-slate-600 animate-spin" style={{ animationDuration: '10s' }} />
              <h4 className="text-sm font-semibold text-white">No Target Selected</h4>
              <p className="text-xs max-w-xs mx-auto">
                Click any blip or dot on the radar, or select a tuition post from the list below.
              </p>
            </div>
          )}

          {/* District Tuition Quick List */}
          <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>{district} Tuitions on Radar ({visiblePosts.length})</span>
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-900 pr-1">
              {visiblePosts.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No active tuition posts currently found in your registered district ({district}). New posts will appear on the radar in real time.
                </div>
              ) : (
                visiblePosts.map(post => {
                  const isSelected = selectedPostId === post.id;
                  const isApplied = appliedPostIds.includes(post.id);

                  return (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPostId(post.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-950/60 border-cyan-500/60 ring-1 ring-cyan-500/40'
                          : 'bg-[#0B0F19] border-blue-950/80 hover:border-blue-800'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">{post.title}</span>
                          {isApplied && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-400 border border-purple-800">
                              Applied
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{post.subject}</span>
                          <span>&bull;</span>
                          <span className="text-cyan-400">{post.areaName}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-extrabold text-emerald-400">
                          ৳ {post.salaryBudget.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-500">{post.gradeLevel}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
