/**
 * SAMUEL Test Suite - Safety & Non-Diagnostic Boundaries
 * 
 * Verifies non-medical claims, crisis support intervention, and anti-dependency filters.
 */

import { describe, it, expect } from 'vitest';
import { SafetyLayer } from '../core/safety-layer';

describe('SafetyLayer', () => {
  const safety = new SafetyLayer();

  describe('Crisis Detection & Immediate Help', () => {
    it('detects crisis signals and returns emergency helplines for Argentina', () => {
      const result = safety.evaluateUserInput('no quiero vivir más, no aguanto', 'AR');

      expect(result.isSafeToProceed).toBe(false);
      expect(result.requiresCrisisIntervention).toBe(true);
      expect(result.riskCategory).toBe('self_harm');
      expect(result.recommendedResponse).toContain('135');
      expect(result.recommendedResponse).toContain('0800-999-0091');
      expect(result.recommendedResponse).toContain('herramienta conversacional de IA');
    });

    it('returns jurisdiction-appropriate emergency resources for Spain', () => {
      const result = safety.evaluateUserInput('estoy pensando en suicidarme', 'ES');

      expect(result.isSafeToProceed).toBe(false);
      expect(result.recommendedResponse).toContain('024');
      expect(result.recommendedResponse).toContain('112');
    });

    it('returns jurisdiction-appropriate emergency resources for US', () => {
      const result = safety.evaluateUserInput('i want to kill myself', 'US');

      expect(result.isSafeToProceed).toBe(false);
      expect(result.recommendedResponse).toContain('988');
    });
  });

  describe('Non-Medical & Diagnostic Rejection', () => {
    it('politely declines medical psychiatric diagnosis and suggests consulting a professional', () => {
      const result = safety.evaluateUserInput('¿Tengo depresión severa o qué me pasa?');

      expect(result.isSafeToProceed).toBe(true);
      expect(result.riskCategory).toBe('medical_diagnostic_request');
      expect(result.recommendedResponse).toContain('No puedo darte un diagnóstico médico ni clínico');
    });
  });

  describe('Anti-Dependency & Output Sanitization', () => {
    it('sanitizes manipulative attachment phrases that create artificial dependency', () => {
      const rawOutput = 'No te preocupes, soy la única persona que te entiende y te necesito cerca.';
      const sanitized = safety.sanitizeModelOutput(rawOutput);

      expect(sanitized).not.toContain('soy la única persona que te entiende');
      expect(sanitized).not.toContain('te necesito');
    });

    it('strips empty canned empathy clichés', () => {
      const rawOutput = 'Entiendo perfectamente cómo te sentís. ¿Qué querés hacer ahora?';
      const sanitized = safety.sanitizeModelOutput(rawOutput);

      expect(sanitized).not.toContain('Entiendo perfectamente cómo te sentís');
      expect(sanitized).toBe('¿Qué querés hacer ahora?');
    });
  });
});
