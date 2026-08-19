/**
 * SAMUEL - Chat View Component
 * 
 * Sanctuary interface: intimate, distraction-free, focused on active listening.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Square, ArrowUp } from 'lucide-react';
import { ChatMessage } from '../core/types';
import { MessageItem } from './MessageItem';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isGenerating: boolean;
  onInterrupt: () => void;
}

const STARTER_PROMPTS = [
  'Hola.',
  'No sé qué me pasa.',
  'Estoy harto.',
  'Necesito pensar algo.',
  'Quiero descargarme.',
];

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isGenerating,
  onInterrupt,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Auto-focus input on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;
    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(140, e.target.scrollHeight)}px`;
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-3xl w-full mx-auto px-4 sm:px-6 h-[calc(100svh-65px)]">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 no-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-light text-neutral-200">
                ¿Qué tenés en la cabeza?
              </h2>
              <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
                Podés escribir lo que quieras, empezar por una palabra o descargar lo que sentís.
              </p>
            </div>

            {/* Quick Starters */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt)}
                  className="px-4 py-2 rounded-full text-xs bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="py-4 border-t border-neutral-800/80 bg-neutral-950/95 sticky bottom-0">
        <div className="relative flex items-end gap-2 bg-neutral-900 border border-neutral-800 focus-within:border-neutral-700 rounded-2xl p-2.5 shadow-lg transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Decí lo que quieras..."
            className="w-full resize-none bg-transparent text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none px-2 py-1 max-h-[140px] leading-relaxed"
          />

          {isGenerating ? (
            <button
              onClick={onInterrupt}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors shrink-0"
              title="Detener respuesta"
            >
              <Square className="w-4 h-4 fill-neutral-300" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`p-2 rounded-xl transition-all shrink-0 ${
                input.trim()
                  ? 'bg-neutral-100 hover:bg-white text-neutral-950 cursor-pointer shadow-md'
                  : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
              }`}
              title="Enviar mensaje"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Discreet bottom statement */}
        <div className="text-center pt-2 text-[11px] text-neutral-400 select-none">
          CONFIDENCIAL · Procesamiento local en este dispositivo
        </div>
      </div>
    </div>
  );
};
