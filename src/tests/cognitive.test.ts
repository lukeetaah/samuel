import { describe, it, expect, beforeEach } from 'vitest';
import { CognitiveEngine } from '../core/cognitive-engine';

describe('CognitiveEngine - Non-Repeating Deep Trajectory', () => {
  let engine: CognitiveEngine;

  beforeEach(() => {
    engine = new CognitiveEngine();
  });

  it('detects office alienation conflict and extracts entities accurately', () => {
    const text = 'me ignoran mis compañeros en la oficina (son 3 y 1 me da bola pero los otros 2 son frios)';
    const parsed = engine.parseInput(text);

    expect(parsed.hasAlienationConflict).toBe(true);
    expect(parsed.actors).toContain('tus compañeros');
    expect(parsed.actors).toContain('el grupo');
  });

  it('synthesizes non-repeating progressive trajectories across consecutive turns', () => {
    // Turn 1: Resignation
    const t1 = engine.synthesizeTurn('quiero renunciar', 1, []);
    expect(t1.exploredFacet).toBe('relief_vs_fear');
    expect(t1.fullResponse).not.toContain('Entiendo tu situación');
    expect(t1.fullResponse).not.toContain('¡Claro!');

    // Turn 2: Boss hostility
    const t2 = engine.synthesizeTurn('mi jefe me hace la vida imposible', 2, [
      { user: 'quiero renunciar', assistant: t1.fullResponse },
    ]);
    expect(t2.exploredFacet).toBe('power_vs_agency');
    expect(t2.fullResponse).not.toBe(t1.fullResponse);
    expect(t2.question).not.toBe(t1.question);

    // Turn 3: Coworker alienation
    const t3 = engine.synthesizeTurn(
      'mis 3 compañeros me ignoran, son fríos y los odio',
      3,
      [
        { user: 'quiero renunciar', assistant: t1.fullResponse },
        { user: 'mi jefe me hace la vida imposible', assistant: t2.fullResponse },
      ]
    );
    expect(t3.exploredFacet).toBe('alienation_weight');
    expect(t3.fullResponse).not.toBe(t2.fullResponse);
    expect(t3.fullResponse).not.toBe(t1.fullResponse);
  });
});
