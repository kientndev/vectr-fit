'use client';

import React from 'react';
import { feedback } from '../lib/feedback';
import {
  Trophy,
  Flame,
  Zap,
  X,
  Shield,
  Medal,
  TrendingUp,
  Award,
} from 'lucide-react';

export interface LeaderboardAthlete {
  id: string;
  name: string;
  rank: number;
  tier: number;
  streak: number;
  xp: number;
  modality: string;
  score: number;
  isCurrentUser?: boolean;
  isRival?: boolean;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  athletes: LeaderboardAthlete[];
  currentUserId?: string;
  currentUserXp?: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  athletes,
  currentUserId,
  currentUserXp = 1450,
}) => {
  if (!isOpen) return null;

  const top3 = athletes.slice(0, 3);
  const restAthletes = athletes.slice(3);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-black font-extrabold text-xs shadow-[0_0_15px_rgba(251,191,36,0.5)]">
            1
          </div>
        );
      case 2:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-300 text-black font-extrabold text-xs shadow-sm">
            2
          </div>
        );
      case 3:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-white font-extrabold text-xs shadow-sm">
            3
          </div>
        );
      default:
        return (
          <span className="font-mono text-xs font-bold text-zinc-500 w-7 text-center">
            #{rank}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#121215] border border-white/[0.1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="border-b border-white/[0.08] bg-[#18181C] p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                  Global Division
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#A3E635] animate-ping" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Athlete Leaderboard · Season 1
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition active:scale-95 border border-white/[0.06]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Podium Top 3 Highlight */}
        <div className="p-4 bg-gradient-to-b from-[#18181C] to-[#121215] border-b border-white/[0.06] grid grid-cols-3 gap-2">
          {top3.map(athlete => (
            <div
              key={athlete.id}
              className={`rounded-2xl p-3 flex flex-col items-center text-center border relative ${
                athlete.rank === 1
                  ? 'border-amber-400/50 bg-amber-400/[0.06] shadow-[0_0_20px_rgba(251,191,36,0.15)]'
                  : 'border-white/[0.06] bg-white/[0.02]'
              }`}
            >
              <div className="mb-2">{getRankBadge(athlete.rank)}</div>
              <div className="text-xs font-bold text-white truncate max-w-[100px]">
                {athlete.name}
              </div>
              <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                T{athlete.tier} · {athlete.xp} XP
              </div>
              <div className="mt-1 flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400">
                <Flame className="h-3 w-3 fill-current" />
                <span>{athlete.streak}d</span>
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable Rank List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {restAthletes.map(athlete => {
            const isMe = athlete.isCurrentUser;
            return (
              <div
                key={athlete.id}
                className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                  isMe
                    ? 'border-[#A3E635] bg-[#A3E635]/10 shadow-[0_0_15px_rgba(163,230,53,0.15)]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getRankBadge(athlete.rank)}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${isMe ? 'text-[#A3E635]' : 'text-white'}`}>
                        {athlete.name}
                      </span>
                      {isMe && (
                        <span className="rounded bg-[#A3E635] px-1 py-0.2 text-[9px] font-black text-black">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
                      <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-zinc-300">
                        Tier {athlete.tier}
                      </span>
                      <span>{athlete.modality}</span>
                      <span>Form: {athlete.score}/100</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-white flex items-center gap-1 justify-end">
                    <Zap className="h-3 w-3 text-[#A3E635] fill-current" />
                    <span>{athlete.xp} XP</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1 justify-end mt-0.5">
                    <Flame className="h-3 w-3 text-amber-400 fill-current" />
                    <span>{athlete.streak}d streak</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="border-t border-white/[0.06] bg-[#18181C] p-3 text-center">
          <p className="text-[11px] text-zinc-400 font-medium">
            Lock in workouts and good form reps to climb the global leaderboard.
          </p>
        </div>
      </div>
    </div>
  );
};
