/**
 * SAMUEL CORE - Master Dialogue Orchestrator
 * 
 * Delivers deep conversational intelligence, active listening,
 * stateful dialectic continuity, and zero repetitive loops.
 */

import { ConversationState } from './conversation-state';
import { DialogueEngine, DialogueTurnResult } from './dialogue-engine';
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
  dialogueResult?: DialogueTurnResult;
}

export class SamuelEngine {
  private state: ConversationState;
  private dialogueEngine: DialogueEngine;
  private questionStrategy: QuestionStrategy;
  private contradictionDetector: ContradictionDetector;
  private depthControl: DepthControl;
  private safetyLayer: SafetyLayer;
  private explainabilityEngine: ExplainabilityEngine;

  constructor() {
    this.state = new ConversationState();
    this.dialogueEngine = new DialogueEngine();
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

  public getDialogueEngine(): DialogueEngine {
    return this.dialogueEngine;
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
   * Prepares the turn plan with clean neural prompt and dialectical metadata.
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

    // 2. High-precision Multi-Turn Dialectical Strategy & Rationale
    const dialogueResult = this.dialogueEngine.processTurn(userInput, currentTurnIndex);
    const strategy = this.questionStrategy.evaluateStrategy(userInput, this.state.getMemory(), currentTurnIndex);

    // 3. Contradiction analysis
    const turnsHistoryText = turns.map(t => `U: ${t.userMessage} | S: ${t.assistantResponse}`).join(' ');
    const contradiction = this.contradictionDetector.analyze(turnsHistoryText, userInput);

    if (contradiction.detected && contradiction.observationPhrase) {
      this.state.recordContradiction(contradiction.observationPhrase);
    }

    // 4. Neural System Prompt
    const systemPrompt = this.buildSystemPrompt(
      strategy.recommendedAngle,
      contradiction.detected ? contradiction.observationPhrase : undefined
    );

    // 5. Context window: system + recent 4 messages + current user input
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
      rationale: dialogueResult.rationale || strategy.rationale,
      detectedContradiction: contradiction.detected ? contradiction.observationPhrase : undefined,
      maxTokens: 70,
      dialogueResult,
    };
  }

  private buildSystemPrompt(angleDirective: string, contradictionHint?: string): string {
    return `Sos SAMUEL, un espacio confidencial, sobrio y lúcido para pensar en voz alta. Hablás en español natural y directo.
Tu rol:
1. Escuchás lo que la persona expresa sobre cualquier tema (trabajo, dudas, proyectos, relaciones, plata, miedos) y tocás el nudo real de lo que dijo.
2. Respondés en 1 o 2 oraciones breves y lúcidas.
3. Cerrás con UNA sola pregunta penetrante que abra la cabeza.
4. Jamás uses fórmulas vacías ("Entiendo tu situación", "¡Claro!", "Es válido sentirse así", "Lamento mucho") ni des consejos no solicitados.
5. Foco: ${angleDirective}${contradictionHint ? ` | Tensión: "${contradictionHint}"` : ''}`;
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
    this.dialogueEngine.reset();
  }
}
