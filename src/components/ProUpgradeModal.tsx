'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  Crown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../lib/soundUtils';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  onTogglePro: (proState: boolean) => void;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  isPro,
  onTogglePro,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  if (!isOpen) return null;

  const handleActivateDemo = () => {
    onTogglePro(!isPro);
    if (!isPro) {
      sounds.playDailyCleared();
    }
  };

  const freeFeatures = [
    'Daily Deterministic 3-Pillar Blueprints (DO / NEED / AVOID)',
    'Full 5-Tier Bodyweight & Gym Iron Database',
    'Interactive Set Tracker & Automatic Rest Timer',
    'Local Joint Soreness Guardrails & 1-Click Swaps',
    'Daily Discipline Ring & History Logging',
  ];

  const proFeatures = [
    'Infinite AI Coach Neural Adjustments & Direct Voice Directives',
    '12-Week Progressive Overload Memory & Auto Deloads',
    'Apex Skill-Tree Roadmaps (Muscle-Up, Planche, 2x BW)',
    'Wearable HRV & Sleep Architecture Sync (Whoop, Apple Health)',
    '60 FPS Form Analysis & Real-Time Cadence Metronome',
    'Export Custom PDF Coaching Dossiers',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-3xl rounded-2xl border border-white/[0.08] bg-[#121215] p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] border border-white/[0.08] text-[#A3E635]">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Vectr Pro Architecture
                </h3>
                {isPro && (
                  <span className="rounded-full bg-[#A3E635]/20 border border-[#A3E635]/40 px-2 py-0.5 text-[11px] font-semibold text-[#A3E635]">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Continuous athletic intelligence and longitudinal progress.
              </p>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center rounded-lg bg-[#18181C] p-1 border border-white/[0.06] self-start sm:self-auto">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                billingCycle === 'monthly'
                  ? 'bg-white/[0.12] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
                billingCycle === 'yearly'
                  ? 'bg-white/[0.12] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Yearly</span>
              <span className="rounded bg-[#A3E635]/20 px-1 py-0.2 text-[10px] font-bold text-[#A3E635]">
                Save 55%
              </span>
            </button>
          </div>
        </div>

        {/* Comparison Tier Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Free Tier */}
          <div className="flex flex-col justify-between rounded-xl border border-white/[0.06] bg-[#18181C] p-5">
            <div>
              <span className="text-xs font-semibold text-zinc-400">Standard Tier</span>
              <div className="mt-2 text-2xl font-bold text-white">Free</div>
              <p className="mt-1 text-xs text-zinc-400">
                Core daily protocol generation without account lock-in.
              </p>

              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2.5">
                {freeFeatures.map(f => (
                  <div key={f} className="flex items-start gap-2 text-xs text-zinc-300">
                    <Check className="h-4 w-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <div className="w-full rounded-lg bg-white/[0.06] py-2 text-center text-xs font-medium text-zinc-400">
                Current Free Tier
              </div>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="flex flex-col justify-between rounded-xl border border-[#A3E635]/40 bg-[#161914] p-5 relative">
            <div className="absolute top-4 right-4">
              <span className="rounded-full bg-[#A3E635]/20 border border-[#A3E635]/40 px-2 py-0.5 text-[10px] font-bold text-[#A3E635]">
                Recommended
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#A3E635]">Vectr Pro</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-mono-numbers text-3xl font-bold text-white">
                  {billingCycle === 'yearly' ? '$49' : '$9'}
                </span>
                <span className="text-xs text-zinc-400">
                  {billingCycle === 'yearly' ? '/ year ($4.08/mo)' : '/ month'}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Complete AI coaching OS with multi-week adaptation memory.
              </p>

              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2.5">
                {proFeatures.map(f => (
                  <div key={f} className="flex items-start gap-2 text-xs text-zinc-200">
                    <Check className="h-4 w-4 text-[#A3E635] flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] space-y-2">
              <button
                type="button"
                onClick={handleActivateDemo}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#A3E635] py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-[#bbf055] active:scale-[0.98] shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 fill-current" />
                <span>{isPro ? 'Deactivate Pro Demo' : 'Activate Pro Demo Mode'}</span>
              </button>
              <p className="text-[11px] text-center text-zinc-500">
                Instant 1-click test mode · No credit card required
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
