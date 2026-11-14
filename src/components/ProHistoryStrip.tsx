'use client';

import React from 'react';
import { WorkoutHistoryEntry } from '../lib/storage';
import { Check, Flame, Trophy, TrendingUp } from 'lucide-react';

interface ProHistoryStripProps {
  history: WorkoutHistoryEntry[];
  streakCount: number;
}

export const ProHistoryStrip: React.FC<ProHistoryStripProps> = ({
  history,
  streakCount,
}) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const recentEntries = [...history].slice(-7);

  const mockWeekly = days.map((dayName, idx) => {
    const entry = recentEntries[idx];
    const isCompleted = !!entry || idx < Math.min(streakCount, 4);
    const score = entry ? entry.score : isCompleted ? 100 : 0;

    return {
      dayName,
      isCompleted,
      score,
      tier: entry ? `T${entry.tier}` : 'T3',
      modality: entry ? (entry.path === 'BODYWEIGHT' ? 'BW' : 'GYM') : 'BW',
    };
  });

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#121215] p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[#A3E635]" />
          <h3 className="text-xs font-semibold text-white tracking-tight">
            7-Day Consistency History
          </h3>
          <span className="rounded-full bg-[#A3E635]/15 px-2 py-0.5 text-[10px] font-semibold text-[#A3E635]">
            Pro Active
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-1 font-mono-numbers">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-white font-medium">{streakCount} Day Streak</span>
          </div>
          <span className="text-zinc-600">·</span>
          <span>{history.length} Sessions Logged</span>
        </div>
      </div>

      {/* 7-Day Day Dots / Card Strip */}
      <div className="grid grid-cols-7 gap-2">
        {mockWeekly.map((item, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center justify-between rounded-lg border p-2.5 transition text-center ${
              item.isCompleted
                ? 'border-[#A3E635]/30 bg-[#A3E635]/[0.05]'
                : 'border-white/[0.04] bg-[#18181C]'
            }`}
          >
            <span className="text-[11px] font-medium text-zinc-400">{item.dayName}</span>

            <div className="my-2">
              {item.isCompleted ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A3E635] text-zinc-950 font-bold">
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
              ) : (
                <div className="h-6 w-6 rounded-full border border-zinc-700 bg-transparent flex items-center justify-center text-[10px] text-zinc-600">
                  —
                </div>
              )}
            </div>

            <div className="font-mono-numbers text-[11px] text-zinc-400">
              {item.isCompleted ? `${item.score}%` : 'Rest'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
