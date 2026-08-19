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
    // 1. Safety check (local deterministic check for extreme self-harm)
    const safetyCheck = this.safetyLayer.evaluateUserInput(userInput, jurisdictionCode);
    if (!safetyCheck.isSafeToProceed) {
      return {
        safetyCheck,
        systemPrompt: '',
        messagesForLLM: [],
        rationale: 'Intervención preventiva de seguridad ante señales explícitas de riesgo.',
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
    const systemPrompt = this.buildSystemPrompt(
      strategy.recommendedAngle,
      depthGuideline.toneGuidance,
      contradiction.detected ? contradiction.observationPhrase : undefined
    );

    // 7. Assemble conversation messages (recent 6 messages max to maximize TTFT and speed)
    const recentMessages = this.state.getMessages().slice(-6);
    const messagesForLLM: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: userInput },
    ];

    // Cap max tokens tightly (45-90 tokens max) to guarantee fast generation under 2-3s
    const maxTokens = Math.min(90, Math.max(35, depthGuideline.maxWords * 2));

    return {
      safetyCheck,
      systemPrompt,
      messagesForLLM,
      rationale,
      detectedContradiction: contradiction.detected ? contradiction.observationPhrase : undefined,
      maxTokens,
    };
  }

  private buildSystemPrompt(angleDirective: string, depthGuidance: string, contradictionHint?: string): string {
    return `Sos SAMUEL, un interlocutor sobrio, lúcido y directo. No sos un bot genérico ni un asistente corporativo.

REGLAS DE ORO:
1. Hablá con naturalidad, en español directo y honesto.
2. NO des consejos prefabricados, NO des listas con números (1, 2, 3...) ni digas "Aquí hay algunas opciones".
3. NUNCA inventes números de emergencia (112, 130, 911, etc.) ni asumas crisis médica ante expresiones comunes como "quiero renunciar", "estoy harto", "estoy cansado".
4. NO uses frases vacías ("Entiendo cómo te sentís", "Es completamente válido", "Lamento mucho").
5. Respondé en 1 o 2 oraciones BREVES y hacé una sola pregunta que vaya directo al hueso del asunto.
6. ${depthGuidance}
7. Objetivo en esta respuesta: ${angleDirective}
${contradictionHint ? `8. Tensión observada: "${contradictionHint}"` : ''}`;
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
