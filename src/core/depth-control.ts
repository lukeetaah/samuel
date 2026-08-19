/**
 * SAMUEL CORE - Depth & Rhythm Control
 * 
 * OPTIMIZED: Reduced word budgets drastically for speed.
 * Shorter toneGuidance strings to save prompt tokens.
 */

import { DepthGuideline } from './types';

export class DepthControl {
  public calculateGuideline(userText: string, _turnIndex?: number): DepthGuideline {
    const wordCount = userText.trim().split(/\s+/).length;

    // Ultra-short input (1-6 words)
    if (wordCount <= 6) {
      return {
        maxWords: 25,
        sentenceCount: 2,
        pacing: 'brief',
        toneGuidance: 'Máximo 2 frases breves.',
      };
    }

    // Medium input (7-40 words)
    if (wordCount <= 40) {
      return {
        maxWords: 35,
        sentenceCount: 2,
        pacing: 'moderate',
        toneGuidance: 'Máximo 2 oraciones + 1 pregunta.',
      };
    }

    // Long input (40+ words)
    return {
      maxWords: 45,
      sentenceCount: 3,
      pacing: 'expansive',
      toneGuidance: 'Sintetizá en 3 oraciones claras.',
    };
  }
}
