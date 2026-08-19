/**
 * SAMUEL CORE - Master Dialogue Orchestrator
 * 
 * Delivers deep multi-turn conversational intelligence, active listening,
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
   * Prepares the turn plan with stateful multi-turn dialectical intelligence.
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

    // 2. High-precision Multi-Turn Dialectical Synthesis
    const dialogueResult = this.dialogueEngine.processTurn(userInput, currentTurnIndex);

    // 3. Contradiction analysis
    const turnsHistoryText = turns.map(t => `U: ${t.userMessage} | S: ${t.assistantResponse}`).join(' ');
    const contradiction = this.contradictionDetector.analyze(turnsHistoryText, userInput);

    if (contradiction.detected && contradiction.observationPhrase) {
      this.state.recordContradiction(contradiction.observationPhrase);
    }

    // 4. Few-shot system prompt for neural inference
    const systemPrompt = `Sos SAMUEL. Respondé exactamente con este calibre de sobriedad y profundidad:
U: ${userInput}
S: ${dialogueResult.fullResponse}`;

    const recentMessages = this.state.getMessages().slice(-2);
    const messagesForLLM: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: userInput },
    ];

    return {
      safetyCheck,
      systemPrompt,
      messagesForLLM,
      rationale: dialogueResult.rationale,
      detectedContradiction: contradiction.detected ? contradiction.observationPhrase : undefined,
      maxTokens: 75,
      dialogueResult,
    };
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
