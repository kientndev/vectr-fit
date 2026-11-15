'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Exercise } from '../types/protocol';
import { feedback } from '../lib/feedback';
import {
  Play,
  Square,
  Camera,
  Timer,
  Shield,
  Zap,
  Check,
  RotateCcw,
  Clock,
  Sparkles,
  Info,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface ActiveSetPlayerProps {
  exercise: Exercise;
  setIndex: number;
  totalSets: number;
  onSetVerified: (exercise: Exercise, setIndex: number, xpEarned: number) => void;
  onClose: () => void;
  onOpenFormCamera?: (
    exerciseName: string,
    mode?: 'FORM' | 'POSTURE' | 'MEAL',
    prescription?: string,
    biomechanicalCues?: string,
    onLockInSet?: () => void
  ) => void;
}

export const ActiveSetPlayer: React.FC<ActiveSetPlayerProps> = ({
  exercise,
  setIndex,
  totalSets,
  onSetVerified,
  onClose,
  onOpenFormCamera,
}) => {
  // Player Phases: 'PREP' -> 'PACER_RUNNING' -> 'TUT_HOLD_LOCK' -> 'REST_RECOVERY'
  const [phase, setPhase] = useState<'PREP' | 'PACER_RUNNING' | 'REST_RECOVERY'>('PREP');
  const [mode, setMode] = useState<'PACER' | 'CAMERA'>('PACER');

  // Time Under Tension (TUT) tracking
  const [activeSeconds, setActiveSeconds] = useState<number>(0);
  const minTutSeconds = 15; // Anti-cheat minimum: at least 15s of active execution

  // Cadence / Rep Metronome
  const [currentRep, setCurrentRep] = useState<number>(0);
  const targetReps = parseInt(exercise.repsOrHold.replace(/[^0-9]/g, ''), 10) || 10;
  const [cadenceSubPhase, setCadenceSubPhase] = useState<'ECCENTRIC (2s)' | 'DRIVE (1s)'>('ECCENTRIC (2s)');

  // 1.5s Press-and-Hold Lock State
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mandatory Rest Recovery Countdown
  const restDuration = exercise.restSeconds || 60;
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(restDuration);
  const minRestBeforeEarlyUnlock = 20; // Must rest at least 20s before early unlock button activates
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Motivational rest quotes
  const restQuotes = [
    'Someone is already working while you rest. Control your breathing.',
    'Tendon adaptation happens in the pause. Inhale deep, exhale slow.',
    'Focus on heart rate deceleration. 4 seconds in, 6 seconds out.',
    'Discipline is what you do when the burn intensifies.',
  ];
  const [quoteIndex] = useState<number>(() => Math.floor(Math.random() * restQuotes.length));

  // Timer Tick during PACER_RUNNING
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === 'PACER_RUNNING') {
      timer = setInterval(() => {
        setActiveSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase]);

  // Cadence Loop during PACER_RUNNING (2s down -> 1s up = 3s per rep)
  useEffect(() => {
    if (phase !== 'PACER_RUNNING') return;

    let subTimer: NodeJS.Timeout;
    let isDown = true;

    const cycle = () => {
      if (isDown) {
        setCadenceSubPhase('ECCENTRIC (2s)');
        if (soundEnabled) feedback.triggerHaptic(15);
        isDown = false;
        subTimer = setTimeout(cycle, 2000);
      } else {
        setCadenceSubPhase('DRIVE (1s)');
        if (soundEnabled) feedback.triggerHaptic(25);
        setCurrentRep(r => Math.min(targetReps, r + 1));
        isDown = true;
        subTimer = setTimeout(cycle, 1000);
      }
    };

    cycle();

    return () => clearTimeout(subTimer);
  }, [phase, targetReps, soundEnabled]);

  // Rest Recovery Countdown
  useEffect(() => {
    let restTimer: NodeJS.Timeout;
    if (phase === 'REST_RECOVERY') {
      restTimer = setInterval(() => {
        setRestSecondsRemaining(sec => {
          if (sec <= 1) {
            feedback.playRestFinished();
            return 0;
          }
          return sec - 1;
        });
      }, 1000);
    }
    return () => clearInterval(restTimer);
  }, [phase]);

  // Start Active Set Pacer
  const handleStartSet = () => {
    feedback.hapticLight();
    setActiveSeconds(0);
    setCurrentRep(0);
    setPhase('PACER_RUNNING');
  };

  // Launch Camera Verification Mode (awards 2x XP)
  const handleLaunchCamera = () => {
    feedback.hapticLight();
    if (onOpenFormCamera) {
      onOpenFormCamera(
        exercise.name,
        'FORM',
        `Set ${setIndex + 1} of ${totalSets} · ${exercise.repsOrHold}`,
        exercise.formCue,
        () => {
          onSetVerified(exercise, setIndex, 50);
          onClose();
        }
      );
    }
  };

  // 1.5s Press & Hold Anti-Cheat Locking Handlers
  const handleHoldStart = () => {
    if (activeSeconds < minTutSeconds) return; // Anti-cheat locked

    feedback.triggerHaptic(20);
    const stepMs = 50;
    const totalMs = 1500;
    const increment = (stepMs / totalMs) * 100;

    holdIntervalRef.current = setInterval(() => {
      setHoldProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(holdIntervalRef.current!);
          finalizeSet();
          return 100;
        }
        return next;
      });
    }, stepMs);
  };

  const handleHoldEnd = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHoldProgress(0);
  };

  // Finalize Set -> Trigger Rest
  const finalizeSet = () => {
    feedback.playSetComplete();
    feedback.hapticSuccess();
    const xp = mode === 'CAMERA' ? 50 : 25;
    onSetVerified(exercise, setIndex, xp);
    setPhase('REST_RECOVERY');
  };

  // Proceed to next set after rest
  const handleFinishRest = () => {
    feedback.hapticLight();
    onClose();
  };

  const isTutSatisfied = activeSeconds >= minTutSeconds;
  const canEarlyUnlockRest = (restDuration - restSecondsRemaining) >= minRestBeforeEarlyUnlock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-4 select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1013] border border-white/[0.12] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="border-b border-white/[0.08] bg-[#14161a] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#A3E635] text-black font-extrabold text-xs">
              S{setIndex + 1}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#A3E635] uppercase">
                  ANTI-CHEAT EXECUTION
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  SET {setIndex + 1} OF {totalSets}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight truncate max-w-[200px]">
                {exercise.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white transition"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-zinc-600" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PHASE 1: PREPARATION & MODE SELECTION                      */}
        {/* ========================================================= */}
        {phase === 'PREP' && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Target Prescription Badge */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Prescribed Work</span>
                <div className="text-2xl font-black font-mono-numbers text-white mt-0.5">
                  {exercise.repsOrHold}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">{exercise.rpe} · Rest {exercise.restSeconds}s</div>
              </div>
              <div className="text-right">
                <span className="rounded bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 text-[10px] font-mono text-sky-400 font-bold">
                  MIN TUT: {minTutSeconds}s
                </span>
              </div>
            </div>

            {/* Mode Selector Cards */}
            <div className="space-y-2.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                Select Execution Verification Mode
              </label>

              {/* Mode 1: Camera Verified (2x XP) */}
              <button
                type="button"
                onClick={() => {
                  setMode('CAMERA');
                  handleLaunchCamera();
                }}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                  mode === 'CAMERA'
                    ? 'border-[#A3E635] bg-[#A3E635]/10 shadow-[0_0_15px_rgba(163,230,53,0.15)]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A3E635]/20 text-[#A3E635]">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Camera AI Verified</span>
                      <span className="rounded bg-[#A3E635] text-black text-[9px] font-black px-1.5 py-0.2">
                        2x XP (+50 XP)
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Live joint-tracking counts verified reps & checks inflection depth.
                    </p>
                  </div>
                </div>
              </button>

              {/* Mode 2: Tempo Cadence Timer (1x XP) */}
              <button
                type="button"
                onClick={() => setMode('PACER')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                  mode === 'PACER'
                    ? 'border-sky-400 bg-sky-400/10 shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/20 text-sky-400">
                    <Timer className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Tempo Cadence Pacer</span>
                      <span className="rounded bg-sky-400/20 text-sky-300 text-[9px] font-bold px-1.5 py-0.2">
                        1x XP (+25 XP)
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Audio-visual metronome pacing 3s per rep with anti-cheat TUT hold.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Form Cue Pill */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-start gap-2 text-xs text-zinc-400 leading-relaxed">
              <Info className="h-4 w-4 text-[#A3E635] shrink-0 mt-0.5" />
              <span>{exercise.formCue}</span>
            </div>

            {/* Launch Pacer Button */}
            <button
              type="button"
              onClick={handleStartSet}
              className="w-full py-4 rounded-2xl bg-[#A3E635] text-black font-extrabold text-sm uppercase tracking-wider hover:bg-[#b0f340] active:scale-95 shadow-[0_0_20px_rgba(163,230,53,0.35)] transition flex items-center justify-center gap-2"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>START ACTIVE SET</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 2: ACTIVE PACER & TIME-UNDER-TENSION LOCK           */}
        {/* ========================================================= */}
        {phase === 'PACER_RUNNING' && (
          <div className="p-5 sm:p-6 space-y-6 text-center">
            {/* Live Rep Counter Display */}
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
                CADENCE PACER
              </span>
              <div className="font-mono-numbers text-6xl font-black text-white tracking-tight">
                {currentRep} <span className="text-2xl text-zinc-500">/ {targetReps}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#A3E635]/15 border border-[#A3E635]/40 px-3 py-1 text-xs font-mono font-bold text-[#A3E635]">
                <Sparkles className="h-3 w-3" />
                <span>{cadenceSubPhase}</span>
              </div>
            </div>

            {/* Time Under Tension Stopwatch */}
            <div className="rounded-2xl border border-white/[0.08] bg-black/50 p-4 flex items-center justify-around font-mono">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase">ACTIVE TUT</span>
                <div className={`text-2xl font-bold ${isTutSatisfied ? 'text-[#A3E635]' : 'text-amber-400'}`}>
                  {activeSeconds}s
                </div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <span className="text-[10px] text-zinc-500 uppercase">MIN TUT LOCK</span>
                <div className="text-2xl font-bold text-zinc-400">
                  {minTutSeconds}s
                </div>
              </div>
            </div>

            {/* Anti-Cheat Warning or Unlocked State */}
            {!isTutSatisfied ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-center gap-2">
                <Shield className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Lock button unlocks after {minTutSeconds - activeSeconds}s more work</span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#A3E635]/10 border border-[#A3E635]/30 text-xs text-[#A3E635] flex items-center justify-center gap-2">
                <Check className="h-4 w-4 stroke-[3]" />
                <span>TUT Criterion Satisfied! Hold button to finalize</span>
              </div>
            )}

            {/* 1.5-Second Press-and-Hold Finalizer Trigger */}
            <div className="relative pt-2">
              <button
                type="button"
                disabled={!isTutSatisfied}
                onMouseDown={handleHoldStart}
                onMouseUp={handleHoldEnd}
                onTouchStart={handleHoldStart}
                onTouchEnd={handleHoldEnd}
                className={`relative w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider overflow-hidden transition-all select-none touch-manipulation active:scale-[0.98] ${
                  isTutSatisfied
                    ? 'bg-zinc-800 text-white border-2 border-[#A3E635]'
                    : 'bg-zinc-900 text-zinc-600 border border-white/5 cursor-not-allowed'
                }`}
              >
                {/* Filling Progress Layer */}
                <div
                  className="absolute inset-0 bg-[#A3E635] transition-all duration-75 ease-linear pointer-events-none"
                  style={{ width: `${holdProgress}%` }}
                />

                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Zap className={`h-4 w-4 ${holdProgress > 50 ? 'fill-black text-black' : 'fill-current text-[#A3E635]'}`} />
                  <span className={holdProgress > 50 ? 'text-black' : 'text-white'}>
                    {holdProgress > 0 ? `HOLDING... ${Math.round(holdProgress)}%` : 'HOLD 1.5s TO LOCK SET'}
                  </span>
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 3: MANDATORY INTER-SET RECOVERY SCREEN               */}
        {/* ========================================================= */}
        {phase === 'REST_RECOVERY' && (
          <div className="p-6 sm:p-7 space-y-6 text-center">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#A3E635]">
                RECOVERY PROTOCOL
              </span>
              <div className="font-mono-numbers text-6xl font-black text-white tracking-tight">
                {restSecondsRemaining}s
              </div>
              <div className="text-xs text-zinc-400">
                Resting before Set {Math.min(totalSets, setIndex + 2)}
              </div>
            </div>

            {/* Motivational Quote Strip */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-300 italic leading-relaxed">
              "{restQuotes[quoteIndex]}"
            </div>

            {/* Recovery Guidance Progress */}
            <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#A3E635] h-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${Math.round(((restDuration - restSecondsRemaining) / restDuration) * 100)}%`,
                }}
              />
            </div>

            {/* Early Ready Button (Anti-Cheat locked for first 20s) */}
            <button
              type="button"
              disabled={!canEarlyUnlockRest && restSecondsRemaining > 0}
              onClick={handleFinishRest}
              className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition active:scale-95 ${
                canEarlyUnlockRest || restSecondsRemaining === 0
                  ? 'bg-[#A3E635] text-black hover:bg-[#b0f340] shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {restSecondsRemaining === 0
                ? 'READY FOR NEXT SET'
                : canEarlyUnlockRest
                ? 'READY EARLY (PROCEED)'
                : `REST LOCKED (${minRestBeforeEarlyUnlock - (restDuration - restSecondsRemaining)}s REMAINING)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
