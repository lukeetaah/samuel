import { describe, it, expect, beforeEach } from 'vitest';
import { SocraticSolver } from '../core/socratic-solver';

describe('SocraticSolver - Real Problem-Solving Dialogue', () => {
  let solver: SocraticSolver;

  beforeEach(() => {
    solver = new SocraticSolver();
  });

  it('solves the exact user sequence with precision, sharp insight and zero repetition', () => {
    // Turn 1: Starter
    const t1 = solver.solve('Necesito pensar algo.', 1);
    expect(t1.themeId).toBe('starter_thinking');
    expect(t1.fullResponse).not.toContain('¿Cómo puedo ayudarte hoy?');
    expect(t1.question).toContain('pesando');

    // Turn 2: Coping with hated job
    const t2 = solver.solve('como hago para no renunciar al trabajo que odio?', 2);
    expect(t2.themeId).toBe('coping_hated_job');
    expect(t2.fullResponse).toContain('preservación mental');
    expect(t2.question).toContain('drena');

    // Turn 3: Salary vs Workload Dilemma
    const t3 = solver.solve(
      'Es que siento que cobro poco y donde voy a buscar me harían laburar mucho más de lo que laburo hoy día',
      3
    );
    expect(t3.themeId).toBe('salary_vs_workload_dilemma');
    expect(t3.fullResponse).toContain('verdadero dilema');
    expect(t3.fullResponse).toContain('sueldo bajo');
    expect(t3.question).toContain('comodidad');
    expect(t3.fullResponse).not.toBe(t2.fullResponse);
    expect(t3.fullResponse).not.toBe(t1.fullResponse);
  });

  it('solves travel dilemma and decision paralysis', () => {
    const t1 = solver.solve('quiero irme de viaje y no me animo', 1);
    expect(t1.themeId).toBe('travel_fear');
    expect(t1.fullResponse).toContain('viaje');

    const t2 = solver.solve('comprar el pasaje o elegir el destino, no se', 2);
    expect(t2.themeId).toBe('travel_execution');
    expect(t2.fullResponse).toContain('pasaje');
  });
});
