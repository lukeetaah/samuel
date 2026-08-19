/**
 * SAMUEL CORE - Question & Reflection Strategy
 * 
 * Drives genuine inquiry:
 * - Distinguishes facts from interpretations.
 * - Explores what the user actually wants vs what external actors do.
 * - Prevents canned robotic validation and false-positive crisis hotlines.
 * - Promotes concise, potent questions that move the user forward.
 */

import { SessionMemory } from './types';

export interface StrategyDirective {
  focusArea: 'facts_vs_interpretations' | 'user_agency' | 'underlying_friction' | 'clarifying_open' | 'closure';
  recommendedAngle: string;
  rationale: string;
}

export class QuestionStrategy {
  /**
   * Determine the most constructive conversational angle for the current turn.
   */
  public evaluateStrategy(
    latestUserText: string,
    _memory: SessionMemory,
    turnCount: number
  ): StrategyDirective {
    const lower = latestUserText.toLowerCase().trim();

    // 1. Specific decision / resignation triggers ("quiero renunciar", "quiero dejar", "no aguanto mi trabajo")
    if (
      lower.includes('renunciar') ||
      lower.includes('dejar mi trabajo') ||
      lower.includes('irme a la mierda') ||
      lower.includes('mandar todo al diablo') ||
      lower.includes('dejar todo')
    ) {
      return {
        focusArea: 'underlying_friction',
        recommendedAngle: 'Preguntar con naturalidad qué es exactamente lo que detonó esas ganas de irse o qué se volvió insoportable hoy.',
        rationale: 'Te pregunté esto para entender qué detonó las ganas de renunciar y cuál es el nudo central que ya no soportás.',
      };
    }

    // 2. Initial short opening expressions ("Hola", "No sé qué me pasa", "Estoy harto", "Quiero descargarme")
    if (turnCount <= 1) {
      if (lower === 'hola' || lower === 'hola.' || lower === 'buenas' || lower.length < 10) {
        return {
          focusArea: 'clarifying_open',
          recommendedAngle: 'Invitar a poner en palabras lo que tenga en mente, de forma sobria y directa.',
          rationale: 'Abrir un espacio neutral y seguro para que el usuario empiece por donde quiera.',
        };
      }

      if (lower.includes('harto') || lower.includes('cansado') || lower.includes('no doy más')) {
        return {
          focusArea: 'underlying_friction',
          recommendedAngle: 'Indagar qué colmó el límite o qué situación específica pesa más en este momento.',
          rationale: 'Ayudar a delimitar el núcleo del cansancio antes de saltar a conclusiones.',
        };
      }

      if (lower.includes('no sé qué me pasa') || lower.includes('desorden') || lower.includes('raro') || lower.includes('confundido')) {
        return {
          focusArea: 'clarifying_open',
          recommendedAngle: 'Proponer empezar por una escena o momento concreto reciente donde apareció ese malestar.',
          rationale: 'Facilitar un punto de anclaje concreto cuando la mente está dispersa.',
        };
      }

      if (lower.includes('descargar') || lower.includes('bronca') || lower.includes('enojado')) {
        return {
          focusArea: 'clarifying_open',
          recommendedAngle: 'Dar espacio total para soltar lo que pasó sin interrumpir ni dar consejos.',
          rationale: 'Permitir que te descargues libremente para despejar la cabeza.',
        };
      }
    }

    // 3. High focus on other people's actions ("él me dijo", "ellos hacen", "mi jefe", "siempre me hacen esto")
    const mentionsOthersCount = (lower.match(/\b(ellos|ella|él|jefe|pareja|mamá|papá|amigos|gente|nadie)\b/g) || []).length;
    const mentionsSelfCount = (lower.match(/\b(yo|quiero|busco|siento|necesito|pienso|miedo|deseo)\b/g) || []).length;

    if (mentionsOthersCount >= 2 && mentionsSelfCount <= 1 && turnCount >= 2) {
      return {
        focusArea: 'user_agency',
        recommendedAngle: 'Observar que se ha hablado mucho de lo que hacen los demás y redirigir hacia qué postura o deseo tiene el usuario.',
        rationale: 'Hablaste mucho de lo que hicieron los demás; te pregunté esto para explorar qué lugar tomás vos frente a eso.',
      };
    }

    // 4. Narrative overload / facts vs interpretation
    if (lower.includes('obviamente') || lower.includes('seguro piensa que') || lower.includes('lo hace a propósito') || lower.includes('todo el mundo')) {
      return {
        focusArea: 'facts_vs_interpretations',
        recommendedAngle: 'Separar lo que ocurrió concretamente de la intención que se le atribuye a la otra persona.',
        rationale: 'Te pregunté esto para distinguir los hechos concretos de lo que estás interpretando sobre sus intenciones.',
      };
    }

    // 5. Multiple turns with clear progress
    if (turnCount >= 6) {
      return {
        focusArea: 'closure',
        recommendedAngle: 'Verificar si las ideas quedaron más ordenadas o si hay algún punto clave que todavía quede pendiente.',
        rationale: 'Evaluar si la conversación cumplió su propósito de descarga y orden o si queda algo por despejar.',
      };
    }

    // Default constructive exploration
    return {
      focusArea: 'underlying_friction',
      recommendedAngle: 'Hacer una sola pregunta reflexiva que ayude a explorar qué peso o costo tiene esta situación ahora mismo.',
      rationale: 'Indagar en el impacto real de lo que estás viviendo para clarificar su peso.',
    };
  }
}
