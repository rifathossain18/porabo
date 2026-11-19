import type { Theme, Variant } from './types';

export const THEMES: Record<Variant, Theme> = {
  blue: {
    text: 'text-blue-700',
    soft: 'bg-blue-50',
    border: 'border-blue-200',
    cardBorder: 'border-slate-200 hover:border-blue-300',
    gradient: 'from-blue-600 to-blue-700',
    gradientText: 'from-blue-700 via-blue-600 to-blue-500',
    shadow: 'shadow-blue-600/15',
    ring: 'focus-visible:ring-blue-400',
    dot: 'bg-blue-600',
    rgb: '37,99,235',
    glow1: 'rgba(37,99,235,0.08)',
    glow2: 'rgba(37,99,235,0.04)',
    line: 'rgba(37,99,235,0.25)',
  },
  green: {
    text: 'text-emerald-700',
    soft: 'bg-emerald-50',
    border: 'border-emerald-200',
    cardBorder: 'border-slate-200 hover:border-emerald-300',
    gradient: 'from-emerald-600 to-green-700',
    gradientText: 'from-emerald-700 via-green-700 to-blue-700',
    shadow: 'shadow-emerald-600/15',
    ring: 'focus-visible:ring-emerald-400',
    dot: 'bg-emerald-600',
    rgb: '22,163,74',
    glow1: 'rgba(22,163,74,0.08)',
    glow2: 'rgba(22,163,74,0.04)',
    line: 'rgba(22,163,74,0.25)',
  },
};

export const FONT_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Bengali", "Helvetica Neue", Arial, sans-serif';
