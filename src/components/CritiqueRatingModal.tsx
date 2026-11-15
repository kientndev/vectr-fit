'use client';

import React, { useState } from 'react';
import {
  X,
  Share2,
  Sparkles,
  Shield,
  Zap,
  Award,
  Check,
  TrendingUp,
  Flame,
  Camera,
} from 'lucide-react';
import { feedback } from '../lib/feedback';

export interface CritiqueRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier?: number;
  tierTitle?: string;
  athleteCallsign?: string;
  overallScore?: number;
  potentialScore?: number;
  strength?: number;
  postureSymmetry?: number;
  explosivePower?: number;
  coreRigidity?: number;
  disciplineCompliance?: number;
  cnsRecovery?: number;
  aiVerdict?: string;
  onOpenScanner?: () => void;
  onShareAwardXp?: () => void;
}

export const CritiqueRatingModal: React.FC<CritiqueRatingModalProps> = ({
  isOpen,
  onClose,
  tier = 3,
  tierTitle = 'CONDITIONED OPERATOR',
  athleteCallsign = 'ATHLETE-VECTR-01',
  overallScore = 88,
  potentialScore = 96,
  strength = 86,
  postureSymmetry = 90,
  explosivePower = 84,
  coreRigidity = 89,
  disciplineCompliance = 94,
  cnsRecovery = 88,
  aiVerdict = 'Exceptional kinetic chain tension and neutral spinal alignment under load. High biomechanical economy with +8 potential margin available.',
  onOpenScanner,
  onShareAwardXp,
}) => {
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleShareCard = async () => {
    feedback.triggerHaptic(40);
    const shareText = `⚡ VECTR FIT // BIOMECHANICAL ATHLETE RATING
Callsign: ${athleteCallsign} • Tier ${tier} (${tierTitle})
Overall Rating: ${overallScore}/100 • Potential: ${potentialScore}/100
Ranking: Top 4.2% of Tier ${tier}

- Relative Strength: ${strength}/100
- Posture & Symmetry: ${postureSymmetry}/100
- Explosive Power: ${explosivePower}/100
- Core & Lever Rigidity: ${coreRigidity}/100
- Discipline & Compliance: ${disciplineCompliance}/100
- CNS & Recovery: ${cnsRecovery}/100

Verified by VECTR FIT AI Biomechanical Telemetry.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'VECTR FIT // Official AI Critique Rating Card',
          text: shareText,
          url: window.location.href,
        });
        if (onShareAwardXp) onShareAwardXp();
        return;
      } catch {
        // Fallback to clipboard if cancelled or unsupported
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
      if (onShareAwardXp) onShareAwardXp();
    }
  };

  const statBars = [
    { label: 'RELATIVE STRENGTH', value: strength, color: 'bg-amber-400', textColor: 'text-amber-400' },
    { label: 'POSTURE & SYMMETRY', value: postureSymmetry, color: 'bg-sky-400', textColor: 'text-sky-400' },
    { label: 'EXPLOSIVE POWER', value: explosivePower, color: 'bg-rose-400', textColor: 'text-rose-400' },
    { label: 'CORE & LEVER RIGIDITY', value: coreRigidity, color: 'bg-[#A3E635]', textColor: 'text-[#A3E635]' },
    { label: 'DISCIPLINE & COMPLIANCE', value: disciplineCompliance, color: 'bg-emerald-400', textColor: 'text-emerald-400' },
    { label: 'CNS & RECOVERY', value: cnsRecovery, color: 'bg-indigo-400', textColor: 'text-indigo-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md my-auto flex flex-col items-center">
        {/* Close Button Floating Upper-Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-11 right-0 sm:right-2 p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-zinc-400 hover:text-white transition active:scale-90 z-20"
          title="Close Rating Card"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ========================================================= */}
        {/* 9:16 ATHLETE CRITIQUE STORY FLEX CARD                     */}
        {/* ========================================================= */}
        <div
          id="athlete-rating-card"
          className="relative w-full rounded-3xl border-2 border-[#A3E635]/40 bg-gradient-to-b from-[#151912] via-[#0E100D] to-[#0A0B09] p-5 sm:p-6 shadow-[0_0_50px_rgba(163,230,53,0.2)] overflow-hidden flex flex-col justify-between"
        >
          {/* Subtle Ambient Grid Background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(#A3E635 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />

          {/* Glowing Top Edge Highlight */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#A3E635] to-transparent" />

          {/* TOP CARD HEADER */}
          <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#A3E635] text-black font-black text-xs shadow-sm">
                V
              </div>
              <div>
                <span className="font-mono text-[10px] font-black tracking-widest text-white uppercase block">
                  VECTR FIT // AI CRITIQUE
                </span>
                <span className="font-mono text-[9px] text-zinc-500 block">
                  VERIFIED BIOMECHANICAL TELEMETRY
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-[10px] font-bold text-[#A3E635] bg-[#A3E635]/15 border border-[#A3E635]/30 px-2 py-0.5 rounded-md uppercase tracking-wider block">
                TIER {tier}
              </span>
              <span className="font-mono text-[9px] text-zinc-400 mt-0.5 block">
                {tierTitle}
              </span>
            </div>
          </div>

          {/* HERO SCORE SECTION */}
          <div className="relative z-10 my-4 text-center">
            <span className="font-mono text-[10px] tracking-widest font-bold uppercase text-zinc-400 block mb-1">
              ATHLETE READINESS INDEX
            </span>

            <div className="inline-flex items-baseline justify-center gap-1.5">
              <span className="font-mono-numbers text-6xl sm:text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(163,230,53,0.35)]">
                {overallScore}
              </span>
              <span className="font-mono text-xl font-bold text-[#A3E635]">/100</span>
            </div>

            <div className="flex items-center justify-center gap-2.5 mt-2">
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <TrendingUp className="h-3 w-3" />
                POTENTIAL: {potentialScore}/100
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                <Flame className="h-3 w-3" />
                TOP 4.2% TIER {tier}
              </span>
            </div>
          </div>

          {/* 6 BIOMECHANICAL STAT BARS */}
          <div className="relative z-10 my-2 space-y-2.5 bg-black/40 border border-white/[0.05] p-3.5 rounded-2xl">
            <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-zinc-500 block mb-1">
              SIX-PILLAR BIOMECHANICAL MATRIX
            </span>

            {statBars.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-zinc-400 font-medium tracking-wide">{stat.label}</span>
                  <span className={`font-bold ${stat.textColor}`}>{stat.value} / 100</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stat.color} rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${stat.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* AI VERDICT FOOTER */}
          <div className="relative z-10 mt-3 pt-3 border-t border-white/[0.08] space-y-2 text-left">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#A3E635]">
              <Sparkles className="h-3 w-3" />
              <span>AI BIOMECHANICAL VERDICT</span>
            </div>
            <p className="text-xs text-zinc-300 leading-snug font-sans">
              "{aiVerdict}"
            </p>

            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600 pt-1">
              <span>HASH: VECTR-{tier}-{overallScore}-{Date.now().toString().slice(-6)}</span>
              <span>APP.VECTR.FIT</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL ACTION BUTTONS                                      */}
        {/* ========================================================= */}
        <div className="w-full mt-3.5 space-y-2">
          <button
            type="button"
            onClick={handleShareCard}
            className="w-full py-3 rounded-2xl bg-[#A3E635] hover:bg-[#b0f340] text-zinc-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(163,230,53,0.35)] active:scale-95 transition"
          >
            {copiedShare ? (
              <>
                <Check className="h-4 w-4 stroke-[3]" />
                <span>COPIED TO CLIPBOARD! (+50 XP)</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                <span>SHARE / EXPORT ATHLETE CARD (+50 XP)</span>
              </>
            )}
          </button>

          {onOpenScanner && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenScanner();
              }}
              className="w-full py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Camera className="h-4 w-4 text-[#A3E635]" />
              <span>RE-SCAN TO IMPROVE RATING</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
