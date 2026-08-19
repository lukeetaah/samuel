/**
 * SAMUEL CORE - Master Engine & Prompt Orchestrator
 * 
 * OPTIMIZED FOR SPEED: Ultra-compact system prompt (~40 tokens),
 * minimal history (last 2 messages), tight token cap.
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

    // 6. Build ULTRA-COMPACT system prompt (~40 tokens)
    const systemPrompt = this.buildSystemPrompt(
      strategy.recommendedAngle,
      contradiction.detected ? contradiction.observationPhrase : undefined
    );

    // 7. Assemble conversation — ONLY last 2 messages to minimize prefill
    const recentMessages = this.state.getMessages().slice(-2);
    const messagesForLLM: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: userInput },
    ];

    // Cap max tokens HARD (25-50) for fast generation
    const maxTokens = Math.min(50, Math.max(25, depthGuideline.maxWords));

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
    // ULTRA-COMPACT: ~40 tokens total. Every token here = ~0.4s of prefill time.
    let prompt = `Sos SAMUEL. Hablás español directo, sin frases vacías ni listas. 1-2 oraciones + 1 pregunta breve. ${angle}`;
    if (contradictionHint) {
      prompt += ` Tensión: "${contradictionHint}"`;
    }
    return prompt;
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
