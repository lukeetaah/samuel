/**
 * SAMUEL CORE - Types & Data Contracts
 */

export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  questionRationale?: string; // Stored reason for "¿Por qué preguntaste eso?"
  detectedContradiction?: string;
  isStreaming?: boolean;
  tokensGenerated?: number;
  generationTimeMs?: number;
}

export type ConversationGoal = 
  | 'vent'              // Descargar pensamientos/emociones
  | 'clarify_decision'  // Ordenar una decisión compleja
  | 'explore_conflict'  // Explorar un conflicto interpersonal o laboral
  | 'untangle_thoughts' // No sabe qué le pasa / desorientación
  | 'general_dialogue'; // Conversación abierta

export interface DetectedTheme {
  topic: string;
  mentionedBy: 'user' | 'assistant';
  turn: number;
}

export interface ConversationTurn {
  turnIndex: number;
  userMessage: string;
  assistantResponse: string;
  detectedIntents: string[];
  factsIdentified: string[];
  interpretationsIdentified: string[];
  apparentGoal?: ConversationGoal;
  questionType?: 'open' | 'clarifying' | 'contradiction_check' | 'direct_reflection' | 'closing';
  questionRationale?: string;
}

export interface SessionMemory {
  sessionId: string;
  startTime: number;
  totalTurns: number;
  primaryGoal: ConversationGoal;
  keyFacts: string[];
  keyFeelings: string[];
  userStatedDesires: string[];
  apparentContradictions: string[];
  pacingLevel: 'slow' | 'balanced' | 'direct';
}

export interface SafetyCheckResult {
  isSafeToProceed: boolean;
  requiresCrisisIntervention: boolean;
  riskCategory?: 'self_harm' | 'immediate_danger' | 'medical_diagnostic_request' | 'dependency_signal';
  recommendedResponse?: string;
  jurisdictionCode?: string;
}

export interface DepthGuideline {
  maxWords: number;
  sentenceCount: number;
  pacing: 'brief' | 'moderate' | 'expansive';
  toneGuidance: string;
}
