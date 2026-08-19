/**
 * SAMUEL - Chat View Component
 * 
 * Sanctuary interface: intimate, distraction-free, focused on active listening.
 * lukson.arts visual universe: luxury dark glass and refined glowing capsules.
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
  'Quiero renunciar.',
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
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(140, e.target.scrollHeight)}px`;
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-3xl w-full mx-auto px-4 sm:px-6 h-[calc(100svh-70px)]">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 no-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-300">
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-serif font-light tracking-tight bg-gradient-to-r from-white via-neutral-200 to-violet-300 bg-clip-text text-transparent">
                ¿Qué tenés en la cabeza?
              </h2>
              <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed font-light">
                Podés escribir lo que quieras, empezar por una palabra o descargar lo que sentís.
              </p>
            </div>

            {/* Quick Starters */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-lg">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt)}
                  className="px-4 py-2 rounded-full text-xs bg-neutral-900/80 border border-violet-500/20 hover:border-violet-500/50 text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] hover:scale-105 backdrop-blur-md"
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
      <div className="py-4 border-t border-violet-500/10 bg-neutral-950/80 backdrop-blur-xl sticky bottom-0">
        <div className="relative flex items-end gap-2 bg-neutral-900/80 border border-violet-500/20 focus-within:border-violet-500/60 focus-within:shadow-[0_0_30px_rgba(139,92,246,0.18)] rounded-2xl p-3 shadow-2xl transition-all backdrop-blur-xl">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Decí lo que quieras..."
            className="w-full resize-none bg-transparent text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none px-2 py-1 max-h-[140px] leading-relaxed font-light"
          />

          {isGenerating ? (
            <button
              onClick={onInterrupt}
              className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors shrink-0"
              title="Detener respuesta"
            >
              <Square className="w-4 h-4 fill-neutral-300" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`p-2.5 rounded-xl transition-all shrink-0 ${
                input.trim()
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                  : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
              }`}
              title="Enviar mensaje"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Discreet bottom statement */}
        <div className="text-center pt-2 text-[11px] text-neutral-500 select-none tracking-wide">
          CONFIDENCIAL · Procesamiento local en este dispositivo · lukson.arts
        </div>
      </div>
    </div>
  );
};
