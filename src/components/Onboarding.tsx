/**
 * SAMUEL - Onboarding & First-Run Experience
 * 
 * Exclusive sanctuary entrance in the lukson.arts visual universe.
 * Transparent first-time local model weight download with real progress.
 */

import React, { useState } from 'react';
import { Shield, Sparkles, HardDrive, WifiOff, Download, ChevronRight, Settings } from 'lucide-react';
import { MODEL_REGISTRY, DEFAULT_MODEL_ID, ModelMetadata } from '../config/models';
import { ModelLoadProgress } from '../engine/model-adapter';
import { LuksonLogo } from './LuksonLogo';

interface OnboardingProps {
  onStart: (modelId: string) => void;
  isLoading: boolean;
  loadProgress: ModelLoadProgress;
  recommendedModelId: string;
  error?: string | null;
}

export const Onboarding: React.FC<OnboardingProps> = ({
  onStart,
  isLoading,
  loadProgress,
  recommendedModelId,
  error,
}) => {
  const [selectedModelId, setSelectedModelId] = useState<string>(
    recommendedModelId || DEFAULT_MODEL_ID
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeModel: ModelMetadata = MODEL_REGISTRY[selectedModelId] || MODEL_REGISTRY[DEFAULT_MODEL_ID];

  return (
    <div className="min-h-[calc(100svh-70px)] text-neutral-100 flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-violet-600/15 via-purple-600/10 to-blue-600/15 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="w-full max-w-xl space-y-8 text-center animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Header with LA Emblem */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <LuksonLogo size={56} showText={true} />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono bg-neutral-900/80 border border-violet-500/30 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping"></span>
            CONFIDENCIAL · PROCESAMIENTO LOCAL
          </div>

          <h1 className="text-4xl sm:text-5xl font-serif font-light tracking-tight bg-gradient-to-r from-white via-neutral-100 to-violet-300 bg-clip-text text-transparent">
            Un lugar donde podés hablar.
          </h1>
          <p className="text-base sm:text-lg text-neutral-400 font-light leading-relaxed max-w-lg mx-auto">
            Podés contar lo que te pasa, ordenar una idea, pensar una decisión o simplemente descargar lo que tenés en la cabeza.
          </p>
        </div>

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-violet-500/20 space-y-2 backdrop-blur-xl shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 text-violet-300 font-medium text-sm">
              <Shield className="w-4 h-4 text-violet-400" />
              <span>Privacidad Real</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              La conversación se procesa en tu dispositivo y el contenido nunca llega a servidores externos.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-violet-500/20 space-y-2 backdrop-blur-xl shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 text-violet-300 font-medium text-sm">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Sin Fórmulas</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              No necesitás saber usar IA ni escribir prompts complejos. Solo hablar con naturalidad.
            </p>
          </div>
        </div>

        {/* Download & Initialization Section */}
        {isLoading ? (
          <div className="p-6 rounded-2xl bg-neutral-900/80 border border-violet-500/30 space-y-4 text-left backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-violet-200 font-medium">
                <Download className="w-4 h-4 text-violet-400 animate-bounce" />
                <span>Instalando modelo en este dispositivo...</span>
              </div>
              <span className="font-mono text-violet-300 font-semibold">
                {Math.round(loadProgress.progress * 100)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden p-0.5 border border-violet-500/20">
              <div
                className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(139,92,246,0.5)]"
                style={{ width: `${Math.max(4, Math.round(loadProgress.progress * 100))}%` }}
              />
            </div>

            <p className="text-xs text-neutral-400 font-mono truncate">
              {loadProgress.text || 'Preparando tensores WebGPU y almacenamiento local...'}
            </p>

            <div className="pt-2 text-[11px] text-neutral-500 border-t border-violet-500/10 flex items-center justify-between font-mono">
              <span>{activeModel.name} ({activeModel.downloadSizeMB} MB)</span>
              <span>Una sola vez · Queda guardado</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Primary Action Button */}
            <button
              onClick={() => onStart(selectedModelId)}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 text-white font-medium text-base shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all flex items-center justify-center gap-2.5 mx-auto cursor-pointer group"
            >
              <span>Empezar</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-xs text-neutral-400 flex items-center justify-center gap-4 pt-1 font-mono">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-violet-400" />
                Descarga inicial: {activeModel.downloadSizeMB} MB
              </span>
              <span className="flex items-center gap-1.5">
                <WifiOff className="w-3.5 h-3.5 text-blue-400" />
                Uso offline posterior
              </span>
            </div>

            {/* Model Selection Toggle for technical users */}
            <div className="pt-2">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-neutral-500 hover:text-violet-300 inline-flex items-center gap-1.5 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{showAdvanced ? 'Ocultar opciones de modelo' : 'Elegir modelo de IA'}</span>
              </button>

              {showAdvanced && (
                <div className="mt-3 p-4 rounded-xl bg-neutral-900/80 border border-violet-500/20 text-left space-y-3 animate-in fade-in duration-200 backdrop-blur-xl">
                  <div className="text-xs text-neutral-400">
                    Seleccioná el modelo que mejor se adapte a tu dispositivo:
                  </div>
                  <div className="space-y-2">
                    {Object.values(MODEL_REGISTRY).map((model) => (
                      <label
                        key={model.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          selectedModelId === model.id
                            ? 'bg-neutral-950/90 border-violet-500/60 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                            : 'bg-neutral-950/40 border-neutral-800/80 hover:border-violet-500/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="model_select"
                          checked={selectedModelId === model.id}
                          onChange={() => setSelectedModelId(model.id)}
                          className="mt-1 accent-violet-500"
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-neutral-200">{model.name}</span>
                            <span className="font-mono text-neutral-400">{model.downloadSizeMB} MB</span>
                          </div>
                          <p className="text-neutral-400 text-[11px] mt-0.5 font-light">{model.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error message if any */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs text-left">
            <strong>Error al inicializar:</strong> {error}
          </div>
        )}

        {/* Footer Disclaimer */}
        <p className="text-[11px] text-neutral-500 max-w-md mx-auto pt-4 border-t border-neutral-900/80 leading-relaxed font-light">
          SAMUEL es una herramienta conversacional de IA para ordenar ideas. No es un psicólogo ni sustituye atención profesional médica o de salud mental.
        </p>
      </div>
    </div>
  );
};
