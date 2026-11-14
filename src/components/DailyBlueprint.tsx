'use client';

import React, { useState } from 'react';
import { DailyProtocol, Exercise } from '../types/protocol';
import { DisciplineRing } from './DisciplineRing';
import { CoachCommandBar } from './CoachCommandBar';
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
  Sparkles,
  Play,
  Square,
  Trophy,
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
  isLiveActive?: boolean;
  liveSeconds?: number;
  onToggleLiveSession?: () => void;
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
  isLiveActive = false,
  liveSeconds = 0,
  onToggleLiveSession,
}) => {
  const [copied, setCopied] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

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

  // Find the FIRST incomplete exercise to Spotlight
  const activeExerciseId = allExercises.find(e => !isExerciseComplete(e))?.id;

  const toggleCardCollapse = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Format live session seconds: HH:MM:SS or MM:SS
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
  .join('\n\n')}

FUEL & RECOVERY:
${protocol.fuelTargets.map(f => `- ${f.label}: ${f.value} (${f.detail})`).join('\n')}

DAILY GUARDRAILS:
${protocol.avoidRules.map(a => `- ${a.title}: ${a.description}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      {/* 1. LIVE WORKOUT SESSION CONTROLLER */}
      <div className="rounded-xl border border-white/[0.08] bg-gradient-to-r from-[#121215] to-[#161a14] p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
            isLiveActive ? 'bg-[#A3E635] text-zinc-950 animate-pulse' : 'bg-white/[0.06] text-white'
          }`}>
            <Zap className="h-5 w-5 fill-current" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                {isLiveActive ? 'LIVE SESSION ACTIVE' : 'WORKOUT CONTROL'}
              </span>
              {isLiveActive && (
                <span className="h-2 w-2 rounded-full bg-[#A3E635] animate-ping" />
              )}
            </div>
            <div className="font-mono-numbers text-xl font-bold text-white tracking-tight">
              {formatTime(liveSeconds)}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleLiveSession}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all touch-manipulation active:scale-95 shadow-sm ${
            isLiveActive
              ? 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300'
              : 'bg-[#A3E635] hover:bg-[#bbf055] text-zinc-950 shadow-[0_0_15px_rgba(163,230,53,0.25)]'
          }`}
        >
          {isLiveActive ? (
            <>
              <Square className="h-3.5 w-3.5 fill-current" />
              <span>END WORKOUT SESSION</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>START LIVE SESSION</span>
            </>
          )}
        </button>
      </div>

      {/* 2. TOP SUMMARY STRIP: SVG Ring + Metrics + Coach Briefing */}
      <DisciplineRing
        completedSets={completedSetsCount}
        totalSets={totalSetsCount}
        completedFuel={completedFuelCount}
        totalFuel={totalFuelCount}
        completedAvoid={completedAvoidCount}
        totalAvoid={totalAvoidCount}
        onIncrementStreak={onIncrementStreak}
        streakCount={streakCount}
        coachQuote={protocol.coachDirective.quote}
        coachName={
          protocol.persona === 'DRILL_SERGEANT'
            ? 'Drill Sergeant Directive'
            : 'Tactical Scientist Brief'
        }
        userXp={userXp}
      />

      {/* Joint Adaptation Alert if active */}
      {protocol.adaptationsSummary.length > 0 && (
        <div className="rounded-xl border border-sky-500/30 bg-sky-500/[0.06] p-3.5 flex items-start gap-3">
          <Zap className="h-4 w-4 text-sky-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-sky-200 space-y-0.5">
            <span className="font-semibold text-white block">Joint Protection Override Active</span>
            <p className="text-zinc-400">
              {protocol.adaptationsSummary.join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* AI Coach Command Bar */}
      <CoachCommandBar
        onSendCommand={onSendCommand}
        isLoading={isCommandLoading}
        activeCommand={protocol.activeCommand}
        onResetToBaseline={onResetToBaseline}
      />

      {/* 3. PILLAR 01: Interactive Workout Session */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-tight">
              Workout Session
            </h2>
            <span className="rounded-md bg-white/[0.08] px-2 py-0.5 text-[11px] font-mono-numbers text-zinc-300">
              {completedSetsCount}/{totalSetsCount} Sets
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] px-2 py-1 text-xs text-zinc-300 transition"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-[#A3E635]" />
                  <span className="text-[#A3E635]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Share</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onResetSession}
              title="Reset today's checks"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition px-1"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Blocks rendering */}
        <div className="space-y-4">
          {protocol.blocks.map((block, bIdx) => (
            <div
              key={bIdx}
              className="rounded-xl border border-white/[0.07] bg-[#121215] overflow-hidden shadow-sm"
            >
              {/* Block Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#151519] px-4 py-2.5">
                <span className="text-xs font-bold text-zinc-200 tracking-tight">
                  {block.title}
                </span>
                <span className="text-[11px] text-zinc-500">
                  {block.subtitle}
                </span>
              </div>

              {/* Streamlined Exercise Cards */}
              <div className="divide-y divide-white/[0.04]">
                {block.exercises.map((exercise, eIdx) => {
                  const isDone = isExerciseComplete(exercise);
                  const isSpotlight = exercise.id === activeExerciseId;
                  const isCollapsed = isDone && !expandedCards[exercise.id];

                  // Find next pending set in this exercise
                  let nextUncheckedSetIdx = -1;
                  for (let i = 0; i < exercise.sets; i++) {
                    if (!completedSets[`${exercise.id}_set_${i}`]) {
                      nextUncheckedSetIdx = i;
                      break;
                    }
                  }

                  // Collapsed Conquered Summary Row for Done Exercises
                  if (isCollapsed) {
                    return (
                      <div
                        key={exercise.id}
                        onClick={() => toggleCardCollapse(exercise.id)}
                        className="p-3.5 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08] transition-colors cursor-pointer flex items-center justify-between select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#A3E635] text-zinc-950 font-bold">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </span>
                          <span className="text-xs font-semibold text-zinc-300">
                            {exercise.name}
                          </span>
                          <span className="text-[11px] font-mono-numbers text-emerald-400">
                            · {exercise.sets}/{exercise.sets} Sets Cleared (+100 XP)
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-500 hover:text-zinc-300">
                          Tap to expand
                        </span>
                      </div>
                    );
                  }

                  // Responsive grid cols for set buttons
                  const gridColsClass = exercise.sets === 3 ? 'grid-cols-3' : 'grid-cols-2';

                  return (
                    <div
                      key={exercise.id}
                      className={`p-4 transition-all ${
                        isSpotlight
                          ? 'border-2 border-[#A3E635]/60 bg-[#141812] shadow-[0_0_20px_rgba(163,230,53,0.1)]'
                          : isDone
                          ? 'bg-emerald-500/[0.02]'
                          : 'hover:bg-white/[0.01]'
                      }`}
                    >
                      {/* Active Exercise Spotlight Tag */}
                      {isSpotlight && (
                        <div className="mb-2.5 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#A3E635]/20 border border-[#A3E635]/50 px-2.5 py-0.5 text-[10px] font-extrabold text-[#A3E635] tracking-wider animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#A3E635]" />
                            UP NEXT · ACTIVE EXERCISE
                          </span>
                          <span className="text-[11px] font-mono-numbers text-zinc-400">
                            Target Set {nextUncheckedSetIdx + 1}
                          </span>
                        </div>
                      )}

                      {/* Top Row: Title, Target, Pills, and Swap */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`text-base font-semibold tracking-tight ${
                              isDone ? 'text-zinc-400 line-through' : 'text-white'
                            }`}>
                              {exercise.name}
                            </h4>

                            {exercise.isAdapted && (
                              <span className="inline-flex items-center gap-1 rounded bg-sky-500/15 border border-sky-500/30 px-1.5 py-0.5 text-[10px] font-medium text-sky-400">
                                <Zap className="h-2.5 w-2.5" />
                                Adapted · {exercise.protectionTag || 'Joint Safety'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {exercise.targetMuscle}
                          </p>
                        </div>

                        {/* Right Pills & Swap Button */}
                        <div className="flex items-center gap-1.5 self-start sm:self-center">
                          <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs font-mono-numbers text-zinc-300">
                            {exercise.rpe}
                          </span>
                          <button
                            type="button"
                            onClick={() => onTriggerRestTimer(exercise.name, 1, exercise.sets, exercise.restSeconds)}
                            title="Start rest timer"
                            className="flex items-center gap-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] px-2 py-0.5 text-xs font-mono-numbers text-zinc-300 transition"
                          >
                            <Clock className="h-3 w-3 text-zinc-400" />
                            <span>{exercise.restSeconds}s Rest</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSwapExercise(bIdx, eIdx)}
                            title="Swap for alternative movement"
                            className="flex items-center gap-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] px-2 py-0.5 text-xs text-zinc-300 hover:text-white transition active:scale-95"
                          >
                            <RotateCw className="h-3 w-3 text-zinc-400" />
                            <span>Swap</span>
                          </button>
                        </div>
                      </div>

                      {/* Prescription Line */}
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-white/[0.08] px-2 py-0.5 text-xs font-mono-numbers font-semibold text-white">
                          {exercise.sets} sets × {exercise.repsOrHold}
                        </span>
                        {exercise.originalExerciseName && (
                          <span className="text-[11px] text-zinc-500">
                            Replaces: <span className="line-through">{exercise.originalExerciseName}</span>
                          </span>
                        )}
                      </div>

                      {/* Form Cue: Clean left-bordered accent line */}
                      <div className="mt-2 border-l-2 border-zinc-700 pl-3 py-0.5">
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {exercise.formCue}
                        </p>
                      </div>

                      {/* Tactile Hardware Set Logger Grid (2x2 or 3x1 even layout) */}
                      <div className="mt-3.5 space-y-1.5">
                        <div className={`grid ${gridColsClass} gap-2`}>
                          {Array.from({ length: exercise.sets }).map((_, sIdx) => {
                            const setKey = `${exercise.id}_set_${sIdx}`;
                            const isSetDone = !!completedSets[setKey];
                            const isNextTarget = isSpotlight && sIdx === nextUncheckedSetIdx;

                            return (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => onToggleSet(exercise, sIdx)}
                                className={`min-h-[48px] w-full flex flex-col items-center justify-center rounded-xl p-2 transition-all touch-manipulation active:scale-[0.97] select-none ${
                                  isSetDone
                                    ? 'bg-[#A3E635] text-zinc-950 font-bold shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                                    : isNextTarget
                                    ? 'border-2 border-[#A3E635] bg-[#1c2417] text-white shadow-[0_0_15px_rgba(163,230,53,0.35)] animate-pulse'
                                    : 'bg-[#18181C] hover:bg-[#222228] border border-white/[0.06] text-zinc-300 font-medium'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  {isSetDone ? (
                                    <Check className="h-4 w-4 stroke-[3]" />
                                  ) : (
                                    <span className="h-4 w-4 rounded-full border border-zinc-500 flex items-center justify-center text-[10px] text-zinc-400">
                                      {sIdx + 1}
                                    </span>
                                  )}
                                  <span className="text-xs tracking-tight">SET {sIdx + 1}</span>
                                </div>
                                <span className={`text-[10px] font-mono-numbers mt-0.5 ${isSetDone ? 'text-zinc-950/80 font-bold' : isNextTarget ? 'text-[#A3E635]' : 'text-zinc-500'}`}>
                                  {isSetDone ? '✓ CLEARED' : isNextTarget ? 'TAP TO LOG · +25 XP' : `${exercise.repsOrHold}`}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
