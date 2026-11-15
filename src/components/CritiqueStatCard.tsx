'use client';

import React, { useState } from 'react';
import { feedback } from '../lib/feedback';
import {
  ShieldCheck,
  Zap,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Flame,
  Award,
} from 'lucide-react';

interface CritiqueStatCardProps {
  level?: number;
  overallScore?: number;
  strength?: number;
  discipline?: number;
  formScore?: number;
  recoveryScore?: number;
  currentXp?: number;
  streakCount?: number;
  tier?: number;
  onOpenScanner?: () => void;
  onOpenRatingModal?: () => void;
}

export const CritiqueStatCard: React.FC<CritiqueStatCardProps> = ({
  level = 3,
  overallScore = 88,
  strength = 84,
  discipline = 92,
  formScore = 90,
  recoveryScore = 86,
  currentXp = 1450,
  streakCount = 3,
  tier,
  onOpenScanner,
  onOpenRatingModal,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Compute Athlete Level from XP (Level 1 to 10)
  const calculatedLevel = Math.min(10, Math.max(1, Math.floor(currentXp / 400) + 1));
  const xpIntoCurrentLevel = currentXp % 400;
  const levelProgressPct = Math.round((xpIntoCurrentLevel / 400) * 100);

  const getLevelTitle = (lvl: number) => {
    switch (lvl) {
      case 1:
        return 'RECRUIT ATHLETE';
      case 2:
        return 'CONDITIONED OPERATOR';
      case 3:
        return 'KINETIC WARRIOR';
      case 4:
        return 'ELITE STRATEGIST';
      case 5:
        return 'APEX SPECIMEN';
      case 6:
        return 'TITAN TIER';
      case 7:
        return 'MASTER BIOMECHANIST';
      case 8:
        return 'SOVEREIGN ATHLETE';
      case 9:
        return 'IMMORTAL ENGINE';
      default:
        return 'TRANSCENDENT 10';
    }
  };

  const stats = [
    { label: 'STRENGTH', value: strength, color: 'bg-amber-400', textColor: 'text-amber-400' },
    { label: 'DISCIPLINE', value: discipline, color: 'bg-[#A3E635]', textColor: 'text-[#A3E635]' },
    { label: 'POSTURE & FORM', value: formScore, color: 'bg-sky-400', textColor: 'text-sky-400' },
    { label: 'RECOVERY', value: recoveryScore, color: 'bg-emerald-400', textColor: 'text-emerald-400' },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#121215] shadow-lg overflow-hidden transition-all">
      {/* Top Banner Bar */}
      <div
        onClick={() => {
          feedback.hapticLight();
          setIsExpanded(!isExpanded);
        }}
        className="p-3.5 sm:p-4 bg-gradient-to-r from-[#18181C] to-[#141812] flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A3E635] text-black font-extrabold text-base shadow-[0_0_15px_rgba(163,230,53,0.3)]">
            L{calculatedLevel}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#A3E635] uppercase">
                {getLevelTitle(calculatedLevel)}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {xpIntoCurrentLevel}/400 XP
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-normal font-sans">
                TIER {tier || calculatedLevel} // {getLevelTitle(calculatedLevel)}
              </h3>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  if (onOpenRatingModal) onOpenRatingModal();
                }}
                title="View Viral 9:16 Shareable Athlete Card"
                className="font-mono text-[11px] font-bold text-[#A3E635] bg-[#A3E635]/15 hover:bg-[#A3E635]/25 border border-[#A3E635]/30 px-2 py-0.5 rounded-md whitespace-nowrap active:scale-95 transition"
              >
                {overallScore}/100 RATING ↗
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenScanner && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onOpenScanner();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#A3E635]/15 hover:bg-[#A3E635]/25 border border-[#A3E635]/30 text-xs font-bold text-[#A3E635] active:scale-95 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Scan</span>
            </button>
          )}

          <div className="p-1.5 rounded-lg bg-white/[0.04] text-zinc-400">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </div>

      {/* Level XP Progress Bar */}
      <div className="w-full bg-white/[0.04] h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-amber-400 to-[#A3E635] h-full transition-all duration-500"
          style={{ width: `${levelProgressPct}%` }}
        />
      </div>

      {/* Expanded Stats Body */}
      {isExpanded && (
        <div className="p-4 bg-[#121215] border-t border-white/[0.06] space-y-3.5 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 gap-3">
            {stats.map(s => (
              <div
                key={s.label}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-400 font-mono text-[10px] tracking-wider">
                    {s.label}
                  </span>
                  <span className={`font-mono font-bold ${s.textColor}`}>
                    {s.value}/100
                  </span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`${s.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Flame className="h-4 w-4 text-amber-400 fill-current" />
              <span>{streakCount} Day Streak Active</span>
            </div>
            <div className="flex items-center gap-1 text-[#A3E635]">
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>Total XP: {currentXp}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
