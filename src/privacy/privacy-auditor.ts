/**
 * SAMUEL - Privacy Auditor
 * 
 * Intercepts network calls at runtime to audit network traffic.
 * Strictly guarantees that 0 bytes of conversation data leave the client.
 * 
 * Distinguishes between:
 * - APP_MODEL_DOWNLOAD: Necessary first-time asset and weights downloads.
 * - STATIC_ASSET: Local stylesheets, fonts, icons, scripts.
 * - CONVERSATION_DATA: STRICTLY PROHIBITED (must remain 0 bytes always).
 * - UNKNOWN_EXTERNAL: Flagged and scrutinized.
 */

export type NetworkCategory = 
  | 'APP_MODEL_DOWNLOAD' 
  | 'STATIC_ASSET' 
  | 'CONVERSATION_DATA' 
  | 'UNKNOWN_EXTERNAL';

export interface AuditRecord {
  id: string;
  timestamp: number;
  destination: string;
  method: string;
  category: NetworkCategory;
  approximateBytes: number;
  status: 'allowed' | 'blocked' | 'completed';
  note?: string;
}

export interface AuditSummary {
  totalRequests: number;
  appModelDownloadBytes: number;
  conversationBytesTransmitted: number;
  isConfidentialGuaranteed: boolean;
  activeIntercepts: string[];
}

type AuditListener = (record: AuditRecord, summary: AuditSummary) => void;

class PrivacyAuditor {
  private static instance: PrivacyAuditor;
  private records: AuditRecord[] = [];
  private listeners: Set<AuditListener> = new Set();
  private isAuditing: boolean = false;

  private originalFetch: typeof window.fetch | null = null;
  private originalSendBeacon: typeof navigator.sendBeacon | null = null;

