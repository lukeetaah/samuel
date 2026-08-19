import { describe, it, expect, beforeEach } from 'vitest';
import { CognitiveEngine } from '../core/cognitive-engine';

describe('CognitiveEngine - Multi-Turn Dialectical Active Listening', () => {
  let engine: CognitiveEngine;

  beforeEach(() => {
    engine = new CognitiveEngine();
  });

  it('accurately parses micro-themes including spite, money, market fear, humor and armor', () => {
    const p1 = engine.parseInput('no darles el gusto y que necesito la guita');
    expect(p1.hasMoneyTie).toBe(true);
    expect(p1.hasSpiteOrPride).toBe(true);

    const p2 = engine.parseInput('que no consigo laburo tampoco fuera de acá');
    expect(p2.hasMarketOrNoJobFear).toBe(true);

    const p3 = engine.parseInput('que ya ni me hablen xD');
    expect(p3.hasArmorOrApathy).toBe(true);
    expect(p3.hasDefensiveHumor).toBe(true);
  });

  it('runs the full realistic 5-turn burnout sequence with zero repetition and sharp active listening', () => {
    // Turn 1: Resignation + Boss Burnout
    const t1 = engine.synthesizeTurn('quiero renunciar porque mi jefe me hace burnout', 1);
    expect(t1.exploredTheme).toBe('boss_burnout');
    expect(t1.fullResponse).toContain('autoridad');
    expect(t1.question).toContain('orgullo');

    // Turn 2: Spite + Money
    const t2 = engine.synthesizeTurn('no darles el gusto y que necesito la guita', 2);
    expect(t2.exploredTheme).toBe('spite_money');
    expect(t2.fullResponse).toContain('guita');
    expect(t2.fullResponse).not.toBe(t1.fullResponse);
    expect(t2.question).not.toBe(t1.question);

    // Turn 3: Can't find work outside
    const t3 = engine.synthesizeTurn('que no consigo laburo tampoco fuera de acá', 3);
    expect(t3.exploredTheme).toBe('market_lockin');
    expect(t3.fullResponse).toContain('candado');
    expect(t3.fullResponse).not.toBe(t2.fullResponse);
    expect(t3.fullResponse).not.toBe(t1.fullResponse);

    // Turn 4: "que ya ni me hablen xD" (Armor + Humor)
    const t4 = engine.synthesizeTurn('que ya ni me hablen xD', 4);
    expect(t4.exploredTheme).toBe('armor_defense');
    expect(t4.fullResponse).toContain('invisible');
    expect(t4.fullResponse).not.toBe(t3.fullResponse);
    expect(t4.fullResponse).not.toBe(t2.fullResponse);

    // Turn 5: "aprender a que no me molesten" (Tactical Boundary Setting)
    const t5 = engine.synthesizeTurn('aprender a que no me molesten', 5);
    expect(t5.exploredTheme).toBe('tactical_boundary');
    expect(t5.fullResponse).not.toBe(t4.fullResponse);
    expect(t5.fullResponse).not.toBe(t3.fullResponse);
    expect(t5.fullResponse).not.toBe(t2.fullResponse);
  });
});
