import React from 'react';
import {
  ArrowRight,
  CheckCircle,
  Crown,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import type { UserRole } from '../../lib/types';
import { FONT_STACK, PORABO_CSS } from './theme';
import { Logo, PremiumBackground } from './SharedLanding';

export const RoleSelector: React.FC<{ onSelect: (role: UserRole) => void }> = ({
  onSelect,
}) => {
  const roles: Array<{
    role: UserRole;
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
      role: 'TUTOR',
      icon: GraduationCap,
      label: 'I am a',
      title: 'Teacher / Tutor',
      desc: 'Teach students in your neighborhood. Keep 100% of what you earn, with zero commission and zero ads fee.',
      points: ['See tuition requests within walking distance', 'Your phone stays hidden until a student accepts', 'No monthly fee, ever'],
      cta: 'Continue as Teacher',
      cardClass: 'from-[#0B1428] via-[#111827] to-[#0B0F19] border-blue-900/60 shadow-blue-900/20 hover:border-blue-500/80 hover:shadow-blue-500/25',
      iconClass: 'from-blue-600 to-cyan-500 shadow-blue-500/30',
      glowClass: 'bg-blue-500/10 group-hover:bg-blue-500/20',
      ctaClass: 'text-blue-400',
      ringClass: 'focus-visible:ring-blue-400',
    },
    {
      role: 'STUDENT',
      icon: Users,
      label: 'I am a',
      title: 'Student / Guardian',
      desc: 'Find verified tutors within 1-5 km of your home. Post your tuition need, review applicants, accept the best match.',
      points: ['Every tutor is NID and institution verified', 'Your phone and address stay private', '100% free for guardians'],
      cta: 'Continue as Guardian',
      cardClass: 'from-[#0B2818] via-[#111827] to-[#0B0F19] border-emerald-900/60 shadow-emerald-900/20 hover:border-emerald-500/80 hover:shadow-emerald-500/25',
      iconClass: 'from-emerald-600 to-teal-500 shadow-emerald-500/30',
      glowClass: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
      ctaClass: 'text-emerald-400',
      ringClass: 'focus-visible:ring-emerald-400',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070A12] text-white relative overflow-hidden" style={{ fontFamily: FONT_STACK }}>
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
        <div className="text-center mb-10 sm:mb-14 pb-rise" style={{ animationDelay: '60ms' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/60 text-blue-300 text-[11px] font-mono border border-blue-800/50 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bangladesh's #1 Hyperlocal Tuition Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] mb-4">
            <span className="text-white">Welcome to </span>
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Porabo</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed px-2">
            Bangladesh's largest tuition marketplace. Connect with verified tutors and students in your neighborhood. No commission, no ads fee, 100% free.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-14 pb-rise" style={{ animationDelay: '120ms' }}>
          {roles.map((r) => (
            <button
              key={r.title}
              type="button"
              onClick={() => onSelect(r.role)}
              className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${r.cardClass} border-2 text-left shadow-2xl p-6 sm:p-8 transition-all duration-300 md:hover:-translate-y-1 active:scale-[0.99] focus:outline-none focus-visible:ring-2 ${r.ringClass}`}
            >
              <div className={`absolute -top-10 -right-10 w-48 h-48 rounded-full transition-colors duration-500 ${r.glowClass}`} />
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${r.iconClass} flex items-center justify-center shadow-lg mb-5`}>
                  <r.icon className="w-7 h-7 text-white" />
                </div>
                <div className={`text-[11px] font-mono mb-1.5 ${r.ctaClass}`}>{r.label}</div>
                <h2 className="text-2xl font-extrabold text-white mb-2">{r.title}</h2>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">{r.desc}</p>
                <ul className="space-y-2 mb-6">
                  {r.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle className={`w-4 h-4 shrink-0 mt-px ${r.ctaClass}`} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <div className={`flex items-center gap-2 text-sm font-semibold ${r.ctaClass}`}>
                  <span>{r.cta}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-3xl w-full mx-auto mb-8 pb-rise" style={{ animationDelay: '180ms' }}>
          {[
            { num: '50K+', label: 'Verified Tutors', icon: Crown },
            { num: '200K+', label: 'Active Students', icon: Users },
            { num: '64', label: 'Districts', icon: MapPin },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 sm:p-4 rounded-2xl bg-[#0B0F19] border border-slate-800">
              <s.icon className="w-4 h-4 text-blue-400 mx-auto mb-1.5" />
              <div className="text-xl sm:text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{s.num}</div>
              <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-slate-400 mt-auto pb-2 pb-rise" style={{ animationDelay: '240ms' }}>
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
