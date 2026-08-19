/**
 * SAMUEL CORE - Explainability Engine
 * 
 * Generates transparent, concise answers to "¿Por qué preguntaste eso?".
 * Follows Section 11: adds understanding without adding latency or technical jargon.
 */

import { StrategyDirective } from './question-strategy';
import { ContradictionFinding } from './contradiction';

export class ExplainabilityEngine {
  /**
   * Produce the rationale text attached to a response.
   */
  public generateRationale(
    strategy: StrategyDirective,
    contradiction: ContradictionFinding,
    userText: string
  ): string {
    if (contradiction.detected && contradiction.rationale) {
      return contradiction.rationale;
    }

    if (strategy.rationale) {
      return strategy.rationale;
    }

    const lower = userText.toLowerCase();
    if (lower.includes('harto') || lower.includes('trabajo')) {
      return 'Te lo pregunté para delimitar qué es exactamente lo que ya no soportás y no quedarnos en el malestar general.';
    }

    return 'Te lo pregunté para poner el foco en lo que está en tu control y clarificar lo que realmente necesitás ahora.';
  }
}
