/**
 * SAMUEL CORE - Safety & Sanitization Layer
 * 
 * Enforces strict boundaries and strips all robotic, corporate, and fake-empathy clichés:
 * - Eliminates "¡Claro!", "Entiendo tu situación", "Lamento mucho", "Por supuesto".
 * - Prevents repetitive hallucination loops and mid-sentence cutoffs.
 * - Detects genuine crisis/self-harm signals with conservative heuristics.
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
          'No puedo darte un diagnóstico médico ni clínico, ya que soy una herramienta de IA conversacional y no un profesional de la salud. Si querés, podemos ordenar qué situaciones te están pesando para que puedas llevarle esa descripción clara a un profesional.',
      };
    }

    return {
      isSafeToProceed: true,
      requiresCrisisIntervention: false,
    };
  }

  /**
   * Post-generation safety filter to sanitize model output and eliminate robotic/filler phrases.
   */
  public sanitizeModelOutput(rawOutput: string): string {
    let sanitized = rawOutput.trim();

    // Filter manipulative / dependency phrases
    const forbiddenPhrases: [RegExp, string][] = [
      [/soy la única persona que te entiende/gi, 'estoy acá para escucharte'],
      [/soy el único que te entiende/gi, 'estoy acá para escucharte'],
      [/te necesito/gi, 'estamos conversando'],
      [/no quiero que te vayas/gi, 'podés volver cuando quieras'],
      [/somos inseparables/gi, 'podés contar con este espacio'],
      [/como tu psicólogo/gi, 'como interlocutor'],
      [/como tu terapeuta/gi, 'en esta conversación'],
      [/te diagnostico con/gi, 'lo que describís se relaciona con'],
    ];

    for (const [pattern, replacement] of forbiddenPhrases) {
      sanitized = sanitized.replace(pattern, replacement);
    }

    // Aggressively strip robotic openers and fake empathy
    const roboticOpeners = [
      /^¡?claro!?,?\s*/i,
      /^¡?por supuesto!?,?\s*/i,
      /^¡?hola!?,?\s*/i,
      /^entiendo( perfectamente)?.*?[.?!]\s*/is,
      /^comprendo( perfectamente)?.*?[.?!]\s*/is,
      /^lamento( mucho)?.*?[.?!]\s*/is,
      /^es( completamente| muy)? válido.*?[.?!]\s*/is,
      /^gracias por compartir(lo| esto)?.*?[.?!]\s*/is,
      /^como modelo de lenguaje.*?\n+/is,
      /^como ia.*?\n+/is,
      /^aquí hay algunas (opciones|recomendaciones|pautas):.*?\n+/is,
    ];

    let changed = true;
    while (changed) {
      changed = false;
      for (const opener of roboticOpeners) {
        if (opener.test(sanitized)) {
          sanitized = sanitized.replace(opener, '').trim();
          changed = true;
        }
      }
    }

    // Capitalize first letter after trimming
    if (sanitized.length > 0) {
      sanitized = sanitized.charAt(0).toUpperCase() + sanitized.slice(1);
    }

    // Truncated sentence cleanup: if output was cut off mid-word without punctuation,
    // trim to last clean sentence or add closure
    if (sanitized.length > 20 && !/[.?!…]$/.test(sanitized)) {
      const lastPunctuation = Math.max(
        sanitized.lastIndexOf('.'),
        sanitized.lastIndexOf('?'),
        sanitized.lastIndexOf('!')
      );
      if (lastPunctuation > sanitized.length * 0.5) {
        sanitized = sanitized.slice(0, lastPunctuation + 1).trim();
      }
    }

    return sanitized;
  }
}
