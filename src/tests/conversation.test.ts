/**
 * SAMUEL Test Suite - Conversational Strategies & Core Logic
 * 
 * Verifies question strategies, facts vs interpretations, contradiction detection,
 * depth control, and explainability rationale.
 */

import { describe, it, expect } from 'vitest';
import { SamuelEngine } from '../core/samuel-engine';
import { QuestionStrategy } from '../core/question-strategy';
import { ContradictionDetector } from '../core/contradiction';
import { DepthControl } from '../core/depth-control';
import { SessionMemory } from '../core/types';

describe('SAMUEL CORE Conversational Logic', () => {
  const engine = new SamuelEngine();
  const questionStrategy = new QuestionStrategy();
  const contradictionDetector = new ContradictionDetector();
  const depthControl = new DepthControl();

  const mockMemory: SessionMemory = {
    sessionId: 'test_session',
    startTime: Date.now(),
    totalTurns: 2,
    primaryGoal: 'general_dialogue',
    keyFacts: [],
    keyFeelings: [],
    userStatedDesires: [],
    apparentContradictions: [],
    pacingLevel: 'balanced',
  };

  describe('Question Strategy', () => {
    it('focuses on underlying friction when user is exhausted/overwhelmed', () => {
      const plan = questionStrategy.evaluateStrategy('Estoy harto de mi trabajo', mockMemory, 1);
      expect(plan.focusArea).toBe('underlying_friction');
      expect(plan.rationale).toContain('colmó');
    });

    it('redirects to user agency when user talks predominantly about other people', () => {
      const plan = questionStrategy.evaluateStrategy(
        'Mi jefe siempre me ignora y ellos nunca me avisan cuando hay reuniones importantes',
        mockMemory,
        3
      );
      expect(plan.focusArea).toBe('user_agency');
      expect(plan.rationale).toContain('postura');
    });

    it('separates facts from interpretations when user makes absolute mind-reading claims', () => {
      const plan = questionStrategy.evaluateStrategy(
        'Obviamente mi compañero lo hace a propósito para perjudicarme',
        mockMemory,
        2
      );
      expect(plan.focusArea).toBe('facts_vs_interpretations');
      expect(plan.rationale).toContain('hechos');
    });
  });

  describe('Contradiction Detection', () => {
    it('detects wanting to leave vs wanting to stay/fix things', () => {
      const history = 'U: Quiero renunciar y mandar todo al diablo.';
      const latest = 'Pero estoy buscando cómo hacer que mi jefe cambie y arreglarlo.';
      const result = contradictionDetector.analyze(history, latest);

      expect(result.detected).toBe(true);
      expect(result.type).toBe('want_leave_vs_want_fix');
      expect(result.observationPhrase).toContain('Decís que querés irte');
    });

    it('detects wanting change vs feeling paralyzed by fear', () => {
      const history = 'U: Necesito algo nuevo en mi vida.';
      const latest = 'Pero tengo miedo y no puedo arriesgarme.';
      const result = contradictionDetector.analyze(history, latest);

      expect(result.detected).toBe(true);
      expect(result.type).toBe('desire_change_vs_fear_action');
    });
  });

  describe('Depth Control', () => {
    it('enforces brief 1-2 sentence response budget on ultra-short user input', () => {
      const guideline = depthControl.calculateGuideline('Hola.', 1);
      expect(guideline.pacing).toBe('brief');
      expect(guideline.sentenceCount).toBeLessThanOrEqual(2);
      expect(guideline.maxWords).toBeLessThanOrEqual(50);
    });

    it('allocates moderate budget on medium user input without wall of text', () => {
      const guideline = depthControl.calculateGuideline(
        'Ayer tuve una discusión fuerte con mi hermano sobre la herencia familiar y no sé cómo seguir.',
        2
      );
      expect(guideline.pacing).toBe('moderate');
      expect(guideline.maxWords).toBeLessThanOrEqual(100);
    });
  });

  describe('Explainability Engine ("¿Por qué preguntaste eso?")', () => {
    it('generates a concise rationale attached to the turn plan', () => {
      const plan = engine.prepareTurn('Estoy harto de mi trabajo');
      expect(plan.rationale).toBeTruthy();
      expect(typeof plan.rationale).toBe('string');
      expect(plan.rationale.length).toBeGreaterThan(15);
    });
  });

  describe('Session Lifecycle & In-Memory Principle', () => {
    it('resets in-memory conversation state completely without leaving residue', () => {
      engine.registerTurnOutput('Hola', 'Hola. ¿Qué tenés en mente?', 'Apertura');
      expect(engine.getState().getMessages().length).toBe(2);

      engine.resetSession();
      expect(engine.getState().getMessages().length).toBe(0);
      expect(engine.getState().getTurns().length).toBe(0);
    });
  });
});
