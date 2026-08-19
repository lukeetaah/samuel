/**
 * SAMUEL CORE - Question & Reflection Strategy
 * 
 * Drives genuine inquiry:
 * - Distinguishes facts from interpretations.
 * - Explores what the user actually wants vs what external actors do.
 * - Prevents canned robotic validation ("Entiendo cómo te sentís", "Es totalmente válido").
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
    const lower = latestUserText.toLowerCase();

    // 1. Initial short opening expressions ("Hola", "No sé qué me pasa", "Estoy harto", "Quiero descargarme")
    if (turnCount <= 1) {
      if (lower === 'hola' || lower === 'hola.' || lower === 'buenas' || lower.length < 10) {
        return {
          focusArea: 'clarifying_open',
          recommendedAngle: 'Invitar a poner en palabras lo que tenga en mente, de forma sobria y sin presiones.',
          rationale: 'Abrir un espacio neutral y seguro para que el usuario empiece por donde quiera.',
        };
      }

      if (lower.includes('harto') || lower.includes('cansado') || lower.includes('no doy más')) {
        return {
          focusArea: 'underlying_friction',
          recommendedAngle: 'Indagar qué es exactamente lo que colmó la paciencia o se volvió insoportable, evitando soluciones apresuradas.',
          rationale: 'Ayudar a delimitar el núcleo del cansancio antes de saltar a conclusiones.',
        };
      }

      if (lower.includes('no sé qué me pasa') || lower.includes('desorden') || lower.includes('raro')) {
        return {
          focusArea: 'clarifying_open',
          recommendedAngle: 'Ofrecer empezar por el último momento en que sintió ese malestar o una escena concreta reciente.',
          rationale: 'Facilitar un punto de anclaje concreto cuando la mente está dispersa o abrumada.',
        };
      }
    }

    // 2. High focus on other people's actions ("él me dijo", "ellos hacen", "mi jefe", "siempre me hacen esto")
    const mentionsOthersCount = (lower.match(/\b(ellos|ella|él|jefe|pareja|mamá|papá|amigos|gente|nadie)\b/g) || []).length;
    const mentionsSelfCount = (lower.match(/\b(yo|quiero|busco|siento|necesito|pienso|miedo|deseo)\b/g) || []).length;

    if (mentionsOthersCount >= 2 && mentionsSelfCount <= 1 && turnCount >= 2) {
      return {
        focusArea: 'user_agency',
        recommendedAngle: 'Observar que se ha hablado mucho de lo que hacen los demás y redirigir suavemente hacia qué postura o deseo tiene el usuario.',
        rationale: 'Hablaste mucho de lo que hicieron los demás; te pregunté esto para explorar qué lugar tomás vos frente a eso.',
      };
    }

    // 3. Narrative overload / facts vs interpretation
    if (lower.includes('obviamente') || lower.includes('seguro piensa que') || lower.includes('lo hace a propósito') || lower.includes('todo el mundo')) {
      return {
        focusArea: 'facts_vs_interpretations',
        recommendedAngle: 'Separar lo que ocurrió concretamente de la intención que se le atribuye a la otra persona o a la situación.',
        rationale: 'Te pregunté esto para distinguir los hechos concretos de lo que estás interpretando sobre sus intenciones.',
      };
    }

    // 4. Multiple turns with clear progress
    if (turnCount >= 6) {
      return {
        focusArea: 'closure',
        recommendedAngle: 'Verificar si las ideas quedaron más ordenadas o si hay algún nudo específico que todavía quede pendiente.',
        rationale: 'Evaluar si la conversación cumplió su propósito de descarga y orden o si queda algo por despejar.',
      };
    }

    // Default constructive exploration
    return {
      focusArea: 'underlying_friction',
      recommendedAngle: 'Profundizar en qué costo o peso personal tiene esta situación en este momento.',
      rationale: 'Indagar en el impacto real de lo que estás viviendo para clarificar su peso.',
    };
  }
}
