/**
 * SAMUEL CORE - Master Engine & Prompt Orchestrator
 * 
 * Hybrid Cognitive Architecture:
 * - Direct CognitiveEngine synthesis for instant, non-repeating, piercing insights.
 * - Local LLM integration for custom neural expansions.
 * - Guaranteed 0 repetition across conversational turns.
 */

import { ConversationState } from './conversation-state';
import { CognitiveEngine, CognitiveTurnResult } from './cognitive-engine';
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
  cognitiveResult?: CognitiveTurnResult;
}

export class SamuelEngine {
  private state: ConversationState;
  private cognitiveEngine: CognitiveEngine;
  private questionStrategy: QuestionStrategy;
  private contradictionDetector: ContradictionDetector;
  private depthControl: DepthControl;
  private safetyLayer: SafetyLayer;
  private explainabilityEngine: ExplainabilityEngine;

  constructor() {
    this.state = new ConversationState();
    this.cognitiveEngine = new CognitiveEngine();
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

  public getCognitiveEngine(): CognitiveEngine {
    return this.cognitiveEngine;
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
   * Prepares the turn plan with cognitive synthesis and fallback LLM structures.
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

    // 2. High-precision Cognitive Turn Synthesis (Instant, never repeats facets)
    const historyTuples = turns.map(t => ({ user: t.userMessage, assistant: t.assistantResponse }));
    const cognitiveResult = this.cognitiveEngine.synthesizeTurn(userInput, currentTurnIndex, historyTuples);

    // 3. Contradiction analysis
    const turnsHistoryText = turns.map(t => `U: ${t.userMessage} | S: ${t.assistantResponse}`).join(' ');
    const contradiction = this.contradictionDetector.analyze(turnsHistoryText, userInput);

    if (contradiction.detected && contradiction.observationPhrase) {
      this.state.recordContradiction(contradiction.observationPhrase);
    }

    // 4. Few-Shot system prompt for neural inference
    const systemPrompt = `Sos SAMUEL. Respondé exactamente con este calibre de sobriedad y profundidad:
U: ${userInput}
S: ${cognitiveResult.fullResponse}`;

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
      rationale: cognitiveResult.rationale,
      detectedContradiction: contradiction.detected ? contradiction.observationPhrase : undefined,
      maxTokens: 75,
      cognitiveResult,
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
    this.cognitiveEngine.reset();
  }
}
