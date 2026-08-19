/**
 * lukson.arts Brand Emblem (LA)
 * 
 * High-craft glowing geometric logo based on the official lukson.arts visual identity.
 */

import React from 'react';

interface LuksonLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const LuksonLogo: React.FC<LuksonLogoProps> = ({
  className = '',
  size = 36,
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/40 via-purple-600/30 to-blue-600/40 rounded-xl blur-md -z-10" />

        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className="relative overflow-visible"
        >
          <defs>
            {/* L Gradient: Neon Violet to Electric Blue */}
            <linearGradient id="la-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>

            {/* A Gradient: Metallic Titanium / Crisp White */}
            <linearGradient id="la-a-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>

            {/* Subtle glow filter */}
            <filter id="la-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#8B5CF6" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Geometric 'L' shape with rounded vertex */}
          <path
            d="M 18 15 L 34 15 L 34 68 L 78 68 L 78 84 L 26 84 C 21.5 84 18 80.5 18 76 Z"
            fill="url(#la-l-grad)"
            filter="url(#la-glow)"
          />

          {/* Geometric 'A' triangle leg crossing through */}
          <path
            d="M 68 15 L 86 15 L 102 84 L 84 84 L 77 56 L 50 56 L 68 15 Z"
            fill="url(#la-a-grad)"
          />
        </svg>
      </div>

      {showText && (
        <span className="font-mono text-xs tracking-wider text-neutral-300 lowercase font-medium">
          lukson<span className="text-violet-400">.arts</span>
        </span>
      )}
    </div>
  );
};
