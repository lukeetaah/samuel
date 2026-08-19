/**
 * SAMUEL CORE - Contradiction & Ambivalence Detection
 * 
 * Identifies dualities, opposing desires, or stated paradoxes.
 * Presents them with tact and humility, never as definitive diagnoses.
 */

export interface ContradictionFinding {
  detected: boolean;
  type?: 'want_leave_vs_want_fix' | 'say_fine_vs_express_pain' | 'blame_others_vs_guilt' | 'desire_change_vs_fear_action';
  observationPhrase: string;
  rationale: string;
}

export class ContradictionDetector {
  /**
   * Scan conversation turns for emotional ambivalence or conflicting intentions.
   */
  public analyze(turnsText: string, latestMessage: string): ContradictionFinding {
    const fullText = (turnsText + ' ' + latestMessage).toLowerCase();

    // 1. Want to leave vs want to stay/fix
    const hasLeaveSignal = /\b(irme|renunciar|dejar|separarme|cortar|escapar|basta)\b/.test(fullText);
    const hasFixSignal = /\b(arreglarlo|cambien|me entiendan|mejore|hacer que|esperar|aguantar)\b/.test(fullText);

    if (hasLeaveSignal && hasFixSignal) {
      return {
        detected: true,
        type: 'want_leave_vs_want_fix',
        observationPhrase: 'Decís que querés irte o terminarlo, pero también estás buscando cómo conseguir que cambien las cosas. Puede que todavía estés oscilando entre esas dos alternativas.',
        rationale: 'Señalar que hay dos impulsos opuestos: el deseo de salir de la situación y la esperanza simultánea de que se resuelva.',
      };
    }

    // 2. Desire change vs fear of taking action / self-sabotage
    const hasChangeDesire = /\b(quiero cambiar|necesito algo nuevo|no puedo seguir así)\b/.test(fullText);
    const hasParalysis = /\b(pero no puedo|tengo miedo|es imposible|no me animo|qué van a decir)\b/.test(fullText);

    if (hasChangeDesire && hasParalysis) {
      return {
        detected: true,
        type: 'desire_change_vs_fear_action',
        observationPhrase: 'Hay una parte tuya que tiene claro que esto no va más, y otra que encuentra riesgos muy altos en dar el paso.',
        rationale: 'Poner en palabras el conflicto entre la necesidad de cambio y el costo percibido de darlo.',
      };
    }

    // 3. Saying "it's not important" while describing heavy emotional impact
    const minimizes = /\b(no importa|da igual|es una tontería|no debería quejarme)\b/.test(fullText);
    const suffers = /\b(llorar|no duermo|me duele|angustia|desespera|obsesiona)\b/.test(fullText);

    if (minimizes && suffers) {
      return {
        detected: true,
        type: 'say_fine_vs_express_pain',
        observationPhrase: 'Por un lado decís que no debería importarte tanto, pero por el otro el malestar que te genera es real y cotidiano.',
        rationale: 'Mostrar el contraste entre intentar restarle importancia mentalmente y el impacto real que estás sintiendo.',
      };
    }

    return {
      detected: false,
      observationPhrase: '',
      rationale: '',
    };
  }
}
