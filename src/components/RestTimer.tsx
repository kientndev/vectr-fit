'use client';

import React, { useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  X,
  Clock,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { sounds } from '../lib/soundUtils';

export interface RestTimerState {
  isActive: boolean;
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  soundEnabled: boolean;
}

interface RestTimerProps {
  timer: RestTimerState;
  onTogglePlay: () => void;
  onAdjustSeconds: (delta: number) => void;
  onReset: () => void;
  onClose: () => void;
  onToggleSound: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  timer,
  onTogglePlay,
  onAdjustSeconds,
  onReset,
  onClose,
  onToggleSound,
}) => {
  const {
    isActive,
    exerciseName,
    setNumber,
    totalSets,
    totalSeconds,
    remainingSeconds,
    isRunning,
    soundEnabled,
  } = timer;

  useEffect(() => {
    if (isActive && remainingSeconds === 0 && totalSeconds > 0) {
      if (soundEnabled) {
        sounds.playRestFinished();
      }
    }
  }, [isActive, remainingSeconds, totalSeconds, soundEnabled]);

  if (!isActive) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progressPercent =
    totalSeconds > 0
      ? Math.max(0, Math.min(100, ((totalSeconds - remainingSeconds) / totalSeconds) * 100))
      : 100;
  const isDone = remainingSeconds === 0;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-none">
      <div className="pointer-events-auto rounded-xl border border-white/[0.08] bg-[#121215] shadow-2xl overflow-hidden">
        {/* Sleek top progress bar */}
        <div className="h-1 w-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isDone ? 'bg-[#A3E635]' : 'bg-[#A3E635]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-3.5 flex items-center justify-between gap-4">
          {/* Left Info */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-white">
              <Clock className="h-4 w-4 text-[#A3E635]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white tracking-tight">
                  {exerciseName || 'Rest Period'}
                </span>
                <span className="text-[11px] text-zinc-500">
                  Set {setNumber} of {totalSets}
                </span>
              </div>
              <div className="text-[11px] text-zinc-400">
                {isDone ? 'Rest Complete — Ready for next set' : 'Recovery countdown'}
              </div>
            </div>
          </div>

          {/* Center Digital Clock */}
          <div className="font-mono-numbers text-xl font-bold tracking-tight text-white">
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onAdjustSeconds(-15)}
              title="-15s"
              className="h-7 w-7 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 flex items-center justify-center text-xs transition"
            >
              -15
            </button>
            <button
              onClick={() => onAdjustSeconds(15)}
              title="+15s"
              className="h-7 w-7 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 flex items-center justify-center text-xs transition"
            >
              +15
            </button>
            <button
              onClick={onTogglePlay}
              title={isRunning ? 'Pause' : 'Play'}
              className="h-7 w-7 rounded-md bg-[#A3E635] text-zinc-950 flex items-center justify-center transition hover:bg-[#bbf055]"
            >
              {isRunning ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
            </button>
            <button
              onClick={onReset}
              title="Reset timer"
              className="h-7 w-7 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white flex items-center justify-center transition"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute' : 'Unmute'}
              className="h-7 w-7 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white flex items-center justify-center transition"
            >
              {soundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
            </button>
            <button
              onClick={onClose}
              title="Close timer"
              className="h-7 w-7 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
