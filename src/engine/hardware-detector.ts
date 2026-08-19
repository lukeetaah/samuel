/**
 * SAMUEL - WebGPU & Hardware Capability Detector
 * 
 * Inspects real WebGPU device limits and browser capabilities.
 * Follows Rule 2: Does not guess fake VRAM numbers.
 * Identifies if the hardware is compatible, recommended tier, or incompatible.
 */

import { DEFAULT_MODEL_ID, FALLBACK_MODEL_ID } from '../config/models';

export interface HardwareReport {
  isWebGPUSupported: boolean;
  adapterDescription?: string;
  vendor?: string;
  architecture?: string;
  maxBufferSizeMB?: number;
  maxStorageBufferBindingSizeMB?: number;
  recommendedModelId: string;
  compatibilityTier: 'recommended' | 'lightweight' | 'incompatible';
  reason?: string;
}

export class HardwareDetector {
  /**
   * Run real WebGPU detection in the current browser environment.
   */
  public static async detect(): Promise<HardwareReport> {
    if (typeof navigator === 'undefined' || !('gpu' in navigator) || !navigator.gpu) {
      return {
        isWebGPUSupported: false,
        recommendedModelId: FALLBACK_MODEL_ID,
        compatibilityTier: 'incompatible',
        reason: 'Tu navegador o dispositivo no tiene soporte para WebGPU. WebGPU es necesario para procesar la IA de forma local y confidencial sin enviar datos a servidores.',
      };
    }

    try {
      const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance',
      });

      if (!adapter) {
        return {
          isWebGPUSupported: false,
          recommendedModelId: FALLBACK_MODEL_ID,
          compatibilityTier: 'incompatible',
          reason: 'No se pudo inicializar un adaptador gráfico WebGPU compatible.',
        };
      }

      // Query actual adapter limits
      const limits = adapter.limits;
      const maxBufferSizeMB = Math.round((limits.maxBufferSize || 0) / (1024 * 1024));
      const maxStorageBufferBindingSizeMB = Math.round(
        (limits.maxStorageBufferBindingSize || 0) / (1024 * 1024)
      );

      // Inspect adapter info if available
      let adapterDescription = 'Adaptador gráfico WebGPU estándar';
      let vendor = '';
      let architecture = '';

      if ('info' in adapter && adapter.info) {
        const info = adapter.info as GPUAdapterInfo;
        vendor = info.vendor || '';
        architecture = info.architecture || '';
        adapterDescription = `${info.vendor || ''} ${info.architecture || ''} ${info.description || ''}`.trim();
      }

      // If buffer limits are severely constrained (e.g. < 256MB per buffer), recommend minimal/lightweight tier
      let recommendedModelId = DEFAULT_MODEL_ID;
      let compatibilityTier: 'recommended' | 'lightweight' = 'recommended';

      if (maxStorageBufferBindingSizeMB > 0 && maxStorageBufferBindingSizeMB < 512) {
        recommendedModelId = FALLBACK_MODEL_ID;
        compatibilityTier = 'lightweight';
      }

      return {
        isWebGPUSupported: true,
        adapterDescription: adapterDescription || 'GPU con soporte WebGPU',
        vendor,
        architecture,
        maxBufferSizeMB,
        maxStorageBufferBindingSizeMB,
        recommendedModelId,
        compatibilityTier,
      };
    } catch (err) {
      return {
        isWebGPUSupported: false,
        recommendedModelId: FALLBACK_MODEL_ID,
        compatibilityTier: 'incompatible',
        reason: `Error al verificar WebGPU: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }
}
