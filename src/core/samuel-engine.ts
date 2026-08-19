/**
 * SAMUEL CORE - Master Engine & Universal Prompt Orchestrator
 * 
 * Crafts sharp, concise prompts for local WebLLM execution on any topic
 * (travel, work, love, doubts, existential, projects), enforcing depth,
 * active listening, safety, and explainability.
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

  public getQuestionStrategy(): QuestionStrategy {
    return this.questionStrategy;
  }

  public getDepthControl(): DepthControl {
    return this.depthControl;
  }

  public getExplainabilityEngine(): ExplainabilityEngine {
    return this.explainabilityEngine;
  }

  /**
   * Prepares the turn plan for genuine neural generation.
   */
  public prepareTurn(userInput: string, jurisdictionCode: string = 'AR'): EngineTurnPlan {
    // 1. Safety check (local deterministic check for extreme self-harm)
    const safetyCheck = this.safetyLayer.evaluateUserInput(userInput, jurisdictionCode);
    if (!safetyCheck.isSafeToProceed) {
      return {
        safetyCheck,
        systemPrompt: '',
        messagesForLLM: [],
        rationale: 'Intervención preventiva de seguridad ante señales explícitas de riesgo.',
        maxTokens: 60,
      };
    }

    const turns = this.state.getTurns();
    const currentTurnIndex = turns.length + 1;

    // 2. Question strategy & angle
    const strategy = this.questionStrategy.evaluateStrategy(userInput, this.state.getMemory(), currentTurnIndex);

    // 3. Contradiction analysis
    const turnsHistoryText = turns.map(t => `U: ${t.userMessage} | S: ${t.assistantResponse}`).join(' ');
    const contradiction = this.contradictionDetector.analyze(turnsHistoryText, userInput);

    if (contradiction.detected && contradiction.observationPhrase) {
      this.state.recordContradiction(contradiction.observationPhrase);
    }

    // 4. Explainability rationale
    const rationale = this.explainabilityEngine.generateRationale(strategy, contradiction, userInput);

    // 5. Build Universal Adaptive System Prompt
    const systemPrompt = this.buildSystemPrompt(
      strategy.recommendedAngle,
      contradiction.detected ? contradiction.observationPhrase : undefined
    );

    // 6. Assemble conversation context (last 4 messages for deep continuity without memory bloat)
    const recentMessages = this.state.getMessages().slice(-4);
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
      maxTokens: 65,
    };
  }

  private buildSystemPrompt(angle: string, contradictionHint?: string): string {
    return `Sos SAMUEL, un espacio sobrio, lúcido y perspicaz para pensar en voz alta. Hablás en español directo, sin condescendencia ni fórmulas hechas.

Tu propósito es escuchar con agudeza lo que la persona dice sobre CUALQUIER tema (decisiones, viajes, miedos, trabajo, pareja, proyectos, etc.) y responder como un interlocutor humano inteligente.

Reglas fundamentales:
1. Jamás uses frases cliché como "Entiendo tu situación", "¡Claro!", "Es comprensible", "Lo que planteas refleja...", "Al poner esto sobre la mesa".
2. No des consejos ("te sugiero que...", "deberías hacer...").
3. No hagas introducciones formales ni listas.
4. Respondé en 1 o 2 oraciones breves que capturen el dilema real y cerrá con UNA sola pregunta penetrante.
5. Foco en esta intervención: ${angle}${contradictionHint ? ` | Tensión: "${contradictionHint}"` : ''}`;
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
