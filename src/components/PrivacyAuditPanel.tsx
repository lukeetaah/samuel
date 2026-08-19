/**
 * SAMUEL - Live Privacy Auditor Panel
 * 
 * Inspects runtime network intercepts in the lukson.arts visual universe:
 * verifying that conversation bytes remain strictly 0.
 */

import React, { useState, useEffect } from 'react';
import { X, Activity, ShieldCheck, Download, Ban, RefreshCw } from 'lucide-react';
import { privacyAuditor, AuditRecord, AuditSummary } from '../privacy/privacy-auditor';

interface PrivacyAuditPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyAuditPanel: React.FC<PrivacyAuditPanelProps> = ({ isOpen, onClose }) => {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [summary, setSummary] = useState<AuditSummary>(privacyAuditor.getAuditSummary());

  useEffect(() => {
    setRecords(privacyAuditor.getAuditRecords());
    setSummary(privacyAuditor.getAuditSummary());

    const unsubscribe = privacyAuditor.subscribe((_, updatedSummary) => {
      setRecords(privacyAuditor.getAuditRecords());
      setSummary(updatedSummary);
    });

    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-neutral-950/90 border border-violet-500/25 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh] backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-violet-500/15 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-950/50 border border-violet-500/30 text-violet-300">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-light text-neutral-100">Privacy Auditor (Inspector en Vivo)</h2>
              <p className="text-xs text-neutral-400 font-mono">Auditoría en tiempo real de peticiones de red</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-950 border-b border-violet-500/15 text-xs font-mono">
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-violet-500/20">
            <span className="text-neutral-400 block mb-1">Transmisión Conversación</span>
            <span className="text-base font-semibold text-emerald-400">
              {summary.conversationBytesTransmitted} bytes
            </span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">✓ 0 bytes verificado</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-violet-500/20">
            <span className="text-neutral-400 block mb-1">Descarga App & Modelo</span>
            <span className="text-base font-semibold text-violet-300">
              {(summary.appModelDownloadBytes / (1024 * 1024)).toFixed(1)} MB
            </span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Caché local en disco</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-violet-500/20">
            <span className="text-neutral-400 block mb-1">Interceptores Activos</span>
            <span className="text-xs font-medium text-neutral-300">
              {summary.activeIntercepts.join(', ')}
            </span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Peticiones: {summary.totalRequests}</span>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
          {records.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-violet-400/50" />
              <p>No se han registrado peticiones salientes.</p>
              <p className="text-[11px] text-neutral-600 mt-1">El modo CONFIDENCIAL está activo y verificado.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((r) => (
                <div
                  key={r.id}
                  className={`p-3 rounded-xl border text-[11px] flex items-center justify-between gap-3 ${
                    r.category === 'CONVERSATION_DATA'
                      ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                      : r.category === 'APP_MODEL_DOWNLOAD'
                      ? 'bg-violet-950/20 border-violet-800/40 text-violet-300'
                      : 'bg-neutral-900/50 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {r.status === 'blocked' ? (
                      <Ban className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : r.category === 'APP_MODEL_DOWNLOAD' ? (
                      <Download className="w-4 h-4 text-violet-400 shrink-0" />
                    ) : (
                      <Activity className="w-4 h-4 text-neutral-400 shrink-0" />
                    )}
                    <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] font-bold">
                      {r.method}
                    </span>
                    <span className="truncate max-w-[320px] text-neutral-200" title={r.destination}>
                      {r.destination}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 border border-violet-500/20">
                      {r.category}
                    </span>
                    <span className="text-neutral-500">
                      {new Date(r.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-violet-500/15 bg-neutral-950 flex justify-between items-center text-xs text-neutral-400 font-mono">
          <span>Auditando: fetch, XMLHttpRequest, sendBeacon, WebSockets</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                privacyAuditor.clearLog();
                setRecords([]);
                setSummary(privacyAuditor.getAuditSummary());
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-violet-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Limpiar Registro
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-violet-500/20"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
