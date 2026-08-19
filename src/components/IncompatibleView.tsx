/**
 * SAMUEL - Incompatible Device View
 * 
 * Enforces Law 2: "No remote fallback".
 * If local execution is unsupported on the current device, clearly informs the user
 * rather than silently routing their thoughts to a remote cloud server.
 */

import React from 'react';
import { ShieldAlert, AlertTriangle, ExternalLink } from 'lucide-react';
import { REGULATORY_CONFIG } from '../config/regulatory';

interface IncompatibleViewProps {
  reason?: string;
  onRetry?: () => void;
}

export const IncompatibleView: React.FC<IncompatibleViewProps> = ({ reason, onRetry }) => {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-amber-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-medium text-neutral-100">
            Modo CONFIDENCIAL no disponible en este dispositivo
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Para garantizar que tus pensamientos nunca salgan de tu equipo, Samuel requiere soporte de aceleración gráfica local (<strong className="text-neutral-300">WebGPU</strong>).
          </p>
        </div>

        {/* Reason / Details */}
        <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 text-left text-xs text-neutral-400 space-y-2 font-mono">
          <div className="flex items-center gap-2 text-amber-400 font-sans font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Detalle técnico</span>
          </div>
          <p>{reason || 'Tu navegador o tarjeta gráfica no soportan WebGPU nativo.'}</p>
        </div>

        {/* Law 2 Principle Statement */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-xs text-emerald-300/90 text-left leading-relaxed">
          <strong className="block mb-1 text-emerald-200">Ley fundamental de SAMUEL:</strong>
          “Si tu dispositivo no puede procesar la IA de manera local, preferimos avisarte con honestidad antes que enviar tus conversaciones a un servidor externo.”
        </div>

        {/* Recommendations */}
        <div className="text-left space-y-2 pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Navegadores recomendados:</h4>
          <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside">
            <li>Google Chrome o Microsoft Edge (versión 113 o superior en PC / Mac / Android)</li>
            <li>Safari en macOS Sonoma / iOS 17.4+ con WebGPU habilitado</li>
            <li>Verificá que la aceleración por hardware esté activa en la configuración de tu navegador</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-medium text-sm transition-colors cursor-pointer"
            >
              Reintentar detección
            </button>
          )}
          <a
            href="https://caniuse.com/webgpu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white text-sm transition-colors"
          >
            <span>Ver compatibilidad WebGPU</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-800/80">
          {REGULATORY_CONFIG.productClassification.category} · {REGULATORY_CONFIG.policyVersion}
        </div>
      </div>
    </div>
  );
};
