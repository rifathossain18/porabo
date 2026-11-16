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
  Award,
  Lock,
  UserCheck,
  Globe,
} from 'lucide-react';
import { UserRole } from '../lib/types';

interface LandingPageProps {
  onProceedToAuth: (role: UserRole, mode: 'login' | 'register') => void;
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 1: ROLE SELECTOR
// ═══════════════════════════════════════════════════════════════
const RoleSelector: React.FC<{ onSelect: (role: UserRole) => void }> = ({ onSelect }) => (
  <div className="min-h-screen bg-[#070A12] text-white relative overflow-hidden">
    {/* Ambient glows */}
    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

    {/* Dot grid */}
    <div
      className="absolute inset-0 opacity-40 pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.15) 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }}
    />

    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between mb-12 sm:mb-16">
        <div className="flex items-center gap-3">
          <img src="/assets/porabo_logo_transparent_90065b0b.svg" alt="Porabo" className="w-10 h-10 object-contain" />
          <div>
            <div className="font-extrabold text-xl tracking-tight text-white">Porabo</div>
            <div className="text-[9px] uppercase font-mono tracking-widest text-blue-400">Tuition Network</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-[#0B0F19]/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-900/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live in 64 Districts</span>
        </div>
      </header>

      {/* Hero */}
      <div className="text-center mb-12 sm:mb-16 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/60 text-blue-300 text-[11px] font-mono border border-blue-800/50 mb-6 self-center">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bangladesh's #1 Hyperlocal Tuition Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-4">
          <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
            Welcome to
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Porabo
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed px-4">
          Bangladesh's largest tuition marketplace. Connect with verified tutors and students within your neighborhood — no commission, no ads fee, 100% free.
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12">
        {/* Teacher Card */}
        <button
          onClick={() => onSelect('TUTOR')}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1428] via-[#111827] to-[#0B0F19] border-2 border-blue-900/60 hover:border-blue-500 transition-all duration-300 p-6 sm:p-8 text-left shadow-2xl shadow-blue-900/20 hover:shadow-blue-500/20 hover:scale-[1.02]"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-5 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-blue-400 mb-2">I am a</div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">Teacher / Tutor</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Teach students in your neighborhood. Keep 100% of what you earn — zero commission, zero ads fee.
            </p>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
              <span>Continue as Teacher</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Guardian Card */}
        <button
          onClick={() => onSelect('STUDENT')}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2818] via-[#111827] to-[#0B0F19] border-2 border-emerald-900/60 hover:border-emerald-500 transition-all duration-300 p-6 sm:p-8 text-left shadow-2xl shadow-emerald-900/20 hover:shadow-emerald-500/20 hover:scale-[1.02]"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-5 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 mb-2">I am a</div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">Student / Guardian</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Find verified tutors within 1-5km of your home. Post tuition needs, review applicants, accept the best match.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
              <span>Continue as Guardian</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>
      </div>

      {/* Trust Signals */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Zero Commission</span>
        </div>
        <div className="w-px h-4 bg-slate-800 hidden sm:block" />
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>No Ads Fee</span>
        </div>
        <div className="w-px h-4 bg-slate-800 hidden sm:block" />
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% Verified</span>
        </div>
        <div className="w-px h-4 bg-slate-800 hidden sm:block" />
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>64 Districts</span>
        </div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SCREEN 2A: TEACHER LANDING
// ═══════════════════════════════════════════════════════════════
const TeacherLanding: React.FC<{
  onSignIn: () => void;
  onRegister: () => void;
  onBack: () => void;
}> = ({ onSignIn, onRegister, onBack }) => (
  <div className="min-h-screen bg-[#070A12] text-white relative overflow-hidden">
    <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
    <div
      className="absolute inset-0 opacity-30 pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.12) 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }}
    />

    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <img src="/assets/porabo_logo_transparent_90065b0b.svg" alt="Porabo" className="w-9 h-9 object-contain" />
          <div>
            <div className="font-extrabold text-lg tracking-tight text-white">Porabo</div>
            <div className="text-[9px] uppercase font-mono tracking-widest text-blue-400">For Teachers</div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          ← Change role
        </button>
      </header>

      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/60 text-blue-300 text-[11px] font-mono border border-blue-800/50 mb-5">
          <Award className="w-3.5 h-3.5" />
          <span>Bangladesh's Largest Teacher Network</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
          <span className="text-white">Teach Your Way.</span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Keep 100% of Your Earnings.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed px-4 mb-8">
          Join Bangladesh's biggest tuition marketplace. Verified students, hyperlocal matching, and zero commission — so every taka you earn stays with you.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
          <button
            onClick={onRegister}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl text-sm shadow-2xl shadow-blue-500/40 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            Create Teacher Account
          </button>
          <button
            onClick={onSignIn}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0B0F19] hover:bg-[#111827] text-white font-semibold rounded-xl text-sm border border-blue-900/60 transition-all flex items-center justify-center gap-2"
          >
            Sign In
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 text-[11px] text-slate-500 font-mono">No credit card required • Free forever</div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-emerald-900/40 hover:border-emerald-500/60 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="font-bold text-sm text-white mb-1.5">Zero Commission</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">Keep every taka you earn. No hidden cuts, no monthly fee, no ads fee.</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-cyan-900/40 hover:border-cyan-500/60 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="font-bold text-sm text-white mb-1.5">Verified Students</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">Every guardian is audited. Only serious tuition requests reach you.</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-blue-900/40 hover:border-blue-500/60 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <MapPin className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="font-bold text-sm text-white mb-1.5">Hyperlocal Matching</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">Students within walking distance. No more cross-city commutes.</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-violet-900/40 hover:border-violet-500/60 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Lock className="w-5 h-5 text-violet-400" />
          </div>
          <h3 className="font-bold text-sm text-white mb-1.5">Privacy Shield</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">Your phone & address stay hidden until a student accepts you.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto mb-12">
        {[
          { num: '50K+', label: 'Verified Tutors' },
          { num: '200K+', label: 'Active Students' },
          { num: '64', label: 'Districts Covered' },
        ].map((s, i) => (
          <div key={i} className="text-center p-4 rounded-2xl bg-gradient-to-br from-[#0B0F19] to-[#111827] border border-blue-900/40">
            <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {s.num}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-mono uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-xs text-slate-400 mb-4">
          <Globe className="w-3.5 h-3.5" />
          <span>Trusted by tutors across Bangladesh</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
          <button
            onClick={onRegister}
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl text-base shadow-2xl shadow-blue-500/40 transition-all hover:scale-[1.02]"
          >
            Get Started Free →
          </button>
          <button
            onClick={onSignIn}
            className="w-full sm:w-auto px-10 py-4 bg-transparent hover:bg-slate-800/50 text-slate-300 font-semibold rounded-xl text-base border border-slate-700 transition-all"
          >
            Already have an account?
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SCREEN 2B: GUARDIAN LANDING
// ═══════════════════════════════════════════════════════════════
const GuardianLanding: React.FC<{
  onSignIn: () => void;
  onRegister: () => void;
  onBack: () => void;
}> = ({ onSignIn, onRegister, onBack }) => (
  <div className="min-h-screen bg-[#070A12] text-white relative overflow-hidden">
    <div className="absolute top-0 right-1/3 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[150px] pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none" />
    <div
      className="absolute inset-0 opacity-30 pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16,185,129,0.12) 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }}
    />

    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <img src="/assets/porabo_logo_transparent_90065b0b.svg" alt="Porabo" className="w-9 h-9 object-contain" />
          <div>
            <div className="font-extrabold text-lg tracking-tight text-white">Porabo</div>
            <div className="text-[9px] uppercase font-mono tracking-widest text-emerald-400">For Guardians</div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          ← Change role
        </button>
      </header>

      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 text-emerald-300 text-[11px] font-mono border border-emerald-800/50 mb-5">
          <Award className="w-3.5 h-3.5" />
          <span>Bangladesh's #1 Tuition Marketplace</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
          <span className="text-white">Find Verified Tutors</span>
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            in Your Neighborhood.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed px-4 mb-8">
          The largest hyperlocal tuition platform in Bangladesh. Find verified teachers within walking distance, review their credentials, and unlock contact only when you're ready to hire.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
          <button
            onClick={onRegister}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-xl text-sm shadow-2xl shadow-emerald-500/40 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            Create Free Account
          </button>
          <button
            onClick={onSignIn}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0B0F19] hover:bg-[#111827] text-white font-semibold rounded-xl text-sm border border-emerald-900/60 transition-all flex items-center justify-center gap-2"
          >
            Sign In
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 text-[11px] text-slate-500 font-mono">100% free • No hidden fees • Ever</div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-emerald-900/40 hover:border-emerald-500/60 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="font-bold text-sm text-white mb-1.5">100% Free</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">No platform fee, no commission, no subscription. Forever free for guardians.</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-cyan-900/40 hover:border-cyan-500/60 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="font-bold text-sm text-white mb-1.5">Verified Teachers</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">Every tutor is audited with NID, student ID, and institutional verification.</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-blue-900/40 hover:border-blue-500/60 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Lock className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="font-bold text-sm text-white mb-1.5">Privacy Shield</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">Your phone & address stay hidden until YOU accept a tutor.</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-violet-900/40 hover:border-violet-500/60 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <MapPin className="w-5 h-5 text-violet-400" />
          </div>
          <h3 className="font-bold text-sm text-white mb-1.5">1km–5km Radius</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">Find tutors walking distance from your home. No more cross-city commutes.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto mb-12">
        {[
          { num: '50K+', label: 'Verified Tutors' },
          { num: '200K+', label: 'Active Students' },
          { num: '64', label: 'Districts Covered' },
        ].map((s, i) => (
          <div key={i} className="text-center p-4 rounded-2xl bg-gradient-to-br from-[#0B0F19] to-[#111827] border border-emerald-900/40">
            <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              {s.num}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-mono uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-xs text-slate-400 mb-4">
          <Globe className="w-3.5 h-3.5" />
          <span>Trusted by 200,000+ families across Bangladesh</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
          <button
            onClick={onRegister}
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-xl text-base shadow-2xl shadow-emerald-500/40 transition-all hover:scale-[1.02]"
          >
            Find My Tutor Free →
          </button>
          <button
            onClick={onSignIn}
            className="w-full sm:w-auto px-10 py-4 bg-transparent hover:bg-slate-800/50 text-slate-300 font-semibold rounded-xl text-base border border-slate-700 transition-all"
          >
            Already have an account?
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export const LandingPage: React.FC<LandingPageProps> = ({ onProceedToAuth }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  if (!selectedRole) {
    return <RoleSelector onSelect={setSelectedRole} />;
  }

  if (selectedRole === 'TUTOR') {
    return (
      <TeacherLanding
        onSignIn={() => onProceedToAuth('TUTOR', 'login')}
        onRegister={() => onProceedToAuth('TUTOR', 'register')}
        onBack={() => setSelectedRole(null)}
      />
    );
  }

  return (
    <GuardianLanding
      onSignIn={() => onProceedToAuth('STUDENT', 'login')}
      onRegister={() => onProceedToAuth('STUDENT', 'register')}
      onBack={() => setSelectedRole(null)}
    />
  );
};