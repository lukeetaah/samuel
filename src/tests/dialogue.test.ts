import { describe, it, expect, beforeEach } from 'vitest';
import { DialogueEngine } from '../core/dialogue-engine';

describe('DialogueEngine - Real Psychological Precision', () => {
  let engine: DialogueEngine;

  beforeEach(() => {
    engine = new DialogueEngine();
  });

  it('handles the exact 4-turn chess match sequence with zero repetition and deep active listening', () => {
    // Turn 1: Constructive dismissal setup
    const t1 = engine.processTurn(
      'quiero renunciar pero mi jefe quiere que renuncie y en realidad no quiero renunciar, pero lo debo hacer porque me siguen asignando cosas para hacer mas y mas dificiles para que me equivoque y me apretan todas juntas',
      1
    );
    expect(t1.intentId).toBe('constructive_dismissal_setup');
    expect(t1.fullResponse).toContain('empujando deliberadamente al error');
    expect(t1.question).toContain('sobreexigiéndote');

    // Turn 2: "que me echen.."
    const t2 = engine.processTurn('que me echen..', 2);
    expect(t2.intentId).toBe('want_to_be_fired');
    expect(t2.fullResponse).toContain('paguen el costo del despido');
    expect(t2.fullResponse).not.toBe(t1.fullResponse);

    // Turn 3: "mis proyectos"
    const t3 = engine.processTurn('mis proyectos', 3);
    expect(t3.intentId).toBe('personal_projects');
    expect(t3.fullResponse).toContain('cabeza en lo propio');
    expect(t3.fullResponse).not.toBe(t2.fullResponse);
    expect(t3.fullResponse).not.toBe(t1.fullResponse);

    // Turn 4: "Irme a andar en bici despues del trabajo de mierda que tengo"
    const t4 = engine.processTurn('Irme a andar en bici despues del trabajo de mierda que tengo', 4);
    expect(t4.intentId).toBe('decompression_ritual');
    expect(t4.fullResponse).toContain('La bici es tu cable a tierra');
    expect(t4.question).toContain('pedaleando');
    expect(t4.fullResponse).not.toBe(t3.fullResponse);
    expect(t4.fullResponse).not.toBe(t2.fullResponse);
    expect(t4.fullResponse).not.toBe(t1.fullResponse);
  });
});
