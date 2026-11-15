'use client';

import React, { useState, useMemo } from 'react';
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
  Crown,
  ChevronUp,
  Target,
  Sparkles,
} from 'lucide-react';

export interface LeaderboardAthlete {
  id: string;
  name: string;
  rank?: number;
  tier: number;
  streak: number;
  xp: number;
  modality: string;
  score: number;
  verifiedSets?: number;
  isCurrentUser?: boolean;
  isRival?: boolean;
  isPro?: boolean;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  athletes: LeaderboardAthlete[];
  currentUserId?: string;
  currentUserXp?: number;
  currentUserTier?: number;
  athleteCallsign?: string;
  verifiedSetsCount?: number;
  streakCount?: number;
  isPro?: boolean;
}

const DEFAULT_RIVALS: LeaderboardAthlete[] = [
  { id: 'rival_1', name: 'KAI // APEX', tier: 5, streak: 42, xp: 9450, modality: 'BODYWEIGHT', score: 98, verifiedSets: 64, isRival: true, isPro: true },
  { id: 'rival_2', name: 'VALKYRIE-9', tier: 5, streak: 38, xp: 8720, modality: 'GYM', score: 96, verifiedSets: 58, isRival: true, isPro: true },
  { id: 'rival_3', name: 'MARCUS // ZERO', tier: 4, streak: 27, xp: 6850, modality: 'BODYWEIGHT', score: 93, verifiedSets: 45, isRival: true, isPro: true },
  { id: 'rival_4', name: 'TITAN_DRAKE', tier: 4, streak: 21, xp: 5900, modality: 'GYM', score: 91, verifiedSets: 39, isRival: true, isPro: false },
  { id: 'rival_5', name: 'SHADOW_CALI', tier: 3, streak: 16, xp: 4420, modality: 'BODYWEIGHT', score: 88, verifiedSets: 32, isRival: true, isPro: true },
  { id: 'rival_6', name: 'ATLAS // HYBRID', tier: 3, streak: 14, xp: 3950, modality: 'GYM', score: 86, verifiedSets: 28, isRival: true, isPro: false },
  { id: 'rival_7', name: 'VECTOR_PRIME', tier: 3, streak: 11, xp: 2850, modality: 'BODYWEIGHT', score: 85, verifiedSets: 22, isRival: true, isPro: false },
  { id: 'rival_8', name: 'NEXUS_FIT', tier: 2, streak: 9, xp: 2600, modality: 'BODYWEIGHT', score: 82, verifiedSets: 19, isRival: true, isPro: false },
  { id: 'rival_9', name: 'RONIN_IRON', tier: 2, streak: 7, xp: 2100, modality: 'GYM', score: 80, verifiedSets: 15, isRival: true, isPro: true },
  { id: 'rival_10', name: 'GHOST_RUNNER', tier: 1, streak: 4, xp: 1250, modality: 'BODYWEIGHT', score: 75, verifiedSets: 10, isRival: true, isPro: false },
  { id: 'rival_11', name: 'RECRUIT_V', tier: 1, streak: 2, xp: 750, modality: 'GYM', score: 72, verifiedSets: 6, isRival: true, isPro: false },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  athletes,
  currentUserId = 'vectr_user',
  currentUserXp = 1450,
  currentUserTier = 3,
  athleteCallsign = 'YOU (ATHLETE)',
  verifiedSetsCount = 8,
  streakCount = 3,
  isPro = false,
}) => {
  const [activeTab, setActiveTab] = useState<'tier' | 'global'>('tier');

  // Unified dynamic roster computation
  const { sortedAthletes, userRank, nextRival } = useMemo(() => {
    // 1. Gather all unique athletes
    const map = new Map<string, LeaderboardAthlete>();

    // Add seeded rivals
    DEFAULT_RIVALS.forEach(r => map.set(r.id, { ...r }));

    // Merge incoming athletes from Convex
    athletes.forEach(a => {
      map.set(a.id, {
        ...a,
        isCurrentUser: a.isCurrentUser || a.id === currentUserId,
      });
    });

    // Inject/Update current user entry with live real-time XP
    map.set(currentUserId, {
      id: currentUserId,
      name: athleteCallsign,
      tier: currentUserTier,
      streak: streakCount,
      xp: currentUserXp,
      modality: 'BODYWEIGHT',
      score: 92,
      verifiedSets: verifiedSetsCount,
      isCurrentUser: true,
      isPro,
    });

    const all = Array.from(map.values());

    // Filter by tab
    const filtered =
      activeTab === 'tier'
        ? all.filter(a => a.tier === currentUserTier || a.isCurrentUser)
        : all;

    // Sort descending by XP
    filtered.sort((a, b) => b.xp - a.xp);

    // Assign 1-indexed ranks
    const ranked = filtered.map((ath, idx) => ({
      ...ath,
      rank: idx + 1,
    }));

    const uRank = ranked.find(a => a.isCurrentUser)?.rank || 1;
    const rivalAhead = ranked.find(a => (a.rank || 0) === uRank - 1);

    return {
      sortedAthletes: ranked,
      userRank: uRank,
      nextRival: rivalAhead,
    };
  }, [
    athletes,
    currentUserId,
    currentUserXp,
    currentUserTier,
    athleteCallsign,
    streakCount,
    verifiedSetsCount,
    isPro,
    activeTab,
  ]);

  if (!isOpen) return null;

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-black font-black text-xs shadow-[0_0_15px_rgba(251,191,36,0.5)]">
            1
          </div>
        );
      case 2:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-300 text-black font-black text-xs shadow-sm">
            2
          </div>
        );
      case 3:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-white font-black text-xs shadow-sm">
            3
          </div>
        );
      default:
        return (
          <span className="font-mono text-xs font-bold text-zinc-400 w-7 text-center">
            #{rank}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0E0E12] border border-white/[0.1] shadow-2xl overflow-hidden flex flex-col h-[92vh] max-h-[820px]">
        {/* Top Header */}
        <div className="border-b border-white/[0.08] bg-[#141418] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                  VECTR RANKED ARENA
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#A3E635] animate-ping" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Competitive Division · Season 1
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              feedback.hapticLight();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition active:scale-90 border border-white/[0.06]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Division Filter Tabs */}
        <div className="p-3 bg-[#111115] border-b border-white/[0.06]">
          <div className="grid grid-cols-2 gap-1.5 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
            <button
              type="button"
              onClick={() => {
                feedback.hapticLight();
                setActiveTab('tier');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'tier'
                  ? 'bg-[#A3E635] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              <span>TIER {currentUserTier} DIVISION</span>
            </button>
            <button
              type="button"
              onClick={() => {
                feedback.hapticLight();
                setActiveTab('global');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'global'
                  ? 'bg-[#A3E635] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>GLOBAL APEX</span>
            </button>
          </div>
        </div>

        {/* Promotion Zone Banner */}
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChevronUp className="h-4 w-4 text-emerald-400 stroke-[3]" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-emerald-400">
              ▲ TIER PROMOTION ZONE (TOP 5)
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">
            Ends Sunday 23:59 UTC
          </span>
        </div>

        {/* Scrollable Ranked Athletes List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 pb-24">
          {sortedAthletes.map(athlete => {
            const isMe = athlete.isCurrentUser;
            const inPromotionZone = (athlete.rank || 0) <= 5;

            return (
              <div
                key={athlete.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between relative ${
                  isMe
                    ? 'border-[#A3E635] bg-[#A3E635]/10 shadow-[0_0_20px_rgba(163,230,53,0.15)] ring-1 ring-[#A3E635]'
                    : inPromotionZone
                    ? 'border-emerald-500/30 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]'
                    : 'border-white/[0.06] bg-[#141418] hover:border-white/[0.12]'
                }`}
              >
                {/* Left side: Rank badge + Athlete Info */}
                <div className="flex items-center gap-3">
                  {getRankBadge(athlete.rank || 0)}

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-xs font-bold ${
                          isMe ? 'text-[#A3E635]' : 'text-zinc-100'
                        }`}
                      >
                        {athlete.name}
                      </span>

                      {isMe && (
                        <span className="rounded bg-[#A3E635] px-1 py-0.2 text-[9px] font-black text-black">
                          YOU
                        </span>
                      )}

                      {athlete.isPro && (
                        <span className="flex items-center gap-0.5 rounded bg-amber-400/20 border border-amber-400/40 px-1 py-0.2 text-[9px] font-black text-amber-300">
                          <Crown className="h-2.5 w-2.5 fill-current" />
                          PRO
                        </span>
                      )}

                      {inPromotionZone && (
                        <span className="text-[9px] font-mono text-emerald-400 font-bold hidden xs:inline">
                          ▲ PROMOTE
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
                      <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-zinc-300 font-semibold">
                        Tier {athlete.tier}
                      </span>
                      <span>{athlete.verifiedSets || 12} Sets Verified</span>
                      <span>Form: {athlete.score}/100</span>
                    </div>
                  </div>
                </div>

                {/* Right side: XP score + Streak */}
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-white flex items-center gap-1 justify-end">
                    <Zap className="h-3.5 w-3.5 text-[#A3E635] fill-current" />
                    <span className="text-zinc-100">{athlete.xp.toLocaleString()} XP</span>
                  </div>
                  <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1 justify-end mt-0.5">
                    <Flame className="h-3 w-3 fill-current" />
                    <span>{athlete.streak}d streak</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pinned Bottom Live User Rank Card */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-[#141418] border-t border-white/[0.1] shadow-[0_-10px_25px_rgba(0,0,0,0.5)] z-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A3E635] text-black font-black text-xs shadow-[0_0_15px_rgba(163,230,53,0.3)]">
              #{userRank}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">
                  {athleteCallsign}
                </span>
                <span className="rounded bg-[#A3E635] px-1 py-0.2 text-[9px] font-black text-black">
                  LIVE
                </span>
                {isPro && (
                  <span className="flex items-center gap-0.5 rounded bg-amber-400/20 px-1 py-0.2 text-[9px] font-bold text-amber-300">
                    <Crown className="h-2.5 w-2.5 fill-current" />
                    PRO
                  </span>
                )}
              </div>
              <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                {nextRival ? (
                  <span className="text-emerald-400 font-medium">
                    ⚡ {nextRival.xp - currentUserXp + 25} XP to pass #{nextRival.rank} {nextRival.name}
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold">
                    👑 CURRENT DIVISION LEADER!
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-sm font-black text-[#A3E635] flex items-center gap-1 justify-end">
              <Zap className="h-4 w-4 fill-current" />
              <span>{currentUserXp.toLocaleString()} XP</span>
            </div>
            <div className="text-[10px] text-zinc-400">
              Rank #{userRank} of {sortedAthletes.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
