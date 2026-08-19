/**
 * SAMUEL - WebLLM Service & Model Manager
 * 
 * Bridges React with the inference Web Worker.
 * Handles model loading progress, streaming tokens, error degradation to smaller local models,
 * and offline status verification.
 */

import { ModelAdapter, ModelLoadProgress, GenerationStats } from './model-adapter';
import { MODEL_REGISTRY, ModelMetadata, DEFAULT_MODEL_ID, ADAPTIVE_FALLBACK_CHAIN } from '../config/models';

export type EngineStatus = 'unloaded' | 'loading' | 'ready' | 'generating' | 'error' | 'incompatible';

export interface WebLLMServiceState {
  status: EngineStatus;
  currentModel: ModelMetadata | null;
  loadProgress: ModelLoadProgress;
  error: string | null;
  isOfflineReady: boolean;
}

type StateListener = (state: WebLLMServiceState) => void;

export class WebLLMService implements ModelAdapter {
  private static instance: WebLLMService;
  private worker: Worker | null = null;
  private currentModelId: string | null = null;
  private status: EngineStatus = 'unloaded';
  private loadProgress: ModelLoadProgress = { progress: 0, text: '' };
  private error: string | null = null;
  private isOfflineReady: boolean = false;
  private listeners: Set<StateListener> = new Set();

  private activeGenerationResolve: ((text: string) => void) | null = null;
  private activeGenerationReject: ((err: Error) => void) | null = null;
  private onTokenCallback: ((token: string, accumulated: string) => void) | null = null;
  private onStatsCallback: ((stats: GenerationStats) => void) | null = null;

  private constructor() {
    this.checkOfflineCache();
  }

  public static getInstance(): WebLLMService {
    if (!WebLLMService.instance) {
      WebLLMService.instance = new WebLLMService();
    }
    return WebLLMService.instance;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): WebLLMServiceState {
    return {
      status: this.status,
      currentModel: this.currentModelId ? MODEL_REGISTRY[this.currentModelId] || null : null,
      loadProgress: this.loadProgress,
      error: this.error,
      isOfflineReady: this.isOfflineReady,
    };
  }

