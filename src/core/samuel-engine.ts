/**
 * SAMUEL CORE - Master Socratic Engine
 * 
 * Orchestrates high-craft Socratic problem-solving with instant execution:
 * - Solves real dilemmas (salary vs workload, coping with hated jobs, fear of travel, burnout, relationships).
 * - Zero hallucination, zero broken Spanish, zero robotic clichés.
 * - Sub-second execution with fluid typewriter streaming.
 */

import { ConversationState } from './conversation-state';
import { SocraticSolver, SocraticTurnResult } from './socratic-solver';
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
  socraticResult?: SocraticTurnResult;
}

export class SamuelEngine {
  private state: ConversationState;
  private socraticSolver: SocraticSolver;
  private questionStrategy: QuestionStrategy;
  private contradictionDetector: ContradictionDetector;
  private depthControl: DepthControl;
  private safetyLayer: SafetyLayer;
  private explainabilityEngine: ExplainabilityEngine;

  constructor() {
    this.state = new ConversationState();
    this.socraticSolver = new SocraticSolver();
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

  public getSocraticSolver(): SocraticSolver {
    return this.socraticSolver;
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
   * Prepares the turn plan with high-craft Socratic problem solving.
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

    // 2. High-precision Socratic Problem-Solving Synthesis
    const socraticResult = this.socraticSolver.solve(userInput, currentTurnIndex);

    // 3. Contradiction analysis
    const turnsHistoryText = turns.map(t => `U: ${t.userMessage} | S: ${t.assistantResponse}`).join(' ');
    const contradiction = this.contradictionDetector.analyze(turnsHistoryText, userInput);

    if (contradiction.detected && contradiction.observationPhrase) {
      this.state.recordContradiction(contradiction.observationPhrase);
    }

    // 4. Few-shot system prompt for neural inference
    const systemPrompt = `Sos SAMUEL. Respondé exactamente con este calibre de sobriedad y profundidad:
U: ${userInput}
S: ${socraticResult.fullResponse}`;

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
      rationale: socraticResult.rationale,
      detectedContradiction: contradiction.detected ? contradiction.observationPhrase : undefined,
      maxTokens: 75,
      socraticResult,
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
    this.socraticSolver.reset();
  }
}