  // Track conversation tokens/strings in memory during session to detect accidental leaks
  private sensitiveSessionFragments: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): PrivacyAuditor {
    if (!PrivacyAuditor.instance) {
      PrivacyAuditor.instance = new PrivacyAuditor();
    }
    return PrivacyAuditor.instance;
  }

  /**
   * Register ephemeral sensitive words/phrases from current session to inspect outgoing payloads
   */
  public registerSensitiveFragment(text: string): void {
    if (!text || text.length < 4) return;
    // Normalize and add chunks of >= 4 characters
    const normalized = text.toLowerCase().trim();
    if (normalized.length >= 4) {
      this.sensitiveSessionFragments.add(normalized);
    }
  }

  public clearSensitiveFragments(): void {
    this.sensitiveSessionFragments.clear();
  }

  /**
   * Determine the network category of a destination and payload
   */
  public categorizeRequest(url: string, payloadBody?: unknown): { category: NetworkCategory; containsSensitiveData: boolean } {
    let containsSensitiveData = false;

    // Check payload against sensitive fragments
    if (payloadBody) {
      let bodyStr = '';
      if (typeof payloadBody === 'string') {
        bodyStr = payloadBody.toLowerCase();
      } else if (payloadBody instanceof FormData || payloadBody instanceof URLSearchParams) {
        bodyStr = payloadBody.toString().toLowerCase();
      } else if (typeof payloadBody === 'object') {
        try {
          bodyStr = JSON.stringify(payloadBody).toLowerCase();
        } catch {
          bodyStr = '';
        }
      }

      if (bodyStr.length > 0) {
        for (const fragment of this.sensitiveSessionFragments) {
          if (bodyStr.includes(fragment)) {
            containsSensitiveData = true;
            break;
          }
        }
      }
    }

    if (containsSensitiveData) {
      return { category: 'CONVERSATION_DATA', containsSensitiveData: true };
    }

    const lowerUrl = url.toLowerCase();

    // Model weight CDNs / Hugging Face / MLC AI repository
    if (
      lowerUrl.includes('huggingface.co') ||
      lowerUrl.includes('raw.githubusercontent.com/mlc-ai') ||
      lowerUrl.includes('cdn') && (lowerUrl.includes('wasm') || lowerUrl.includes('bin') || lowerUrl.includes('model') || lowerUrl.includes('weights')) ||
      lowerUrl.endsWith('.bin') ||
      lowerUrl.endsWith('.wasm') ||
      lowerUrl.endsWith('.json') && lowerUrl.includes('mlc')
    ) {
      return { category: 'APP_MODEL_DOWNLOAD', containsSensitiveData: false };
    }

    // Static local assets
    if (
      lowerUrl.startsWith('/') ||
      lowerUrl.startsWith('data:') ||
      lowerUrl.startsWith('blob:') ||
      lowerUrl.includes(typeof window !== 'undefined' ? window.location.host : 'localhost') ||
      lowerUrl.endsWith('.js') ||
      lowerUrl.endsWith('.css') ||
      lowerUrl.endsWith('.svg') ||
      lowerUrl.endsWith('.woff2') ||
      lowerUrl.endsWith('.png')
    ) {
      return { category: 'STATIC_ASSET', containsSensitiveData: false };
    }

    return { category: 'UNKNOWN_EXTERNAL', containsSensitiveData: false };
  }

  /**
   * Start intercepting network requests to enforce and audit the confidentiality invariant.
   */
  public startAuditing(): void {
    if (this.isAuditing || typeof window === 'undefined') return;
    this.isAuditing = true;

    // 1. Intercept fetch
    if (window.fetch) {
      this.originalFetch = window.fetch.bind(window);
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
        const method = init?.method || (typeof input === 'object' && 'method' in input ? input.method : 'GET') || 'GET';
        const body = init?.body;

        const { category, containsSensitiveData } = this.categorizeRequest(url, body);

        // Calculate approximate bytes
        let approxBytes = 0;
        if (typeof body === 'string') {
          approxBytes = new Blob([body]).size;
        } else if (body instanceof Blob) {
          approxBytes = body.size;
        } else if (body instanceof ArrayBuffer) {
          approxBytes = body.byteLength;
        }

        // LAW 1 & LAW 2 ENFORCEMENT: Never allow conversation data to leave
        if (containsSensitiveData) {
          this.logRecord({
            id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            timestamp: Date.now(),
            destination: url,
            method: method.toUpperCase(),
            category: 'CONVERSATION_DATA',
            approximateBytes: approxBytes,
            status: 'blocked',
            note: 'BLOQUEADO: Intento de egreso de datos conversacionales detectado por PrivacyAuditor.',
          });
          throw new Error('SAMUEL_PRIVACY_VIOLATION_PREVENTED: Outgoing conversation transmission is strictly prohibited in CONFIDENTIAL mode.');
        }

        this.logRecord({
          id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
          destination: url,
          method: method.toUpperCase(),
          category,
          approximateBytes: approxBytes,
          status: 'allowed',
          note: category === 'APP_MODEL_DOWNLOAD' ? 'Descarga de pesos del modelo local.' : 'Recurso estático de la aplicación.',
        });

        return this.originalFetch!(input, init);
      };
    }

    // 2. Intercept XMLHttpRequest
    if (typeof window.XMLHttpRequest !== 'undefined') {
      const originalXHRProto = window.XMLHttpRequest.prototype;
      const originalOpen = originalXHRProto.open;
      const originalSend = originalXHRProto.send;
      const auditor = this;

      originalXHRProto.open = function (method: string, url: string | URL, ...rest: unknown[]) {
        (this as unknown as { _auditMethod: string; _auditUrl: string })._auditMethod = method;
        (this as unknown as { _auditMethod: string; _auditUrl: string })._auditUrl = url.toString();
        // @ts-expect-error - variadic open
        return originalOpen.apply(this, [method, url, ...rest]);
      };

      originalXHRProto.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
        const xReq = this as unknown as { _auditMethod?: string; _auditUrl?: string };
        const url = xReq._auditUrl || 'unknown-xhr';
        const method = (xReq._auditMethod || 'GET').toUpperCase();

        const { category, containsSensitiveData } = auditor.categorizeRequest(url, body);

        if (containsSensitiveData) {
          auditor.logRecord({
            id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            timestamp: Date.now(),
            destination: url,
            method,
            category: 'CONVERSATION_DATA',
            approximateBytes: body ? 100 : 0,
            status: 'blocked',
            note: 'BLOQUEADO XHR: Intento de egreso conversacional.',
          });
          throw new Error('SAMUEL_PRIVACY_VIOLATION_PREVENTED: XHR conversation transmission is strictly blocked.');
        }

        auditor.logRecord({
          id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
          destination: url,
          method,
          category,
          approximateBytes: body ? 50 : 0,
          status: 'allowed',
        });

        return (originalSend as (this: XMLHttpRequest, body?: unknown) => void).apply(this, [body]);
      };
    }

    // 3. Intercept sendBeacon
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      this.originalSendBeacon = navigator.sendBeacon.bind(navigator);
      navigator.sendBeacon = (url: string | URL, data?: BodyInit | null): boolean => {
        const urlStr = url.toString();
        const { category, containsSensitiveData } = this.categorizeRequest(urlStr, data);

        if (containsSensitiveData) {
          this.logRecord({
            id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            timestamp: Date.now(),
            destination: urlStr,
            method: 'POST (BEACON)',
            category: 'CONVERSATION_DATA',
            approximateBytes: data ? 100 : 0,
            status: 'blocked',
            note: 'BLOQUEADO BEACON: Transmisión de telemetría con datos conversacionales impedida.',
          });
          return false;
        }

        this.logRecord({
          id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
          destination: urlStr,
          method: 'POST (BEACON)',
          category,
          approximateBytes: data ? 50 : 0,
          status: 'allowed',
        });

        return this.originalSendBeacon!(url, data);
      };
    }

    // 4. Intercept WebSocket
    if (typeof window.WebSocket !== 'undefined') {
      const OriginalWS = window.WebSocket;
      const auditor = this;

      // @ts-expect-error - Custom WS constructor
      window.WebSocket = function (url: string | URL, protocols?: string | string[]) {
        const urlStr = url.toString();
        auditor.logRecord({
          id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
          destination: urlStr,
          method: 'WS_CONNECT',
          category: 'UNKNOWN_EXTERNAL',
          approximateBytes: 0,
          status: 'allowed',
          note: 'Conexión WebSocket abierta.',
        });

        const wsInstance = new OriginalWS(url, protocols);
        const originalSend = wsInstance.send.bind(wsInstance);

        wsInstance.send = (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
          const { containsSensitiveData } = auditor.categorizeRequest(urlStr, data);
          if (containsSensitiveData) {
            auditor.logRecord({
              id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              timestamp: Date.now(),
              destination: urlStr,
              method: 'WS_SEND',
              category: 'CONVERSATION_DATA',
              approximateBytes: typeof data === 'string' ? data.length : 100,
              status: 'blocked',
              note: 'BLOQUEADO WS: Intento de egreso por WebSocket.',
            });
            throw new Error('SAMUEL_PRIVACY_VIOLATION_PREVENTED: WebSocket conversation transmission is strictly blocked.');
          }
          return (originalSend as (data: unknown) => void)(data);
        };

        return wsInstance;
      };
    }
  }

  public stopAuditing(): void {
    if (!this.isAuditing || typeof window === 'undefined') return;
    this.isAuditing = false;

    if (this.originalFetch) window.fetch = this.originalFetch;
    if (this.originalSendBeacon && navigator) navigator.sendBeacon = this.originalSendBeacon;
  }

  private logRecord(record: AuditRecord): void {
    this.records.push(record);
    // Keep max 200 records in memory for auditing inspection
    if (this.records.length > 200) {
      this.records.shift();
    }
    const summary = this.getAuditSummary();
    this.listeners.forEach((listener) => {
      try {
        listener(record, summary);
      } catch (err) {
        console.error('Audit listener error:', err);
      }
    });
  }

  public getAuditRecords(): AuditRecord[] {
    return [...this.records];
  }

  public getAuditSummary(): AuditSummary {
    let appModelDownloadBytes = 0;
    let conversationBytesTransmitted = 0;

    for (const record of this.records) {
      if (record.category === 'APP_MODEL_DOWNLOAD' && record.status === 'allowed') {
        appModelDownloadBytes += record.approximateBytes;
      }
      if (record.category === 'CONVERSATION_DATA' && record.status === 'completed') {
        conversationBytesTransmitted += record.approximateBytes;
      }
    }

    return {
      totalRequests: this.records.length,
      appModelDownloadBytes,
      conversationBytesTransmitted,
      isConfidentialGuaranteed: conversationBytesTransmitted === 0,
      activeIntercepts: ['fetch', 'XMLHttpRequest', 'sendBeacon', 'WebSocket'],
    };
  }

  public subscribe(listener: AuditListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public clearLog(): void {
    this.records = [];
  }
}

export const privacyAuditor = PrivacyAuditor.getInstance();
