import type { Theme, Variant } from './types';

export const THEMES: Record<Variant, Theme> = {
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

export const PORABO_CSS = `
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

export const FONT_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Bengali", "Helvetica Neue", Arial, sans-serif';
