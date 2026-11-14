'use client';

import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Snowflake,
  Send,
  RotateCcw,
  Sparkles,
  Bot,
} from 'lucide-react';

interface CoachCommandBarProps {
  onSendCommand: (prompt: string) => Promise<void>;
  isLoading: boolean;
  activeCommand?: string;
  onResetToBaseline: () => void;
  isAiLive?: boolean;
}

export const CoachCommandBar: React.FC<CoachCommandBarProps> = ({
  onSendCommand,
  isLoading,
  activeCommand,
  onResetToBaseline,
  isAiLive = true,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');

  const quickChips = [
    { label: 'Make It Harder', icon: Flame },
    { label: 'Short on Time (15m)', icon: Zap },
    { label: 'Recovery / Mobility Day', icon: Snowflake },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() || isLoading) return;
    const p = customPrompt.trim();
    setCustomPrompt('');
    await onSendCommand(p);
  };

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#121215] p-3.5 sm:p-4 space-y-3">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#A3E635]" />
          <span className="text-xs font-semibold text-white tracking-tight">
            AI Coach Command Bar
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A3E635] animate-pulse" />
            <span>{isAiLive ? 'Live Cloud AI' : 'Deterministic Engine'}</span>
          </span>
        </div>

        {activeCommand && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-sky-400 font-medium">
              Active: {activeCommand}
            </span>
            <button
              type="button"
              onClick={onResetToBaseline}
              title="Reset to baseline"
              className="flex items-center gap-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] px-2 py-0.5 text-[11px] text-zinc-300 transition"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {/* Non-blocking synthesizing banner when loading */}
      {isLoading && (
        <div className="flex items-center gap-2.5 rounded-lg border border-[#A3E635]/30 bg-[#A3E635]/[0.06] p-2.5 text-xs text-zinc-200 animate-pulse">
          <Bot className="h-4 w-4 text-[#A3E635] flex-shrink-0" />
          <span>Coach is synthesizing your biomechanical protocol in the cloud...</span>
        </div>
      )}

      {/* Quick Action Chips Row */}
      <div className="flex flex-wrap items-center gap-1.5">
        {quickChips.map(chip => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.label}
              type="button"
              disabled={isLoading}
              onClick={() => onSendCommand(chip.label)}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-[#18181C] px-2.5 py-1 text-xs font-medium text-zinc-300 hover:border-white/[0.14] hover:text-white transition disabled:opacity-50"
            >
              <Icon className="h-3.5 w-3.5 text-zinc-400" />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Command Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={customPrompt}
          onChange={e => setCustomPrompt(e.target.value)}
          placeholder="E.g., Swap dips for push-ups, lower back tight today, add core..."
          disabled={isLoading}
          className="flex-1 rounded-lg border border-white/[0.07] bg-[#18181C] px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-[#A3E635]/60 focus:outline-none transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !customPrompt.trim()}
          className="flex items-center gap-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-40"
        >
          {isLoading ? (
            <span>Thinking...</span>
          ) : (
            <>
              <span>Send</span>
              <Send className="h-3 w-3" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
