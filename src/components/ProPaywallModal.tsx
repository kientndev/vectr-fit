'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  Crown,
  Sparkles,
  Zap,
  Shield,
  Flame,
  ArrowRight,
  Lock,
  Star,
} from 'lucide-react';
import { feedback } from '../lib/feedback';

export interface ProPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  onTogglePro: (proState: boolean) => void;
  dailyScansRemaining?: number;
}

export const ProPaywallModal: React.FC<ProPaywallModalProps> = ({
  isOpen,
  onClose,
  isPro,
  onTogglePro,
  dailyScansRemaining = 0,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStartTrial = () => {
    feedback.hapticSuccess();
    feedback.playLevelUp();
    setIsProcessing(true);
    setTimeout(() => {
      onTogglePro(true);
      setIsProcessing(false);
      onClose();
    }, 800);
  };

  const handleDevToggle = () => {
    feedback.hapticLight();
    onTogglePro(!isPro);
    if (!isPro) {
      feedback.playDailyCleared();
    }
  };

  const proFeatures = [
    {
      title: 'Unlimited 3-in-1 AI Vision Scans',
      desc: 'Form Check, Posture & Physique, and Meal Macros without daily caps.',
    },
    {
      title: 'Full 0-100 Biomechanical Rating Breakdown',
      desc: 'Deep joint telemetry, kinetic symmetry, and potential projections.',
    },
    {
      title: 'Unlimited Live AI Coach Swaps & Guardrails',
      desc: 'Real-time workout adaptations, autoregulation, and joint protection.',
    },
    {
      title: 'Verified PRO Callsign Badge',
      desc: 'Stand out on Tier and Global Leaderboard divisions with gold status.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 select-none overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/[0.12] bg-[#0C0C0E] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden my-auto">
        {/* Glowing Top Ambient Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-[#A3E635]/15 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            feedback.hapticLight();
            onClose();
          }}
          className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-zinc-400 hover:text-white transition active:scale-90 border border-white/[0.08]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5 sm:p-7 space-y-6">
          {/* Header Badge & Title */}
          <div className="text-center space-y-2 pt-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#A3E635]/15 border border-[#A3E635]/30 px-3 py-1 text-xs font-bold text-[#A3E635] shadow-sm">
              <Crown className="h-3.5 w-3.5 fill-current" />
              <span>VECTR PRO ARCHITECTURE</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
              UNLOCK YOUR UNFAIR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-[#A3E635]">
                BIOMECHANICAL ADVANTAGE
              </span>
            </h2>

            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              {isPro ? (
                <span className="text-[#A3E635] font-semibold">
                  ✓ You are currently an active VECTR PRO athlete with unlimited scan capacity.
                </span>
              ) : dailyScansRemaining <= 0 ? (
                <span className="text-amber-400 font-medium">
                  ⚠️ Daily Free AI Scan used. Upgrade to VECTR PRO for unlimited instant AI vision feedback.
                </span>
              ) : (
                <span>
                  Join elite athletes optimizing form, symmetry, and metabolic partitioning in real time.
                </span>
              )}
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-2.5 rounded-2xl bg-[#141418] border border-white/[0.07] p-4">
            {proFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#A3E635]/20 text-[#A3E635]">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-100">{feat.title}</div>
                  <div className="text-[11px] text-zinc-400 leading-snug">{feat.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Plan Selector Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Annual Plan (Pre-selected) */}
            <button
              type="button"
              onClick={() => {
                feedback.hapticLight();
                setSelectedPlan('yearly');
              }}
              className={`relative rounded-2xl p-4 text-left transition-all border flex flex-col justify-between ${
                selectedPlan === 'yearly'
                  ? 'border-[#A3E635] bg-[#A3E635]/[0.08] shadow-[0_0_20px_rgba(163,230,53,0.15)] ring-1 ring-[#A3E635]'
                  : 'border-white/[0.08] bg-[#141418] hover:border-white/[0.15]'
              }`}
            >
              {/* Most Popular Pill */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#A3E635] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black shadow-sm">
                MOST POPULAR · SAVE 52%
              </div>

              <div>
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Annual Access
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">$39.99</span>
                  <span className="text-[11px] text-zinc-400">/ yr</span>
                </div>
                <div className="text-[10px] text-[#A3E635] font-semibold mt-0.5">
                  Only $3.33 / month
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-300 font-medium">
                  7-Day Free Trial
                </span>
                <div
                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    selectedPlan === 'yearly'
                      ? 'border-[#A3E635] bg-[#A3E635] text-black'
                      : 'border-zinc-600 bg-transparent'
                  }`}
                >
                  {selectedPlan === 'yearly' && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                </div>
              </div>
            </button>

            {/* Monthly Plan */}
            <button
              type="button"
              onClick={() => {
                feedback.hapticLight();
                setSelectedPlan('monthly');
              }}
              className={`relative rounded-2xl p-4 text-left transition-all border flex flex-col justify-between ${
                selectedPlan === 'monthly'
                  ? 'border-[#A3E635] bg-[#A3E635]/[0.08] shadow-[0_0_20px_rgba(163,230,53,0.15)] ring-1 ring-[#A3E635]'
                  : 'border-white/[0.08] bg-[#141418] hover:border-white/[0.15]'
              }`}
            >
              <div>
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Monthly Plan
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">$6.99</span>
                  <span className="text-[11px] text-zinc-400">/ mo</span>
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  Billed monthly
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400">
                  Cancel anytime
                </span>
                <div
                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    selectedPlan === 'monthly'
                      ? 'border-[#A3E635] bg-[#A3E635] text-black'
                      : 'border-zinc-600 bg-transparent'
                  }`}
                >
                  {selectedPlan === 'monthly' && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                </div>
              </div>
            </button>
          </div>

          {/* Primary CTA Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleStartTrial}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-[#A3E635] hover:bg-[#b5f543] active:scale-[0.98] transition-all text-black font-black text-sm tracking-wide shadow-[0_0_25px_rgba(163,230,53,0.3)] disabled:opacity-75"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>INITIALIZING PRO SESSION...</span>
                </div>
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-black" />
                  <span>
                    {isPro
                      ? 'KEEP VECTR PRO ACTIVE'
                      : selectedPlan === 'yearly'
                      ? '⚡ START 7-DAY FREE TRIAL'
                      : 'UNLOCK VECTR PRO ($6.99/MO)'}
                  </span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-3 text-[10px] text-zinc-500 font-mono">
              <span>🔒 Encrypted Checkout</span>
              <span>•</span>
              <span>⚡ Instant Access</span>
              <span>•</span>
              <span>❌ Cancel in 1 Tap</span>
            </div>
          </div>

          {/* Developer Mode Toggle */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500">
              DEV DEBUG · CREATOR TOOLS
            </span>
            <button
              type="button"
              onClick={handleDevToggle}
              className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition active:scale-95 border border-white/[0.08]"
            >
              {isPro ? '🔴 Turn Pro OFF' : '🟢 Developer Mode: Toggle Pro Active'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
