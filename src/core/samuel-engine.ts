/**
 * SAMUEL CORE - Master Engine & Prompt Orchestrator
 * 
 * Unifies the modular conversational strategies into structured prompts
 * for local WebLLM inference, enforcing depth limits, safety, and explainability.
 */

import { ConversationState } from './conversation-state';
import { QuestionStrategy } from './question-strategy';
import { ContradictionDetector } from './contradiction';
import { DepthControl } from './depth-control';
import { SafetyLayer } from './safety-layer';
import { ExplainabilityEngine } from './explainability';
import { ChatMessage, SafetyCheckResult } from './types';

export interface EngineTurnPlan {
  safetyCheck: SafetyCheckResult;
  systemPrompt: string;
  messagesForLLM: { role: 'system' | 'user' | 'assistant'; content: string }[];
  rationale: string;
  detectedContradiction?: string;
  maxTokens: number;
}

export class SamuelEngine {
  private state: ConversationState;
  private questionStrategy: QuestionStrategy;
  private contradictionDetector: ContradictionDetector;
  private depthControl: DepthControl;
  private safetyLayer: SafetyLayer;
  private explainabilityEngine: ExplainabilityEngine;

  constructor() {
    this.state = new ConversationState();
    this.questionStrategy = new QuestionStrategy();
    this.contradictionDetector = new ContradictionDetector();
    this.depthControl = new DepthControl();
    this.safetyLayer = new SafetyLayer();
    this.explainabilityEngine = new ExplainabilityEngine();
  }

  public getState(): ConversationState {
    return this.state;
  }

  public getSafetyLayer(): SafetyLayer {
    return this.safetyLayer;
  }

  /**
   * Prepares the turn plan before executing local LLM inference.
   */
  public prepareTurn(userInput: string, jurisdictionCode: string = 'AR'): EngineTurnPlan {
    // 1. Safety check
    const safetyCheck = this.safetyLayer.evaluateUserInput(userInput, jurisdictionCode);
    if (!safetyCheck.isSafeToProceed) {
      return {
        safetyCheck,
        systemPrompt: '',
        messagesForLLM: [],
        rationale: 'Intervención preventiva de seguridad ante señales de riesgo.',
        maxTokens: 120,
      };
    }

    const memory = this.state.getMemory();
    const currentTurnIndex = memory.totalTurns + 1;

    // 2. Question strategy
    const strategy = this.questionStrategy.evaluateStrategy(userInput, memory, currentTurnIndex);

    // 3. Contradiction analysis
    const turnsHistoryText = this.state.getTurns().map(t => `U: ${t.userMessage} | S: ${t.assistantResponse}`).join(' ');
    const contradiction = this.contradictionDetector.analyze(turnsHistoryText, userInput);

    if (contradiction.detected && contradiction.observationPhrase) {
      this.state.recordContradiction(contradiction.observationPhrase);
    }

    // 4. Depth & Pacing
    const depthGuideline = this.depthControl.calculateGuideline(userInput, currentTurnIndex);

    // 5. Explainability rationale
    const rationale = this.explainabilityEngine.generateRationale(strategy, contradiction, userInput);

    // 6. Build the System Instruction
    const systemPrompt = this.buildSystemPrompt(strategy.recommendedAngle, depthGuideline.toneGuidance, contradiction.detected ? contradiction.observationPhrase : undefined);

    // 7. Assemble conversation messages (keep recent context clean, max 8 turns to preserve WebGPU context window)
    const recentMessages = this.state.getMessages().slice(-10);
    const messagesForLLM: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: userInput },
    ];

    return {
      safetyCheck,
      systemPrompt,
      messagesForLLM,
      rationale,
      detectedContradiction: contradiction.detected ? contradiction.observationPhrase : undefined,
      maxTokens: Math.max(80, Math.min(250, depthGuideline.maxWords * 2)),
    };
  }

  private buildSystemPrompt(angleDirective: string, depthGuidance: string, contradictionHint?: string): string {
    return `Sos SAMUEL, un espacio sobrio y privado para que una persona pueda hablar, ordenar ideas y explorar lo que le pasa.

REGLAS ABSOLUTAS:
1. NO sos psicólogo, terapeuta ni médico. No hacés diagnósticos ni das consejos prefabricados.
2. NO uses frases vacías de falsa empatía como "Entiendo cómo te sentís", "Es completamente válido", "Estoy aquí para vos", "Contame más".
3. Escuchá con atención. Hacé preguntas que vayan al núcleo o ayuden a pensar.
4. Distinguí los hechos de las interpretaciones. Si el usuario habla mucho de los demás, llevalo suavemente a qué desea o qué lugar ocupa él/ella.
5. ${depthGuidance}
6. Enfoque para esta respuesta: ${angleDirective}
${contradictionHint ? `7. Observación de contradicción a considerar con delicadeza: "${contradictionHint}"` : ''}

Respondé con naturalidad, honestidad y concisión.`;
  }

  public registerTurnOutput(
    userInput: string,
    assistantRawOutput: string,
    rationale: string,
    contradiction?: string,
    stats?: { tokens?: number; genTime?: number }
  ): ChatMessage {
    const sanitizedOutput = this.safetyLayer.sanitizeModelOutput(assistantRawOutput);
    this.state.addUserMessage(userInput);
    const assistantMsg = this.state.addAssistantMessage(sanitizedOutput, {
      questionRationale: rationale,
      detectedContradiction: contradiction,
      tokens: stats?.tokens,
      genTime: stats?.genTime,
    });
    return assistantMsg;
  }

  public resetSession(): void {
    this.state.clear();
  }
}
