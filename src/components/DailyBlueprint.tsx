'use client';

import React, { useState } from 'react';
import { DailyProtocol, Exercise } from '../types/protocol';
import { CoachCommandBar } from './CoachCommandBar';
import { ActiveSetPlayer } from './ActiveSetPlayer';
import {
  Brain,
  Shield,
  Clock,
  Zap,
  Check,
  RotateCw,
  Copy,
  Printer,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trophy,
  Camera,
  Info,
  HelpCircle,
  Lock,
  X,
  Crown,
} from 'lucide-react';

interface DailyBlueprintProps {
  protocol: DailyProtocol;
  onOpenProModal: () => void;
  onTriggerRestTimer: (exerciseName: string, setNumber: number, totalSets: number, restSeconds: number) => void;
  streakCount: number;
  onIncrementStreak: () => void;
  onSwapExercise: (blockIndex: number, exerciseIndex: number) => void;
  onSendCommand: (prompt: string) => Promise<void>;
  isCommandLoading: boolean;
  onResetToBaseline: () => void;
  completedSets: Record<string, boolean>;
  onToggleSet: (exercise: Exercise, setIndex: number) => void;
  onToggleAllSets: (exercise: Exercise) => void;
  completedFuel: Record<string, boolean>;
  onToggleFuel: (id: string) => void;
  completedAvoid: Record<string, boolean>;
  onToggleAvoid: (id: string) => void;
  onResetSession: () => void;
  showFuelAndRules?: boolean;
  userXp?: number;
  floatingXp?: { id: number; text: string } | null;
  onOpenFormCamera?: (exerciseName: string) => void;
}

