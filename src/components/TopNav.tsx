'use client';

import React from 'react';
import { Flame, Crown, RotateCw, User, Cloud, CloudOff } from 'lucide-react';
import { DifficultyTier, Modality } from '../types/protocol';
import { TIER_CONFIG } from '../lib/protocolEngine';
import { UserButton, SignInButton, useUser } from '@clerk/clerk-react';

interface TopNavProps {
  tier: DifficultyTier;
  modality: Modality;
  streakCount: number;
  onIncrementStreak: () => void;
  onOpenProModal: () => void;
  isPro: boolean;
  onAdvanceDay: () => void;
  activeView?: 'today' | 'recovery' | 'history';
  onViewChange?: (view: 'today' | 'recovery' | 'history') => void;
  isCloudConnected?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  tier,
  modality,
  streakCount,
  onIncrementStreak,
  onOpenProModal,
  isPro,
  onAdvanceDay,
  activeView = 'today',
  onViewChange,
  isCloudConnected = false,
}) => {
  const tierInfo = TIER_CONFIG[tier];
  
  // Safely check user from Clerk if configured
  let user: any = null;
  let isClerkAvailable = false;
  try {
    const authState = useUser();
    user = authState?.user;
    isClerkAvailable = true;
  } catch {
    // Graceful fallback if ClerkProvider is bypassed or not yet configured
    isClerkAvailable = false;
  }

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-white/[0.07] bg-[#09090B]/95 px-3 sm:px-6">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3">
        {/* Left: Clean Brand Wordmark & Cloud Sync Status */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.08] text-white">
            <svg
              className="h-5 w-5 fill-none stroke-current stroke-2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 3L3 21h6l3-6 3 6h6L12 3z" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white">
              VECTR
            </span>
            <span className="rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-zinc-300">
              FIT
            </span>

            {/* Cloud Sync Status Indicator */}
            <div className="flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-400">
              <span className={`h-1.5 w-1.5 rounded-full ${isCloudConnected ? 'bg-[#A3E635] shadow-[0_0_6px_rgba(163,230,53,0.5)]' : 'bg-amber-400'}`} />
              <span className="hidden sm:inline font-mono-numbers">
                {user ? 'CLOUD SYNCED' : 'LOCAL GUEST'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Segmented View Switcher (Desktop/Tablet) */}
        {onViewChange && (
          <nav className="hidden md:flex items-center rounded-lg bg-[#141418] border border-white/[0.06] p-1">
            <button
              type="button"
              onClick={() => onViewChange('today')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                activeView === 'today'
                  ? 'bg-white/[0.12] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Today's Session
            </button>
            <button
              type="button"
              onClick={() => onViewChange('recovery')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                activeView === 'recovery'
                  ? 'bg-white/[0.12] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Body & Recovery
            </button>
            <button
              type="button"
              onClick={() => onViewChange('history')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                activeView === 'history'
                  ? 'bg-white/[0.12] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Consistency History
            </button>
          </nav>
        )}

        {/* Right Side: Streak, Pro Pill, and Clerk Auth */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Active Discipline Streak Pill */}
          <button
            onClick={onIncrementStreak}
            title="Log completed discipline streak"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-[#141418] px-2.5 py-1 text-xs font-medium text-zinc-300 hover:border-white/[0.15] hover:text-white transition active:scale-95"
          >
            <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
            <span className="font-mono-numbers">{streakCount}d</span>
          </button>

          {/* Pro Button */}
          {isPro ? (
            <button
              onClick={onOpenProModal}
              title="Vectr Pro Active"
              className="flex items-center gap-1.5 rounded-lg bg-[#A3E635] px-2.5 py-1 text-xs font-semibold text-zinc-950 transition hover:bg-[#bbf055] active:scale-95 shadow-sm"
            >
              <Crown className="h-3 w-3 fill-current" />
              <span className="hidden sm:inline">Pro</span>
            </button>
          ) : (
            <button
              onClick={onOpenProModal}
              title="Upgrade to Vectr Pro"
              className="flex items-center gap-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] px-2.5 py-1 text-xs font-medium text-white transition active:scale-95"
            >
              <Crown className="h-3 w-3 text-[#A3E635]" />
              <span className="hidden sm:inline">Pro</span>
            </button>
          )}

          {/* Next Day Utility */}
          <button
            type="button"
            onClick={onAdvanceDay}
            title="Advance to next training day & save history log"
            className="hidden sm:flex items-center gap-1 rounded-lg border border-white/[0.07] bg-[#141418] px-2 py-1 text-xs font-medium text-zinc-400 hover:border-white/[0.15] hover:text-zinc-200 transition active:scale-95"
          >
            <RotateCw className="h-3 w-3" />
          </button>

          {/* User Auth: Clerk UserButton or Modal SignInButton */}
          <div className="flex items-center pl-1 border-l border-white/[0.06]">
            {isClerkAvailable && user ? (
              <div className="flex items-center gap-2">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'h-7 w-7 ring-1 ring-white/10',
                    },
                  }}
                />
              </div>
            ) : isClerkAvailable ? (
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] px-2.5 py-1 text-xs font-medium text-white transition active:scale-95"
                >
                  <User className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Sign In</span>
                </button>
              </SignInButton>
            ) : (
              <div className="h-7 w-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-zinc-500">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
