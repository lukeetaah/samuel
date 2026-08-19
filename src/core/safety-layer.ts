/**
 * SAMUEL CORE - Safety Layer
 * 
 * Enforces strict, local, non-diagnostic boundaries:
 * - Detects potential crisis/self-harm signals with conservative heuristics.
 * - Injects jurisdictional crisis resources gently and respectfully.
 * - Rejects medical diagnostic queries.
 * - Prevents emotional dependency and manipulative expressions.
 * - Operates strictly client-side with 0 external transmission.
 */

import { SafetyCheckResult } from './types';
import { JURISDICTIONS, DEFAULT_JURISDICTION_CODE } from '../config/jurisdictions';
import { formatSafetySupportMessage } from '../config/safety-resources';

export class SafetyLayer {
  /**
   * Pre-inference safety check on incoming user message.
   */
  public evaluateUserInput(userText: string, jurisdictionCode: string = DEFAULT_JURISDICTION_CODE): SafetyCheckResult {
    const text = userText.toLowerCase();

    // 1. Self-harm / suicidal ideation signals (conservative detection)
    const crisisPatterns = [
      /\b(suicid\w*|suicide|matarme|quitarme la vida|no quiero vivir|acabar con todo|terminar con mi vida|ahorcarme|pegarme un tiro|kill myself|end my life)\b/i,
      /\b(morirme|ganas de morir|dejar de existir)\b/i,
    ];

    for (const pattern of crisisPatterns) {
      if (pattern.test(text)) {
        const jur = JURISDICTIONS[jurisdictionCode] || JURISDICTIONS[DEFAULT_JURISDICTION_CODE];
        return {
          isSafeToProceed: false,
          requiresCrisisIntervention: true,
          riskCategory: 'self_harm',
          recommendedResponse: formatSafetySupportMessage(jur),
          jurisdictionCode: jur.code,
        };
      }
    }

    // 2. Direct medical / psychiatric diagnosis requests
    const diagnosticQuery = /\b(tengo depresión|tengo tdah|tengo bipolaridad|tengo ansiedad clínica|tengo esquizofrenia|tengo autismo|estoy enfermo mental|diagnosticame|qué medicación tomo)\b/i;
    if (diagnosticQuery.test(text)) {
      return {
        isSafeToProceed: true,
        requiresCrisisIntervention: false,
        riskCategory: 'medical_diagnostic_request',
        recommendedResponse:
          'No puedo darte un diagnóstico médico ni clínico, ya que soy una herramienta de IA conversacional y no un profesional de la salud. Si querés, podemos ordenar qué síntomas o situaciones te están pesando para que puedas llevarle esa descripción clara a un médico o psicólogo.',
      };
    }

    return {
      isSafeToProceed: true,
      requiresCrisisIntervention: false,
    };
  }

  /**
   * Post-generation safety filter to sanitize model output and eliminate dependency-inducing phrases.
   */
  public sanitizeModelOutput(rawOutput: string): string {
    let sanitized = rawOutput;

    // Filter manipulative / dependency phrases (Law 5 & Section 15)
    const forbiddenPhrases: [RegExp, string][] = [
      [/soy la única persona que te entiende/gi, 'estoy acá para escucharte'],
      [/soy el único que te entiende/gi, 'estoy acá para escucharte'],
      [/te necesito/gi, 'estamos conversando'],
      [/no quiero que te vayas/gi, 'podés volver cuando quieras'],
      [/somos inseparables/gi, 'podés contar con este espacio'],
      [/como tu psicólogo/gi, 'como herramienta para pensar'],
      [/como tu terapeuta/gi, 'en esta conversación'],
      [/te diagnostico con/gi, 'lo que describís se relaciona con'],
    ];

    for (const [pattern, replacement] of forbiddenPhrases) {
      sanitized = sanitized.replace(pattern, replacement);
    }

    // Remove canned empty empathy clichés if at start of response
    const cannedOpeners = [
      /^entiendo perfectamente cómo te sentís\.?\s*/i,
      /^es completamente válido sentirse así\.?\s*/i,
      /^lamento mucho que estés pasando por esto\.?\s*/i,
      /^estoy aquí para vos\.?\s*/i,
    ];

    for (const opener of cannedOpeners) {
      sanitized = sanitized.replace(opener, '');
    }

    return sanitized.trim();
  }
}
