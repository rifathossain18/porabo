import React from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  Crown,
  Globe,
  MapPin,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { FONT_STACK, THEMES } from './theme';
import type { LandingConfig } from './types';
import {
  EarningsCard,
  Logo,
  MatchCard,
  PremiumBackground,
  PrivacyPanel,
  Radar,
} from './SharedLanding';

export const RoleLanding: React.FC<{
  config: LandingConfig;
  onSignIn: () => void;
  onRegister: () => void;
  onBack: () => void;
}> = ({ config, onSignIn, onRegister, onBack }) => {
  const t = THEMES[config.variant];
  const isBlue = config.variant === 'blue';

  return (
    <div
      className="min-h-screen bg-slate-50 text-white relative overflow-hidden"
      style={{ fontFamily: FONT_STACK }}
    >
      <PremiumBackground variant={config.variant} />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28 sm:pb-16">
        <header className="flex items-center justify-between mb-10 sm:mb-14 pb-rise">
          <Logo sub={config.eyebrow} subClass={t.text} small />
          <button
            type="button"
            onClick={onBack}
            className={`text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 ${t.ring}`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Change role</span>
          </button>
        </header>

        <section className="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-center mb-16 sm:mb-24">
          <div>
            <div className={`pb-rise inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${t.soft} ${t.text} text-[11px] font-mono border ${t.border} mb-5`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{config.badge}</span>
            </div>
            <h1
              className="pb-rise text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mb-5"
              style={{ animationDelay: '60ms' }}
            >
              <span className="text-white">{config.headlineTop}</span>
              <br />
              <span className={`bg-gradient-to-r ${t.gradientText} bg-clip-text text-transparent`}>
                {config.headlineBottom}
              </span>
            </h1>
            <p
              className="pb-rise text-sm sm:text-base text-slate-500 max-w-xl leading-relaxed mb-7"
              style={{ animationDelay: '120ms' }}
            >
              {config.sub}
            </p>
            <div className="pb-rise flex flex-col sm:flex-row gap-3" style={{ animationDelay: '180ms' }}>
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
                className={`w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-white text-white font-semibold rounded-xl text-sm border ${t.border} transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 ${t.ring}`}
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="pb-rise mt-4 text-[11px] text-slate-500 font-mono" style={{ animationDelay: '220ms' }}>
              {config.note}
            </div>
          </div>
          <div className="pb-rise space-y-4" style={{ animationDelay: '140ms' }}>
            <Radar variant={config.variant} pins={config.pins} />
            <div className="max-w-[420px] mx-auto" aria-hidden="true">
              {isBlue ? <EarningsCard /> : <MatchCard />}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16 sm:mb-24">
          {config.features.map((f) => (
            <div
              key={f.title}
              className={`p-5 rounded-2xl bg-white border ${t.cardBorder} transition-all duration-300 hover:-translate-y-1`}
            >
              <div className={`w-10 h-10 rounded-xl ${t.soft} border ${t.border} flex items-center justify-center mb-3`}>
                <f.icon className={`w-5 h-5 ${t.text}`} />
              </div>
              <h3 className="font-bold text-sm text-white mb-1.5">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="mb-16 sm:mb-24">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-8 max-w-lg">
            {config.stepsTitle}
          </h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {config.steps.map((s, i) => (
              <li key={s.title} className="relative p-6 rounded-2xl bg-gradient-to-br from-white to-white border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-lg ${t.shadow}`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-3xl font-black text-slate-800 font-mono">{i + 1}</span>
                </div>
                <h3 className="font-bold text-white mb-1.5">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        <PrivacyPanel
          variant={config.variant}
          title={config.privacyTitle}
          body={config.privacyBody}
          beforeLabel={config.beforeLabel}
          afterLabel={config.afterLabel}
        />

        <section className="grid grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto mb-16 sm:mb-24">
          {[
            { num: '50K+', label: 'Verified Tutors', icon: Crown },
            { num: '200K+', label: 'Active Students', icon: Users },
            { num: '64', label: 'Districts Covered', icon: MapPin },
          ].map((s) => (
            <div key={s.label} className="text-center p-4 rounded-2xl bg-gradient-to-br from-white to-white border border-slate-200">
              <s.icon className={`w-4 h-4 mx-auto mb-2 ${t.text}`} />
              <div className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${isBlue ? 'from-blue-600 to-blue-700' : 'from-emerald-600 to-green-600'} bg-clip-text text-transparent`}>
                {s.num}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </section>

        <section className="max-w-3xl mx-auto mb-16 sm:mb-24">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-6">Common questions</h2>
          <div className="space-y-3">
            {config.faqs.map((f) => (
              <details key={f.q} className="group rounded-2xl bg-white border border-slate-200 open:border-slate-300">
                <summary className={`flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-white rounded-2xl focus:outline-none focus-visible:ring-2 ${t.ring}`}>
                  <span>{f.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 ${t.text} transition-transform duration-200 group-open:rotate-180`} />
                </summary>
                <p className="px-5 pb-4 text-sm text-slate-500 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={`relative overflow-hidden rounded-3xl border ${t.border} bg-gradient-to-br from-white to-white p-8 sm:p-12 text-center`}>
          <div
            aria-hidden="true"
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full"
            style={{ background: `radial-gradient(circle, ${t.glow1} 0%, transparent 70%)` }}
          />
          <div className="relative">
            <div className="inline-flex items-center gap-2 text-xs text-slate-500 mb-4">
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
                className={`w-full sm:w-auto px-10 py-4 bg-transparent hover:bg-slate-100 text-slate-600 font-semibold rounded-xl text-base border border-slate-300 transition-transform duration-200 hover:scale-[1.03] hover:border-slate-500 active:scale-[0.98] focus:outline-none focus-visible:ring-2 ${t.ring}`}
              >
                Already have an account?
              </button>
            </div>
          </div>
        </section>
        <footer className="mt-10 text-center text-[11px] text-slate-600 font-mono">
          © {new Date().getFullYear()} Porabo Tuition Network. Made in Bangladesh.
        </footer>
      </div>

      <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden border-t border-slate-200 bg-slate-50 p-3">
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
