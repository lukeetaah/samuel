/**
 * SAMUEL - Privacy Badge Component
 * 
 * Discrete, persistent privacy status indicator.
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
      className="group inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/40 border border-emerald-800/40 text-emerald-300/90 hover:bg-emerald-900/40 hover:border-emerald-700/60 transition-all cursor-pointer select-none"
      title="Hacé clic para ver cómo funciona la privacidad en Samuel"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span>{REGULATORY_CONFIG.privacyStatement.badgeText}</span>
      {isOfflineReady && (
        <span className="text-[10px] text-emerald-400/70 border-l border-emerald-700/50 pl-2">
          Offline listo
        </span>
      )}
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
    </button>
  );
};
