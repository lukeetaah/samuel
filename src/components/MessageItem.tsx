/**
 * SAMUEL - Message Item Component
 * 
 * Displays chat messages, streaming tokens, and contextual "¿Por qué preguntaste eso?" explanations.
 */

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { ChatMessage } from '../core/types';

interface MessageItemProps {
  message: ChatMessage;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const [showRationale, setShowRationale] = useState(false);
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={`flex flex-col w-full my-3.5 transition-all ${
        isAssistant ? 'items-start' : 'items-end'
      }`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-5 py-4 text-base leading-relaxed break-words shadow-sm ${
          isAssistant
            ? 'bg-neutral-900/90 border border-neutral-800 text-neutral-100 font-sans'
            : 'bg-neutral-800/80 border border-neutral-700/50 text-neutral-200 font-sans'
        }`}
      >
        {/* Main Content */}
        <div className="whitespace-pre-wrap">
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse align-middle" />
          )}
        </div>

        {/* Explainability Button for Assistant Questions */}
        {isAssistant && !message.isStreaming && message.questionRationale && (
          <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex flex-col items-start">
            <button
              onClick={() => setShowRationale(!showRationale)}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-emerald-400 font-medium transition-colors cursor-pointer select-none"
            >
              <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
              <span>¿Por qué preguntaste eso?</span>
              {showRationale ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showRationale && (
              <div className="mt-2 p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-300 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-150">
                <span className="text-emerald-400 font-medium block mb-0.5">Propósito conversacional:</span>
                {message.questionRationale}
              </div>
            )}
          </div>
        )}

        {/* Subtle Token Generation Meta */}
        {isAssistant && !message.isStreaming && message.tokensGenerated && message.generationTimeMs && (
          <div className="mt-2 text-[10px] text-neutral-500 font-mono flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-neutral-600" />
            <span>
              {message.tokensGenerated} tokens en {(message.generationTimeMs / 1000).toFixed(1)}s (
              {((message.tokensGenerated / message.generationTimeMs) * 1000).toFixed(1)} t/s)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
