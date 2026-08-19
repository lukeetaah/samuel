/**
 * SAMUEL CORE - Master Engine & Prompt Orchestrator
 * 
 * High-performance conversational orchestrator:
 * - Few-shot style grounding for sub-2B models (Matrix/Oracle vibe: concise, piercing, no clichés).
 * - Repetition prevention and tight token budgeting.
 * - Minimal context overhead to maximize TTFT speed.
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

    // 6. Build Few-Shot grounded system prompt
    const systemPrompt = this.buildSystemPrompt(
      strategy.recommendedAngle,
      contradiction.detected ? contradiction.observationPhrase : undefined
    );

    // 7. Assemble conversation — keep recent 2-4 messages to preserve flow without bloat
    const recentMessages = this.state.getMessages().slice(-4);
    const messagesForLLM: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: userInput },
    ];

    // Cap max tokens tightly (45-75 tokens) to guarantee snappy generation without cutting off words
    const maxTokens = Math.min(75, Math.max(40, depthGuideline.maxWords * 2));

    return {
      safetyCheck,
      systemPrompt,
      messagesForLLM,
      rationale,
      detectedContradiction: contradiction.detected ? contradiction.observationPhrase : undefined,
      maxTokens,
    };
  }

  private buildSystemPrompt(angle: string, contradictionHint?: string): string {
    return `Sos SAMUEL, una presencia lúcida y directa para pensar en voz alta. Hablás en español directo sin rodeos.
Reglas estrictas:
- NUNCA digas "¡Claro!", "Entiendo tu situación", "Lamento", ni des consejos prefabricados ("has intentado hablar con...").
- NUNCA repitas frases de turnos anteriores ni hagas listas.
- Respondé en 1 o 2 oraciones que reconozcan el peso de lo que se dijo y cerrá con 1 sola pregunta incisiva.
- Ángulo: ${angle}${contradictionHint ? ` | Tensión: "${contradictionHint}"` : ''}

Ejemplos:
U: quiero renunciar
S: ¿Qué fue lo que pasó hoy que te hizo decir basta?
U: mi jefe me hace la vida imposible y mis compañeros me ignoran
S: Estar en un lugar donde sentís que te quieren afuera agota a cualquiera. Si te vas, ¿lo primero que aparece es alivio o incertidumbre?`;
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
