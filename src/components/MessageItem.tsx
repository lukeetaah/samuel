/**
 * SAMUEL - Message Item Component
 * 
 * Displays chat messages, streaming tokens, and contextual "¿Por qué preguntaste eso?" explanations.
 * lukson.arts visual universe: refined dark glass, violet ambient touches, and immaculate typography.
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
      className={`flex flex-col w-full my-4 transition-all ${
        isAssistant ? 'items-start' : 'items-end'
      }`}
    >
      <div
        className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-6 py-5 text-base leading-relaxed break-words shadow-2xl transition-all ${
          isAssistant
            ? 'bg-neutral-900/70 border border-violet-500/20 text-neutral-100 font-sans backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
            : 'bg-gradient-to-br from-violet-950/40 via-neutral-900/90 to-neutral-950 border border-violet-500/30 text-neutral-100 font-sans backdrop-blur-md shadow-[0_4px_20px_rgba(139,92,246,0.08)]'
        }`}
      >
        {/* Main Content */}
        <div className="whitespace-pre-wrap font-light tracking-wide text-[15px] sm:text-base">
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1.5 bg-gradient-to-b from-violet-400 to-blue-400 animate-pulse align-middle rounded-full" />
          )}
        </div>

        {/* Explainability Button for Assistant Questions */}
        {isAssistant && !message.isStreaming && message.questionRationale && (
          <div className="mt-4 pt-3 border-t border-violet-500/15 flex flex-col items-start">
            <button
              onClick={() => setShowRationale(!showRationale)}
              className="inline-flex items-center gap-1.5 text-xs text-violet-300/80 hover:text-violet-200 font-medium transition-colors cursor-pointer select-none group"
            >
              <HelpCircle className="w-3.5 h-3.5 text-violet-400/70 group-hover:text-violet-300" />
              <span>¿Por qué preguntaste eso?</span>
              {showRationale ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showRationale && (
              <div className="mt-2.5 p-3.5 rounded-xl bg-neutral-950/80 border border-violet-500/20 text-xs text-neutral-300 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-150">
                <span className="text-violet-400 font-medium block mb-1 font-mono text-[11px]">
                  PROPÓSITO CONVERSACIONAL
                </span>
                {message.questionRationale}
              </div>
            )}
          </div>
        )}

        {/* Subtle Generation Stats */}
        {isAssistant && !message.isStreaming && message.tokensGenerated && message.generationTimeMs && (
          <div className="mt-2.5 text-[10px] text-neutral-500 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-violet-500/70" />
            <span>
              {message.tokensGenerated} tokens · {(message.generationTimeMs / 1000).toFixed(1)}s (
              {((message.tokensGenerated / message.generationTimeMs) * 1000).toFixed(1)} t/s)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
