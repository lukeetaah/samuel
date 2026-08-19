/**
 * SAMUEL - Model Adapter Interface
 * 
 * Abstraction layer for local inference backends (WebLLM Worker, etc.).
 * Allows seamless switching and benchmarking of different models.
 */

import { ModelMetadata } from '../config/models';

export interface ModelLoadProgress {
  progress: number;      // 0 to 1
  text: string;          // Human-readable status (e.g. "Cargando pesos 45%")
  downloadedMB?: number;
  totalMB?: number;
}

export interface GenerationStats {
  promptTokens: number;
  completionTokens: number;
  timeToFirstTokenMs: number;
  totalTimeMs: number;
  tokensPerSecond: number;
}

export interface ModelAdapter {
  isInitialized(): boolean;
  getLoadedModel(): ModelMetadata | null;
  loadModel(modelId: string, onProgress?: (progress: ModelLoadProgress) => void): Promise<void>;
  unloadModel(): Promise<void>;
  generateStream(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    options: {
      maxTokens?: number;
      temperature?: number;
      topP?: number;
      onToken: (token: string, accumulated: string) => void;
      onStats?: (stats: GenerationStats) => void;
    }
  ): Promise<string>;
  interrupt(): void;
}
