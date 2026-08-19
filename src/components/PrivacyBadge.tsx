/**
 * SAMUEL - Privacy Badge Component
 * 
 * Exclusive, glowing privacy indicator tailored for lukson.arts visual universe.
 */

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { REGULATORY_CONFIG } from '../config/regulatory';

interface PrivacyBadgeProps {
  onClick: () => void;
  isOfflineReady?: boolean;
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ onClick, isOfflineReady }) => {
  return (
    <button
      onClick={onClick}
      className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-neutral-950/80 border border-violet-500/30 text-violet-200/90 hover:text-white hover:border-violet-400/60 shadow-[0_0_15px_rgba(139,92,246,0.12)] hover:shadow-[0_0_20px_rgba(139,92,246,0.25)] transition-all cursor-pointer select-none backdrop-blur-md"
      title="Hacé clic para ver cómo funciona la privacidad en Samuel"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400"></span>
      </span>
      <span className="tracking-wide">{REGULATORY_CONFIG.privacyStatement.badgeText}</span>
      {isOfflineReady && (
        <span className="text-[10px] text-blue-300/80 border-l border-violet-700/50 pl-2 font-mono">
          Offline
        </span>
      )}
      <ShieldCheck className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
    </button>
  );
};