export const DailyBlueprint: React.FC<DailyBlueprintProps> = ({
  protocol,
  onOpenProModal,
  onTriggerRestTimer,
  streakCount,
  onIncrementStreak,
  onSwapExercise,
  onSendCommand,
  isCommandLoading,
  onResetToBaseline,
  completedSets,
  onToggleSet,
  onToggleAllSets,
  completedFuel,
  onToggleFuel,
  completedAvoid,
  onToggleAvoid,
  onResetSession,
  showFuelAndRules = true,
  userXp = 350,
  floatingXp,
  onOpenFormCamera,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeCuePopoverId, setActiveCuePopoverId] = useState<string | null>(null);
  const [showCoachDrawer, setShowCoachDrawer] = useState<boolean>(false);

  // Active Set Player State (HUD execution modal)
  const [playerTarget, setPlayerTarget] = useState<{
    exercise: Exercise;
    setIndex: number;
    totalSets: number;
  } | null>(null);

  // Calculate totals
  const allExercises = protocol.blocks.flatMap(b => b.exercises);
  const totalSetsCount = allExercises.reduce((sum, e) => sum + e.sets, 0);
  const completedSetsCount = Object.values(completedSets).filter(Boolean).length;

  const totalFuelCount = protocol.fuelTargets.length;
  const completedFuelCount = Object.values(completedFuel).filter(Boolean).length;

  const totalAvoidCount = protocol.avoidRules.length;
  const completedAvoidCount = Object.values(completedAvoid).filter(Boolean).length;

  const isExerciseComplete = (exercise: Exercise): boolean => {
    for (let i = 0; i < exercise.sets; i++) {
      if (!completedSets[`${exercise.id}_set_${i}`]) {
        return false;
      }
    }
    return exercise.sets > 0;
  };

  // Find the FIRST incomplete exercise to Spotlight in the Mission Queue
  const activeExercise = allExercises.find(e => !isExerciseComplete(e));
  const activeExerciseId = activeExercise?.id;

  const handleCopySummary = () => {
    const text = `VECTR FIT DAILY BLUEPRINT
Path: ${protocol.modality} · Tier ${protocol.tier} (${protocol.tierTitle})
Objective: ${protocol.objectiveLabel} · ${protocol.timeWindow}m · Energy ${protocol.energy}/5

COACH DIRECTIVE:
${protocol.coachDirective.quote}

WORKOUT SESSION:
${protocol.blocks
  .map(
    b =>
      `${b.title}\n` +
      b.exercises
        .map(
          e =>
            `- ${e.name} (${e.targetMuscle}) · ${e.sets} sets × ${e.repsOrHold} · Rest: ${e.restSeconds}s · ${e.rpe}\n  Cue: ${e.formCue}`
        )
        .join('\n')
  )
  .join('\n\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Open the Anti-Cheat Active Set Execution Player
  const handleEngageExercise = (exercise: Exercise) => {
    // Determine the next incomplete set
    let nextSet = 0;
    for (let i = 0; i < exercise.sets; i++) {
      if (!completedSets[`${exercise.id}_set_${i}`]) {
        nextSet = i;
        break;
      }
    }
    setPlayerTarget({
      exercise,
      setIndex: nextSet,
      totalSets: exercise.sets,
    });
  };

  // When a set is verified through the player (either via camera or pacer)
  const handleSetVerified = (exercise: Exercise, setIndex: number, xpEarned: number) => {
    onToggleSet(exercise, setIndex);
  };

  return (
    <div className="flex-1 space-y-5 relative">
      {/* Floating Dopamine XP Bubble */}
      {floatingXp && (
        <div className="fixed top-20 right-6 z-50 pointer-events-none animate-bounce">
          <div className="rounded-full bg-[#A3E635] text-zinc-950 px-3.5 py-1.5 font-extrabold text-xs shadow-[0_0_20px_rgba(163,230,53,0.6)] flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>{floatingXp.text}</span>
          </div>
        </div>
      )}

      {/* 1. COLLAPSIBLE AI COACH & ADJUSTMENTS DRAWER */}
      <div className="rounded-xl border border-white/[0.07] bg-[#121215] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCoachDrawer(!showCoachDrawer)}
          className="w-full flex items-center justify-between p-3 sm:px-4 bg-white/[0.02] hover:bg-white/[0.05] transition text-left"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#A3E635]" />
            <span className="text-xs font-bold text-white tracking-wide">
              AI Coach & Adjustments
            </span>
            <span className="text-[10px] font-mono text-zinc-500 hidden xs:inline">
              ({protocol.persona === 'TACTICAL_SCIENTIST' ? 'Tactical Scientist' : 'Drill Sergeant'})
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono">
            <span className="text-[11px]">{showCoachDrawer ? 'Hide' : 'Directives'}</span>
            {showCoachDrawer ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>

        {showCoachDrawer && (
          <div className="p-4 border-t border-white/[0.06] space-y-3.5 bg-black/20">
            {/* Coach Directive Quote */}
            {protocol.coachDirective?.quote && (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-xs text-zinc-300 leading-relaxed">
                <span className="font-mono text-[10px] text-[#A3E635] uppercase font-bold block mb-1">
                  Tactical Directive
                </span>
                "{protocol.coachDirective.quote.replace(/^"|"$/g, '')}"
              </div>
            )}

            {/* AI Coach Command Bar */}
            <CoachCommandBar
              onSendCommand={onSendCommand}
              isLoading={isCommandLoading}
              onResetToBaseline={onResetToBaseline}
            />
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. MISSION QUEUE (COMPACT STREAMLINED EXERCISE LIST)      */}
      {/* ========================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#A3E635]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Tactical Mission Queue
            </h3>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-xs">
            {onOpenFormCamera && (
              <button
                type="button"
                onClick={() => onOpenFormCamera(allExercises[0]?.name || 'Movement')}
                className="flex items-center gap-1.5 rounded-lg bg-[#A3E635]/15 hover:bg-[#A3E635]/25 border border-[#A3E635]/30 px-2.5 py-1 text-xs font-bold text-[#A3E635] active:scale-95 transition"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>AI Scan</span>
              </button>
            )}
            <span className="text-zinc-400">
              {completedSetsCount} / {totalSetsCount} Sets Verified
            </span>
            <button
              type="button"
              onClick={onResetSession}
              title="Reset today's checks"
              className="text-zinc-500 hover:text-zinc-300 transition px-1"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Mission Queue Rows */}
        <div className="space-y-2">
          {protocol.blocks.map((block, bIdx) => (
            <div key={bIdx} className="space-y-1.5">
              {/* Clean Vertical Stack Block Divider */}
              <div className="pt-3 pb-1.5 flex flex-col gap-0.5 px-1">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-300">
                  {block.title}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  {block.subtitle}
                </span>
              </div>

              {/* Rows */}
              {block.exercises.map((exercise, eIdx) => {
                const isDone = isExerciseComplete(exercise);
                const isActive = exercise.id === activeExerciseId;
                const completedCount = Array.from({ length: exercise.sets }).filter(
                  (_, i) => completedSets[`${exercise.id}_set_${i}`]
                ).length;

                return (
                  <div
                    key={exercise.id}
                    className={`relative rounded-2xl border p-4 transition-all flex flex-col gap-3 ${
                      isActive
                        ? 'border-[#A3E635] bg-[#141812] shadow-[0_0_15px_rgba(163,230,53,0.15)] ring-1 ring-[#A3E635]/30'
                        : isDone
                        ? 'border-emerald-500/30 bg-[#0e1410] opacity-80'
                        : 'border-white/[0.06] bg-[#121215]'
                    }`}
                  >
                    {/* Row 1 (Header): 01 Badge + Full Exercise Name (NO truncation) + Set Counter Pill */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-black ${
                            isDone
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : isActive
                              ? 'bg-[#A3E635] text-black shadow-sm'
                              : 'bg-white/[0.04] text-zinc-500 border border-white/[0.06]'
                          }`}
                        >
                          {isDone ? (
                            <Check className="h-4 w-4 stroke-[3]" />
                          ) : (
                            `${bIdx * 2 + eIdx + 1}`.padStart(2, '0')
                          )}
                        </span>

                        <div className="min-w-0">
                          <h4
                            className={`text-base font-bold leading-snug break-words ${
                              isDone ? 'text-zinc-400 line-through' : 'text-white'
                            }`}
                          >
                            {exercise.name}
                          </h4>
                          {exercise.isAdapted && (
                            <span className="inline-block mt-0.5 rounded bg-sky-500/15 border border-sky-500/30 px-1.5 py-0.5 text-[9px] font-mono text-sky-400">
                              Adapted
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right side: Compact Set Counter Pill */}
                      <div className="shrink-0 rounded-lg bg-zinc-900/90 border border-white/[0.06] px-2.5 py-1 text-right font-mono text-xs whitespace-nowrap">
                        <span className="font-bold text-[#A3E635]">
                          {completedCount}/{exercise.sets} Sets
                        </span>
                        <span className="text-zinc-500 ml-1.5 text-[11px]">
                          · {exercise.rpe}
                        </span>
                      </div>
                    </div>

                    {/* Row 2 (Prescription): Full-width sleek dark pill */}
                    <div className="w-full bg-zinc-900/90 border border-white/[0.06] px-3.5 py-2 rounded-lg text-xs font-mono text-zinc-300 flex items-center justify-between">
                      <span className="font-semibold tracking-wide text-zinc-200">
                        {exercise.sets} × {exercise.repsOrHold}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Rest: {exercise.restSeconds}s
                      </span>
                    </div>

                    {/* Row 3 (Actions): Left: ? Cues & Swap | Right: Wide [ ⚡ ENGAGE ] / LOCKED / VERIFIED */}
                    <div className="flex items-center justify-between gap-3 pt-0.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveCuePopoverId(
                              activeCuePopoverId === exercise.id ? null : exercise.id
                            )
                          }
                          title="Form Cues"
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
                            activeCuePopoverId === exercise.id
                              ? 'bg-[#A3E635]/20 text-[#A3E635] border-[#A3E635]/40'
                              : 'bg-white/[0.04] text-zinc-400 hover:text-white border-white/[0.06]'
                          }`}
                        >
                          <HelpCircle className="h-3.5 w-3.5" />
                          <span>Cues</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onSwapExercise(bIdx, eIdx)}
                          title="Swap Movement"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] text-xs font-medium transition active:scale-95"
                        >
                          <RotateCw className="h-3.5 w-3.5" />
                          <span>Swap</span>
                        </button>
                      </div>

                      <div>
                        {isDone ? (
                          <span className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                            <Check className="h-4 w-4 stroke-[3]" />
                            <span>VERIFIED</span>
                          </span>
                        ) : isActive ? (
                          <button
                            type="button"
                            onClick={() => handleEngageExercise(exercise)}
                            className="flex items-center gap-2 rounded-xl bg-[#A3E635] hover:bg-[#b0f340] px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-black shadow-[0_0_15px_rgba(163,230,53,0.35)] active:scale-95 transition"
                          >
                            <Zap className="h-4 w-4 fill-black" />
                            <span>ENGAGE</span>
                          </button>
                        ) : (
                          <span className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-2 text-xs font-mono text-zinc-500 flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5" />
                            <span>LOCKED</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cues Popover Dropdown */}
                    {activeCuePopoverId === exercise.id && (
                      <div className="mt-1 p-3.5 rounded-xl bg-zinc-900 border border-[#A3E635]/40 shadow-2xl text-xs text-zinc-300 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between pb-1 border-b border-white/[0.06] mb-1.5">
                          <span className="font-mono text-[10px] text-[#A3E635] uppercase font-bold">
                            Biomechanical Cue · {exercise.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveCuePopoverId(null)}
                            className="text-zinc-500 hover:text-white"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="leading-relaxed">{exercise.formCue}</p>
                        <div className="mt-2 text-[10px] font-mono text-zinc-400">
                          Target: {exercise.targetMuscle} · Rest {exercise.restSeconds}s
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. VECTR PRO MEMBERSHIP CARD (HIGH-CONVERTING ENTRY)      */}
      {/* ========================================================= */}
      <div
        onClick={onOpenProModal}
        className="cursor-pointer rounded-2xl border border-white/[0.08] bg-gradient-to-r from-[#121215] via-[#161914] to-[#121215] p-4 transition-all hover:border-[#A3E635]/40 active:scale-[0.99] group shadow-lg flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A3E635]/15 border border-[#A3E635]/30 text-[#A3E635] group-hover:scale-105 transition shrink-0">
            <Crown className="h-5 w-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-[#A3E635] uppercase">
                VECTR PRO MEMBERSHIP
              </span>
              <span className="rounded bg-[#A3E635]/20 px-1.5 py-0.2 text-[9px] font-bold text-[#A3E635]">
                SAVE 52%
              </span>
            </div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              Unlock Unlimited 3-in-1 AI Vision & Bio-Ratings
            </h4>
            <p className="text-[11px] text-zinc-400">
              Form Check, Posture Scan & Meal Macros without daily caps.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onOpenProModal();
          }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#A3E635] text-black font-bold text-xs hover:bg-[#bbf055] transition shrink-0 ml-3"
        >
          <span>Upgrade</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ========================================================= */}
      {/* 5. ANTI-CHEAT ACTIVE SET EXECUTION PLAYER MODAL          */}
      {/* ========================================================= */}
      {playerTarget && (
        <ActiveSetPlayer
          exercise={playerTarget.exercise}
          setIndex={playerTarget.setIndex}
          totalSets={playerTarget.totalSets}
          onSetVerified={handleSetVerified}
          onClose={() => setPlayerTarget(null)}
          onOpenFormCamera={onOpenFormCamera}
        />
      )}
    </div>
  );
};
