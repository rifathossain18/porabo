import React from 'react';

/**
 * High-quality SVG Illustration for Empty Tuition Feed
 */
export const EmptyFeedIllustration: React.FC<{ className?: string }> = ({ className = 'w-48 h-48' }) => (
  <svg
    viewBox="0 0 320 260"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} mx-auto select-none`}
  >
    <defs>
      <linearGradient id="feedGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="feedGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <radialGradient id="feedGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
      </radialGradient>
      <filter id="feedShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0284c7" floodOpacity="0.25" />
      </filter>
    </defs>

    {/* Ambient Glow */}
    <circle cx="160" cy="130" r="100" fill="url(#feedGlow)" />

    {/* Radar Scan Rings */}
    <circle cx="160" cy="130" r="100" stroke="#1e3a8a" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
    <circle cx="160" cy="130" r="75" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.6" />
    <circle cx="160" cy="130" r="48" stroke="#38bdf8" strokeWidth="1.5" opacity="0.5" />

    {/* Floating Card Backdrop */}
    <rect x="80" y="55" width="160" height="150" rx="20" fill="#0f172a" stroke="#1e3a8a" strokeWidth="1.5" filter="url(#feedShadow)" />
    <rect x="95" y="75" width="60" height="8" rx="4" fill="#334155" />
    <rect x="95" y="92" width="130" height="6" rx="3" fill="#1e293b" />
    <rect x="95" y="104" width="110" height="6" rx="3" fill="#1e293b" />
    <rect x="95" y="116" width="80" height="6" rx="3" fill="#1e293b" />

    {/* Empty State Magnifier with Location Pin */}
    <g transform="translate(145, 120)">
      {/* Magnifier Glass Circle */}
      <circle cx="28" cy="28" r="32" fill="url(#feedGrad1)" stroke="url(#feedGrad2)" strokeWidth="3" />
      {/* Reflection shine */}
      <path d="M12 18 C18 10, 36 10, 44 18" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      {/* Location Pin inside Glass */}
      <path
        d="M28 14 C22 14, 18 18.5, 18 24 C18 31, 28 39, 28 39 C28 39, 38 31, 38 24 C38 18.5, 34 14, 28 14 Z"
        fill="#06b6d4"
      />
      <circle cx="28" cy="22" r="3" fill="#070a12" />
      {/* Handle */}
      <rect x="50" y="48" width="10" height="28" rx="5" transform="rotate(-45 50 48)" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
    </g>

    {/* Small decorative sparkle stars */}
    <g fill="#38bdf8" opacity="0.8">
      <path d="M65 80 L67 85 L72 87 L67 89 L65 94 L63 89 L58 87 L63 85 Z" />
      <path d="M255 100 L256.5 103.5 L260 105 L256.5 106.5 L255 110 L253.5 106.5 L250 105 L253.5 103.5 Z" />
      <path d="M100 205 L101.5 208.5 L105 210 L101.5 211.5 L100 215 L98.5 211.5 L95 210 L98.5 208.5 Z" />
    </g>
  </svg>
);

/**
 * High-quality SVG Illustration for Empty Applications
 */
export const EmptyApplicationsIllustration: React.FC<{ className?: string }> = ({ className = 'w-48 h-48' }) => (
  <svg
    viewBox="0 0 320 260"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} mx-auto select-none`}
  >
    <defs>
      <linearGradient id="appGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="paperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <radialGradient id="appGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
      </radialGradient>
      <filter id="appShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#1d4ed8" floodOpacity="0.3" />
      </filter>
    </defs>

    {/* Ambient Glow */}
    <circle cx="160" cy="130" r="105" fill="url(#appGlow)" />

    {/* Trailing Paper Plane Dotted Flight Arc */}
    <path
      d="M70 190 Q110 80, 200 85 T255 70"
      stroke="#38bdf8"
      strokeWidth="2"
      strokeDasharray="4 6"
      strokeLinecap="round"
      opacity="0.6"
    />

    {/* Main Application Dossier Card */}
    <rect x="85" y="60" width="130" height="150" rx="18" fill="url(#paperGrad)" stroke="#1e3a8a" strokeWidth="1.5" filter="url(#appShadow)" />
    {/* Card Header Tag */}
    <rect x="100" y="78" width="45" height="10" rx="5" fill="#3b82f6" opacity="0.8" />
    <rect x="100" y="98" width="100" height="6" rx="3" fill="#334155" />
    <rect x="100" y="112" width="85" height="6" rx="3" fill="#1e293b" />
    <rect x="100" y="126" width="95" height="6" rx="3" fill="#1e293b" />

    {/* Verification Badge Stamp */}
    <circle cx="175" cy="170" r="18" fill="#0369a1" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="1.5" />
    <path d="M168 170 L173 175 L183 164" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

    {/* Dynamic Origami Paper Airplane (Sending Applications) */}
    <g transform="translate(195, 50) rotate(15)">
      <polygon points="0,30 50,0 20,40 16,56 26,45" fill="#38bdf8" />
      <polygon points="50,0 20,40 26,45" fill="#0284c7" />
      <polygon points="0,30 20,40 16,56" fill="#0369a1" />
      <polygon points="0,30 50,0 20,40" fill="url(#appGrad1)" opacity="0.8" />
    </g>

    {/* Tiny decorative stars */}
    <g fill="#06b6d4" opacity="0.8">
      <path d="M60 120 L62 125 L67 127 L62 129 L60 134 L58 129 L53 127 L58 125 Z" />
      <path d="M260 160 L261.5 163.5 L265 165 L261.5 166.5 L260 170 L258.5 166.5 L255 165 L258.5 163.5 Z" />
    </g>
  </svg>
);

