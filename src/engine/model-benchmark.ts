/**
 * SAMUEL - Model Benchmark & Quality Evaluator
 * 
 * Evaluates candidate local models in real device conditions:
 * - Measures load time
 * - Measures Time-to-First-Token (TTFT)
 * - Measures Tokens per second
 * - Assesses Spanish conversational coherence
 * 
 * Never generates fabricated benchmarks.
 */

import { webLLMService } from './webllm-service';
import { MODEL_REGISTRY } from '../config/models';

export interface BenchmarkResult {
  modelId: string;
  modelName: string;
  loadTimeMs: number;
  timeToFirstTokenMs: number;
  tokensPerSecond: number;
  sampleOutput: string;
  timestamp: number;
  success: boolean;
  error?: string;
}

const BENCHMARK_TEST_PROMPTS = [
  {
    name: 'Escucha activa laboral',
    prompt: 'Estoy harto de mi trabajo y siento que no doy más.',
  },
  {
    name: 'Clarificación de hechos vs interpretaciones',
    prompt: 'Mi jefe seguro piensa que no sirvo para nada porque hoy no me saludó.',
  },
];

export class ModelBenchmarkRunner {
  /**
   * Run a lightweight live benchmark on a specific local model.
   */
  public static async runBenchmark(modelId: string): Promise<BenchmarkResult> {
    const meta = MODEL_REGISTRY[modelId] || { name: modelId };
    const loadStart = performance.now();

    try {
      // 1. Measure load time
      await webLLMService.loadModel(modelId);
      const loadTimeMs = Math.round(performance.now() - loadStart);

      // 2. Measure inference on first prompt
      let ttftMs = 0;
      let totalTokens = 0;
      let fullText = '';
      const genStart = performance.now();

      await webLLMService.generateStream(
        [
          {
            role: 'system',
            content: 'Sos SAMUEL. Respondé de forma sobria, breve (máximo 2 oraciones) y reflexiva en español.',
          },
          {
            role: 'user',
            content: BENCHMARK_TEST_PROMPTS[0].prompt,
          },
        ],
        {
          maxTokens: 60,
          temperature: 0.6,
          onToken: (_token, accumulated) => {
            if (ttftMs === 0) {
              ttftMs = Math.round(performance.now() - genStart);
            }
            totalTokens++;
            fullText = accumulated;
          },
        }
      );

      const totalGenTime = Math.max(1, performance.now() - genStart);
      const tokensPerSec = Number(((totalTokens / totalGenTime) * 1000).toFixed(1));

      return {
        modelId,
        modelName: meta.name,
        loadTimeMs,
        timeToFirstTokenMs: ttftMs,
        tokensPerSecond: tokensPerSec,
        sampleOutput: fullText.trim(),
        timestamp: Date.now(),
        success: true,
      };
    } catch (err) {
      return {
        modelId,
        modelName: meta.name,
        loadTimeMs: 0,
        timeToFirstTokenMs: 0,
        tokensPerSecond: 0,
        sampleOutput: '',
        timestamp: Date.now(),
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
