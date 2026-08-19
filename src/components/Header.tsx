/**
 * SAMUEL - Top Header Navigation
 * 
 * Minimalist, discrete, sanctuary design.
 */

import React from 'react';
import { PrivacyBadge } from './PrivacyBadge';
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
    <header className="w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <span className="font-serif tracking-widest text-lg font-semibold text-neutral-100 uppercase select-none">
          SAMUEL
        </span>
        {currentModel && (
          <span className="hidden md:inline-block text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400">
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
          className="p-2 rounded-xl hover:bg-neutral-800 hover:text-neutral-200 transition-colors text-xs flex items-center gap-1"
          title="Recursos de ayuda y líneas de asistencia"
        >
          <HeartHandshake className="w-4 h-4 text-rose-400/80" />
          <span className="hidden sm:inline">Ayuda</span>
        </button>

        <button
          onClick={onOpenAuditor}
          className="p-2 rounded-xl hover:bg-neutral-800 hover:text-neutral-200 transition-colors text-xs flex items-center gap-1"
          title="Auditar tráfico de red en vivo"
        >
          <Activity className="w-4 h-4 text-emerald-400/80" />
          <span className="hidden sm:inline">Auditor</span>
        </button>

        <button
          onClick={onOpenPrivacy}
          className="p-2 rounded-xl hover:bg-neutral-800 hover:text-neutral-200 transition-colors text-xs flex items-center gap-1"
          title="¿Cómo funciona?"
        >
          <Info className="w-4 h-4" />
        </button>

        {hasMessages && (
          <button
            onClick={onResetSession}
            className="p-2 rounded-xl hover:bg-rose-950/40 hover:text-rose-300 border border-transparent hover:border-rose-900/40 transition-colors text-xs flex items-center gap-1 text-neutral-400"
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
