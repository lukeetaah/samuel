import { describe, it, expect, beforeEach } from 'vitest';
import { DialogueEngine } from '../core/dialogue-engine';

describe('DialogueEngine - 7-Turn Real Multi-Turn Dialectic Continuity', () => {
  let engine: DialogueEngine;

  beforeEach(() => {
    engine = new DialogueEngine();
  });

  it('handles the exact 7-turn burnout and boss sequence with zero repetition and deep active listening', () => {
    // Turn 1: "quiero renunciar"
    const t1 = engine.processTurn('quiero renunciar', 1);
    expect(t1.intentId).toBe('resignation_initial');
    expect(t1.fullResponse).toContain('síntoma de que tu cabeza ya se fue');
    expect(t1.question).toContain('puntual');

    // Turn 2: "vacaciones xD" (Escapism humor)
    const t2 = engine.processTurn('vacaciones xD', 2);
    expect(t2.intentId).toBe('work_escapism');
    expect(t2.fullResponse).toContain('el lunes siguiente volvés exactamente al mismo pozo');
    expect(t2.fullResponse).not.toBe(t1.fullResponse);

    // Turn 3: "no, es que vuelvo a lo mismo que detesto" (Routine hatred)
    const t3 = engine.processTurn('no, es que vuelvo a lo mismo que detesto', 3);
    expect(t3.intentId).toBe('routine_hatred');
    expect(t3.fullResponse).toContain('sensación de trampa');
    expect(t3.fullResponse).not.toBe(t2.fullResponse);

    // Turn 4: "que necesito el sueldo de mierda que me pagan" (Financial trap)
    const t4 = engine.processTurn('que necesito el sueldo de mierda que me pagan', 4);
    expect(t4.intentId).toBe('financial_trap');
    expect(t4.fullResponse).toContain('peor negocio posible');
    expect(t4.fullResponse).toContain('salud');
    expect(t4.fullResponse).not.toBe(t3.fullResponse);

    // Turn 5: "cumplo mi horario y no dejo que me invadan la vida pero cada vez me la complican mas con el burnout"
    const t5 = engine.processTurn(
      'cumplo mi horario y no dejo que me invadan la vida pero cada vez me la complican mas con el burnout',
      5
    );
    expect(t5.intentId).toBe('schedule_vs_burnout');
    expect(t5.fullResponse).toContain('horario a rajatabla');
    expect(t5.fullResponse).not.toBe(t4.fullResponse);

    // Turn 6: "Todo eso y más" (Confirmed physical symptoms)
    const t6 = engine.processTurn('Todo eso y más', 6);
    expect(t6.intentId).toBe('confirmed_symptoms');
    expect(t6.fullResponse).toContain('gritando en todos los frentes');
    expect(t6.question).toContain('cuerpo roto');
    expect(t6.fullResponse).not.toBe(t5.fullResponse);
    expect(t6.fullResponse).not.toBe(t1.fullResponse);

    // Turn 7: "Que me deje de molestar TANTo la existencia de mi jefe" (Boss fixation & disengagement)
    const t7 = engine.processTurn('Que me deje de molestar TANTo la existencia de mi jefe', 7);
    expect(t7.intentId).toBe('boss_fixation');
    expect(t7.fullResponse).toContain('dueño de tu humor');
    expect(t7.question).toContain('mueble');
    expect(t7.fullResponse).not.toBe(t6.fullResponse);
    expect(t7.fullResponse).not.toBe(t3.fullResponse);
  });
});
