/**
 * lukson.arts Brand Logo
 * 
 * Uses the real lukson-logo.jpg image and links to luksonarts.vercel.app.
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
    <a
      href="https://luksonarts.vercel.app"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2.5 select-none group ${className}`}
      title="lukson.arts"
    >
      <div
        className="relative shrink-0 rounded-lg overflow-hidden shadow-[0_0_18px_rgba(139,92,246,0.25)] group-hover:shadow-[0_0_28px_rgba(139,92,246,0.45)] transition-shadow duration-300"
        style={{ width: size, height: size }}
      >
        <img
          src="/lukson-logo.jpg"
          alt="lukson.arts"
          width={size}
          height={size}
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {showText && (
        <span className="font-mono text-xs tracking-wider text-neutral-300 lowercase font-medium group-hover:text-white transition-colors">
          lukson<span className="text-violet-400">.arts</span>
        </span>
      )}
    </a>
  );
};
