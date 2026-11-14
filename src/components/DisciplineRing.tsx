'use client';

import React from 'react';
import { Flame, Check, Shield, Zap, Sparkles } from 'lucide-react';

interface DisciplineRingProps {
  completedSets: number;
  totalSets: number;
  completedFuel: number;
  totalFuel: number;
  completedAvoid: number;
  totalAvoid: number;
  onIncrementStreak?: () => void;
  streakCount: number;
  coachQuote?: string;
  coachName?: string;
  userXp?: number;
}

export const DisciplineRing: React.FC<DisciplineRingProps> = ({
  completedSets,
  totalSets,
  completedFuel,
  totalFuel,
  completedAvoid,
  totalAvoid,
  onIncrementStreak,
  streakCount,
  coachQuote,
  coachName,
  userXp = 350,
}) => {
  const totalItems = totalSets + totalFuel + totalAvoid;
  const completedItems = completedSets + completedFuel + completedAvoid;
  const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isAllCleared = totalItems > 0 && completedItems === totalItems;

  // Level & XP Math (Each level is 500 XP)
  const currentLevel = Math.floor(userXp / 500) + 1;
  const xpInCurrentLevel = userXp % 500;
  const xpPct = Math.round((xpInCurrentLevel / 500) * 100);

  // SVG Ring Calculations
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#121215] p-4 sm:p-5 shadow-sm space-y-4">
      {/* Athlete XP & Rank Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#A3E635] text-zinc-950 font-bold text-[10px]">
            <Zap className="h-3 w-3 fill-current" />
          </div>
          <span className="text-xs font-bold text-white tracking-tight">
            LVL {currentLevel} · {currentLevel >= 4 ? 'APEX ATHLETE' : currentLevel >= 3 ? 'WARRIOR' : 'CONDITIONED'}
          </span>
          <span className="font-mono-numbers text-[11px] text-[#A3E635] font-semibold">
            {xpInCurrentLevel} / 500 XP
          </span>
        </div>

        {/* Level XP Progress Bar */}
        <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#A3E635] transition-all duration-500 rounded-full"
              style={{ width: `${xpPct}%` }}
            />
          </div>
          <span className="font-mono-numbers text-[10px] text-zinc-500">{xpPct}%</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        {/* Left: SVG Ring + Metrics Overview */}
        <div className="flex items-center gap-5 w-full lg:w-auto">
          {/* Circular Progress Ring */}
          <div className="relative flex-shrink-0 h-20 w-20 flex items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 88 88">
              <circle
                cx="44"
                cy="44"
                r={radius}
                className="stroke-zinc-800/80 fill-none"
                strokeWidth="6"
              />
              <circle
                cx="44"
                cy="44"
                r={radius}
                className={`fill-none transition-all duration-500 ease-out ${
                  isAllCleared
                    ? 'stroke-[#A3E635]'
                    : percentage > 50
                    ? 'stroke-sky-400'
                    : 'stroke-[#A3E635]'
                }`}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>

            {/* Inner Percentage Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono-numbers">
              <span className={`text-lg font-bold ${isAllCleared ? 'text-[#A3E635]' : 'text-white'}`}>
                {percentage}%
              </span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500">
                Done
              </span>
            </div>
          </div>

          {/* 3 Metric Columns */}
          <div className="grid grid-cols-3 gap-4 flex-1 lg:flex-initial">
            <div>
              <span className="text-[11px] font-medium text-zinc-400 block">Sets</span>
              <span className="font-mono-numbers text-sm font-semibold text-white">
                {completedSets} <span className="text-zinc-500 text-xs">/ {totalSets}</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-zinc-400 block">Fuel</span>
              <span className="font-mono-numbers text-sm font-semibold text-white">
                {completedFuel} <span className="text-zinc-500 text-xs">/ {totalFuel}</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-zinc-400 block">Guardrails</span>
              <span className="font-mono-numbers text-sm font-semibold text-white">
                {completedAvoid} <span className="text-zinc-500 text-xs">/ {totalAvoid}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Coach Briefing without line-clamp truncation */}
        {coachQuote && (
          <div className="flex-1 lg:border-l lg:border-white/[0.06] lg:pl-5 w-full">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A3E635]" />
              <span>{coachName || 'Daily Coach Directive'}</span>
            </div>
            <p className="text-sm font-normal text-zinc-200 leading-relaxed">
              "{coachQuote.replace(/^"|"$/g, '')}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
