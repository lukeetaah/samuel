/**
 * SAMUEL - Thinking Indicator
 * 
 * Cinematic "oracle processing" animation shown while the local model
 * is computing its response. Evokes the feel of a sentient intelligence
 * parsing reality — rotating cryptic status phrases, glitch pulses,
 * and a calm elapsed timer so the user knows it's working.
 */

import React, { useState, useEffect, useRef } from 'react';

const THINKING_PHRASES = [
  'procesando…',
  'leyendo entre líneas…',
  'buscando el ángulo justo…',
  'conectando patrones…',
  'separando ruido de señal…',
  'ajustando la perspectiva…',
  'encontrando las palabras…',
  'escuchando lo que dijiste…',
  'descifrando intención…',
  'calibrando profundidad…',
  'mapeando el contexto…',
  'preparando la respuesta…',
];

export const ThinkingIndicator: React.FC = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const startRef = useRef(Date.now());

  // Rotate phrases every 3.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % THINKING_PHRASES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Random glitch pulses
  useEffect(() => {
    const triggerGlitch = () => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    };
    const interval = setInterval(() => {
      if (Math.random() > 0.6) triggerGlitch();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
  };

  return (
    <div className="flex flex-col w-full my-4 items-start">
      <div className="max-w-[88%] sm:max-w-[80%] rounded-2xl px-6 py-5 bg-neutral-900/70 border border-violet-500/20 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        {/* Animated bars — three pulsing lines with staggered timing */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1 items-end h-5">
            <div
              className="w-[3px] rounded-full bg-gradient-to-t from-violet-500 to-blue-400 animate-pulse"
              style={{ height: '12px', animationDelay: '0ms', animationDuration: '1.2s' }}
            />
            <div
              className="w-[3px] rounded-full bg-gradient-to-t from-violet-500 to-blue-400 animate-pulse"
              style={{ height: '18px', animationDelay: '200ms', animationDuration: '1.4s' }}
            />
            <div
              className="w-[3px] rounded-full bg-gradient-to-t from-violet-500 to-blue-400 animate-pulse"
              style={{ height: '10px', animationDelay: '400ms', animationDuration: '1.0s' }}
            />
            <div
              className="w-[3px] rounded-full bg-gradient-to-t from-violet-500 to-blue-400 animate-pulse"
              style={{ height: '20px', animationDelay: '100ms', animationDuration: '1.6s' }}
            />
            <div
              className="w-[3px] rounded-full bg-gradient-to-t from-violet-500 to-blue-400 animate-pulse"
              style={{ height: '8px', animationDelay: '300ms', animationDuration: '1.1s' }}
            />
          </div>
          <span className="text-xs font-mono text-violet-300/90 font-medium tracking-wider uppercase">
            SAMUEL
          </span>
        </div>

        {/* Rotating phrase with glitch effect */}
        <div
          className={`text-sm font-light text-neutral-300 tracking-wide transition-all duration-200 ${
            glitch ? 'translate-x-[1px] opacity-70 skew-x-1' : 'opacity-100'
          }`}
        >
          <span className="text-violet-400/70 mr-1 font-mono text-xs">›</span>
          {THINKING_PHRASES[phraseIndex]}
        </div>

        {/* Elapsed + subliminal reassurance */}
        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            inferencia local activa
          </span>
          <span className="tabular-nums text-violet-400/60">{formatTime(elapsed)}</span>
        </div>

        {/* Progress shimmer bar */}
        <div className="mt-3 h-[2px] w-full bg-neutral-800 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-violet-500/60 to-transparent rounded-full animate-shimmer" />
        </div>
      </div>
    </div>
  );
};
