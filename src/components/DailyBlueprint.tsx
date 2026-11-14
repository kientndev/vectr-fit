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
  Sparkles,
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
}) => {
  const [copied, setCopied] = useState(false);

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

  const getExerciseCompletedSetsCount = (exercise: Exercise): number => {
    let count = 0;
    for (let i = 0; i < exercise.sets; i++) {
      if (completedSets[`${exercise.id}_set_${i}`]) count++;
    }
    return count;
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
    <div className="flex-1 space-y-5">
      {/* 1. TOP SUMMARY STRIP: SVG Ring + Metrics + Coach Briefing */}
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

      {/* 2. PILLAR 01: Interactive Workout Session */}
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

        {/* Blocks rendering without nested border boxes */}
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

                  return (
                    <div
                      key={exercise.id}
                      className={`p-4 transition-colors ${
                        isDone ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'
                      }`}
                    >
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

                      {/* Tactile Set Logger Row */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {Array.from({ length: exercise.sets }).map((_, sIdx) => {
                          const setKey = `${exercise.id}_set_${sIdx}`;
                          const isSetDone = !!completedSets[setKey];

                          return (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => onToggleSet(exercise, sIdx)}
                              className={`min-h-[44px] flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs transition-all touch-manipulation active:scale-95 select-none ${
                                isSetDone
                                  ? 'bg-[#A3E635] text-zinc-950 font-semibold shadow-sm'
                                  : 'bg-[#18181C] hover:bg-[#222228] border border-white/[0.06] text-zinc-300 font-medium'
                              }`}
                            >
                              {isSetDone ? (
                                <Check className="h-4 w-4 stroke-[2.5]" />
                              ) : (
                                <span className="h-4 w-4 rounded-full border border-zinc-600 flex items-center justify-center text-[10px] text-zinc-400">
                                  {sIdx + 1}
                                </span>
                              )}
                              <span>Set {sIdx + 1}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 2-COLUMN GRID FOR FUEL (NEED) & GUARDRAILS (AVOID) */}
      {showFuelAndRules && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PILLAR 02 // NEED */}
        <div className="rounded-xl border border-white/[0.07] bg-[#121215] p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <h3 className="text-xs font-bold text-white tracking-tight">
              Fuel & Recovery
            </h3>
            <span className="text-[11px] font-mono-numbers text-zinc-400">
              {completedFuelCount}/{totalFuelCount} Target
            </span>
          </div>

          <div className="space-y-2">
            {protocol.fuelTargets.map(target => {
              const isDone = !!completedFuel[target.id];

              return (
                <div
                  key={target.id}
                  onClick={() => onToggleFuel(target.id)}
                  className={`cursor-pointer rounded-lg border p-3 transition select-none ${
                    isDone
                      ? 'border-sky-500/40 bg-sky-500/[0.08]'
                      : 'border-white/[0.06] bg-[#18181C] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-400">
                      {target.label}
                    </span>
                    <span className={`h-4 w-4 rounded flex items-center justify-center border ${
                      isDone
                        ? 'bg-sky-400 border-sky-400 text-zinc-950'
                        : 'border-zinc-700 bg-transparent'
                    }`}>
                      {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                    </span>
                  </div>

                  <div className={`mt-1 font-mono-numbers text-base font-semibold ${
                    isDone ? 'text-sky-300' : 'text-white'
                  }`}>
                    {target.value}
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {target.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* PILLAR 03 // AVOID */}
        <div className="rounded-xl border border-white/[0.07] bg-[#121215] p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <h3 className="text-xs font-bold text-white tracking-tight">
              Discipline Guardrails
            </h3>
            <span className="text-[11px] font-mono-numbers text-zinc-400">
              {completedAvoidCount}/{totalAvoidCount} Maintained
            </span>
          </div>

          <div className="space-y-2">
            {protocol.avoidRules.map(rule => {
              const isDone = !!completedAvoid[rule.id];

              return (
                <div
                  key={rule.id}
                  onClick={() => onToggleAvoid(rule.id)}
                  className={`cursor-pointer rounded-lg border p-3 transition select-none ${
                    isDone
                      ? 'border-emerald-500/40 bg-emerald-500/[0.08]'
                      : 'border-white/[0.06] bg-[#18181C] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200">
                      {rule.title}
                    </span>
                    <span className={`h-4 w-4 rounded flex items-center justify-center border ${
                      isDone
                        ? 'bg-emerald-400 border-emerald-400 text-zinc-950'
                        : 'border-zinc-700 bg-transparent'
                    }`}>
                      {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* Pro Upgrade Teaser Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-[#121215] p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#A3E635]" />
            <span className="text-xs font-semibold text-white">
              Vectr Pro Membership
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            Multi-week overload curves, wearable sync, and custom coaching voice briefings.
          </p>
        </div>

        <button
          onClick={onOpenProModal}
          className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] px-3.5 py-2 text-xs font-semibold text-white transition active:scale-95"
        >
          <span>Learn More</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
