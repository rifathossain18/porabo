import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  Zap,
  MapPin,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Lock,
  UserCheck,
  Globe,
  Crown,
  ChevronLeft,
  ChevronDown,
  Star,
  Wallet,
  Search,
  Clock,
  BookOpen,
  Phone,
} from 'lucide-react';
import { UserRole } from '../lib/types';

interface LandingPageProps {
  onProceedToAuth: (role: UserRole, mode: 'login' | 'register') => void;
}

// ═══════════════════════════════════════════════════════════════════
// Types + themes
// ═══════════════════════════════════════════════════════════════════
type Variant = 'blue' | 'green';

interface Theme {
  text: string;
  soft: string;
  border: string;
  cardBorder: string;
  gradient: string;
  gradientText: string;
  shadow: string;
  ring: string;
  dot: string;
  rgb: string;
  glow1: string;
  glow2: string;
  line: string;
}

const THEMES: Record<Variant, Theme> = {
  blue: {
    text: 'text-blue-400',
    soft: 'bg-blue-950/60',
    border: 'border-blue-800/50',
    cardBorder: 'border-blue-900/40 hover:border-blue-500/60',
    gradient: 'from-blue-600 to-cyan-500',
    gradientText: 'from-blue-400 via-cyan-400 to-emerald-400',
    shadow: 'shadow-blue-500/30',
    ring: 'focus-visible:ring-blue-400',
    dot: 'bg-blue-400',
    rgb: '59,130,246',
    glow1: 'rgba(59,130,246,0.2)',
    glow2: 'rgba(6,182,212,0.14)',
    line: 'rgba(59,130,246,0.6)',
  },
  green: {
    text: 'text-emerald-400',
    soft: 'bg-emerald-950/60',
    border: 'border-emerald-800/50',
    cardBorder: 'border-emerald-900/40 hover:border-emerald-500/60',
    gradient: 'from-emerald-600 to-teal-500',
    gradientText: 'from-emerald-400 via-teal-400 to-cyan-400',
    shadow: 'shadow-emerald-500/30',
    ring: 'focus-visible:ring-emerald-400',
    dot: 'bg-emerald-400',
    rgb: '16,185,129',
    glow1: 'rgba(16,185,129,0.18)',
    glow2: 'rgba(6,182,212,0.12)',
    line: 'rgba(16,185,129,0.6)',
  },
};

// ═══════════════════════════════════════════════════════════════════
// CSS-only motion (no JS timers, nothing blocks first paint)
// ═══════════════════════════════════════════════════════════════════
const PORABO_CSS = `
.pb-rise{animation:pbRise .6s cubic-bezier(.2,.7,.2,1) both}
@keyframes pbRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.pb-sweep{animation:pbSweep 6s linear infinite}
@keyframes pbSweep{to{transform:rotate(360deg)}}
.pb-ping{animation:pbPing 2.4s cubic-bezier(0,0,.2,1) infinite}
@keyframes pbPing{0%{transform:scale(1);opacity:.7}80%,100%{transform:scale(2.6);opacity:0}}
details > summary{list-style:none}
details > summary::-webkit-details-marker{display:none}
@media (prefers-reduced-motion:reduce){.pb-rise,.pb-sweep,.pb-ping{animation:none}}
`;

const FONT_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Bengali", "Helvetica Neue", Arial, sans-serif';

