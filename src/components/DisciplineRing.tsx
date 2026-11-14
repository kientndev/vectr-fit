'use client';

import React from 'react';
import { Flame, Check, Shield } from 'lucide-react';

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
}) => {
  const totalItems = totalSets + totalFuel + totalAvoid;
  const completedItems = completedSets + completedFuel + completedAvoid;
  const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isAllCleared = totalItems > 0 && completedItems === totalItems;

  // SVG Ring Calculations
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#121215] p-4 sm:p-5 shadow-sm">
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

        {/* Right: Coach Briefing Snippet in Clean Typography */}
        {coachQuote && (
          <div className="flex-1 lg:border-l lg:border-white/[0.06] lg:pl-5 w-full">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A3E635]" />
              <span>{coachName || 'Daily Coach Directive'}</span>
            </div>
            <p className="text-sm font-normal text-zinc-300 leading-snug line-clamp-2">
              "{coachQuote.replace(/^"|"$/g, '')}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
