'use client';

import React, { useState, useEffect } from 'react';
import { DailyProtocol, JointSoreness } from '../types/protocol';
import {
  Activity,
  Zap,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Heart,
  Wind,
  ShieldAlert,
} from 'lucide-react';
import { feedback } from '../lib/feedback';

interface MuscleRecoveryPanelProps {
  protocol: DailyProtocol;
  completedSets: Record<string, boolean>;
  soreJoints: JointSoreness[];
  energy: number;
  onAwardXp?: (amount: number, reason: string) => void;
}

interface MuscleGroupStatus {
  name: string;
  readiness: number; // 0 - 100
  statusLabel: string;
  category: 'OPTIMAL' | 'LOADED' | 'FATIGUED';
  setsDone: number;
}

export const MuscleRecoveryPanel: React.FC<MuscleRecoveryPanelProps> = ({
  protocol,
  completedSets,
  soreJoints,
  energy,
  onAwardXp,
}) => {
  // Mobility Flush Timer State (120 seconds)
  const [flushSecondsLeft, setFlushSecondsLeft] = useState<number>(120);
  const [isFlushRunning, setIsFlushRunning] = useState<boolean>(false);
  const [isFlushCompleted, setIsFlushCompleted] = useState<boolean>(false);
  const [cnsBonus, setCnsBonus] = useState<number>(0);

  // Breathing Phase for interactive pulse
  const [breathPhase, setBreathPhase] = useState<'INHALE' | 'HOLD' | 'EXHALE'>('INHALE');

  useEffect(() => {
    let timer: any = null;
    if (isFlushRunning && flushSecondsLeft > 0) {
      timer = setInterval(() => {
        setFlushSecondsLeft(prev => {
          if (prev <= 1) {
            setIsFlushRunning(false);
            setIsFlushCompleted(true);
            setCnsBonus(5);
            feedback.playDailyCleared();
            feedback.hapticSuccess();
            if (onAwardXp) {
              onAwardXp(40, '⚡ 2-MIN MOBILITY FLUSH COMPLETED (+40 XP)');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isFlushRunning, flushSecondsLeft, onAwardXp]);

  // Breathing cycle animation while running
  useEffect(() => {
    let breathTimer: any = null;
    if (isFlushRunning) {
      const cycleTime = (120 - flushSecondsLeft) % 14;
      if (cycleTime < 4) setBreathPhase('INHALE');
      else if (cycleTime < 8) setBreathPhase('HOLD');
      else setBreathPhase('EXHALE');
    }
    return () => clearTimeout(breathTimer);
  }, [isFlushRunning, flushSecondsLeft]);

  const allExercises = protocol.blocks.flatMap(b => b.exercises);

  const countCompletedSetsForKeywords = (keywords: string[]) => {
    let completed = 0;
    allExercises.forEach(ex => {
      const target = (ex.targetMuscle + ' ' + ex.name).toLowerCase();
      const matches = keywords.some(k => target.includes(k.toLowerCase()));
      if (matches) {
        for (let i = 0; i < ex.sets; i++) {
          if (completedSets[`${ex.id}_set_${i}`]) {
            completed++;
          }
        }
      }
    });
    return completed;
  };

  const pushSetsDone = countCompletedSetsForKeywords(['push', 'chest', 'pectoral', 'tricep', 'dip']);
  const pullSetsDone = countCompletedSetsForKeywords(['pull', 'lat', 'row', 'chin', 'bicep']);
  const shoulderSetsDone = countCompletedSetsForKeywords(['shoulder', 'delt', 'overhead', 'hspu', 'rotator']);
  const legSetsDone = countCompletedSetsForKeywords(['leg', 'squat', 'lunge', 'pistol', 'quad', 'hamstring', 'deadlift', 'hinge']);
  const coreSetsDone = countCompletedSetsForKeywords(['core', 'abs', 'hollow', 'dragon', 'plank', 'toes-to-bar', 'l-sit']);

  const totalWorkoutSetsDone = Object.values(completedSets).filter(Boolean).length;

  // Real-time fatigue calculation
  const calculateDynamicStatus = (
    name: string,
    setsDone: number,
    isJointFlagged: boolean,
    baselineReadiness: number
  ): MuscleGroupStatus => {
    if (isJointFlagged) {
      const fatiguedScore = Math.max(35, 45 - setsDone * 4);
      return {
        name,
        readiness: fatiguedScore,
        statusLabel: 'Guardrail Active',
        category: 'FATIGUED',
        setsDone,
      };
    }

    if (setsDone >= 5) {
      const heavyScore = Math.max(48, baselineReadiness - setsDone * 7);
      return {
        name,
        readiness: heavyScore,
        statusLabel: 'Deep Stimulus',
        category: 'LOADED',
        setsDone,
      };
    } else if (setsDone > 0) {
      const loadedScore = Math.max(65, baselineReadiness - setsDone * 6);
      return {
        name,
        readiness: loadedScore,
        statusLabel: 'Stimulus Loaded',
        category: 'LOADED',
        setsDone,
      };
    }

    return {
      name,
      readiness: baselineReadiness,
      statusLabel: 'Optimal',
      category: 'OPTIMAL',
      setsDone: 0,
    };
  };

  // Dynamic CNS Readiness
  const baseCns = energy <= 2 ? 55 : soreJoints.some(j => j !== 'None') ? 72 : 92;
  const cnsDrain = totalWorkoutSetsDone * 2.5;
  const rawCns = Math.min(100, Math.max(35, Math.round(baseCns - cnsDrain + cnsBonus)));

  const groups: MuscleGroupStatus[] = [
    calculateDynamicStatus('Chest & Push', pushSetsDone, soreJoints.includes('Wrists') && pushSetsDone > 0, 96),
    calculateDynamicStatus('Back & Pull', pullSetsDone, false, 94),
    calculateDynamicStatus('Shoulders & Delts', shoulderSetsDone, soreJoints.includes('Shoulders'), soreJoints.includes('Shoulders') ? 42 : 92),
    calculateDynamicStatus('Legs & Posterior', legSetsDone, soreJoints.includes('Knees'), soreJoints.includes('Knees') ? 44 : 95),
    calculateDynamicStatus('Core & Trunk', coreSetsDone, soreJoints.includes('Lower Back'), soreJoints.includes('Lower Back') ? 46 : 98),
    {
      name: 'CNS Readiness',
      readiness: rawCns,
      statusLabel: isFlushCompleted ? 'Flush Restored' : rawCns < 60 ? 'CNS Taxed' : rawCns < 80 ? 'Active Load' : 'Prime Focus',
      category: rawCns < 60 ? 'FATIGUED' : rawCns < 80 ? 'LOADED' : 'OPTIMAL',
      setsDone: totalWorkoutSetsDone,
    },
  ];

  // Current mobility protocol step
  const getMobilityCue = () => {
    const elapsed = 120 - flushSecondsLeft;
    if (elapsed < 30) {
      return {
        phase: 'PHASE 1 (0:00 - 0:30)',
        action: 'Diaphragmatic Parasympathetic Reset',
        cue: 'Inhale 4s into lower ribs, hold 4s, exhale 6s with soft jaw.',
      };
    } else if (elapsed < 60) {
      return {
        phase: 'PHASE 2 (0:30 - 1:00)',
        action: 'Spinal Decompression & Thoracic Extension',
        cue: 'Passive hang or active puppy pose to traction lumbar vertebrae.',
      };
    } else if (elapsed < 90) {
      return {
        phase: 'PHASE 3 (1:00 - 1:30)',
        action: 'Hip Flexor & Psoas Flush',
        cue: 'Half-kneeling pelvic tuck. Squeeze rear glute to open anterior chain.',
      };
    } else {
      return {
        phase: 'PHASE 4 (1:30 - 2:00)',
        action: 'CNS Autonomic Down-Regulation',
        cue: 'Slow nasal breath. Lower heart rate below 100 bpm before exiting.',
      };
    }
  };

  const currentCue = getMobilityCue();

  return (
    <div className="space-y-4">
      {/* 6-Zone Kinetic Telemetry Panel */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121215] p-4 sm:p-5 space-y-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A3E635]/15 border border-[#A3E635]/30 text-[#A3E635]">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-tight">
                DYNAMIC MUSCLE RECOVERY TELEMETRY
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                {totalWorkoutSetsDone} Sets Verified Today · Real-Time Stimulus Modeling
              </p>
            </div>
          </div>

          <span className="rounded-full bg-white/[0.06] border border-white/[0.08] px-2.5 py-0.5 text-[10px] font-mono font-bold text-zinc-300">
            6-ZONE KINETICS
          </span>
        </div>

        {/* 6 Muscle Groups Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {groups.map(group => {
            const isFatigued = group.category === 'FATIGUED';
            const isLoaded = group.category === 'LOADED';

            return (
              <div
                key={group.name}
                className={`rounded-xl border p-3 transition-all ${
                  isFatigued
                    ? 'border-rose-500/30 bg-rose-500/[0.05]'
                    : isLoaded
                    ? 'border-amber-400/30 bg-amber-400/[0.05]'
                    : 'border-white/[0.06] bg-[#18181C]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200 truncate">
                    {group.name}
                  </span>
                  <span
                    className={`font-mono-numbers text-xs font-black ${
                      isFatigued
                        ? 'text-rose-400'
                        : isLoaded
                        ? 'text-amber-400'
                        : 'text-[#A3E635]'
                    }`}
                  >
                    {group.readiness}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${
                      isFatigued
                        ? 'bg-rose-500'
                        : isLoaded
                        ? 'bg-amber-400'
                        : 'bg-[#A3E635]'
                    }`}
                    style={{ width: `${group.readiness}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                  <span
                    className={`font-medium ${
                      isFatigued
                        ? 'text-rose-400'
                        : isLoaded
                        ? 'text-amber-300'
                        : 'text-zinc-400'
                    }`}
                  >
                    {group.statusLabel}
                  </span>
                  {group.setsDone > 0 && (
                    <span className="text-zinc-500 font-bold">
                      {group.setsDone}s
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive 2-Min Mobility Flush & Decompression Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#141418] to-[#0F0F12] p-4 sm:p-5 space-y-4 shadow-xl relative overflow-hidden">
        {/* Glow corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#A3E635]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A3E635]/20 text-[#A3E635]">
              <Wind className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black tracking-tight text-white uppercase">
                  2-MIN DECOMPRESSION & MOBILITY FLUSH
                </h4>
                <span className="rounded bg-[#A3E635]/20 px-1.5 py-0.2 text-[9px] font-bold text-[#A3E635]">
                  +40 XP
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">
                Lowers systemic cortisol and restores +5% CNS readiness post-session.
              </p>
            </div>
          </div>

          {/* Time Display */}
          <div className="font-mono text-lg font-black text-white bg-black/40 px-3 py-1 rounded-xl border border-white/[0.08]">
            {Math.floor(flushSecondsLeft / 60)}:
            {(flushSecondsLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>

        {/* Guided Action & Breath Pulse HUD */}
        {isFlushRunning ? (
          <div className="p-3.5 rounded-xl bg-black/50 border border-[#A3E635]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#A3E635] tracking-wider uppercase">
                {currentCue.phase}
              </span>
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-white">
                <span className="inline-block h-2 w-2 rounded-full bg-[#A3E635] animate-ping" />
                <span>BREATH: {breathPhase}</span>
              </div>
            </div>

            <div className="text-xs font-bold text-white">
              {currentCue.action}
            </div>

            <div className="text-[11px] text-zinc-300 leading-snug">
              {currentCue.cue}
            </div>
          </div>
        ) : isFlushCompleted ? (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">
                ✓ FLUSH COMPLETED · CNS RECOVERED
              </div>
              <div className="text-[11px] text-zinc-300">
                +40 XP logged to athlete dossier. +5% CNS Readiness added to daily kinetic model.
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400 leading-relaxed">
            Follow structured parasympathetic breathing intervals, passive spinal hang, and pelvic reset to accelerate neural recovery.
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          {!isFlushCompleted ? (
            <button
              type="button"
              onClick={() => {
                feedback.hapticLight();
                setIsFlushRunning(!isFlushRunning);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition active:scale-95 shadow-sm ${
                isFlushRunning
                  ? 'bg-amber-400 text-black hover:bg-amber-300'
                  : 'bg-[#A3E635] text-black hover:bg-[#bbf055]'
              }`}
            >
              {isFlushRunning ? (
                <>
                  <Pause className="h-4 w-4 fill-current" />
                  <span>PAUSE FLUSH</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>
                    {flushSecondsLeft < 120
                      ? 'RESUME FLUSH'
                      : '⚡ START 2-MIN DECOMPRESSION & MOBILITY FLUSH (+40 XP)'}
                  </span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                feedback.hapticLight();
                setFlushSecondsLeft(120);
                setIsFlushCompleted(false);
                setIsFlushRunning(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 transition active:scale-95 border border-white/[0.08]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>RUN ANOTHER FLUSH</span>
            </button>
          )}

          {flushSecondsLeft < 120 && !isFlushCompleted && (
            <button
              type="button"
              onClick={() => {
                feedback.hapticLight();
                setIsFlushRunning(false);
                setFlushSecondsLeft(120);
              }}
              title="Reset Timer"
              className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white transition active:scale-90 border border-white/[0.08]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