// ═══════════════════════════════════════════════════════════════════
// Shared pieces
// ═══════════════════════════════════════════════════════════════════
const PremiumBackground: React.FC<{ variant: Variant | 'mixed' }> = ({
  variant,
}) => {
  const glow1 =
    variant === 'green' ? THEMES.green.glow1 : THEMES.blue.glow1;
  const glow2 =
    variant === 'mixed' ? 'rgba(16,185,129,0.14)' : THEMES[variant].glow2;
  const line =
    variant === 'green' ? THEMES.green.line : THEMES.blue.line;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ transform: 'translateZ(0)' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 20% 10%, #0B1428 0%, #070A12 40%, #050810 100%)',
        }}
      />
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${glow1} 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${glow2} 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.12) 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${line}, transparent)`,
        }}
      />
    </div>
  );
};

const Logo: React.FC<{ sub: string; subClass: string; small?: boolean }> = ({
  sub,
  subClass,
  small,
}) => (
  <div className="flex items-center gap-3">
    <img
      src="/assets/porabo_logo_transparent_90065b0b.svg"
      alt="Porabo"
      width={40}
      height={40}
      decoding="async"
      className={`${small ? 'w-9 h-9' : 'w-10 h-10'} object-contain`}
    />
    <div>
      <div
        className={`font-extrabold tracking-tight text-white ${
          small ? 'text-lg' : 'text-xl'
        }`}
      >
        Porabo
      </div>
      <div className={`text-[10px] font-mono tracking-widest ${subClass}`}>
        {sub}
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// Neighborhood radar — the signature visual (pure CSS/SVG-free)
// ═══════════════════════════════════════════════════════════════════
interface Pin {
  x: number;
  y: number;
  label: string;
  delay: string;
}

const Radar: React.FC<{ variant: Variant; pins: Pin[] }> = ({
  variant,
  pins,
}) => {
  const t = THEMES[variant];
  const rings = [
    { size: 100, label: '5 km', top: '1%' },
    { size: 66, label: '3 km', top: '17.5%' },
    { size: 33, label: '1 km', top: '34%' },
  ];

  return (
    <div
      className="relative w-full max-w-[420px] mx-auto aspect-square"
      role="img"
      aria-label="Map showing verified people within 1 to 5 kilometres"
    >
      {rings.map((r) => (
        <React.Fragment key={r.label}>
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-700/60"
            style={{
              width: `${r.size}%`,
              height: `${r.size}%`,
              background:
                r.size === 33
                  ? `radial-gradient(circle, rgba(${t.rgb},0.10) 0%, transparent 100%)`
                  : undefined,
            }}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-500 px-1 bg-[#070A12]"
            style={{ top: r.top }}
          >
            {r.label}
          </div>
        </React.Fragment>
      ))}

      {/* Crosshair */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800/70" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-800/70" />

      {/* Sweep */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div
          className="absolute inset-0 pb-sweep"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, transparent 280deg, rgba(${t.rgb},0.28) 360deg)`,
          }}
        />
      </div>

      {/* Home */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="relative flex h-3.5 w-3.5">
          <span
            className={`pb-ping absolute inline-flex h-full w-full rounded-full ${t.dot}`}
          />
          <span
            className={`relative inline-flex h-3.5 w-3.5 rounded-full ${t.dot} border-2 border-[#070A12]`}
          />
        </span>
      </div>

      {/* Pins */}
      {pins.map((p) => (
        <div
          key={p.label}
          className="absolute flex items-center -translate-y-1/2"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span
              className="pb-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400"
              style={{ animationDelay: p.delay }}
            />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <span
            className={`ml-1.5 whitespace-nowrap rounded-full border ${t.border} bg-[#0B0F19]/90 px-2 py-0.5 text-[10px] text-slate-200`}
          >
            {p.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Hero cards (decorative product previews)
// ═══════════════════════════════════════════════════════════════════
const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div
    className={`rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0F1626] to-[#0B0F19] p-4 sm:p-5 shadow-2xl shadow-black/40 ${className}`}
  >
    {children}
  </div>
);

const EarningsCard: React.FC = () => (
  <GlassCard>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2 text-xs text-slate-300">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-950/80 border border-blue-800/50">
          <Search className="w-3.5 h-3.5 text-blue-400" />
        </span>
        New tuition request nearby
      </div>
      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 rounded-full px-2 py-0.5">
        0.8 km
      </span>
    </div>
    <div className="text-sm font-bold text-white">
      Class 9 · Physics · 3 days a week
    </div>
    <div className="text-[11px] text-slate-400 mt-0.5">
      Mirpur 10 · Evening batch · Verified guardian
    </div>

    <div className="mt-4 space-y-2 text-xs">
      <div className="flex justify-between text-slate-400">
        <span>Monthly fee</span>
        <span className="text-slate-200 font-mono">৳ 5,000</span>
      </div>
      <div className="flex justify-between text-slate-400">
        <span>Porabo commission</span>
        <span className="text-slate-200 font-mono">৳ 0</span>
      </div>
      <div className="h-px bg-slate-800" />
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
          <Wallet className="w-3.5 h-3.5 text-blue-400" />
          You keep
        </span>
        <span className="font-mono font-bold text-base text-white">
          ৳ 5,000
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
      </div>
      <div className="text-[10px] text-slate-500 font-mono text-right">
        100% of your earnings
      </div>
    </div>
  </GlassCard>
);

const MatchCard: React.FC = () => (
  <GlassCard>
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-sm font-extrabold text-white">
        NJ
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-sm font-bold text-white">
          Nusrat Jahan
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-[11px] text-slate-400 truncate">
          BUET · Mathematics &amp; Physics
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center justify-end gap-1 text-xs font-bold text-white">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          4.9
        </div>
        <div className="text-[10px] font-mono text-emerald-400">0.9 km</div>
      </div>
    </div>

    <div className="mt-3 flex flex-wrap gap-1.5">
      {['NID verified', 'Student ID', 'Institution'].map((b) => (
        <span
          key={b}
          className="inline-flex items-center gap-1 rounded-full border border-emerald-800/50 bg-emerald-950/60 px-2 py-0.5 text-[10px] text-emerald-300"
        >
          <CheckCircle className="w-3 h-3" />
          {b}
        </span>
      ))}
    </div>

    <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-[#070A12] px-3 py-2.5">
      <span className="flex items-center gap-2 text-xs text-slate-400">
        <Phone className="w-3.5 h-3.5" />
        <span className="font-mono tracking-wider">01•• ••• ••••</span>
      </span>
      <span className="flex items-center gap-1 text-[10px] text-slate-500">
        <Lock className="w-3 h-3" />
        Unlocks on accept
      </span>
    </div>
  </GlassCard>
);

// ═══════════════════════════════════════════════════════════════════
// Privacy shield: before / after
// ═══════════════════════════════════════════════════════════════════
const PrivacyPanel: React.FC<{
  variant: Variant;
  title: string;
  body: string;
  beforeLabel: string;
  afterLabel: string;
}> = ({ variant, title, body, beforeLabel, afterLabel }) => {
  const t = THEMES[variant];
  return (
    <section className="mb-16 sm:mb-24 grid gap-8 lg:grid-cols-2 lg:items-center">
      <div>
        <div
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${t.soft} border ${t.border} mb-4`}
        >
          <Lock className={`w-5 h-5 ${t.text}`} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-md">
          {body}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <GlassCard>
          <div className="text-[11px] text-slate-400 mb-3 flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            {beforeLabel}
          </div>
          <div className="space-y-2 text-xs">
            <div className="rounded-lg bg-[#070A12] border border-slate-800 px-2.5 py-2 font-mono text-slate-500 tracking-wider">
              01•• ••• ••••
            </div>
            <div className="rounded-lg bg-[#070A12] border border-slate-800 px-2.5 py-2 text-slate-500">
              Address hidden
            </div>
          </div>
        </GlassCard>
        <GlassCard className={`border-2 ${t.border}`}>
          <div className={`text-[11px] mb-3 flex items-center gap-1.5 ${t.text}`}>
            <CheckCircle className="w-3 h-3" />
            {afterLabel}
          </div>
          <div className="space-y-2 text-xs">
            <div className="rounded-lg bg-[#070A12] border border-slate-800 px-2.5 py-2 font-mono text-white tracking-wider">
              01700-000000
            </div>
            <div className="rounded-lg bg-[#070A12] border border-slate-800 px-2.5 py-2 text-slate-200">
              Full address shared
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCREEN 1: ROLE SELECTOR
// ═══════════════════════════════════════════════════════════════════
const RoleSelector: React.FC<{ onSelect: (role: UserRole) => void }> = ({
  onSelect,
}) => {
  const roles: Array<{
    role: UserRole;
    variant: Variant;
    icon: React.ElementType;
    label: string;
    title: string;
    desc: string;
    points: string[];
    cta: string;
    cardClass: string;
    iconClass: string;
    glowClass: string;
    ctaClass: string;
    ringClass: string;
  }> = [
    {
      role: 'TUTOR' as UserRole,
      variant: 'blue',
      icon: GraduationCap,
      label: 'I am a',
      title: 'Teacher / Tutor',
      desc: 'Teach students in your neighborhood. Keep 100% of what you earn, with zero commission and zero ads fee.',
      points: [
        'See tuition requests within walking distance',
        'Your phone stays hidden until a student accepts',
        'No monthly fee, ever',
      ],
      cta: 'Continue as Teacher',
      cardClass:
        'from-[#0B1428] via-[#111827] to-[#0B0F19] border-blue-900/60 shadow-blue-900/20 hover:border-blue-500/80 hover:shadow-blue-500/25',
      iconClass: 'from-blue-600 to-cyan-500 shadow-blue-500/30',
      glowClass: 'bg-blue-500/10 group-hover:bg-blue-500/20',
      ctaClass: 'text-blue-400',
      ringClass: 'focus-visible:ring-blue-400',
    },
    {
      role: 'STUDENT' as UserRole,
      variant: 'green',
      icon: Users,
      label: 'I am a',
      title: 'Student / Guardian',
      desc: 'Find verified tutors within 1-5 km of your home. Post your tuition need, review applicants, accept the best match.',
      points: [
        'Every tutor is NID and institution verified',
        'Your phone and address stay private',
        '100% free for guardians',
      ],
      cta: 'Continue as Guardian',
      cardClass:
        'from-[#0B2818] via-[#111827] to-[#0B0F19] border-emerald-900/60 shadow-emerald-900/20 hover:border-emerald-500/80 hover:shadow-emerald-500/25',
      iconClass: 'from-emerald-600 to-teal-500 shadow-emerald-500/30',
      glowClass: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
      ctaClass: 'text-emerald-400',
      ringClass: 'focus-visible:ring-emerald-400',
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#070A12] text-white relative overflow-hidden"
      style={{ fontFamily: FONT_STACK }}
    >
      <style>{PORABO_CSS}</style>
      <PremiumBackground variant="mixed" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col min-h-screen">
        <header className="flex items-center justify-between mb-10 sm:mb-14 pb-rise">
          <Logo sub="Tuition Network" subClass="text-blue-400" />
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-[#0B0F19]/80 px-3 py-1.5 rounded-full border border-blue-900/50">
            <span className="relative flex h-1.5 w-1.5">
              <span className="pb-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span>Live in 64 Districts</span>
          </div>
        </header>

        <div
          className="text-center mb-10 sm:mb-14 pb-rise"
          style={{ animationDelay: '60ms' }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/60 text-blue-300 text-[11px] font-mono border border-blue-800/50 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bangladesh's #1 Hyperlocal Tuition Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] mb-4">
            <span className="text-white">Welcome to </span>
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Porabo
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed px-2">
            Bangladesh's largest tuition marketplace. Connect with verified
            tutors and students in your neighborhood. No commission, no ads
            fee, 100% free.
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-14 pb-rise"
          style={{ animationDelay: '120ms' }}
        >
          {roles.map((r) => (
            <button
              key={r.title}
              type="button"
              onClick={() => onSelect(r.role)}
              className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${r.cardClass} border-2 text-left shadow-2xl p-6 sm:p-8 transition-all duration-300 md:hover:-translate-y-1 active:scale-[0.99] focus:outline-none focus-visible:ring-2 ${r.ringClass}`}
            >
              <div
                className={`absolute -top-10 -right-10 w-48 h-48 rounded-full transition-colors duration-500 ${r.glowClass}`}
              />
              <div className="relative z-10">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${r.iconClass} flex items-center justify-center shadow-lg mb-5`}
                >
                  <r.icon className="w-7 h-7 text-white" />
                </div>
                <div className={`text-[11px] font-mono mb-1.5 ${r.ctaClass}`}>
                  {r.label}
                </div>
                <h2 className="text-2xl font-extrabold text-white mb-2">
                  {r.title}
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                  {r.desc}
                </p>
                <ul className="space-y-2 mb-6">
                  {r.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2 text-xs text-slate-300"
                    >
                      <CheckCircle
                        className={`w-4 h-4 shrink-0 mt-px ${r.ctaClass}`}
                      />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <div
                  className={`flex items-center gap-2 text-sm font-semibold ${r.ctaClass}`}
                >
                  <span>{r.cta}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-3 gap-3 sm:gap-4 max-w-3xl w-full mx-auto mb-8 pb-rise"
          style={{ animationDelay: '180ms' }}
        >
          {[
            { num: '50K+', label: 'Verified Tutors', icon: Crown },
            { num: '200K+', label: 'Active Students', icon: Users },
            { num: '64', label: 'Districts', icon: MapPin },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center p-3 sm:p-4 rounded-2xl bg-[#0B0F19] border border-slate-800"
            >
              <s.icon className="w-4 h-4 text-blue-400 mx-auto mb-1.5" />
              <div className="text-xl sm:text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {s.num}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-slate-400 mt-auto pb-2 pb-rise"
          style={{ animationDelay: '240ms' }}
        >
          {[
            { icon: CheckCircle, text: 'Zero Commission' },
            { icon: Zap, text: 'No Ads Fee' },
            { icon: ShieldCheck, text: '100% Verified' },
            { icon: MapPin, text: '64 Districts' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2">
              <item.icon className="w-4 h-4 text-emerald-400" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SCREEN 2: ROLE LANDING (Teacher + Guardian share one engine)
// ═══════════════════════════════════════════════════════════════════
interface LandingConfig {
  variant: Variant;
  eyebrow: string;
  badge: string;
  headlineTop: string;
  headlineBottom: string;
  sub: string;
  registerLabel: string;
  note: string;
  proof: string;
  bottomCta: string;
  features: Array<{ icon: React.ElementType; title: string; desc: string }>;
  steps: Array<{ icon: React.ElementType; title: string; desc: string }>;
  stepsTitle: string;
  privacyTitle: string;
  privacyBody: string;
  beforeLabel: string;
  afterLabel: string;
  pins: Pin[];
  faqs: Array<{ q: string; a: string }>;
}

const TEACHER_CONFIG: LandingConfig = {
  variant: 'blue',
  eyebrow: 'For Teachers',
  badge: "Bangladesh's Largest Teacher Network",
  headlineTop: 'Teach Your Way.',
  headlineBottom: 'Keep 100% of Your Earnings.',
  sub: "Join Bangladesh's biggest tuition marketplace. Verified students, hyperlocal matching, and zero commission, so every taka you earn stays with you.",
  registerLabel: 'Create Teacher Account',
  note: 'No credit card required • Free forever',
  proof: 'Trusted by tutors across Bangladesh',
  bottomCta: 'Get Started Free',
  features: [
    {
      icon: Zap,
      title: 'Zero Commission',
      desc: 'Keep every taka you earn. No hidden cuts, no monthly fee, no ads fee.',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Students',
      desc: 'Every guardian is audited. Only serious tuition requests reach you.',
    },
    {
      icon: MapPin,
      title: 'Hyperlocal Matching',
      desc: 'Students within walking distance. No more cross-city commutes.',
    },
    {
      icon: Clock,
      title: 'Your Schedule',
      desc: 'Choose your subjects, areas and hours. Say yes only to what fits.',
    },
  ],
  stepsTitle: 'From sign-up to first class in three steps',
  steps: [
    {
      icon: UserCheck,
      title: 'Create your profile',
      desc: 'Add subjects, preferred areas and your credentials. Get verified with NID and institution details.',
    },
    {
      icon: Search,
      title: 'Find requests near you',
      desc: 'Browse tuition needs inside your radius and apply to the ones you like.',
    },
    {
      icon: BookOpen,
      title: 'Start teaching',
      desc: 'When a guardian accepts you, contact details unlock and you agree on the rest directly.',
    },
  ],
  privacyTitle: 'Your phone and address stay yours until you are accepted.',
  privacyBody:
    'Guardians only see your verified profile at first. Your contact details unlock after a student accepts you, never before.',
  beforeLabel: 'Before acceptance',
  afterLabel: 'After acceptance',
  pins: [
    { x: 58, y: 24, label: 'Class 9 · Physics', delay: '0s' },
    { x: 18, y: 40, label: 'Class 6 · Math', delay: '0.6s' },
    { x: 62, y: 66, label: 'HSC · Chemistry', delay: '1.2s' },
    { x: 22, y: 78, label: 'Class 8 · English', delay: '1.8s' },
  ],
  faqs: [
    {
      q: 'Is Porabo really free for teachers?',
      a: 'Yes. There is no commission, no monthly fee and no ads fee. You keep everything you earn from your students.',
    },
    {
      q: 'Who sees my phone number and address?',
      a: 'Nobody at first. Your contact details unlock only after a student accepts you.',
    },
    {
      q: 'How do I get matched with students?',
      a: 'Requests are matched by distance, so you see students close to where you live or work.',
    },
    {
      q: 'Are the guardians verified?',
      a: 'Guardians are audited, so the tuition requests you see come from serious families.',
    },
  ],
};

const GUARDIAN_CONFIG: LandingConfig = {
  variant: 'green',
  eyebrow: 'For Guardians',
  badge: "Bangladesh's #1 Tuition Marketplace",
  headlineTop: 'Find Verified Tutors',
  headlineBottom: 'in Your Neighborhood.',
  sub: "The largest hyperlocal tuition platform in Bangladesh. Find verified teachers within walking distance, review their credentials, and unlock contact only when you're ready to hire.",
  registerLabel: 'Create Free Account',
  note: '100% free • No hidden fees • Ever',
  proof: 'Trusted by 200,000+ families across Bangladesh',
  bottomCta: 'Find My Tutor Free',
  features: [
    {
      icon: CheckCircle,
      title: '100% Free',
      desc: 'No platform fee, no commission, no subscription. Forever free for guardians.',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Teachers',
      desc: 'Every tutor is audited with NID, student ID, and institutional verification.',
    },
    {
      icon: MapPin,
      title: '1km to 5km Radius',
      desc: 'Find tutors walking distance from your home. No more cross-city commutes.',
    },
    {
      icon: Star,
      title: 'Compare Before You Pick',
      desc: 'Review subjects, credentials and distance for every applicant side by side.',
    },
  ],
  stepsTitle: 'Find the right tutor in three steps',
  steps: [
    {
      icon: BookOpen,
      title: 'Post your tuition need',
      desc: 'Tell us the class, subject, budget and location. It takes about a minute.',
    },
    {
      icon: Users,
      title: 'Review applicants',
      desc: 'Verified tutors near you apply. Compare their credentials, ratings and distance.',
    },
    {
      icon: UserCheck,
      title: 'Accept the best match',
      desc: 'Accept one tutor and their contact details unlock. Everyone else never sees yours.',
    },
  ],
  privacyTitle: 'Your phone and address stay private until you say yes.',
  privacyBody:
    'Tutors see your tuition need, not your contact details. Your phone and address unlock only for the tutor you accept.',
  beforeLabel: 'Before you accept',
  afterLabel: 'After you accept',
  pins: [
    { x: 58, y: 24, label: 'Math · 0.8 km', delay: '0s' },
    { x: 16, y: 40, label: 'English · 2.1 km', delay: '0.6s' },
    { x: 60, y: 66, label: 'Physics · 1.4 km', delay: '1.2s' },
    { x: 20, y: 78, label: 'Chemistry · 3.6 km', delay: '1.8s' },
  ],
  faqs: [
    {
      q: 'Is it free for guardians?',
      a: 'Yes. There is no platform fee, no commission and no subscription for guardians.',
    },
    {
      q: 'How are tutors verified?',
      a: 'Every tutor is audited with NID, student ID and institutional verification before appearing in search.',
    },
    {
      q: 'Who can see my phone number?',
      a: 'Only the tutor you accept. Your phone and address stay hidden from everyone else.',
    },
    {
      q: 'Can I choose how far the tutor lives?',
      a: 'Yes. Search within 1 km to 5 km of your home and pick someone within walking distance.',
    },
  ],
};

const RoleLanding: React.FC<{
  config: LandingConfig;
  onSignIn: () => void;
  onRegister: () => void;
  onBack: () => void;
}> = ({ config, onSignIn, onRegister, onBack }) => {
  const t = THEMES[config.variant];
  const isBlue = config.variant === 'blue';

  return (
    <div
      className="min-h-screen bg-[#070A12] text-white relative overflow-hidden"
      style={{ fontFamily: FONT_STACK }}
    >
      <style>{PORABO_CSS}</style>
      <PremiumBackground variant={config.variant} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28 sm:pb-16">
        {/* Header */}
        <header className="flex items-center justify-between mb-10 sm:mb-14 pb-rise">
          <Logo sub={config.eyebrow} subClass={t.text} small />
          <button
            type="button"
            onClick={onBack}
            className={`text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors focus:outline-none focus-visible:ring-2 ${t.ring}`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Change role</span>
          </button>
        </header>

        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-center mb-16 sm:mb-24">
          <div>
            <div
              className={`pb-rise inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${t.soft} ${t.text} text-[11px] font-mono border ${t.border} mb-5`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{config.badge}</span>
            </div>

            <h1
              className="pb-rise text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mb-5"
              style={{ animationDelay: '60ms' }}
            >
              <span className="text-white">{config.headlineTop}</span>
              <br />
              <span
                className={`bg-gradient-to-r ${t.gradientText} bg-clip-text text-transparent`}
              >
                {config.headlineBottom}
              </span>
            </h1>

            <p
              className="pb-rise text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed mb-7"
              style={{ animationDelay: '120ms' }}
            >
              {config.sub}
            </p>

            <div
              className="pb-rise flex flex-col sm:flex-row gap-3"
              style={{ animationDelay: '180ms' }}
            >
              <button
                type="button"
                onClick={onRegister}
                className={`w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r ${t.gradient} text-white font-bold rounded-xl text-sm shadow-2xl ${t.shadow} transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 ${t.ring}`}
              >
                <UserCheck className="w-4 h-4" />
                <span>{config.registerLabel}</span>
              </button>
              <button
                type="button"
                onClick={onSignIn}
                className={`w-full sm:w-auto px-8 py-3.5 bg-[#0B0F19] hover:bg-[#111827] text-white font-semibold rounded-xl text-sm border ${t.border} transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 ${t.ring}`}
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div
              className="pb-rise mt-4 text-[11px] text-slate-500 font-mono"
              style={{ animationDelay: '220ms' }}
            >
              {config.note}
            </div>
          </div>

          <div
            className="pb-rise space-y-4"
            style={{ animationDelay: '140ms' }}
          >
            <Radar variant={config.variant} pins={config.pins} />
            <div className="max-w-[420px] mx-auto" aria-hidden="true">
              {isBlue ? <EarningsCard /> : <MatchCard />}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16 sm:mb-24">
          {config.features.map((f) => (
            <div
              key={f.title}
              className={`p-5 rounded-2xl bg-[#0B0F19] border ${t.cardBorder} transition-all duration-300 hover:-translate-y-1`}
            >
              <div
                className={`w-10 h-10 rounded-xl ${t.soft} border ${t.border} flex items-center justify-center mb-3`}
              >
                <f.icon className={`w-5 h-5 ${t.text}`} />
              </div>
              <h3 className="font-bold text-sm text-white mb-1.5">
                {f.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </section>

        {/* How it works (a real sequence, so numbered) */}
        <section className="mb-16 sm:mb-24">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-8 max-w-lg">
            {config.stepsTitle}
          </h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {config.steps.map((s, i) => (
              <li
                key={s.title}
                className="relative p-6 rounded-2xl bg-gradient-to-br from-[#0F1626] to-[#0B0F19] border border-slate-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-lg ${t.shadow}`}
                  >
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-3xl font-black text-slate-800 font-mono">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-white mb-1.5">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Privacy shield */}
        <PrivacyPanel
          variant={config.variant}
          title={config.privacyTitle}
          body={config.privacyBody}
          beforeLabel={config.beforeLabel}
          afterLabel={config.afterLabel}
        />

        {/* Stats */}
        <section className="grid grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto mb-16 sm:mb-24">
          {[
            { num: '50K+', label: 'Verified Tutors', icon: Crown },
            { num: '200K+', label: 'Active Students', icon: Users },
            { num: '64', label: 'Districts Covered', icon: MapPin },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center p-4 rounded-2xl bg-gradient-to-br from-[#0B0F19] to-[#111827] border border-slate-800"
            >
              <s.icon className={`w-4 h-4 mx-auto mb-2 ${t.text}`} />
              <div
                className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${
                  isBlue ? 'from-blue-400 to-cyan-400' : 'from-emerald-400 to-teal-400'
                } bg-clip-text text-transparent`}
              >
                {s.num}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto mb-16 sm:mb-24">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-6">
            Common questions
          </h2>
          <div className="space-y-3">
            {config.faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl bg-[#0B0F19] border border-slate-800 open:border-slate-700"
              >
                <summary
                  className={`flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-white rounded-2xl focus:outline-none focus-visible:ring-2 ${t.ring}`}
                >
                  <span>{f.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 ${t.text} transition-transform duration-200 group-open:rotate-180`}
                  />
                </summary>
                <p className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section
          className={`relative overflow-hidden rounded-3xl border ${t.border} bg-gradient-to-br from-[#0F1626] to-[#0B0F19] p-8 sm:p-12 text-center`}
        >
          <div
            aria-hidden="true"
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full"
            style={{
              background: `radial-gradient(circle, ${t.glow1} 0%, transparent 70%)`,
            }}
          />
          <div className="relative">
            <div className="inline-flex items-center gap-2 text-xs text-slate-400 mb-4">
              <Globe className="w-3.5 h-3.5" />
              <span>{config.proof}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-6">
              {isBlue ? 'Ready to start teaching?' : 'Ready to find the right tutor?'}
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onRegister}
                className={`w-full sm:w-auto px-10 py-4 bg-gradient-to-r ${t.gradient} text-white font-bold rounded-xl text-base shadow-2xl ${t.shadow} transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 ${t.ring}`}
              >
                {config.bottomCta}
              </button>
              <button
                type="button"
                onClick={onSignIn}
                className={`w-full sm:w-auto px-10 py-4 bg-transparent hover:bg-slate-800/50 text-slate-300 font-semibold rounded-xl text-base border border-slate-700 transition-transform duration-200 hover:scale-[1.03] hover:border-slate-500 active:scale-[0.98] focus:outline-none focus-visible:ring-2 ${t.ring}`}
              >
                Already have an account?
              </button>
            </div>
          </div>
        </section>

        <footer className="mt-10 text-center text-[11px] text-slate-600 font-mono">
          © {new Date().getFullYear()} Porabo Tuition Network. Made in
          Bangladesh.
        </footer>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden border-t border-slate-800 bg-[#070A12]/95 p-3">
        <button
          type="button"
          onClick={onRegister}
          className={`w-full py-3.5 bg-gradient-to-r ${t.gradient} text-white font-bold rounded-xl text-sm shadow-xl ${t.shadow} active:scale-[0.98] transition-transform flex items-center justify-center gap-2`}
        >
          <UserCheck className="w-4 h-4" />
          {config.registerLabel}
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════
export const LandingPage: React.FC<LandingPageProps> = ({
  onProceedToAuth,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  if (!selectedRole) {
    return <RoleSelector onSelect={setSelectedRole} />;
  }

  if (selectedRole === 'TUTOR') {
    return (
      <RoleLanding
        config={TEACHER_CONFIG}
        onSignIn={() => onProceedToAuth('TUTOR', 'login')}
        onRegister={() => onProceedToAuth('TUTOR', 'register')}
        onBack={() => setSelectedRole(null)}
      />
    );
  }

  return (
    <RoleLanding
      config={GUARDIAN_CONFIG}
      onSignIn={() => onProceedToAuth('STUDENT', 'login')}
      onRegister={() => onProceedToAuth('STUDENT', 'register')}
      onBack={() => setSelectedRole(null)}
    />
  );
};