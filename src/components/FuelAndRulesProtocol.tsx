'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DailyProtocol, FuelTarget, AvoidRule } from '../types/protocol';
import { feedback } from '../lib/feedback';
import {
  Droplet,
  Zap,
  Shield,
  Camera,
  Check,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Flame,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface FuelAndRulesProtocolProps {
  protocol: DailyProtocol;
  completedFuel: Record<string, boolean>;
  onToggleFuel: (id: string) => void;
  completedAvoid: Record<string, boolean>;
  onToggleAvoid: (id: string) => void;
  waterAmount: number;
  onIncrementWater: (delta: number) => void;
  onSnapProof: (targetId: string, label: string) => void;
  onOpenChallengeCam?: () => void;
  awardXp: (amount: number, reason: string) => void;
}

export const FuelAndRulesProtocol: React.FC<FuelAndRulesProtocolProps> = ({
  protocol,
  completedFuel,
  onToggleFuel,
  completedAvoid,
  onToggleAvoid,
  waterAmount,
  onIncrementWater,
  onSnapProof,
  onOpenChallengeCam,
  awardXp,
}) => {
  // Scientific details popover states
  const [expandedScience, setExpandedScience] = useState<Record<string, boolean>>({});

  // Hydration cooldown timer state (anti-cheat: prevent spam-clicking 7 times in 2 seconds)
  const [hydrationCooldownSecs, setHydrationCooldownSecs] = useState<number>(0);

  // Press-and-Hold state for Fuel Cards (1.5s hold)
  const [holdingFuelId, setHoldingFuelId] = useState<string | null>(null);
  const [fuelHoldProgress, setFuelHoldProgress] = useState<number>(0);
  const fuelHoldTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fuelHoldStartTimeRef = useRef<number>(0);

  // Press-and-Hold state for Guardrail Oath (2.0s hold)
  const [holdingGuardrailId, setHoldingGuardrailId] = useState<string | null>(null);
  const [guardrailHoldProgress, setGuardrailHoldProgress] = useState<number>(0);
  const guardrailHoldTimerRef = useRef<NodeJS.Timeout | null>(null);
  const guardrailHoldStartTimeRef = useRef<number>(0);

  // Hydration Cooldown interval countdown
  useEffect(() => {
    if (hydrationCooldownSecs <= 0) return;
    const interval = setInterval(() => {
      setHydrationCooldownSecs(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hydrationCooldownSecs]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (fuelHoldTimerRef.current) clearInterval(fuelHoldTimerRef.current);
      if (guardrailHoldTimerRef.current) clearInterval(guardrailHoldTimerRef.current);
    };
  }, []);

  const toggleScience = (id: string) => {
    feedback.hapticLight();
    setExpandedScience(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // -------------------------------------------------------------
  // Hydration Intake Handler (+0.5L)
  // -------------------------------------------------------------
  const handleAddHydration = () => {
    if (hydrationCooldownSecs > 0) return;
    feedback.triggerHaptic(30);
    onIncrementWater(0.5);
    awardXp(10, '💧 +0.5L HYDRATION LOGGED');

    // Start 5-minute (300s) digestion cooldown
    setHydrationCooldownSecs(300);
  };

  const handleBypassHydrationCooldown = () => {
    setHydrationCooldownSecs(0);
    onSnapProof('fuel_hydration', 'Hydration Bottle');
  };

  // -------------------------------------------------------------
  // Press-and-Hold for Bio-Fuel Macro/Supplement (1.5s)
  // -------------------------------------------------------------
  const startFuelHold = (targetId: string) => {
    if (completedFuel[targetId]) return;
    feedback.triggerHaptic(30);
    setHoldingFuelId(targetId);
    fuelHoldStartTimeRef.current = Date.now();
    const duration = 1500; // 1.5 seconds

    if (fuelHoldTimerRef.current) clearInterval(fuelHoldTimerRef.current);

    fuelHoldTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - fuelHoldStartTimeRef.current;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setFuelHoldProgress(pct);

      if (elapsed % 300 < 50) {
        feedback.triggerHaptic(20);
      }

      if (elapsed >= duration) {
        if (fuelHoldTimerRef.current) clearInterval(fuelHoldTimerRef.current);
        setFuelHoldProgress(100);
        setHoldingFuelId(null);
        feedback.triggerHaptic([60, 40, 100]);
        feedback.playSetComplete();
        onToggleFuel(targetId);
        awardXp(50, '⚡ BIO-FUEL INTAKE LOCKED');
      }
    }, 40);
  };

  const stopFuelHold = () => {
    if (fuelHoldTimerRef.current) clearInterval(fuelHoldTimerRef.current);
    setHoldingFuelId(null);
    setFuelHoldProgress(0);
  };

  // -------------------------------------------------------------
  // Press-and-Hold for Guardrail Oath (2.0s)
  // -------------------------------------------------------------
  const startGuardrailHold = (ruleId: string) => {
    if (completedAvoid[ruleId]) return;
    feedback.triggerHaptic(40);
    setHoldingGuardrailId(ruleId);
    guardrailHoldStartTimeRef.current = Date.now();
    const duration = 2000; // 2.0 seconds

    if (guardrailHoldTimerRef.current) clearInterval(guardrailHoldTimerRef.current);

    guardrailHoldTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - guardrailHoldStartTimeRef.current;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setGuardrailHoldProgress(pct);

      if (elapsed % 350 < 50) {
        feedback.triggerHaptic(25);
      }

      if (elapsed >= duration) {
        if (guardrailHoldTimerRef.current) clearInterval(guardrailHoldTimerRef.current);
        setGuardrailHoldProgress(100);
        setHoldingGuardrailId(null);
        feedback.triggerHaptic([80, 50, 120]);
        feedback.playSetComplete();
        onToggleAvoid(ruleId);
        awardXp(50, '🛡️ PROTOCOL OATH VERIFIED');
      }
    }, 40);
  };

  const stopGuardrailHold = () => {
    if (guardrailHoldTimerRef.current) clearInterval(guardrailHoldTimerRef.current);
    setHoldingGuardrailId(null);
    setGuardrailHoldProgress(0);
  };

  // Format cooldown: M:SS
  const formatCooldown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  // Metrics math
  const totalFuelCount = protocol.fuelTargets.length;
  const completedFuelCount = Object.values(completedFuel).filter(Boolean).length;
  const totalAvoidCount = protocol.avoidRules.length;
  const completedAvoidCount = Object.values(completedAvoid).filter(Boolean).length;

  // Hydration card data
  const isHydrationTarget = (t: FuelTarget) =>
    t.id === 'fuel_hydration' ||
    t.id === 'fuel_2' ||
    t.label.toLowerCase().includes('hydrat') ||
    t.label.toLowerCase().includes('water');

  const hydrationTarget = protocol.fuelTargets.find(isHydrationTarget);
  const nonHydrationTargets = protocol.fuelTargets.filter(t => !isHydrationTarget(t));
  const isHydrationComplete = waterAmount >= 3.5 || (hydrationTarget && !!completedFuel[hydrationTarget.id]);

  // 7 segments for 3.5L (0.5L per segment)
  const hydrationSegments = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5];

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 0. DAILY BIO-COMPLIANCE BAR (Top Lock-In Telemetry)        */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-r from-[#121215] via-[#151913] to-[#121215] p-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#A3E635] animate-pulse" />
            <h3 className="text-xs font-mono font-bold tracking-widest text-[#A3E635] uppercase">
              DAILY BIO-COMPLIANCE TELEMETRY
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            {completedFuelCount + completedAvoidCount} / {totalFuelCount + totalAvoidCount} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Telemetry 1: Hydration */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-[11px] font-mono">
              <span className="flex items-center gap-1">
                <Droplet className="h-3.5 w-3.5 text-sky-400" />
                HYDRATION
              </span>
              <span className={`font-bold ${isHydrationComplete ? 'text-[#A3E635]' : 'text-white'}`}>
                {waterAmount.toFixed(1)}L / 3.5L
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-400 transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, Math.round((waterAmount / 3.5) * 100))}%` }}
              />
            </div>
          </div>

          {/* Telemetry 2: Bio-Fuel */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-[11px] font-mono">
              <span className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                BIO-FUEL
              </span>
              <span className={`font-bold ${completedFuelCount === totalFuelCount ? 'text-[#A3E635]' : 'text-white'}`}>
                {completedFuelCount} / {totalFuelCount} LOCKED
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-300 rounded-full"
                style={{ width: `${totalFuelCount > 0 ? Math.round((completedFuelCount / totalFuelCount) * 100) : 0}%` }}
              />
            </div>
          </div>

          {/* Telemetry 3: Guardrails */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-[11px] font-mono">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                GUARDRAILS
              </span>
              <span className={`font-bold ${completedAvoidCount === totalAvoidCount ? 'text-[#A3E635]' : 'text-white'}`}>
                {completedAvoidCount} / {totalAvoidCount} HELD
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${totalAvoidCount > 0 ? Math.round((completedAvoidCount / totalAvoidCount) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 60s CAMERA LOCK-IN CHALLENGE BANNER                       */}
      {/* ========================================================= */}
      {onOpenChallengeCam && (
        <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-400/[0.08] to-amber-500/[0.02] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-black font-extrabold text-sm shadow-[0_0_15px_rgba(251,191,36,0.4)]">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                  DAILY CAMERA CHALLENGE
                </span>
                <span className="rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.2">
                  +150 BONUS XP
                </span>
              </div>
              <h4 className="text-sm font-bold text-amber-300 mt-0.5">
                60s Camera Lock-In Challenge
              </h4>
              <p className="text-xs text-zinc-100 font-medium mt-0.5">
                Complete 15 Strict Form Push-ups or 45s Plank on Camera
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenChallengeCam}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-400 text-black font-extrabold text-xs hover:bg-amber-300 active:scale-95 transition shadow-sm whitespace-nowrap"
          >
            Launch Challenge
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 01 // BIO-FUEL TELEMETRY                          */}
      {/* ========================================================= */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#A3E635]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              01 // BIO-FUEL TELEMETRY
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#A3E635]">
            {completedFuelCount} / {totalFuelCount} LOCKED
          </span>
        </div>

        {/* 1. INTERACTIVE HYDRATION CARD (7-Segment Meter + Anti-Cheat Cooldown) */}
        <div
          className={`rounded-2xl border p-4 transition-all ${
            isHydrationComplete
              ? 'border-[#A3E635]/60 bg-[#141a12] shadow-[0_0_15px_rgba(163,230,53,0.15)]'
              : 'border-white/[0.08] bg-[#121215]'
          }`}
        >
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                <Droplet className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-400 tracking-wider uppercase block">
                  CELLULAR MATRIX
                </span>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Hydration & Electrolyte Protocol
                </h4>
              </div>
            </div>

            <div className="text-right">
              <span className={`font-mono-numbers text-lg font-black ${isHydrationComplete ? 'text-[#A3E635]' : 'text-white'}`}>
                {waterAmount.toFixed(1)}L
              </span>
              <span className="text-zinc-500 text-xs font-mono block">/ 3.5L Goal</span>
            </div>
          </div>

          {/* Visual 7-Segment Progress Meter */}
          <div className="mt-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 w-full">
              {hydrationSegments.map((seg, idx) => {
                const isFilled = waterAmount >= seg;
                return (
                  <div
                    key={idx}
                    className={`h-3 flex-1 rounded-md transition-all duration-300 ${
                      isFilled
                        ? 'bg-[#A3E635] shadow-[0_0_8px_rgba(163,230,53,0.45)]'
                        : 'bg-white/[0.05] border border-white/[0.04]'
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 px-0.5">
              <span>0.5L</span>
              <span>1.5L</span>
              <span>2.5L</span>
              <span className="text-zinc-300 font-bold">3.5L</span>
            </div>
          </div>

          {/* Punchy 1-Line Badge + Science Toggle */}
          <div className="mt-3 rounded-xl bg-black/40 border border-white/[0.04] p-3 text-xs flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <p className="text-zinc-300 text-[11px] leading-snug">
                <span className="text-[#A3E635] font-bold">WHY IT MATTERS: </span>
                Prevents isometric cramping, maintains blood plasma volume, and prevents tendon failure under load.
              </p>
              <button
                type="button"
                onClick={() => toggleScience('hydration')}
                className="shrink-0 ml-2 text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-0.5 px-2 py-0.5 rounded bg-white/[0.04]"
              >
                <span>Science</span>
                {expandedScience['hydration'] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>

            {expandedScience['hydration'] && (
              <div className="pt-2 border-t border-white/[0.06] text-[11px] text-zinc-400 leading-relaxed animate-in fade-in duration-150">
                A 2% drop in body water triggers an 11% reduction in motor-unit firing frequency. Drink 750ml within 60 minutes of waking and replenish sodium during tension sets.
              </div>
            )}
          </div>

          {/* Actions / Anti-Cheat Button */}
          <div className="mt-3.5 flex flex-col sm:flex-row items-center gap-2">
            {isHydrationComplete ? (
              <div className="w-full py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center gap-2 text-xs font-mono font-bold text-emerald-400 shadow-sm">
                <Check className="h-4 w-4 stroke-[3]" />
                <span>HYDRATION TARGET VERIFIED (+50 XP)</span>
              </div>
            ) : hydrationCooldownSecs > 0 ? (
              <div className="w-full flex flex-col sm:flex-row items-center gap-2">
                <div className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center gap-2 text-xs font-mono text-amber-300">
                  <Clock className="h-4 w-4 text-amber-400 animate-spin" />
                  <span>Digesting — Next 0.5L in {formatCooldown(hydrationCooldownSecs)}</span>
                </div>

                <button
                  type="button"
                  onClick={handleBypassHydrationCooldown}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#A3E635]/15 hover:bg-[#A3E635]/25 border border-[#A3E635]/30 text-xs font-bold text-[#A3E635] flex items-center justify-center gap-1.5 active:scale-95 transition whitespace-nowrap"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Verify Bottle on Cam</span>
                </button>
              </div>
            ) : (
              <div className="w-full flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddHydration}
                  className="flex-1 py-2.5 rounded-xl bg-[#A3E635] hover:bg-[#b0f340] text-zinc-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(163,230,53,0.3)] active:scale-95 transition"
                >
                  <Droplet className="h-4 w-4 fill-current" />
                  <span>+ 0.5L INTAKE (+10 XP)</span>
                </button>

                {waterAmount > 0.5 && (
                  <button
                    type="button"
                    onClick={() => onIncrementWater(-0.5)}
                    title="Undo -0.5L"
                    className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] transition"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2. NON-HYDRATION BIO-FUEL CARDS (Photo Proof vs Hold-to-Log) */}
        {nonHydrationTargets.map((target, idx) => {
          const isDone = !!completedFuel[target.id];
          const isHoldingThis = holdingFuelId === target.id;
          const whyItMatters =
            idx === 0
              ? 'Triggers mTOR muscle protein synthesis and supplies essential BCAAs to spare lean mass.'
              : 'Synthesizes type-I collagen cross-links in loaded tendons and capsular ligaments.';

          return (
            <div
              key={target.id}
              className={`rounded-2xl border p-4 transition-all ${
                isDone
                  ? 'border-[#A3E635]/60 bg-[#141a12] shadow-[0_0_15px_rgba(163,230,53,0.15)]'
                  : 'border-white/[0.08] bg-[#121215]'
              }`}
            >
              {/* Header: Vertical Stacked Title + Prescription Pill */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 tracking-wider uppercase block">
                      BIO-FUEL TARGET
                    </span>
                    <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                      {target.label}
                    </h4>
                  </div>
                </div>

                {/* Full-width Prescription Pill */}
                <div className="w-full bg-zinc-900/90 border border-white/[0.06] px-3.5 py-2 rounded-lg text-xs font-mono text-zinc-300 flex items-center justify-between">
                  <span className="font-bold text-[#A3E635]">
                    {target.value}
                  </span>
                  <span className="text-[11px] text-zinc-500 uppercase font-mono">
                    Prescription Target
                  </span>
                </div>
              </div>

              {/* Punchy 1-Line Badge + Science Toggle */}
              <div className="mt-3 rounded-xl bg-black/40 border border-white/[0.04] p-3 text-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-zinc-300 text-[11px] leading-snug">
                    <span className="text-amber-400 font-bold">WHY IT MATTERS: </span>
                    {whyItMatters}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleScience(target.id)}
                    className="shrink-0 ml-2 text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-0.5 px-2 py-0.5 rounded bg-white/[0.04]"
                  >
                    <span>Science</span>
                    {expandedScience[target.id] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                </div>

                {expandedScience[target.id] && (
                  <div className="pt-2 border-t border-white/[0.06] text-[11px] text-zinc-400 leading-relaxed animate-in fade-in duration-150">
                    {target.detail || 'Targeted micronutrient and amino acid substrate timing ensures rapid cellular glycogen resynthesis and tendon matrix remodeling.'}
                  </div>
                )}
              </div>

              {/* Actions: Dual Option (Camera Proof 2x vs Hold 1.5s) */}
              <div className="mt-3.5">
                {isDone ? (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center gap-2 text-xs font-mono font-bold text-emerald-400">
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>BIO-FUEL INTAKE VERIFIED (+50 XP)</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Option 1: SNAP PROOF (2x XP) */}
                    <button
                      type="button"
                      onClick={() => onSnapProof(target.id, target.label)}
                      className="py-2.5 px-3 rounded-xl bg-[#A3E635] hover:bg-[#b0f340] text-zinc-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(163,230,53,0.3)] active:scale-95 transition"
                    >
                      <Camera className="h-4 w-4" />
                      <span>SNAP PROOF (+100 XP · 2x)</span>
                    </button>

                    {/* Option 2: Tactile 1.5s Hold */}
                    <button
                      type="button"
                      onMouseDown={() => startFuelHold(target.id)}
                      onMouseUp={stopFuelHold}
                      onMouseLeave={stopFuelHold}
                      onTouchStart={() => startFuelHold(target.id)}
                      onTouchEnd={stopFuelHold}
                      className="relative overflow-hidden py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-bold text-xs select-none touch-none flex items-center justify-center gap-2 active:scale-95 transition"
                    >
                      {isHoldingThis && (
                        <div
                          className="absolute inset-0 bg-[#A3E635]/30 transition-all duration-75"
                          style={{ width: `${fuelHoldProgress}%` }}
                        />
                      )}
                      <span className="relative z-10 font-mono">
                        {isHoldingThis ? `HOLDING... ${fuelHoldProgress}%` : 'HOLD 1.5s TO LOG (+50 XP)'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* ========================================================= */}
      {/* SECTION 02 // DISCIPLINE GUARDRAILS                       */}
      {/* ========================================================= */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              02 // DISCIPLINE GUARDRAILS (ANTI-GOALS)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            {completedAvoidCount} / {totalAvoidCount} HELD
          </span>
        </div>

        <div className="space-y-3">
          {protocol.avoidRules.map((rule, idx) => {
            const isDone = !!completedAvoid[rule.id];
            const isHoldingThis = holdingGuardrailId === rule.id;
            const whyAvoidMatters =
              idx === 0
                ? 'Zero swinging or pike-kipping: kipping destroys tendon tension and robs you of genuine motor unit recruitment.'
                : idx === 1
                ? 'Phone scrolling impairs central nervous system focus and extends intra-set rest beyond optimal hypertrophy windows.'
                : 'Blue light suppresses pineal melatonin by up to 58%, depriving you of deep stage-3 slow-wave recovery.';

            return (
              <div
                key={rule.id}
                className={`rounded-2xl border p-4 transition-all ${
                  isDone
                    ? 'border-emerald-500/60 bg-[#121c16] shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'border-white/[0.08] bg-[#121215]'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-red-400 tracking-wider uppercase block">
                        ANTI-GOAL GUARDRAIL
                      </span>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {rule.title}
                      </h4>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/15 text-red-300'
                  }`}>
                    {isDone ? 'MAINTAINED' : 'CRITICAL'}
                  </span>
                </div>

                {/* Punchy 1-Line Badge + Science Toggle */}
                <div className="mt-3 rounded-xl bg-black/40 border border-white/[0.04] p-3 text-xs flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-zinc-300 text-[11px] leading-snug">
                      <span className="text-emerald-400 font-bold">WHY IT MATTERS: </span>
                      {whyAvoidMatters}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleScience(rule.id)}
                      className="shrink-0 ml-2 text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-0.5 px-2 py-0.5 rounded bg-white/[0.04]"
                    >
                      <span>Science</span>
                      {expandedScience[rule.id] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  </div>

                  {expandedScience[rule.id] && (
                    <div className="pt-2 border-t border-white/[0.06] text-[11px] text-zinc-400 leading-relaxed animate-in fade-in duration-150">
                      {rule.description}
                    </div>
                  )}
                </div>

                {/* Anti-Cheat Press-and-Hold Oath Button (2.0s) */}
                <div className="mt-3.5">
                  {isDone ? (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center gap-2 text-xs font-mono font-bold text-emerald-400 shadow-sm">
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>GUARDRAIL MAINTAINED (+50 XP)</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onMouseDown={() => startGuardrailHold(rule.id)}
                      onMouseUp={stopGuardrailHold}
                      onMouseLeave={stopGuardrailHold}
                      onTouchStart={() => startGuardrailHold(rule.id)}
                      onTouchEnd={stopGuardrailHold}
                      className="relative overflow-hidden w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-extrabold text-xs select-none touch-none flex items-center justify-center gap-2 active:scale-98 transition shadow-sm"
                    >
                      {/* Animated Volt Green Fill Bar */}
                      {isHoldingThis && (
                        <div
                          className="absolute inset-0 bg-[#A3E635]/35 transition-all duration-75"
                          style={{ width: `${guardrailHoldProgress}%` }}
                        />
                      )}
                      <Shield className="h-4 w-4 text-emerald-400 relative z-10" />
                      <span className="relative z-10 font-mono tracking-wide">
                        {isHoldingThis
                          ? `HOLDING OATH... ${guardrailHoldProgress}%`
                          : 'HOLD 2.0s TO SWEAR PROTOCOL (+50 XP)'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
