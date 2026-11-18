import React from 'react';
import {
  CheckCircle,
  Lock,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Wallet,
} from 'lucide-react';
import { THEMES } from './theme';
import type { Pin, Variant } from './types';

export const PremiumBackground: React.FC<{ variant: Variant | 'mixed' }> = ({
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

export const Logo: React.FC<{ sub: string; subClass: string; small?: boolean }> = ({
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

export const Radar: React.FC<{ variant: Variant; pins: Pin[] }> = ({
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
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800/70" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-800/70" />
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div
          className="absolute inset-0 pb-sweep"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, transparent 280deg, rgba(${t.rgb},0.28) 360deg)`,
          }}
        />
      </div>
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

export const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div
    className={`rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0F1626] to-[#0B0F19] p-4 sm:p-5 shadow-2xl shadow-black/40 ${className}`}
  >
    {children}
  </div>
);

export const EarningsCard: React.FC = () => (
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
        <span className="font-mono font-bold text-base text-white">৳ 5,000</span>
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

export const MatchCard: React.FC = () => (
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

export const PrivacyPanel: React.FC<{
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