  private notifyStateChange(): void {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  public isInitialized(): boolean {
    return this.status === 'ready' || this.status === 'generating';
  }

  public getLoadedModel(): ModelMetadata | null {
    return this.currentModelId ? MODEL_REGISTRY[this.currentModelId] || null : null;
  }

  private initWorker(): Worker {
    if (this.worker) return this.worker;

    try {
      this.worker = new Worker(
        new URL('./inference-worker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = (event: MessageEvent) => {
        this.handleWorkerMessage(event.data);
      };

      this.worker.onerror = (err) => {
        console.error('Inference Worker Error:', err);
        this.status = 'error';
        this.error = `Error en el worker de inferencia: ${err.message || 'Fallo desconocido'}`;
        this.notifyStateChange();
      };

      return this.worker;
    } catch (err) {
      console.error('Failed to create Web Worker:', err);
      throw new Error(`No se pudo inicializar el worker: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private handleWorkerMessage(data: { type: string; payload?: unknown }): void {
    const { type, payload } = data;

    switch (type) {
      case 'INIT_PROGRESS': {
        const p = payload as { progress: number; text: string };
        this.loadProgress = {
          progress: p.progress,
          text: p.text,
        };
        this.notifyStateChange();
        break;
      }

      case 'INIT_SUCCESS': {
        this.status = 'ready';
        this.error = null;
        this.loadProgress = { progress: 1, text: 'Modelo cargado y listo para usar.' };
        this.isOfflineReady = true;
        this.notifyStateChange();
        break;
      }

      case 'INIT_ERROR': {
        const p = payload as { error: string };
        this.handleModelLoadFailure(p.error);
        break;
      }

      case 'TOKEN': {
        const p = payload as { id: string; token: string; accumulated: string };
        if (this.onTokenCallback) {
          this.onTokenCallback(p.token, p.accumulated);
        }
        break;
      }

      case 'GENERATE_COMPLETE': {
        const p = payload as { id: string; finalContent: string; stats: GenerationStats };
        this.status = 'ready';
        if (this.onStatsCallback) {
          this.onStatsCallback(p.stats);
        }
        if (this.activeGenerationResolve) {
          this.activeGenerationResolve(p.finalContent);
          this.activeGenerationResolve = null;
        }
        this.notifyStateChange();
        break;
      }

      case 'GENERATE_ERROR': {
        const p = payload as { id: string; error: string };
        this.status = 'ready';
        if (this.activeGenerationReject) {
          this.activeGenerationReject(new Error(p.error));
          this.activeGenerationReject = null;
        }
        this.notifyStateChange();
        break;
      }

      case 'UNLOAD_SUCCESS': {
        this.status = 'unloaded';
        this.currentModelId = null;
        this.notifyStateChange();
        break;
      }
    }
  }

  /**
   * Adaptive degradation: If standard model runs out of memory or fails to compile in WebGPU,
   * step down to next model in ADAPTIVE_FALLBACK_CHAIN (Law 2: strictly local fallback).
   */
  private async handleModelLoadFailure(errorMessage: string): Promise<void> {
    console.warn(`Model loading failed for ${this.currentModelId}: ${errorMessage}`);

    const currentIndex = ADAPTIVE_FALLBACK_CHAIN.indexOf(this.currentModelId || '');
    const nextModelId = currentIndex >= 0 && currentIndex + 1 < ADAPTIVE_FALLBACK_CHAIN.length
      ? ADAPTIVE_FALLBACK_CHAIN[currentIndex + 1]
      : null;

    if (nextModelId) {
      console.info(`Degrading gracefully to lighter local model: ${nextModelId}`);
      this.loadProgress = {
        progress: 0.1,
        text: `Ajustando a modelo local más liviano (${MODEL_REGISTRY[nextModelId]?.name || nextModelId})...`,
      };
      this.notifyStateChange();
      await this.loadModel(nextModelId);
    } else {
      this.status = 'incompatible';
      this.error = `No fue posible ejecutar los modelos locales en este dispositivo: ${errorMessage}`;
      this.notifyStateChange();
    }
  }

  public async loadModel(modelId: string = DEFAULT_MODEL_ID): Promise<void> {
    this.status = 'loading';
    this.currentModelId = modelId;
    this.error = null;
    this.loadProgress = { progress: 0.01, text: 'Iniciando WebGPU y preparando entorno local...' };
    this.notifyStateChange();

    try {
      const worker = this.initWorker();
      worker.postMessage({
        type: 'INIT',
        payload: { modelId },
      });
    } catch (err) {
      this.status = 'error';
      this.error = err instanceof Error ? err.message : String(err);
      this.notifyStateChange();
      throw err;
    }
  }

  public async unloadModel(): Promise<void> {
    if (this.worker) {
      this.worker.postMessage({ type: 'UNLOAD' });
    }
    this.status = 'unloaded';
    this.currentModelId = null;
    this.notifyStateChange();
  }

  public generateStream(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    options: {
      maxTokens?: number;
      temperature?: number;
      topP?: number;
      onToken: (token: string, accumulated: string) => void;
      onStats?: (stats: GenerationStats) => void;
    }
  ): Promise<string> {
    if (!this.isInitialized() || !this.worker) {
      return Promise.reject(new Error('El modelo de IA local no está inicializado.'));
    }

    this.status = 'generating';
    this.notifyStateChange();

    this.onTokenCallback = options.onToken;
    this.onStatsCallback = options.onStats || null;

    const reqId = `gen_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    return new Promise<string>((resolve, reject) => {
      this.activeGenerationResolve = resolve;
      this.activeGenerationReject = reject;

      this.worker!.postMessage({
        type: 'GENERATE',
        payload: {
          id: reqId,
          messages,
          options: {
            maxTokens: options.maxTokens,
            temperature: options.temperature,
            topP: options.topP,
          },
        },
      });
    });
  }

  public interrupt(): void {
    if (this.worker) {
      this.worker.postMessage({ type: 'INTERRUPT' });
    }
    this.status = 'ready';
    this.notifyStateChange();
  }

  /**
   * Check if model weights are cached locally for offline readiness.
   */
  public async checkOfflineCache(): Promise<boolean> {
    if (typeof caches === 'undefined') return false;
    try {
      const cacheNames = await caches.keys();
      const hasWebLLMCache = cacheNames.some(
        (name) => name.includes('webllm') || name.includes('mlc')
      );
      this.isOfflineReady = hasWebLLMCache;
      this.notifyStateChange();
      return hasWebLLMCache;
    } catch {
      return false;
    }
  }
}

export const webLLMService = WebLLMService.getInstance();
