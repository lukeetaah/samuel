/**
 * SAMUEL - Main Application Root
 * 
 * Orchestrates Local WebGPU In-Browser AI Engine, Privacy Auditor,
 * and the sanctuary user interface.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HardwareDetector, HardwareReport } from './engine/hardware-detector';
import { webLLMService, WebLLMServiceState } from './engine/webllm-service';
import { SamuelEngine } from './core/samuel-engine';
import { privacyAuditor } from './privacy/privacy-auditor';
import { detectUserJurisdiction } from './config/jurisdictions';
import { DEFAULT_MODEL_ID } from './config/models';
import { ChatMessage } from './core/types';

import { Header } from './components/Header';
import { Onboarding } from './components/Onboarding';
import { ChatView } from './components/ChatView';
import { PrivacyModal } from './components/PrivacyModal';
import { PrivacyAuditPanel } from './components/PrivacyAuditPanel';
import { SafetyModal } from './components/SafetyModal';
import { IncompatibleView } from './components/IncompatibleView';

export const App: React.FC = () => {
  const [hardwareReport, setHardwareReport] = useState<HardwareReport | null>(null);
  const [hardwareChecking, setHardwareChecking] = useState<boolean>(true);
  const [engineState, setEngineState] = useState<WebLLMServiceState>(webLLMService.getState());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [jurisdiction, setJurisdiction] = useState<string>('AR');

  // Modals state
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isAuditorModalOpen, setIsAuditorModalOpen] = useState<boolean>(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);

  // Core Engine instance
  const samuelEngine = useMemo(() => new SamuelEngine(), []);

  // Initialize Privacy Auditor and Hardware Detection on mount
  useEffect(() => {
    privacyAuditor.startAuditing();
    setJurisdiction(detectUserJurisdiction());

    const checkHardware = async () => {
      setHardwareChecking(true);
      const report = await HardwareDetector.detect();
      setHardwareReport(report);
      setHardwareChecking(false);
    };

    checkHardware();

    const unsubscribe = webLLMService.subscribe((state) => {
      setEngineState(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleStart = useCallback(async (modelId: string = DEFAULT_MODEL_ID) => {
    try {
      await webLLMService.loadModel(modelId);
    } catch (err) {
      console.error('Error starting model:', err);
    }
  }, []);

  const handleSendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || engineState.status === 'generating') return;

      // Register sensitive fragment with Privacy Auditor
      privacyAuditor.registerSensitiveFragment(userText);

      // Add user message to UI
      const userMsg: ChatMessage = {
        id: `msg_u_${Date.now()}`,
        role: 'user',
        content: userText.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);

      // 1. Prepare turn with SAMUEL CORE
      const turnPlan = samuelEngine.prepareTurn(userText, jurisdiction);

      // 2. Check safety intervention
      if (!turnPlan.safetyCheck.isSafeToProceed && turnPlan.safetyCheck.recommendedResponse) {
        const safetyResponseMsg: ChatMessage = {
          id: `msg_a_${Date.now()}`,
          role: 'assistant',
          content: turnPlan.safetyCheck.recommendedResponse,
          timestamp: Date.now(),
          questionRationale: turnPlan.rationale,
        };
        setMessages((prev) => [...prev, safetyResponseMsg]);
        samuelEngine.registerTurnOutput(
          userText,
          turnPlan.safetyCheck.recommendedResponse,
          turnPlan.rationale
        );
        return;
      }

      // 3. Create placeholder assistant message for streaming
      const assistantMsgId = `msg_a_${Date.now()}`;
      const placeholderMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
        questionRationale: turnPlan.rationale,
        detectedContradiction: turnPlan.detectedContradiction,
      };

      setMessages((prev) => [...prev, placeholderMsg]);

      const startTime = performance.now();
      let accumulatedContent = '';
      let completionTokensCount = 0;

      // 4. In-Browser Local Neural Generation (WebGPU)
      try {
        await webLLMService.generateStream(turnPlan.messagesForLLM, {
          maxTokens: turnPlan.maxTokens,
          temperature: 0.7,
          topP: 0.9,
          onToken: (_token, accumulated) => {
            accumulatedContent = accumulated;
            completionTokensCount++;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? { ...msg, content: accumulated, isStreaming: true }
                  : msg
              )
            );
          },
          onStats: (stats) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? {
                      ...msg,
                      tokensGenerated: stats.completionTokens,
                      generationTimeMs: stats.totalTimeMs,
                    }
                  : msg
              )
            );
          },
        });

        const totalTimeMs = Math.round(performance.now() - startTime);
        privacyAuditor.registerSensitiveFragment(accumulatedContent);

        // Finalize message with sanitization and state registration
        const finalized = samuelEngine.registerTurnOutput(
          userText,
          accumulatedContent,
          turnPlan.rationale,
          turnPlan.detectedContradiction,
          { tokens: completionTokensCount, genTime: totalTimeMs }
        );

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: finalized.content,
                  isStreaming: false,
                  tokensGenerated: completionTokensCount,
                  generationTimeMs: totalTimeMs,
                }
              : msg
          )
        );
      } catch (err) {
        console.warn('Local neural inference error, activating emergency recovery:', err);
        const emergencyResult = samuelEngine.getDialogueEngine().processTurn(
          userText,
          samuelEngine.getState().getTurns().length + 1
        );
        const finalized = samuelEngine.registerTurnOutput(
          userText,
          emergencyResult.fullResponse,
          turnPlan.rationale,
          turnPlan.detectedContradiction
        );
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: finalized.content,
                  isStreaming: false,
                }
              : msg
          )
        );
      }
    },
    [engineState.status, jurisdiction, samuelEngine]
  );

  const handleInterrupt = useCallback(() => {
    webLLMService.interrupt();
    setMessages((prev) =>
      prev.map((msg) => (msg.isStreaming ? { ...msg, isStreaming: false } : msg))
    );
  }, []);

  const handleResetSession = useCallback(() => {
    samuelEngine.resetSession();
    privacyAuditor.clearSensitiveFragments();
    setMessages([]);
  }, [samuelEngine]);

  // If hardware check is running
  if (hardwareChecking) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center p-6">
        <div className="text-center space-y-3 font-mono text-xs text-neutral-400">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Iniciando santuario local...</p>
        </div>
      </div>
    );
  }

  // If device is strictly incompatible (Law 2: No remote fallback)
  if (hardwareReport && !hardwareReport.isWebGPUSupported) {
    return (
      <IncompatibleView
        reason={hardwareReport.reason}
        onRetry={async () => {
          setHardwareChecking(true);
          const r = await HardwareDetector.detect();
          setHardwareReport(r);
          setHardwareChecking(false);
        }}
      />
    );
  }

  const isModelReady = engineState.status === 'ready' || engineState.status === 'generating';

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-violet-950 selection:text-violet-200">
      {/* Top Header */}
      <Header
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onOpenAuditor={() => setIsAuditorModalOpen(true)}
        onOpenSafety={() => setIsSafetyModalOpen(true)}
        onResetSession={handleResetSession}
        hasMessages={messages.length > 0}
        isOfflineReady={engineState.isOfflineReady}
        currentModel={engineState.currentModel}
      />

      {/* Main View: Onboarding vs Chat */}
      <main className="flex-1 flex flex-col">
        {!isModelReady && messages.length === 0 ? (
          <Onboarding
            onStart={handleStart}
            isLoading={engineState.status === 'loading'}
            loadProgress={engineState.loadProgress}
            recommendedModelId={hardwareReport?.recommendedModelId || DEFAULT_MODEL_ID}
            error={engineState.error}
          />
        ) : (
          <ChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            isGenerating={engineState.status === 'generating'}
            onInterrupt={handleInterrupt}
          />
        )}
      </main>

      {/* Modals */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        currentModel={engineState.currentModel}
        onOpenAuditor={() => setIsAuditorModalOpen(true)}
      />

      <PrivacyAuditPanel
        isOpen={isAuditorModalOpen}
        onClose={() => setIsAuditorModalOpen(false)}
      />

      <SafetyModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        initialJurisdiction={jurisdiction}
      />
    </div>
  );
};

export default App;