/**
 * High-quality SVG Illustration for Empty Applicant Inbox
 */
export const EmptyInboxIllustration: React.FC<{ className?: string }> = ({ className = 'w-48 h-48' }) => (
  <svg
    viewBox="0 0 320 260"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} mx-auto select-none`}
  >
    <defs>
      <linearGradient id="inboxGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
      </linearGradient>
      <radialGradient id="inboxGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
      </radialGradient>
      <filter id="inboxShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#0891b2" floodOpacity="0.25" />
      </filter>
    </defs>

    {/* Ambient Glow */}
    <circle cx="160" cy="130" r="110" fill="url(#inboxGlow)" />

    {/* Modern Isometric Inbox Tray (Empty State) */}
    <g filter="url(#inboxShadow)">
      {/* Tray Base Back Wall */}
      <polygon points="70,140 160,105 250,140 160,175" fill="#0b1329" stroke="#1e3a8a" strokeWidth="1.5" />
      {/* Front Left Wall with cutout */}
      <polygon points="70,140 70,165 130,188 130,170" fill="#111c38" stroke="#1e3a8a" strokeWidth="1.5" />
      {/* Front Right Wall with cutout */}
      <polygon points="190,170 190,188 250,165 250,140" fill="#0f172a" stroke="#1e3a8a" strokeWidth="1.5" />
      {/* Front Scoop Cutout */}
      <polygon points="130,188 160,200 190,188 190,170 160,182 130,170" fill="#1e293b" stroke="#0284c7" strokeWidth="1.5" />
    </g>

    {/* Floating Scholar Cap & Star Notification */}
    <g transform="translate(130, 45)">
      {/* Graduation Cap Diamond */}
      <polygon points="30,10 60,25 30,40 0,25" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
      {/* Skullcap underneath */}
      <path d="M12 28 Q30 42 48 28 L48 38 Q30 52 12 38 Z" fill="#0369a1" />
      {/* Tassel */}
      <path d="M30 25 L45 35 L45 48" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="45" cy="50" r="2.5" fill="#facc15" />
    </g>

    {/* Notification Ping Icon */}
    <g transform="translate(205, 75)">
      <circle cx="14" cy="14" r="16" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
      <circle cx="14" cy="14" r="6" fill="#38bdf8" />
      {/* Radio pulses */}
      <path d="M3 6 C-1 11, -1 17, 3 22" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M25 6 C29 11, 29 17, 25 22" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </g>

    {/* Clean empty sparkle accents */}
    <g fill="#38bdf8" opacity="0.8">
      <path d="M80 80 L81.5 83.5 L85 85 L81.5 86.5 L80 90 L78.5 86.5 L75 85 L78.5 83.5 Z" />
      <path d="M245 190 L246.5 193.5 L250 195 L246.5 196.5 L245 200 L243.5 196.5 L240 195 L243.5 193.5 Z" />
    </g>
  </svg>
);
