import React from 'react';

interface GenderAvatarProps {
  gender?: 'MALE' | 'FEMALE';
  role?: 'STUDENT' | 'TUTOR';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  name?: string;
}

export const GenderAvatar: React.FC<GenderAvatarProps> = ({
  gender = 'MALE',
  role = 'TUTOR',
  size = 'md',
  className = '',
  name = '',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  const isMale = gender === 'MALE';
  // Sanitize unique id so multiple avatars don't clash on gradient IDs
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');

  return (
    <div
      className={`relative rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-lg border ${
        isMale
          ? 'bg-gradient-to-br from-[#0A1628] via-[#0F1E3D] to-[#050A14] border-blue-500/40'
          : 'bg-gradient-to-br from-[#0A1F28] via-[#0F2E3D] to-[#050F14] border-cyan-500/40'
      } ${sizeClasses[size]} ${className}`}
      title={`${name || (isMale ? 'Male' : 'Female')} (${
        role === 'TUTOR' ? 'Tutor' : 'Student'
      })`}
    >
      {/* Ambient colored glow */}
      <div
        className={`absolute inset-0 opacity-40 pointer-events-none ${
          isMale
            ? 'bg-[radial-gradient(circle_at_50%_20%,rgba(59,130,246,0.45),transparent_70%)]'
            : 'bg-[radial-gradient(circle_at_50%_20%,rgba(6,182,212,0.45),transparent_70%)]'
        }`}
      />

      {/* Subtle dot grid background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${
            isMale ? '#60A5FA' : '#22D3EE'
          } 0.8px, transparent 1px)`,
          backgroundSize: '9px 9px',
        }}
      />

      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={`skin${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isMale ? '#E6BC95' : '#EBC5A0'} />
            <stop offset="100%" stopColor={isMale ? '#C49870' : '#C89E78'} />
          </linearGradient>
          <linearGradient id={`hair${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2D1810" />
            <stop offset="100%" stopColor="#150903" />
          </linearGradient>
          <linearGradient id={`shirt${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isMale ? '#3B82F6' : '#06B6D4'} />
            <stop offset="100%" stopColor={isMale ? '#1E40AF' : '#0891B2'} />
          </linearGradient>
          <linearGradient id={`tie${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
        </defs>

        {isMale ? <MaleAvatar uid={uid} /> : <FemaleAvatar uid={uid} />}
      </svg>
    </div>
  );
};

// ==========================================================
// Male Avatar — Scholar with neat quiff & collared shirt + tie
// ==========================================================
const MaleAvatar: React.FC<{ uid: string }> = ({ uid }) => (
  <g>
    {/* Shirt / body */}
    <path
      d="M 12 100 Q 12 72 32 67 Q 40 64 50 64 Q 60 64 68 67 Q 88 72 88 100 Z"
      fill={`url(#shirt${uid})`}
    />
    {/* Shirt side shading for depth */}
    <path d="M 12 100 Q 12 72 32 67 L 32 100 Z" fill="#0F172A" opacity="0.25" />
    <path d="M 88 100 Q 88 72 68 67 L 68 100 Z" fill="#0F172A" opacity="0.25" />

    {/* Collar V-shape */}
    <path
      d="M 39 65 L 50 78 L 61 65 L 58 63 L 50 72 L 42 63 Z"
      fill="#0F172A"
    />
    <path
      d="M 39 65 L 50 78 L 61 65"
      stroke="#60A5FA"
      strokeWidth="0.8"
      fill="none"
      strokeLinejoin="round"
    />

    {/* Tie */}
    <path
      d="M 47 77 L 50 74 L 53 77 L 54 90 L 50 96 L 46 90 Z"
      fill={`url(#tie${uid})`}
    />
    <path d="M 47 77 L 50 74 L 53 77 L 52 80 L 48 80 Z" fill="#7F1D1D" />
    <path
      d="M 48 77 L 50 75 L 52 77"
      stroke="#FCA5A5"
      strokeWidth="0.4"
      fill="none"
    />

    {/* Neck */}
    <path
      d="M 43 58 Q 50 64 57 58 L 57 65 Q 50 67 43 65 Z"
      fill="#C49870"
    />
    <ellipse cx="50" cy="60" rx="6" ry="1.5" fill="rgba(100,50,30,0.25)" />

    {/* Face */}
    <ellipse cx="50" cy="40" rx="15" ry="18" fill={`url(#skin${uid})`} />
    {/* Forehead shadow */}
    <ellipse cx="50" cy="28" rx="13" ry="3" fill="rgba(100,50,30,0.15)" />

    {/* Hair — short neat with slight quiff */}
    <path
      d="M 33 38 Q 31 26 40 21 Q 46 18 50 18 Q 54 18 60 21 Q 69 26 67 38 Q 66 33 62 30 Q 57 27 50 27 Q 43 27 38 30 Q 34 33 33 38 Z"
      fill={`url(#hair${uid})`}
    />
    {/* Hair highlight */}
    <path
      d="M 40 23 Q 46 20 52 21 Q 58 23 62 27"
      stroke="#5A3A24"
      strokeWidth="0.9"
      strokeLinecap="round"
      fill="none"
      opacity="0.65"
    />

    {/* Eyebrows */}
    <path
      d="M 40 35 Q 43 33.5 46 35"
      stroke="#1A0F08"
      strokeWidth="1.3"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M 54 35 Q 57 33.5 60 35"
      stroke="#1A0F08"
      strokeWidth="1.3"
      strokeLinecap="round"
      fill="none"
    />

    {/* Eyes */}
    <ellipse cx="43" cy="40" rx="1.6" ry="2.1" fill="#1A0F08" />
    <ellipse cx="57" cy="40" rx="1.6" ry="2.1" fill="#1A0F08" />
    <circle cx="43.5" cy="39.3" r="0.6" fill="#FFFFFF" />
    <circle cx="57.5" cy="39.3" r="0.6" fill="#FFFFFF" />

    {/* Nose hint */}
    <path
      d="M 50 43 L 49 46.5 Q 50 47.5 51 46.5"
      stroke="#9B6E50"
      strokeWidth="0.8"
      strokeLinecap="round"
      fill="none"
    />

    {/* Warm smile */}
    <path
      d="M 45 51 Q 50 55 55 51"
      stroke="#7A3520"
      strokeWidth="1.3"
      strokeLinecap="round"
      fill="none"
    />

    {/* Cheek blush */}
    <ellipse cx="39" cy="47" rx="2.5" ry="1.4" fill="rgba(220,120,110,0.28)" />
    <ellipse cx="61" cy="47" rx="2.5" ry="1.4" fill="rgba(220,120,110,0.28)" />
  </g>
);

// ==========================================================
// Female Avatar — Scholar with long flowing hair & teal blouse
// ==========================================================
const FemaleAvatar: React.FC<{ uid: string }> = ({ uid }) => (
  <g>
    {/* Long hair — back layer behind shoulders */}
    <path
      d="M 28 42 Q 25 27 36 21 Q 43 17 50 17 Q 57 17 64 21 Q 75 27 72 42 Q 74 58 73 75 Q 68 71 62 70 L 38 70 Q 32 71 27 75 Q 26 58 28 42 Z"
      fill={`url(#hair${uid})`}
    />

    {/* Shirt / body */}
    <path
      d="M 16 100 Q 16 74 34 69 Q 42 66 50 66 Q 58 66 66 69 Q 84 74 84 100 Z"
      fill={`url(#shirt${uid})`}
    />
    {/* Shirt side shading */}
    <path d="M 16 100 Q 16 74 34 69 L 34 100 Z" fill="#0F172A" opacity="0.25" />
    <path d="M 84 100 Q 84 74 66 69 L 66 100 Z" fill="#0F172A" opacity="0.25" />

    {/* Blouse neckline */}
    <path
      d="M 43 68 Q 50 76 57 68 Q 53 73 50 74 Q 47 73 43 68 Z"
      fill="#0E7490"
    />
    <path
      d="M 43 68 Q 50 76 57 68"
      stroke="#22D3EE"
      strokeWidth="0.7"
      fill="none"
      strokeLinejoin="round"
    />

    {/* Neck */}
    <path
      d="M 44 56 Q 50 62 56 56 L 56 66 Q 50 68 44 66 Z"
      fill="#C89E78"
    />
    <ellipse cx="50" cy="59" rx="5.5" ry="1.3" fill="rgba(100,50,30,0.2)" />

    {/* Face */}
    <ellipse cx="50" cy="40" rx="14" ry="17" fill={`url(#skin${uid})`} />
    <ellipse cx="50" cy="28" rx="12" ry="2.5" fill="rgba(100,50,30,0.13)" />

    {/* Side hair strands framing face */}
    <path
      d="M 34 38 Q 32 46 33 55 Q 35 51 36 45 Q 36 41 34 38 Z"
      fill={`url(#hair${uid})`}
    />
    <path
      d="M 66 38 Q 68 46 67 55 Q 65 51 64 45 Q 64 41 66 38 Z"
      fill={`url(#hair${uid})`}
    />

    {/* Front bangs — side-swept */}
    <path
      d="M 35 38 Q 33 26 42 20 Q 50 16 58 20 Q 67 26 65 38 Q 63 31 58 27 Q 54 24 50 24 Q 45 24 41 27 Q 37 31 35 38 Z"
      fill={`url(#hair${uid})`}
    />
    {/* Hair highlight */}
    <path
      d="M 42 22 Q 48 19 54 20 Q 60 22 63 26"
      stroke="#7A4A28"
      strokeWidth="0.9"
      strokeLinecap="round"
      fill="none"
      opacity="0.6"
    />

    {/* Eyebrows */}
    <path
      d="M 40 35 Q 43 33.5 46 35"
      stroke="#1A0F08"
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M 54 35 Q 57 33.5 60 35"
      stroke="#1A0F08"
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
    />

    {/* Eyes */}
    <ellipse cx="43" cy="40" rx="1.5" ry="2" fill="#1A0F08" />
    <ellipse cx="57" cy="40" rx="1.5" ry="2" fill="#1A0F08" />
    <circle cx="43.5" cy="39.4" r="0.55" fill="#FFFFFF" />
    <circle cx="57.5" cy="39.4" r="0.55" fill="#FFFFFF" />

    {/* Eyeliner / lashes — subtle curved accent above each eye */}
    <path
      d="M 41.5 38.6 Q 43 37.4 44.5 38.6"
      stroke="#1A0F08"
      strokeWidth="0.55"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 55.5 38.6 Q 57 37.4 58.5 38.6"
      stroke="#1A0F08"
      strokeWidth="0.55"
      fill="none"
      strokeLinecap="round"
    />

    {/* Nose hint */}
    <path
      d="M 50 43 L 49 46 Q 50 47 51 46"
      stroke="#9B6E50"
      strokeWidth="0.75"
      strokeLinecap="round"
      fill="none"
    />

    {/* Warm smile with subtle lip tint */}
    <path
      d="M 45 51 Q 50 55 55 51"
      stroke="#9A3D2E"
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
    />
    <ellipse cx="50" cy="53.5" rx="4" ry="1.1" fill="rgba(220,100,100,0.35)" />

    {/* Cheek blush */}
    <ellipse
      cx="39"
      cy="46.5"
      rx="2.3"
      ry="1.3"
      fill="rgba(230,130,130,0.32)"
    />
    <ellipse
      cx="61"
      cy="46.5"
      rx="2.3"
      ry="1.3"
      fill="rgba(230,130,130,0.32)"
    />

    {/* Small elegant earring */}
    <circle
      cx="35.5"
      cy="46"
      r="0.9"
      fill="#FCD34D"
      stroke="#F59E0B"
      strokeWidth="0.2"
    />
  </g>
);