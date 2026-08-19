/**
 * SAMUEL - Crisis & Safety Resources Modal
 * 
 * Provides verified hotlines and professional help directories per jurisdiction
 * in the lukson.arts visual universe.
 */

import React, { useState } from 'react';
import { X, HeartHandshake, Phone, Globe, ShieldAlert } from 'lucide-react';
import { JURISDICTIONS, JurisdictionInfo } from '../config/jurisdictions';
import { getSafetyResourcesForJurisdiction, EmergencyContact } from '../config/safety-resources';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialJurisdiction?: string;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({
  isOpen,
  onClose,
  initialJurisdiction = 'AR',
}) => {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>(initialJurisdiction);

  if (!isOpen) return null;

  const currentJur: JurisdictionInfo = JURISDICTIONS[selectedJurisdiction] || JURISDICTIONS['AR'];
  const contacts: EmergencyContact[] = getSafetyResourcesForJurisdiction(selectedJurisdiction);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-950/90 border border-violet-500/25 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh] backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-violet-500/15 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-light text-neutral-100">Recursos de Asistencia y Crisis</h2>
              <p className="text-xs text-neutral-400 font-mono">Líneas gratuitas y atención humana directa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="p-4 bg-amber-950/20 border-b border-amber-900/30 text-xs text-amber-200/90 flex items-start gap-2.5 font-light">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            SAMUEL es una herramienta de IA conversacional y no brinda atención médica ni de urgencia. Si estás pasando por un momento crítico o sentís que estás en riesgo, comunicate con un profesional o una línea de ayuda especializada.
          </span>
        </div>

        {/* Country Selector */}
        <div className="px-6 pt-4 flex items-center justify-between">
          <label htmlFor="jurisdiction-select" className="text-xs text-neutral-400 font-mono">País o región:</label>
          <select
            id="jurisdiction-select"
            value={selectedJurisdiction}
            onChange={(e) => setSelectedJurisdiction(e.target.value)}
            className="bg-neutral-900 border border-violet-500/20 text-neutral-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-violet-500"
          >
            {Object.values(JURISDICTIONS).map((j) => (
              <option key={j.code} value={j.code}>
                {j.name}
              </option>
            ))}
          </select>
        </div>

        {/* Helplines List */}
        <div className="p-6 overflow-y-auto space-y-4 font-light">
          {contacts.map((contact, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-neutral-900/60 border border-violet-500/15 space-y-2 backdrop-blur-md"
            >
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-sm text-neutral-100">{contact.title}</h4>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-neutral-800 border border-violet-500/20 text-neutral-300">
                  {contact.hours}
                </span>
              </div>
              <p className="text-xs text-neutral-400">{contact.description}</p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-300 bg-violet-950/50 border border-violet-500/30 px-3 py-1.5 rounded-xl font-mono">
                  <Phone className="w-3.5 h-3.5 text-violet-400" />
                  <span>{contact.phone}</span>
                </div>
                {contact.url && (
                  <a
                    href={contact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/50 px-3 py-1.5 rounded-xl transition-colors font-mono"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <span>Sitio Oficial</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-violet-500/15 bg-neutral-950 flex justify-between items-center text-xs text-neutral-400 font-mono">
          <span>Marco: {currentJur.legalFramework}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-violet-500/20"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
