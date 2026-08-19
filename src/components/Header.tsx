/**
 * SAMUEL - Top Header Navigation
 * 
 * Exclusive sanctuary aesthetic in the lukson.arts visual universe.
 */

import React from 'react';
import { PrivacyBadge } from './PrivacyBadge';
import { LuksonLogo } from './LuksonLogo';
import { RotateCcw, Activity, HeartHandshake, Info } from 'lucide-react';
import { ModelMetadata } from '../config/models';

interface HeaderProps {
  onOpenPrivacy: () => void;
  onOpenAuditor: () => void;
  onOpenSafety: () => void;
  onResetSession: () => void;
  hasMessages: boolean;
  isOfflineReady?: boolean;
  currentModel: ModelMetadata | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPrivacy,
  onOpenAuditor,
  onOpenSafety,
  onResetSession,
  hasMessages,
  isOfflineReady,
  currentModel,
}) => {
  return (
    <header className="w-full border-b border-violet-500/15 bg-neutral-950/70 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      {/* Left: Brand with Lukson Emblem */}
      <div className="flex items-center gap-3">
        <LuksonLogo size={28} />
        <span className="font-serif tracking-widest text-lg font-semibold bg-gradient-to-r from-white via-neutral-100 to-violet-300 bg-clip-text text-transparent uppercase select-none">
          SAMUEL
        </span>
        {currentModel && (
          <span className="hidden md:inline-block text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-neutral-900/90 border border-violet-500/20 text-neutral-400">
            {currentModel.name}
          </span>
        )}
      </div>

      {/* Center: Privacy Status */}
      <div className="flex items-center">
        <PrivacyBadge onClick={onOpenPrivacy} isOfflineReady={isOfflineReady} />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 text-neutral-400">
        <button
          onClick={onOpenSafety}
          className="p-2 rounded-xl hover:bg-neutral-900/80 hover:text-rose-300 border border-transparent hover:border-rose-500/20 transition-all text-xs flex items-center gap-1.5"
          title="Recursos de ayuda y líneas de asistencia"
        >
          <HeartHandshake className="w-4 h-4 text-rose-400/80" />
          <span className="hidden sm:inline">Ayuda</span>
        </button>

        <button
          onClick={onOpenAuditor}
          className="p-2 rounded-xl hover:bg-neutral-900/80 hover:text-violet-300 border border-transparent hover:border-violet-500/20 transition-all text-xs flex items-center gap-1.5"
          title="Auditar tráfico de red en vivo"
        >
          <Activity className="w-4 h-4 text-violet-400/80" />
          <span className="hidden sm:inline">Auditor</span>
        </button>

        <button
          onClick={onOpenPrivacy}
          className="p-2 rounded-xl hover:bg-neutral-900/80 hover:text-neutral-200 border border-transparent hover:border-violet-500/20 transition-all text-xs flex items-center gap-1.5"
          title="¿Cómo funciona?"
        >
          <Info className="w-4 h-4 text-neutral-400" />
        </button>

        {hasMessages && (
          <button
            onClick={onResetSession}
            className="p-2 rounded-xl hover:bg-rose-950/40 hover:text-rose-300 border border-transparent hover:border-rose-900/40 transition-all text-xs flex items-center gap-1.5 text-neutral-400"
            title="Borrar sesión de la memoria volátil"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Borrar</span>
          </button>
        )}
      </div>
    </header>
  );
};
