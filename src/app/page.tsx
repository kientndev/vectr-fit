'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CalibrationState, DailyProtocol, Exercise } from '../types/protocol';
import {
  generateDailyProtocol,
  cycleExerciseSwap,
  applyCoachAdjustment,
} from '../lib/protocolEngine';
import { processCoachCommand } from '../lib/coachBrain';
import {
  loadStoredState,
  saveStoredState,
  advanceToNextDay,
  WorkoutHistoryEntry,
  DEFAULT_STORAGE_STATE,
} from '../lib/storage';
import { TopNav } from '../components/TopNav';
import { CalibrationPanel } from '../components/CalibrationPanel';
import { DailyBlueprint } from '../components/DailyBlueprint';
import { MuscleRecoveryPanel } from '../components/MuscleRecoveryPanel';
import { RestTimer, RestTimerState } from '../components/RestTimer';
import { ProUpgradeModal } from '../components/ProUpgradeModal';
import { ProHistoryStrip } from '../components/ProHistoryStrip';
import { BottomNav, MobileTab } from '../components/BottomNav';
import { sounds } from '../lib/soundUtils';
import { Check } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function Home() {
  // 1. User Identity (Clerk User + Persistent Guest Device ID for unauthenticated mobile APK)
  const [deviceId, setDeviceId] = useState<string>('');
  
  // Safely read user from Clerk
  let clerkUser: any = null;
  try {
    const auth = useUser();
    clerkUser = auth?.user;
  } catch {
    clerkUser = null;
  }

  // Active Effective User ID for Convex Queries & Actions
  const effectiveUserId = clerkUser?.id || deviceId || 'vectr_guest_device';

  // Today's YYYY-MM-DD
  const todayDate = new Date().toISOString().split('T')[0];

  // 2. Athlete Calibration State
  const [calibration, setCalibration] = useState<CalibrationState>(DEFAULT_STORAGE_STATE.calibration);

  // Generated Daily Blueprint
  const [protocol, setProtocol] = useState<DailyProtocol>(() =>
    generateDailyProtocol(DEFAULT_STORAGE_STATE.calibration)
  );

  // Checked items state
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});
  const [completedFuel, setCompletedFuel] = useState<Record<string, boolean>>({});
  const [completedAvoid, setCompletedAvoid] = useState<Record<string, boolean>>({});

  // Discipline & History State
  const [streakCount, setStreakCount] = useState<number>(DEFAULT_STORAGE_STATE.streakCount);
  const [completedWorkouts, setCompletedWorkouts] = useState<WorkoutHistoryEntry[]>(DEFAULT_STORAGE_STATE.completedWorkouts);
  const [isPro, setIsPro] = useState<boolean>(DEFAULT_STORAGE_STATE.isPro);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isCommandLoading, setIsCommandLoading] = useState(false);
  const [isAiLive, setIsAiLive] = useState(true);

  // Mobile App Native 4-Tab State
  const [activeTab, setActiveTab] = useState<MobileTab>('workout');

  // Auto Rest Timer State
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    isActive: false,
    exerciseName: '',
    setNumber: 1,
    totalSets: 3,
    totalSeconds: 90,
    remainingSeconds: 90,
    isRunning: false,
    soundEnabled: true,
  });

  // Track hydration status to avoid SSR mismatches
  const isHydrated = useRef(false);

  // 3. Convex Live Database Hooks (with safe null-guarding if offline or Convex URL not yet set)
  let convexAthleteData: any = null;
  try {
    convexAthleteData = useQuery(
      api.protocols.getOrCreateAthlete,
      effectiveUserId ? { userId: effectiveUserId, todayDate } : 'skip'
    );
  } catch {
    convexAthleteData = null;
  }

  let toggleSetOrTaskMutation: any = null;
  let swapExerciseMutation: any = null;
  let upsertAthleteMutation: any = null;
  let generateOrAdjustAction: any = null;

  try {
    toggleSetOrTaskMutation = useMutation(api.protocols.toggleSetOrTask);
    swapExerciseMutation = useMutation(api.protocols.swapExercise);
    upsertAthleteMutation = useMutation(api.protocols.upsertAthleteProfile);
    generateOrAdjustAction = useAction(api.aiCoach.generateOrAdjustProtocol);
  } catch {
    // Graceful fallback for offline mode
  }

  // Generate / Load Device ID on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedDeviceId = localStorage.getItem('vectr_device_id');
      if (!storedDeviceId) {
        storedDeviceId = `vectr_dev_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
        localStorage.setItem('vectr_device_id', storedDeviceId);
      }
      setDeviceId(storedDeviceId);
    }
  }, []);

  // Safe client hydration from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !isHydrated.current) {
      isHydrated.current = true;
      const stored = loadStoredState();
      setCalibration(stored.calibration);
      setCompletedSets(stored.completedSets || {});
      setCompletedFuel(stored.completedFuel || {});
      setCompletedAvoid(stored.completedAvoid || {});
      setStreakCount(stored.streakCount || 1);
      setCompletedWorkouts(stored.completedWorkouts || []);
      setIsPro(!!stored.isPro);

      const hydratedProtocol = generateDailyProtocol(stored.calibration);
      setProtocol(hydratedProtocol);
    }
  }, []);

  // Sync state from Convex when cloud data updates
  useEffect(() => {
    if (convexAthleteData?.profile) {
      const p = convexAthleteData.profile;
      if (p.streakCount !== undefined) setStreakCount(p.streakCount);
      if (p.isPro !== undefined) setIsPro(p.isPro);
    }
    if (convexAthleteData?.history && Array.isArray(convexAthleteData.history)) {
      setCompletedWorkouts(
        convexAthleteData.history.map((h: any, idx: number) => ({
          id: h._id || `hist_${idx}`,
          date: h.date,
          path: h.modality?.toUpperCase() || 'BODYWEIGHT',
          tier: h.tier,
          objective: h.objective,
          score: h.completionPct,
          setsCompleted: 12,
          totalSets: 12,
        }))
      );
    }
  }, [convexAthleteData]);

  // Save changes to localStorage whenever core state updates (offline-first sync)
  useEffect(() => {
    if (isHydrated.current) {
      saveStoredState({
        calibration,
        completedSets,
        completedFuel,
        completedAvoid,
        streakCount,
        completedWorkouts,
        isPro,
      });

      // Also sync profile changes to Convex if online
      if (upsertAthleteMutation && effectiveUserId) {
        upsertAthleteMutation({
          userId: effectiveUserId,
          modality: calibration.modality.toLowerCase() as 'bodyweight' | 'gym',
          tier: calibration.tier,
          objective: calibration.objective,
          coachPersona: calibration.persona,
          streakCount,
          isPro,
        }).catch(() => {});
      }
    }
  }, [calibration, completedSets, completedFuel, completedAvoid, streakCount, completedWorkouts, isPro, effectiveUserId]);

  // Auto-regenerate whenever calibration state changes
  useEffect(() => {
    if (isHydrated.current) {
      const nextProtocol = generateDailyProtocol(calibration);
      setProtocol(nextProtocol);
    }
  }, [calibration]);

  // Countdown effect for restTimer
  useEffect(() => {
    let interval: any = null;
    if (restTimer.isActive && restTimer.isRunning && restTimer.remainingSeconds > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev.remainingSeconds <= 1) {
            return {
              ...prev,
              remainingSeconds: 0,
              isRunning: false,
            };
          }
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1,
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restTimer.isActive, restTimer.isRunning, restTimer.remainingSeconds]);

  // Trigger rest timer from set completion or manual button
  const handleTriggerRestTimer = (
    exerciseName: string,
    setNumber: number,
    totalSets: number,
    restSeconds: number
  ) => {
    const sec = restSeconds || 90;
    setRestTimer({
      isActive: true,
      exerciseName,
      setNumber,
      totalSets,
      totalSeconds: sec,
      remainingSeconds: sec,
      isRunning: true,
      soundEnabled: true,
    });
  };

  const handleToggleTimerPlay = () => {
    setRestTimer(prev => {
      if (prev.remainingSeconds === 0) {
        return {
          ...prev,
          remainingSeconds: prev.totalSeconds,
          isRunning: true,
        };
      }
      return {
        ...prev,
        isRunning: !prev.isRunning,
      };
    });
  };

  const handleAdjustTimerSeconds = (delta: number) => {
    setRestTimer(prev => {
      const nextRemaining = Math.max(5, prev.remainingSeconds + delta);
      const nextTotal = Math.max(nextRemaining, prev.totalSeconds + delta);
      return {
        ...prev,
        remainingSeconds: nextRemaining,
        totalSeconds: nextTotal,
      };
    });
  };

  const handleResetTimer = () => {
    setRestTimer(prev => ({
      ...prev,
      remainingSeconds: prev.totalSeconds,
      isRunning: true,
    }));
  };

  const handleCloseTimer = () => {
    setRestTimer(prev => ({
      ...prev,
      isActive: false,
      isRunning: false,
    }));
  };

  const handleToggleSound = () => {
    setRestTimer(prev => {
      const nextSound = !prev.soundEnabled;
      sounds.enabled = nextSound;
      return {
        ...prev,
        soundEnabled: nextSound,
      };
    });
  };

  const handleCalibrationChange = (updates: Partial<CalibrationState>) => {
    setCalibration(prev => ({
      ...prev,
      ...updates,
    }));
  };

  // Cloud AI Protocol Generation (Connected to Convex Action)
  const handleManualGenerate = async () => {
    setIsGenerating(true);
    try {
      if (generateOrAdjustAction && effectiveUserId) {
        const cloudResult = await generateOrAdjustAction({
          userId: effectiveUserId,
          date: todayDate,
          calibration: {
            modality: calibration.modality.toLowerCase() as 'bodyweight' | 'gym',
            tier: calibration.tier,
            objective: calibration.objective,
            persona: calibration.persona,
          },
          checkIn: {
            energy: calibration.energy,
            duration: calibration.timeWindow,
            soreJoints: calibration.soreJoints,
          },
          userCommand: 'Recalibrate Full Session',
        });

        if (cloudResult?.blocks && cloudResult.blocks.length > 0) {
          setIsAiLive(true);
          const next = generateDailyProtocol(calibration);
          next.coachDirective.quote = cloudResult.coachBriefing || next.coachDirective.quote;
          setProtocol(next);
        } else {
          const nextProtocol = generateDailyProtocol(calibration);
          setProtocol(nextProtocol);
        }
      } else {
        const nextProtocol = generateDailyProtocol(calibration);
        setProtocol(nextProtocol);
      }
    } catch {
      // Local fallback
      setIsAiLive(false);
      const nextProtocol = generateDailyProtocol(calibration);
      setProtocol(nextProtocol);
    } finally {
      setIsGenerating(false);
      setActiveTab('workout');
    }
  };

  const handleIncrementStreak = () => {
    setStreakCount(prev => prev + 1);
    sounds.playDailyCleared();
  };

  // Toggle individual set checkbox with 0ms optimistic UI + Convex Cloud sync
  const handleToggleSet = (exercise: Exercise, setIndex: number) => {
    const key = `${exercise.id}_set_${setIndex}`;
    const nextState = !completedSets[key];

    // Optimistic instantaneous state update
    setCompletedSets(prev => ({
      ...prev,
      [key]: nextState,
    }));

    if (nextState) {
      sounds.playSetComplete();
      handleTriggerRestTimer(exercise.name, setIndex + 1, exercise.sets, exercise.restSeconds);
    }

    // Cloud sync to Convex
    if (toggleSetOrTaskMutation && effectiveUserId) {
      toggleSetOrTaskMutation({
        userId: effectiveUserId,
        date: todayDate,
        type: 'set',
        itemId: key,
        completed: nextState,
      }).catch(() => {});
    }
  };

  // Master toggle for an exercise card
  const handleToggleAllSets = (exercise: Exercise) => {
    let allDone = true;
    for (let i = 0; i < exercise.sets; i++) {
      if (!completedSets[`${exercise.id}_set_${i}`]) {
        allDone = false;
        break;
      }
    }

    const updates: Record<string, boolean> = {};
    for (let i = 0; i < exercise.sets; i++) {
      const key = `${exercise.id}_set_${i}`;
      updates[key] = !allDone;

      if (toggleSetOrTaskMutation && effectiveUserId) {
        toggleSetOrTaskMutation({
          userId: effectiveUserId,
          date: todayDate,
          type: 'set',
          itemId: key,
          completed: !allDone,
        }).catch(() => {});
      }
    }

    setCompletedSets(prev => ({
      ...prev,
      ...updates,
    }));

    if (!allDone) {
      sounds.playSetComplete();
      handleTriggerRestTimer(exercise.name, exercise.sets, exercise.sets, exercise.restSeconds);
    }
  };

  const handleToggleFuel = (id: string) => {
    const next = !completedFuel[id];
    if (next) sounds.playSetComplete();

    setCompletedFuel(prev => ({ ...prev, [id]: next }));

    // Sync to Convex
    if (toggleSetOrTaskMutation && effectiveUserId) {
      toggleSetOrTaskMutation({
        userId: effectiveUserId,
        date: todayDate,
        type: 'fuel',
        itemId: id,
        completed: next,
      }).catch(() => {});
    }
  };

  const handleToggleAvoid = (id: string) => {
    const next = !completedAvoid[id];
    if (next) sounds.playSetComplete();

    setCompletedAvoid(prev => ({ ...prev, [id]: next }));

    // Sync to Convex
    if (toggleSetOrTaskMutation && effectiveUserId) {
      toggleSetOrTaskMutation({
        userId: effectiveUserId,
        date: todayDate,
        type: 'avoid',
        itemId: id,
        completed: next,
      }).catch(() => {});
    }
  };

  const handleResetSession = () => {
    setCompletedSets({});
    setCompletedFuel({});
    setCompletedAvoid({});
  };

  // 1-Click Exercise Swap Handler (with Convex Cloud Persistence)
  const handleSwapExercise = (blockIndex: number, exerciseIndex: number) => {
    setProtocol(prev => {
      const nextBlocks = [...prev.blocks];
      const targetBlock = { ...nextBlocks[blockIndex] };
      const targetExercise = targetBlock.exercises[exerciseIndex];

      if (targetExercise) {
        setCompletedSets(currentSets => {
          const next = { ...currentSets };
          for (let i = 0; i < targetExercise.sets; i++) {
            delete next[`${targetExercise.id}_set_${i}`];
          }
          return next;
        });

        const swapped = cycleExerciseSwap(targetExercise);
        const nextExercises = [...targetBlock.exercises];
        nextExercises[exerciseIndex] = swapped;
        targetBlock.exercises = nextExercises;
        nextBlocks[blockIndex] = targetBlock;

        // Persist swapped movement to Convex
        if (swapExerciseMutation && effectiveUserId) {
          swapExerciseMutation({
            userId: effectiveUserId,
            date: todayDate,
            blockIndex,
            exerciseIndex,
            swappedExercise: swapped,
          }).catch(() => {});
        }
      }

      return {
        ...prev,
        blocks: nextBlocks,
      };
    });
  };

  // Cloud AI Coach Command Bar Dispatcher (Calls Convex Action with Offline Engine fallback)
  const handleSendCommand = async (prompt: string) => {
    setIsCommandLoading(true);
    try {
      if (generateOrAdjustAction && effectiveUserId) {
        const cloudResult = await generateOrAdjustAction({
          userId: effectiveUserId,
          date: todayDate,
          calibration: {
            modality: calibration.modality.toLowerCase() as 'bodyweight' | 'gym',
            tier: calibration.tier,
            objective: calibration.objective,
            persona: calibration.persona,
          },
          checkIn: {
            energy: calibration.energy,
            duration: calibration.timeWindow,
            soreJoints: calibration.soreJoints,
          },
          userCommand: prompt,
        });

        if (cloudResult?.coachBriefing) {
          setIsAiLive(true);
          const res = processCoachCommand(calibration, prompt, protocol);
          res.directive.quote = cloudResult.coachBriefing;
          const updated = applyCoachAdjustment(protocol, res);
          setProtocol(updated);
          return;
        }
      }

      // Offline deterministic engine fallback
      setIsAiLive(false);
      await new Promise(r => setTimeout(r, 120));
      const res = processCoachCommand(calibration, prompt, protocol);

      if (res.success) {
        const updated = applyCoachAdjustment(protocol, res);
        setProtocol(updated);

        if (res.adjustedCalibration) {
          setCalibration(prev => ({
            ...prev,
            ...res.adjustedCalibration,
          }));
        }
      }
    } catch {
      setIsAiLive(false);
      const res = processCoachCommand(calibration, prompt, protocol);
      if (res.success) {
        const updated = applyCoachAdjustment(protocol, res);
        setProtocol(updated);
      }
    } finally {
      setIsCommandLoading(false);
    }
  };

  const handleResetToBaseline = () => {
    const fresh = generateDailyProtocol(calibration);
    setProtocol(fresh);
  };

  // Advance to Next Day Utility (saves history & resets daily checks)
  const handleAdvanceDay = () => {
    const allExercises = protocol.blocks.flatMap(b => b.exercises);
    const totalSets = allExercises.reduce((sum, e) => sum + e.sets, 0);
    const setsDone = Object.values(completedSets).filter(Boolean).length;
    const score = totalSets > 0 ? Math.round((setsDone / totalSets) * 100) : 100;

    const currentState = {
      calibration,
      completedSets,
      completedFuel,
      completedAvoid,
      streakCount,
      lastCompletedDate: todayDate,
      completedWorkouts,
      isPro,
    };

    const nextState = advanceToNextDay(currentState, score, totalSets, setsDone);
    setCompletedSets({});
    setCompletedFuel({});
    setCompletedAvoid({});
    setStreakCount(nextState.streakCount);
    setCompletedWorkouts(nextState.completedWorkouts);

    sounds.playDailyCleared();
  };

  // Calculations for badges
  const allExercises = protocol.blocks.flatMap(b => b.exercises);
  const totalSetsCount = allExercises.reduce((sum, e) => sum + e.sets, 0);
  const completedSetsCount = Object.values(completedSets).filter(Boolean).length;
  const pendingSets = Math.max(0, totalSetsCount - completedSetsCount);

  const totalFuelCount = protocol.fuelTargets.length;
  const completedFuelCount = Object.values(completedFuel).filter(Boolean).length;
  const totalAvoidCount = protocol.avoidRules.length;
  const completedAvoidCount = Object.values(completedAvoid).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans select-none">
      {/* Sleek Top App Header with Clerk / Guest Status */}
      <TopNav
        tier={calibration.tier}
        modality={calibration.modality}
        streakCount={streakCount}
        onIncrementStreak={handleIncrementStreak}
        onOpenProModal={() => setIsProModalOpen(true)}
        isPro={isPro}
        onAdvanceDay={handleAdvanceDay}
        activeView={activeTab === 'workout' ? 'today' : activeTab === 'recovery' ? 'recovery' : 'history'}
        onViewChange={v => {
          if (v === 'today') setActiveTab('workout');
          else if (v === 'recovery') setActiveTab('recovery');
          else setActiveTab('recovery');
        }}
        isCloudConnected={!!convexAthleteData}
      />

      {/* Main SaaS Workspace Container with Safe-Area bottom padding */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 sm:px-6 pb-28">
        {/* ========================================================= */}
        {/* TAB 1: WORKOUT (DO Session + Coach Briefing + Sticky Timer) */}
        {/* ========================================================= */}
        {activeTab === 'workout' && (
          <div className="space-y-6">
            <DailyBlueprint
              protocol={protocol}
              onOpenProModal={() => setIsProModalOpen(true)}
              onTriggerRestTimer={handleTriggerRestTimer}
              streakCount={streakCount}
              onIncrementStreak={handleIncrementStreak}
              onSwapExercise={handleSwapExercise}
              onSendCommand={handleSendCommand}
              isCommandLoading={isCommandLoading}
              onResetToBaseline={handleResetToBaseline}
              completedSets={completedSets}
              onToggleSet={handleToggleSet}
              onToggleAllSets={handleToggleAllSets}
              completedFuel={completedFuel}
              onToggleFuel={handleToggleFuel}
              completedAvoid={completedAvoid}
              onToggleAvoid={handleToggleAvoid}
              onResetSession={handleResetSession}
              showFuelAndRules={false}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CHECK-IN (Calibration Console & Joint Protection)  */}
        {/* ========================================================= */}
        {activeTab === 'checkin' && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="pb-1">
              <h2 className="text-base font-bold text-white tracking-tight">
                Daily Calibration & Guardrails
              </h2>
              <p className="text-xs text-zinc-400">
                Configure training modality, tier benchmark, energy level, and joint protection.
              </p>
            </div>

            <CalibrationPanel
              state={calibration}
              onChange={handleCalibrationChange}
              onGenerate={handleManualGenerate}
              isGenerating={isGenerating}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: FUEL & RULES (NEED & AVOID Checklists)             */}
        {/* ========================================================= */}
        {activeTab === 'fuel' && (
          <div className="space-y-6">
            <div className="pb-1">
              <h2 className="text-base font-bold text-white tracking-tight">
                Nutrition Targets & Guardrails
              </h2>
              <p className="text-xs text-zinc-400">
                Log daily macronutrient goals, hydration, sleep hygiene, and discipline anti-goals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PILLAR 02 // NEED */}
              <div className="rounded-xl border border-white/[0.07] bg-[#121215] p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <h3 className="text-xs font-bold text-white tracking-tight">
                    Fuel & Recovery Targets
                  </h3>
                  <span className="text-[11px] font-mono-numbers text-zinc-400">
                    {completedFuelCount}/{totalFuelCount} Logged
                  </span>
                </div>

                <div className="space-y-2.5">
                  {protocol.fuelTargets.map(target => {
                    const isDone = !!completedFuel[target.id];

                    return (
                      <div
                        key={target.id}
                        onClick={() => handleToggleFuel(target.id)}
                        className={`cursor-pointer rounded-xl border p-3.5 transition select-none touch-manipulation active:scale-[0.99] ${
                          isDone
                            ? 'border-sky-500/40 bg-sky-500/[0.08]'
                            : 'border-white/[0.06] bg-[#18181C] hover:border-white/[0.12]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-zinc-400">
                            {target.label}
                          </span>
                          <span className={`h-5 w-5 rounded-md flex items-center justify-center border ${
                            isDone
                              ? 'bg-sky-400 border-sky-400 text-zinc-950'
                              : 'border-zinc-700 bg-transparent'
                          }`}>
                            {isDone && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </span>
                        </div>

                        <div className={`mt-1 font-mono-numbers text-lg font-bold ${
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
                    Discipline Guardrails (Anti-Goals)
                  </h3>
                  <span className="text-[11px] font-mono-numbers text-zinc-400">
                    {completedAvoidCount}/{totalAvoidCount} Maintained
                  </span>
                </div>

                <div className="space-y-2.5">
                  {protocol.avoidRules.map(rule => {
                    const isDone = !!completedAvoid[rule.id];

                    return (
                      <div
                        key={rule.id}
                        onClick={() => handleToggleAvoid(rule.id)}
                        className={`cursor-pointer rounded-xl border p-3.5 transition select-none touch-manipulation active:scale-[0.99] ${
                          isDone
                            ? 'border-emerald-500/40 bg-emerald-500/[0.08]'
                            : 'border-white/[0.06] bg-[#18181C] hover:border-white/[0.12]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-200">
                            {rule.title}
                          </span>
                          <span className={`h-5 w-5 rounded-md flex items-center justify-center border ${
                            isDone
                              ? 'bg-emerald-400 border-emerald-400 text-zinc-950'
                              : 'border-zinc-700 bg-transparent'
                          }`}>
                            {isDone && <Check className="h-3.5 w-3.5 stroke-[3]" />}
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
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: RECOVERY (Muscle Readiness + History + Pro Strip)   */}
        {/* ========================================================= */}
        {activeTab === 'recovery' && (
          <div className="space-y-6">
            <div className="pb-1">
              <h2 className="text-base font-bold text-white tracking-tight">
                Biomechanical Readiness & History
              </h2>
              <p className="text-xs text-zinc-400">
                6-zone kinetic fatigue modeling, CNS readiness, and 7-day consistency tracking.
              </p>
            </div>

            <MuscleRecoveryPanel
              protocol={protocol}
              completedSets={completedSets}
              soreJoints={calibration.soreJoints}
              energy={calibration.energy}
            />

            <ProHistoryStrip
              history={completedWorkouts}
              streakCount={streakCount}
            />
          </div>
        )}
      </main>

      {/* Floating Rest Timer with safe-area offset above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 pointer-events-none z-50">
        <RestTimer
          timer={restTimer}
          onTogglePlay={handleToggleTimerPlay}
          onAdjustSeconds={handleAdjustTimerSeconds}
          onReset={handleResetTimer}
          onClose={handleCloseTimer}
          onToggleSound={handleToggleSound}
        />
      </div>

      {/* Fixed Native Mobile Bottom Tab Bar (h-16) */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        pendingSetsCount={pendingSets}
      />

      {/* Pro SaaS Upgrade Modal */}
      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        isPro={isPro}
        onTogglePro={proState => setIsPro(proState)}
      />
    </div>
  );
}
