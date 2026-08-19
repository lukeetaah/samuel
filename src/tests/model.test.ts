/**
 * SAMUEL Test Suite - Model Registry & Hardware Fallback
 * 
 * Verifies model configurations, download footprint declarations,
 * and adaptive degradation chains (Law 2: only local fallbacks).
 */

import { describe, it, expect } from 'vitest';
import { MODEL_REGISTRY, DEFAULT_MODEL_ID, FALLBACK_MODEL_ID, ADAPTIVE_FALLBACK_CHAIN } from '../config/models';
import { HardwareDetector } from '../engine/hardware-detector';

describe('Model Configuration & Adaptive Fallback', () => {
  it('contains valid metadata for all models in the registry', () => {
    for (const [id, model] of Object.entries(MODEL_REGISTRY)) {
      expect(model.id).toBe(id);
      expect(model.name).toBeTruthy();
      expect(model.downloadSizeMB).toBeGreaterThan(100);
      expect(model.contextWindow).toBeGreaterThanOrEqual(2048);
      expect(['recommended', 'lightweight', 'minimal']).toContain(model.tier);
    }
  });

  it('verifies adaptive fallback chain points only to local models', () => {
    expect(FALLBACK_MODEL_ID).toBeDefined();
    expect(MODEL_REGISTRY[FALLBACK_MODEL_ID]).toBeDefined();
    expect(ADAPTIVE_FALLBACK_CHAIN.length).toBeGreaterThanOrEqual(2);
    for (const modelId of ADAPTIVE_FALLBACK_CHAIN) {
      expect(MODEL_REGISTRY[modelId]).toBeDefined();
    }
    expect(ADAPTIVE_FALLBACK_CHAIN[0]).toBe(DEFAULT_MODEL_ID);
  });

  it('HardwareDetector reports incompatibility gracefully when WebGPU is absent', async () => {
    // In standard node jsdom environment, navigator.gpu is undefined
    const report = await HardwareDetector.detect();
    expect(report.isWebGPUSupported).toBe(false);
    expect(report.compatibilityTier).toBe('incompatible');
    expect(report.reason).toContain('WebGPU');
  });
});
