/**
 * SAMUEL - Incompatible Device View
 * 
 * Enforces Law 2: "No remote fallback".
 * Lukson.arts visual universe styling.
 */

import React from 'react';
import { ShieldAlert, AlertTriangle, ExternalLink } from 'lucide-react';
import { REGULATORY_CONFIG } from '../config/regulatory';
import { LuksonLogo } from './LuksonLogo';

interface IncompatibleViewProps {
  reason?: string;
  onRetry?: () => void;
}

export const IncompatibleView: React.FC<IncompatibleViewProps> = ({ reason, onRetry }) => {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-violet-600/10 via-purple-600/10 to-blue-600/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-lg w-full bg-neutral-900/80 border border-violet-500/25 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6 text-center backdrop-blur-2xl">
        {/* Brand */}
        <div className="flex justify-center">
          <LuksonLogo size={48} showText={true} />
        </div>

        {/* Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-light text-neutral-100">
            Modo CONFIDENCIAL no disponible en este dispositivo
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed font-light">
            Para garantizar que tus pensamientos nunca salgan de tu equipo, Samuel requiere soporte de aceleración gráfica local (<strong className="text-violet-300 font-mono">WebGPU</strong>).
          </p>
        </div>

        {/* Reason / Details */}
        <div className="p-4 rounded-2xl bg-neutral-950/80 border border-violet-500/20 text-left text-xs text-neutral-400 space-y-2 font-mono">
          <div className="flex items-center gap-2 text-amber-400 font-sans font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Detalle técnico</span>
          </div>
          <p>{reason || 'Tu navegador o tarjeta gráfica no soportan WebGPU nativo.'}</p>
        </div>

        {/* Law 2 Principle Statement */}
        <div className="p-4 rounded-2xl bg-violet-950/20 border border-violet-500/30 text-xs text-violet-200/90 text-left leading-relaxed font-light">
          <strong className="block mb-1 text-violet-300 font-medium">Ley fundamental de SAMUEL:</strong>
          “Si tu dispositivo no puede procesar la IA de manera local, preferimos avisarte con honestidad antes que enviar tus conversaciones a un servidor externo.”
        </div>

        {/* Recommendations */}
        <div className="text-left space-y-2 pt-1 font-light">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">Navegadores recomendados:</h4>
          <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside">
            <li>Google Chrome o Microsoft Edge (v113+ en PC / Mac / Android)</li>
            <li>Safari en macOS Sonoma / iOS 17.4+ con WebGPU habilitado</li>
            <li>Verificá que la aceleración por hardware esté activa en la configuración del navegador</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] cursor-pointer"
            >
              Reintentar detección
            </button>
          )}
          <a
            href="https://caniuse.com/webgpu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-neutral-950 border border-violet-500/20 text-neutral-300 hover:text-white text-sm transition-colors"
          >
            <span>Ver compatibilidad</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-800/80 font-mono">
          {REGULATORY_CONFIG.productClassification.category} · lukson.arts
        </div>
      </div>
    </div>
  );
};
