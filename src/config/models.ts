/**
 * SAMUEL - Model Configuration & Registry
 * 
 * Provides model metadata, download footprints, context limits,
 * and adaptive hierarchy for local execution.
 */

export interface ModelMetadata {
  id: string;
  name: string;
  family: string;
  parameterSize: string;
  quantization: string;
  downloadSizeMB: number;
  vramEstimatedMB: number;
  contextWindow: number;
  description: string;
  tier: 'recommended' | 'lightweight' | 'minimal';
  languages: string[];
  isDefault?: boolean;
}

export const MODEL_REGISTRY: Record<string, ModelMetadata> = {
  'Qwen2.5-0.5B-Instruct-q4f16_1-MLC': {
    id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 0.5B Instruct',
    family: 'Qwen',
    parameterSize: '0.5B',
    quantization: 'q4f16_1',
    downloadSizeMB: 350,
    vramEstimatedMB: 450,
    contextWindow: 2048,
    description: 'Ultra rápido y fluido en español. Respuestas inmediatas sin demora.',
    tier: 'recommended',
    languages: ['es', 'en'],
    isDefault: true,
  },
  'Qwen2.5-1.5B-Instruct-q4f16_1-MLC': {
    id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 1.5B Instruct',
    family: 'Qwen',
    parameterSize: '1.5B',
    quantization: 'q4f16_1',
    downloadSizeMB: 940,
    vramEstimatedMB: 1200,
    contextWindow: 4096,
    description: 'Mayor profundidad de razonamiento para GPUs dedicadas.',
    tier: 'lightweight',
    languages: ['es', 'en'],
  },
  'SmolLM2-360M-Instruct-q4f16_1-MLC': {
    id: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
    name: 'SmolLM2 360M Instruct',
    family: 'SmolLM',
    parameterSize: '360M',
    quantization: 'q4f16_1',
    downloadSizeMB: 220,
    vramEstimatedMB: 380,
    contextWindow: 2048,
    description: 'Ultra liviano y de carga instantánea, ideal para dispositivos de gama baja.',
    tier: 'minimal',
    languages: ['es', 'en'],
  },
  'Llama-3.2-1B-Instruct-q4f16_1-MLC': {
    id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 1B Instruct',
    family: 'Llama',
    parameterSize: '1.2B',
    quantization: 'q4f16_1',
    downloadSizeMB: 878,
    vramEstimatedMB: 1100,
    contextWindow: 4096,
    description: 'Modelo compacto de Meta optimizado para instrucciones.',
    tier: 'lightweight',
    languages: ['es', 'en'],
  },
};

export const DEFAULT_MODEL_ID = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';
export const FALLBACK_MODEL_ID = 'SmolLM2-360M-Instruct-q4f16_1-MLC';

export const ADAPTIVE_FALLBACK_CHAIN: string[] = [
  'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
  'SmolLM2-360M-Instruct-q4f16_1-MLC',
  'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
  'Llama-3.2-1B-Instruct-q4f16_1-MLC',
];
