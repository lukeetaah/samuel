/**
 * SAMUEL - Privacy & Architecture Modal
 * 
 * Provides a 2-tier explanation:
 * - Simple: Clear, friendly, zero jargon.
 * - Technical: Model specs, WebGPU execution, Cache API storage, and 0 outbound chat bytes proof.
 */

import React, { useState } from 'react';
import { X, Shield, Cpu, HardDrive, WifiOff, FileText, CheckCircle2 } from 'lucide-react';
import { REGULATORY_CONFIG } from '../config/regulatory';
import { PRIVACY_SECTIONS } from '../privacy/privacy-policy';
import { ModelMetadata } from '../config/models';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel: ModelMetadata | null;
  onOpenAuditor: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  currentModel,
  onOpenAuditor,
}) => {
  const [activeTab, setActiveTab] = useState<'simple' | 'technical' | 'legal'>('simple');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-neutral-100">Privacidad y Funcionamiento</h2>
              <p className="text-xs text-neutral-400">{REGULATORY_CONFIG.privacyStatement.badgeText}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-6 pt-2">
          <button
            onClick={() => setActiveTab('simple')}
            className={`pb-2.5 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'simple'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Explicación Simple
          </button>
          <button
            onClick={() => setActiveTab('technical')}
            className={`pb-2.5 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'technical'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Detalles Técnicos
          </button>
          <button
            onClick={() => setActiveTab('legal')}
            className={`pb-2.5 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'legal'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Marco Legal
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-neutral-300 text-sm leading-relaxed">
          {activeTab === 'simple' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
                <p className="text-base text-neutral-100 font-medium mb-1">
                  “No llegó.”
                </p>
                <p className="text-neutral-300">
                  {REGULATORY_CONFIG.privacyStatement.simpleExplanation}
                </p>
              </div>

              <div className="space-y-4">
                {PRIVACY_SECTIONS.map((sec, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-neutral-200">{sec.title}</h4>
                      <p className="text-neutral-400 text-xs mt-0.5">{sec.simpleText}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200/90 text-xs">
                <strong>Importante:</strong> {REGULATORY_CONFIG.disclaimers.nonMedical}
              </div>
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-start gap-3">
                  <Cpu className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-neutral-400">Modelo Cargado</div>
                    <div className="font-mono text-sm text-neutral-200">{currentModel?.name || 'Llama 3.2 1B Instruct'}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Cuantización {currentModel?.quantization || 'q4f16_1'}</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-start gap-3">
                  <HardDrive className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-neutral-400">Almacenamiento Local</div>
                    <div className="text-sm text-neutral-200">Cache API + IndexedDB</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Pesos del modelo cacheados</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-start gap-3">
                  <WifiOff className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-neutral-400">Tráfico de Conversación</div>
                    <div className="text-sm font-semibold text-emerald-400">0 bytes transmitidos</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Sin APIs ni proxies remotos</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-start gap-3">
                  <FileText className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-neutral-400">Persistencia de Mensajes</div>
                    <div className="text-sm text-neutral-200">Solo Memoria Volátil</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Se descarta al cerrar o reiniciar</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Detalle Arquitectónico</h4>
                <div className="space-y-2">
                  {PRIVACY_SECTIONS.map((sec, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/80 text-xs">
                      <span className="font-medium text-neutral-200 block mb-1">{sec.title}</span>
                      <span className="text-neutral-400 leading-relaxed font-mono">{sec.technicalDetails}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuditor();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
                >
                  Abrir Inspector de Red (Privacy Auditor)
                </button>
              </div>
            </div>
          )}

          {activeTab === 'legal' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                <h4 className="text-sm font-medium text-neutral-200">Declaraciones y Marco Regulatorio</h4>
                <p className="text-neutral-400 leading-relaxed">
                  {REGULATORY_CONFIG.legalReferences.dataProtection}
                </p>
                <p className="text-neutral-400 leading-relaxed">
                  {REGULATORY_CONFIG.legalReferences.healthRegulationNote}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                <h4 className="text-sm font-medium text-neutral-200">Límites de Edad y Responsabilidad</h4>
                <p className="text-neutral-400">
                  Edad recomendada: {REGULATORY_CONFIG.minimumAge} años o más.
                </p>
                <p className="text-neutral-400 leading-relaxed">
                  Versión de políticas: <code className="font-mono text-emerald-400">{REGULATORY_CONFIG.policyVersion}</code> (Actualizado: {REGULATORY_CONFIG.lastUpdated})
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/90 flex justify-between items-center text-xs text-neutral-500">
          <span>SAMUEL Core v1.0 · Inferencia 100% en Cliente</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
