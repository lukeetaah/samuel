/**
 * SAMUEL CORE - Question & Reflection Strategy
 * 
 * OPTIMIZED: Ultra-short angle directives (max 10 words each)
 * to minimize system prompt tokens and prefill time.
 */

import { SessionMemory } from './types';

export interface StrategyDirective {
  focusArea: 'facts_vs_interpretations' | 'user_agency' | 'underlying_friction' | 'clarifying_open' | 'closure';
  recommendedAngle: string;
  rationale: string;
}

export class QuestionStrategy {
  public evaluateStrategy(
    latestUserText: string,
    _memory: SessionMemory,
    turnCount: number
  ): StrategyDirective {
    const lower = latestUserText.toLowerCase().trim();

    // Resignation / quitting triggers
    if (
      lower.includes('renunciar') ||
      lower.includes('dejar mi trabajo') ||
      lower.includes('irme a la mierda') ||
      lower.includes('mandar todo al diablo') ||
      lower.includes('dejar todo')
    ) {
      return {
        focusArea: 'underlying_friction',
        recommendedAngle: 'Preguntá qué detonó hoy las ganas de irse.',
        rationale: 'Explorar qué detonó las ganas de renunciar.',
      };
    }

    // First turn openers
    if (turnCount <= 1) {
      if (lower === 'hola' || lower === 'hola.' || lower === 'buenas' || lower.length < 10) {
        return {
          focusArea: 'clarifying_open',
          recommendedAngle: 'Invitá a decir qué tiene en mente.',
          rationale: 'Abrir espacio para que empiece por donde quiera.',
        };
      }

      if (lower.includes('harto') || lower.includes('cansado') || lower.includes('no doy más')) {
        return {
          focusArea: 'underlying_friction',
          recommendedAngle: 'Preguntá qué situación puntual colmó el límite.',
          rationale: 'Delimitar qué colmó el límite.',
        };
      }

      if (lower.includes('no sé qué me pasa') || lower.includes('confundido') || lower.includes('raro')) {
        return {
          focusArea: 'clarifying_open',
          recommendedAngle: 'Pedí un momento concreto reciente donde apareció eso.',
          rationale: 'Anclar en algo concreto cuando la mente está dispersa.',
        };
      }

      if (lower.includes('descargar') || lower.includes('bronca') || lower.includes('enojado')) {
        return {
          focusArea: 'clarifying_open',
          recommendedAngle: 'Dá espacio para soltar sin interrumpir.',
          rationale: 'Permitir descarga libre.',
        };
      }
    }

    // Focus on others vs self
    const mentionsOthers = (lower.match(/\b(ellos|ella|él|jefe|pareja|mamá|papá|amigos|gente|nadie)\b/g) || []).length;
    const mentionsSelf = (lower.match(/\b(yo|quiero|busco|siento|necesito|pienso|miedo)\b/g) || []).length;

    if (mentionsOthers >= 2 && mentionsSelf <= 1 && turnCount >= 2) {
      return {
        focusArea: 'user_agency',
        recommendedAngle: 'Redirigí hacia qué quiere o siente el usuario.',
        rationale: 'Explorar la postura propia frente a lo que hacen otros.',
      };
    }

    // Interpretation vs facts
    if (lower.includes('obviamente') || lower.includes('seguro piensa') || lower.includes('a propósito') || lower.includes('todo el mundo')) {
      return {
        focusArea: 'facts_vs_interpretations',
        recommendedAngle: 'Separá hechos concretos de interpretación.',
        rationale: 'Distinguir hechos de interpretaciones.',
      };
    }

    // Closure after several turns
    if (turnCount >= 6) {
      return {
        focusArea: 'closure',
        recommendedAngle: 'Preguntá si quedó algo pendiente o si las ideas se ordenaron.',
        rationale: 'Evaluar si la conversación cumplió su propósito.',
      };
    }

    // Default
    return {
      focusArea: 'underlying_friction',
      recommendedAngle: 'Hacé una pregunta sobre el peso real de la situación.',
      rationale: 'Explorar el impacto real de lo que vive.',
    };
  }
}
