/**
 * SAMUEL CORE - Conversation State & Ephemeral Session
 * 
 * Manages the in-memory session. Never writes conversation history to permanent storage.
 * Follows Law 1 (Privacy) & Law 4 (Simplicity): "No todo lo que decís tiene que convertirse en un archivo".
 */

import { ChatMessage, ConversationTurn, SessionMemory } from './types';

export class ConversationState {
  private sessionId: string;
  private startTime: number;
  private turns: ConversationTurn[] = [];
  private messages: ChatMessage[] = [];
  private sessionMemory: SessionMemory;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.startTime = Date.now();
    this.sessionMemory = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      totalTurns: 0,
      primaryGoal: 'general_dialogue',
      keyFacts: [],
      keyFeelings: [],
      userStatedDesires: [],
      apparentContradictions: [],
      pacingLevel: 'balanced',
    };
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  public getTurns(): ConversationTurn[] {
    return [...this.turns];
  }

  public getMemory(): SessionMemory {
    return { ...this.sessionMemory };
  }

  public addUserMessage(content: string): ChatMessage {
    const msg: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };
    this.messages.push(msg);
    this.inferGoalFromUserMessage(content);
    return msg;
  }

  public addAssistantMessage(
    content: string, 
    meta?: { questionRationale?: string; detectedContradiction?: string; tokens?: number; genTime?: number }
  ): ChatMessage {
    const msg: ChatMessage = {
      id: `msg_${Date.now()}_a`,
      role: 'assistant',
      content: content.trim(),
      timestamp: Date.now(),
      questionRationale: meta?.questionRationale,
      detectedContradiction: meta?.detectedContradiction,
      tokensGenerated: meta?.tokens,
      generationTimeMs: meta?.genTime,
    };
    this.messages.push(msg);

    // Record turn
    const lastUser = [...this.messages].reverse().find(m => m.role === 'user');
    if (lastUser) {
      const turn: ConversationTurn = {
        turnIndex: this.turns.length + 1,
        userMessage: lastUser.content,
        assistantResponse: content,
        detectedIntents: [],
        factsIdentified: [],
        interpretationsIdentified: [],
        apparentGoal: this.sessionMemory.primaryGoal,
        questionRationale: meta?.questionRationale,
      };
      this.turns.push(turn);
      this.sessionMemory.totalTurns = this.turns.length;
    }

    return msg;
  }

  public updateStreamingMessage(content: string): void {
    const last = this.messages[this.messages.length - 1];
    if (last && last.role === 'assistant') {
      last.content = content;
    }
  }

  private inferGoalFromUserMessage(content: string): void {
    const lower = content.toLowerCase();
    if (lower.includes('descargar') || lower.includes('harto') || lower.includes('bronca') || lower.includes('explotar')) {
      this.sessionMemory.primaryGoal = 'vent';
    } else if (lower.includes('decidir') || lower.includes('no sé si') || lower.includes('elección') || lower.includes('renunciar o')) {
      this.sessionMemory.primaryGoal = 'clarify_decision';
    } else if (lower.includes('jefe') || lower.includes('pareja') || lower.includes('amigo') || lower.includes('discusión') || lower.includes('me dijo')) {
      this.sessionMemory.primaryGoal = 'explore_conflict';
    } else if (lower.includes('no sé qué me pasa') || lower.includes('raro') || lower.includes('perdido') || lower.includes('confundido')) {
      this.sessionMemory.primaryGoal = 'untangle_thoughts';
    }
  }

  public recordContradiction(description: string): void {
    if (!this.sessionMemory.apparentContradictions.includes(description)) {
      this.sessionMemory.apparentContradictions.push(description);
    }
  }

  public clear(): void {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.startTime = Date.now();
    this.turns = [];
    this.messages = [];
    this.sessionMemory = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      totalTurns: 0,
      primaryGoal: 'general_dialogue',
      keyFacts: [],
      keyFeelings: [],
      userStatedDesires: [],
      apparentContradictions: [],
      pacingLevel: 'balanced',
    };
  }
}
