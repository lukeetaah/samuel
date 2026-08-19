/**
 * SAMUEL - WebLLM Inference Web Worker
 * 
 * Runs local LLM inference in a dedicated background thread to keep
 * the UI silky smooth, fully interactive, and 60fps responsive.
 */

import { MLCEngine, InitProgressReport } from '@mlc-ai/web-llm';

let engine: MLCEngine | null = null;
let isGenerating = false;
let abortRequested = false;

self.onmessage = async (event: MessageEvent) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'INIT': {
      try {
        const { modelId } = payload;

        if (engine) {
          try {
            await engine.unload();
          } catch {
            // Ignore previous unload error
          }
          engine = null;
        }

        engine = new MLCEngine();
        engine.setInitProgressCallback((report: InitProgressReport) => {
          self.postMessage({
            type: 'INIT_PROGRESS',
            payload: {
              progress: report.progress,
              text: report.text,
            },
          });
        });

        await engine.reload(modelId);

        self.postMessage({
          type: 'INIT_SUCCESS',
          payload: { modelId },
        });
      } catch (err) {
        self.postMessage({
          type: 'INIT_ERROR',
          payload: { error: err instanceof Error ? err.message : String(err) },
        });
      }
      break;
    }

    case 'GENERATE': {
      if (!engine) {
        self.postMessage({
          type: 'GENERATE_ERROR',
          payload: { id: payload.id, error: 'Motor de inferencia no inicializado.' },
        });
        return;
      }

      isGenerating = true;
      abortRequested = false;
      const { id, messages, options } = payload;
      const startTime = performance.now();
      let firstTokenTime = 0;
      let promptTokens = 0;
      let completionTokens = 0;
      let accumulated = '';

      try {
        const stream = await engine.chat.completions.create({
          messages: messages,
          temperature: options?.temperature ?? 0.65,
          top_p: options?.topP ?? 0.85,
          max_tokens: options?.maxTokens ?? 200,
          stream: true,
          stream_options: { include_usage: true },
        });

        for await (const chunk of stream) {
          if (abortRequested) {
            break;
          }

          const delta = chunk.choices[0]?.delta?.content || '';
          if (delta) {
            if (completionTokens === 0) {
              firstTokenTime = performance.now();
            }
            completionTokens++;
            accumulated += delta;

            self.postMessage({
              type: 'TOKEN',
              payload: {
                id,
                token: delta,
                accumulated,
              },
            });
          }

          if (chunk.usage) {
            promptTokens = chunk.usage.prompt_tokens;
          }
        }

        const endTime = performance.now();
        const totalTimeMs = Math.max(1, endTime - startTime);
        const ttftMs = firstTokenTime > 0 ? Math.round(firstTokenTime - startTime) : 0;
        const tokensPerSecond = completionTokens > 0 ? Number(((completionTokens / totalTimeMs) * 1000).toFixed(1)) : 0;

        self.postMessage({
          type: 'GENERATE_COMPLETE',
          payload: {
            id,
            finalContent: accumulated,
            stats: {
              promptTokens,
              completionTokens,
              timeToFirstTokenMs: ttftMs,
              totalTimeMs: Math.round(totalTimeMs),
              tokensPerSecond,
            },
          },
        });
      } catch (err) {
        self.postMessage({
          type: 'GENERATE_ERROR',
          payload: { id, error: err instanceof Error ? err.message : String(err) },
        });
      } finally {
        isGenerating = false;
      }
      break;
    }

    case 'INTERRUPT': {
      abortRequested = true;
      if (engine && isGenerating) {
        try {
          await engine.interruptGenerate();
        } catch {
          // Ignore interrupt error
        }
      }
      break;
    }

    case 'UNLOAD': {
      if (engine) {
        try {
          await engine.unload();
        } catch {
          // Ignore unload error
        }
        engine = null;
      }
      self.postMessage({ type: 'UNLOAD_SUCCESS' });
      break;
    }

    default:
      console.warn('Unknown worker message:', type);
  }
};
