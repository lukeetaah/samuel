/**
 * SAMUEL - Crisis & Safety Resources Modal
 * 
 * Provides verified hotlines and professional help directories per jurisdiction.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-medium text-neutral-100">Recursos de Asistencia y Crisis</h2>
              <p className="text-xs text-neutral-400">Líneas gratuitas y atención humana directa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="p-4 bg-amber-950/20 border-b border-amber-900/30 text-xs text-amber-200/90 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            SAMUEL es una herramienta de IA conversacional y no brinda atención médica ni de urgencia. Si estás pasando por un momento crítico o sentís que estás en riesgo, comunicate con un profesional o una línea de ayuda especializada.
          </span>
        </div>

        {/* Country Selector */}
        <div className="px-6 pt-4 flex items-center justify-between">
          <label htmlFor="jurisdiction-select" className="text-xs text-neutral-400">País o región:</label>
          <select
            id="jurisdiction-select"
            value={selectedJurisdiction}
            onChange={(e) => setSelectedJurisdiction(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            {Object.values(JURISDICTIONS).map((j) => (
              <option key={j.code} value={j.code}>
                {j.name}
              </option>
            ))}
          </select>
        </div>

        {/* Helplines List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {contacts.map((contact, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2"
            >
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-sm text-neutral-100">{contact.title}</h4>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
                  {contact.hours}
                </span>
              </div>
              <p className="text-xs text-neutral-400">{contact.description}</p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-3 py-1 rounded-lg">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{contact.phone}</span>
                </div>
                {contact.url && (
                  <a
                    href={contact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 px-3 py-1 rounded-lg transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Sitio Oficial</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/90 flex justify-between items-center text-xs text-neutral-400">
          <span>Marco: {currentJur.legalFramework}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
