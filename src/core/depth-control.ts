/**
 * SAMUEL CORE - Depth & Rhythm Control
 * 
 * Ensures responses have natural conversational pacing:
 * - Avoids artificial 700-word walls of text.
 * - Calibrates output budget based on user input length and context.
 * - Enforces conciseness, precision, and space for user reflection.
 */

import { DepthGuideline } from './types';

export class DepthControl {
  /**
   * Determine word budget and style guidelines for the next turn.
   */
  public calculateGuideline(userText: string, _turnIndex?: number): DepthGuideline {
    const wordCount = userText.trim().split(/\s+/).length;

    // 1. Ultra-short input (1-6 words: "Hola", "Estoy harto", "No sé qué me pasa")
    if (wordCount <= 6) {
      return {
        maxWords: 45,
        sentenceCount: 2,
        pacing: 'brief',
        toneGuidance: 'Respondé en 1 o 2 frases breves y directas. No agregues relleno explicativo ni introducciones formales.',
      };
    }

    // 2. Medium input (7-40 words)
    if (wordCount <= 40) {
      return {
        maxWords: 80,
        sentenceCount: 3,
        pacing: 'moderate',
        toneGuidance: 'Respondé en 2 o 3 oraciones reflexivas. Enfocate en una sola pregunta o señalamiento clave.',
      };
    }

    // 3. Long / Expressive input (40+ words)
    return {
      maxWords: 120,
      sentenceCount: 4,
      pacing: 'expansive',
      toneGuidance: 'Respondé sintetizando el punto central en 3 o 4 oraciones claras. Evitá listas largas y no des consejos no solicitados.',
    };
  }
}
