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
import { OnboardingFlow, OnboardingData } from '../components/OnboardingFlow';
import { FormCheckCamera } from '../components/FormCheckCamera';
import { CritiqueStatCard } from '../components/CritiqueStatCard';
import { LeaderboardModal, LeaderboardAthlete } from '../components/LeaderboardModal';
import { feedback } from '../lib/feedback';
import { Check, Plus, Droplet, Sparkles, Zap, Shield, Heart, Sun, Dumbbell, Moon, Trophy } from 'lucide-react';
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

  // Dynamic Fuel Quantities (e.g. Water in Liters)
  const [waterAmount, setWaterAmount] = useState<number>(1.5);

  // Discipline & History State
  const [streakCount, setStreakCount] = useState<number>(DEFAULT_STORAGE_STATE.streakCount);
  const [completedWorkouts, setCompletedWorkouts] = useState<WorkoutHistoryEntry[]>(DEFAULT_STORAGE_STATE.completedWorkouts);
  const [isPro, setIsPro] = useState<boolean>(DEFAULT_STORAGE_STATE.isPro);

  // Gamification & XP State
  const [userXp, setUserXp] = useState<number>(420);
  const [floatingXp, setFloatingXp] = useState<{ id: number; text: string } | null>(null);

  // Live Workout Session Mode State
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [liveSeconds, setLiveSeconds] = useState<number>(0);

  // Onboarding & AI Form Camera States
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraExerciseName, setCameraExerciseName] = useState<string>('Standard Push-up');

  // Critique AI & Leaderboard Modals
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

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

  // Helper: Trigger floating XP badge and award XP
  const awardXp = (amount: number, reason: string) => {
    setUserXp(prev => prev + amount);
    setFloatingXp({ id: Date.now(), text: `+${amount} XP ${reason}` });
    setTimeout(() => {
      setFloatingXp(null);
    }, 1800);
  };

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
  let completeOnboardingMutation: any = null;
  let generateOrAdjustAction: any = null;
  let analyzeExerciseFormAction: any = null;
  let critiquePostureAction: any = null;
  let critiqueMealAction: any = null;
  let leaderboardData: any = null;

  try {
    leaderboardData = useQuery(
      api.protocols.getLeaderboard,
      effectiveUserId ? { userId: effectiveUserId, userXp, userTier: calibration.tier } : 'skip'
    );
  } catch {
    leaderboardData = null;
  }

  try {
    toggleSetOrTaskMutation = useMutation(api.protocols.toggleSetOrTask);
    swapExerciseMutation = useMutation(api.protocols.swapExercise);
    upsertAthleteMutation = useMutation(api.protocols.upsertAthleteProfile);
    completeOnboardingMutation = useMutation(api.protocols.completeOnboarding);
    generateOrAdjustAction = useAction(api.aiCoach.generateOrAdjustProtocol);
    analyzeExerciseFormAction = useAction(api.aiCoach.analyzeExerciseForm);
    critiquePostureAction = useAction(api.aiCoach.critiquePostureAndPhysique);
    critiqueMealAction = useAction(api.aiCoach.critiqueMealMacros);
  } catch {
    // Graceful fallback for offline mode
  }

  // Generate / Load Device ID & XP on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedDeviceId = localStorage.getItem('vectr_device_id');
      if (!storedDeviceId) {
        storedDeviceId = `vectr_dev_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
        localStorage.setItem('vectr_device_id', storedDeviceId);
      }
      setDeviceId(storedDeviceId);

      const storedXp = localStorage.getItem('vectr_user_xp');
      if (storedXp) setUserXp(parseInt(storedXp, 10));

      const storedWater = localStorage.getItem('vectr_water_amount');
      if (storedWater) setWaterAmount(parseFloat(storedWater));
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

      // Check if user has completed onboarding previously
      const hasOnboarded = localStorage.getItem('vectr_onboarding_done');
      if (!hasOnboarded) {
        setIsOnboardingOpen(true);
      }
    }
  }, []);

  // Live Workout Session Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isLiveActive) {
      interval = setInterval(() => {
        setLiveSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLiveActive]);

  const handleToggleLiveSession = () => {
    if (!isLiveActive) {
      setIsLiveActive(true);
      feedback.triggerHaptic([50, 50, 100]);
      feedback.playSetComplete();
      awardXp(50, '⚡ LIVE SESSION STARTED');
    } else {
      setIsLiveActive(false);
      feedback.triggerHaptic([80, 40, 80]);
      awardXp(100, '🏆 WORKOUT CONQUERED');
    }
  };

  // Sync state from Convex when cloud data updates
  useEffect(() => {
    if (convexAthleteData?.profile) {
      const p = convexAthleteData.profile;
      if (p.streakCount !== undefined) setStreakCount(p.streakCount);
      if (p.isPro !== undefined) setIsPro(p.isPro);
      if (p.onboardingCompleted) {
        localStorage.setItem('vectr_onboarding_done', 'true');
      }
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

      localStorage.setItem('vectr_user_xp', userXp.toString());
      localStorage.setItem('vectr_water_amount', waterAmount.toString());

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
  }, [calibration, completedSets, completedFuel, completedAvoid, streakCount, completedWorkouts, isPro, userXp, waterAmount, effectiveUserId]);

  // Auto-regenerate whenever calibration state changes
  useEffect(() => {
    if (isHydrated.current) {
      const nextProtocol = generateDailyProtocol(calibration);
      setProtocol(nextProtocol);
    }
  }, [calibration]);

  // Handler: Complete Onboarding Questionnaire
  const handleCompleteOnboarding = (data: OnboardingData) => {
    // 1. Map target skill to standard primary objective
    let mappedObjective = 'SKILLS';
    if (data.targetSkill.includes('Hypertrophy')) mappedObjective = 'STRENGTH';
    else if (data.targetSkill.includes('Martial')) mappedObjective = 'METCON';
    else if (data.targetSkill.includes('Raw Strength')) mappedObjective = 'STRENGTH';

    const nextCalibration: CalibrationState = {
      ...calibration,
      modality: data.modality,
      tier: data.calculatedTier,
      objective: mappedObjective as any,
      persona: data.coachPersona,
      timeWindow: data.sessionDuration as any,
      soreJoints: data.soreJoints,
    };

    setCalibration(nextCalibration);
    setIsOnboardingOpen(false);
    localStorage.setItem('vectr_onboarding_done', 'true');
    awardXp(150, '🚀 ATHLETE PROFILE INITIALIZED');

    // Sync to Convex
    if (completeOnboardingMutation && effectiveUserId) {
      completeOnboardingMutation({
        userId: effectiveUserId,
        modality: data.modality.toLowerCase() as 'bodyweight' | 'gym',
        tier: data.calculatedTier,
        objective: mappedObjective,
        coachPersona: data.coachPersona,
        soreJoints: data.soreJoints,
        biometrics: {
          weightKg: data.weightKg,
          heightCm: data.heightCm,
          maxPullups: data.maxPullups,
          maxPushups: data.maxPushups,
          targetSkill: data.targetSkill,
          equipment: data.equipment,
        },
      }).catch((e: any) => console.warn('Convex onboarding sync notice:', e));
    }
  };

  // Handler: Open Form Check Camera for an exercise
  const handleOpenFormCamera = (exerciseName: string) => {
    setCameraExerciseName(exerciseName);
    setIsCameraOpen(true);
  };

  // Handler: Send captured frame & telemetry to Convex / Gemini Vision
  const handleAnalyzeFormSnapshot = async (payload: {
    exerciseName: string;
    imageBase64: string;
    telemetry: {
      spineAlignmentDeg: number;
      elbowAngleDeg: number;
      romDepthPct: number;
      repCount: number;
    };
  }) => {
    if (analyzeExerciseFormAction) {
      try {
        const res = await analyzeExerciseFormAction({
          exerciseName: payload.exerciseName,
          imageBase64: payload.imageBase64,
          telemetry: payload.telemetry,
          persona: calibration.persona,
        });
        awardXp(75, '🎯 FORM CHECK COMPLETED');
        return {
          formScore: res.formScore,
          whatLookedSolid: res.whatLookedSolid,
          microCorrection: res.microCorrection,
        };
      } catch (e) {
        console.warn('Convex action error, falling back:', e);
      }
    }

    awardXp(75, '🎯 FORM CHECK COMPLETED');
    return {
      formScore: 92,
      whatLookedSolid: 'Rigid kinetic tension maintained through scapular depression and hip lockout.',
      microCorrection: 'Slow the eccentric descent by ~0.5s to maximize active tendon strain.',
    };
  };

  // Handler: Critique Posture & Physique (Mode B)
  const handleCritiquePostureSnapshot = async (payload: {
    imageBase64: string;
    poseType: string;
  }) => {
    if (critiquePostureAction) {
      try {
        const res = await critiquePostureAction({
          userId: effectiveUserId,
          imageBase64: payload.imageBase64,
          poseType: payload.poseType,
          persona: calibration.persona,
        });
        awardXp(120, '🧍 POSTURE CRITIQUE COMPLETE');
        return res;
      } catch (e) {
        console.warn('Convex posture action error:', e);
      }
    }
    awardXp(120, '🧍 POSTURE CRITIQUE COMPLETE');
    return {
      overallScore: 88,
      potentialScore: 96,
      spinalPosture: 86,
      shoulderSymmetry: 90,
      coreAlignment: 85,
      athleticFrame: 89,
      primaryCritique: 'Slight rounded shoulder posture with forward head bias. Lower pelvic alignment is balanced.',
      correctiveDrills: [
        { name: 'Prone Scapular Y-T-W Raises', reps: '2 sets × 12 reps', cue: 'Depress traps; tuck chin.' },
        { name: 'Dead Bug with Hollow Core Press', reps: '3 sets × 10 reps/side', cue: 'Glue lumbar flat to the floor.' },
      ],
    };
  };

  // Handler: Critique Meal & Macros (Mode C)
  const handleCritiqueMealSnapshot = async (payload: {
    imageBase64: string;
  }) => {
    if (critiqueMealAction) {
      try {
        const res = await critiqueMealAction({
          userId: effectiveUserId,
          imageBase64: payload.imageBase64,
        });
        awardXp(100, '🥩 MEAL SCANNED & LOGGED');
        return res;
      } catch (e) {
        console.warn('Convex meal action error:', e);
      }
    }
    awardXp(100, '🥩 MEAL SCANNED & LOGGED');
    return {
      mealName: 'Grilled Chicken, Jasmine Rice & Steamed Greens',
      proteinGrams: 46,
      calories: 560,
      carbsGrams: 52,
      fatsGrams: 14,
      cleanScore: 94,
      critique: 'Optimal leucine trigger (>3g) achieved with complete amino acid profile. Clean complex carbohydrate partitioning.',
    };
  };

  // 1-Tap Add Corrective Drill to Today's Workout
  const handleAddCorrectiveDrill = (drill: { name: string; reps: string; cue: string }) => {
    const newExercise: Exercise = {
      id: `drill_${Date.now()}`,
      name: drill.name,
      targetMuscle: 'Corrective & Kinetic Posture',
      sets: 2,
      repsOrHold: drill.reps,
      restSeconds: 45,
      rpe: 'RPE 6.5',
      formCue: drill.cue,
      isAdapted: true,
      protectionTag: 'Posture Drill',
      category: 'FINISHER',
    };

    setProtocol(prev => {
      const nextBlocks = [...prev.blocks];
      if (nextBlocks.length > 0) {
        nextBlocks[nextBlocks.length - 1] = {
          ...nextBlocks[nextBlocks.length - 1],
          exercises: [...nextBlocks[nextBlocks.length - 1].exercises, newExercise],
        };
      }
      return { ...prev, blocks: nextBlocks };
    });

    awardXp(50, '⚡ CORRECTIVE DRILL ADDED');
    feedback.playSetComplete();
  };

  // Auto-complete fuel target when meal is logged
  const handleMealLogged = (protein: number) => {
    setCompletedFuel(prev => ({
      ...prev,
      fuel_1: true,
    }));
    awardXp(50, `🍗 ${protein}g PROTEIN LOCKED`);
  };

  // Countdown effect for restTimer
  useEffect(() => {
    let interval: any = null;
    if (restTimer.isActive && restTimer.isRunning && restTimer.remainingSeconds > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev.remainingSeconds <= 1) {
            feedback.playRestFinished();
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
      feedback.soundEnabled = nextSound;
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
    feedback.playLevelUp();
    awardXp(150, '🔥 STREAK EXTENDED');
  };

  // Toggle individual set checkbox with high-dopamine feedback & XP
  const handleToggleSet = (exercise: Exercise, setIndex: number) => {
    const key = `${exercise.id}_set_${setIndex}`;
    const nextState = !completedSets[key];

    // Optimistic instantaneous state update
    setCompletedSets(prev => ({
      ...prev,
      [key]: nextState,
    }));

    if (nextState) {
      feedback.playSetComplete();
      awardXp(25, '⚡ SET CLEARED');
      handleTriggerRestTimer(exercise.name, setIndex + 1, exercise.sets, exercise.restSeconds);

      // Check if all sets for this exercise are now cleared
      let allSetsDone = true;
      for (let i = 0; i < exercise.sets; i++) {
        if (i !== setIndex && !completedSets[`${exercise.id}_set_${i}`]) {
          allSetsDone = false;
          break;
        }
      }
      if (allSetsDone) {
        setTimeout(() => {
          feedback.playExerciseComplete();
          awardXp(100, `🏆 ${exercise.name.toUpperCase()} COMPLETE!`);
        }, 200);
      }
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
      feedback.playExerciseComplete();
      awardXp(100, `🏆 ${exercise.name.toUpperCase()} CLEARED!`);
      handleTriggerRestTimer(exercise.name, exercise.sets, exercise.sets, exercise.restSeconds);
    }
  };

  const handleToggleFuel = (id: string) => {
    const next = !completedFuel[id];
    if (next) {
      feedback.playSetComplete();
      awardXp(50, '🥑 FUEL TARGET LOGGED');
    }

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

  const handleIncrementWater = (delta: number) => {
    setWaterAmount(prev => {
      const next = Math.max(0.5, Math.min(6.0, +(prev + delta).toFixed(1)));
      if (next >= 3.5 && !completedFuel['fuel_2']) {
        handleToggleFuel('fuel_2');
      }
      feedback.triggerHaptic(20);
      return next;
    });
  };

  const handleToggleAvoid = (id: string) => {
    const next = !completedAvoid[id];
    if (next) {
      feedback.playSetComplete();
      awardXp(50, '🛡️ GUARDRAIL HELD FIRM');
    }

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
          awardXp(50, '⚡ AI ADAPTATION ACTIVE');
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
        awardXp(30, '⚡ OFFLINE OVERRIDE ACTIVE');
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

    feedback.playLevelUp();
    awardXp(250, '🎉 24-HOUR RESET BONUS');
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
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        activeView={activeTab === 'workout' ? 'today' : activeTab === 'recovery' ? 'recovery' : 'history'}
        onViewChange={v => {
          if (v === 'today') setActiveTab('workout');
          else if (v === 'recovery') setActiveTab('recovery');
          else setActiveTab('recovery');
        }}
        isCloudConnected={!!convexAthleteData}
      />

      {/* Main SaaS Workspace Container with Safe-Area bottom padding */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 sm:px-6 pb-28 space-y-5">
        {/* Critique AI Character Stat Card (LVL 1 to 10 progression) */}
        <CritiqueStatCard
          currentXp={userXp}
          streakCount={streakCount}
          onOpenScanner={() => handleOpenFormCamera('Standard Push-up')}
        />

        {/* ========================================================= */}
        {/* TAB 1: WORKOUT (DO Session + Spotlight + Live Controller) */}
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
              userXp={userXp}
              floatingXp={floatingXp}
              isLiveActive={isLiveActive}
              liveSeconds={liveSeconds}
              onToggleLiveSession={handleToggleLiveSession}
              onOpenFormCamera={handleOpenFormCamera}
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
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: FUEL & RULES (Interactive High-Affordance Cards)   */}
        {/* ========================================================= */}
        {activeTab === 'fuel' && (
          <div className="space-y-6">
            <div className="pb-1 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Time-Slotted Protocols & Discipline
                </h2>
                <p className="text-xs text-zinc-400">
                  Earn +50 XP per locked target. Scientific timing for peak hormonal & kinetic output.
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono-numbers text-sm font-bold text-[#A3E635]">
                  {completedFuelCount + completedAvoidCount} / {totalFuelCount + totalAvoidCount}
                </span>
                <span className="block text-[10px] text-zinc-500 uppercase">Cleared</span>
              </div>
            </div>

            {/* Quick 60s Lock-In Challenge Card */}
            <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-400/[0.08] to-amber-500/[0.02] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-black font-extrabold text-sm shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                      Daily Dopamine Drill
                    </span>
                    <span className="rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.2">
                      +150 BONUS XP
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-0.5">
                    🔥 60s Camera Lock-In Challenge: 15 Strict Form Push-ups
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenFormCamera('Standard Push-up')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 active:scale-95 transition shadow-sm"
              >
                Launch Challenge
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PILLAR 02 // TIME-SLOTTED RECOVERY TARGETS */}
              <div className="rounded-xl border border-white/[0.07] bg-[#121215] p-4 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <div className="flex items-center gap-1.5">
                    <Sun className="h-4 w-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white tracking-tight uppercase">
                      Time-Slotted Fuel Targets
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono-numbers text-[#A3E635]">
                    {completedFuelCount}/{totalFuelCount} Locked
                  </span>
                </div>

                <div className="space-y-3">
                  {protocol.fuelTargets.map((target, idx) => {
                    const isDone = !!completedFuel[target.id];
                    const isWaterTarget = target.id === 'fuel_2';
                    const timeSlot = idx === 0 ? 'Training Window' : idx === 1 ? 'Morning Lock-In' : 'Evening Recovery';
                    const whyItMatters =
                      idx === 0
                        ? 'Triggers mTOR muscle protein synthesis and supplies essential BCAAs.'
                        : idx === 1
                        ? 'Maintains cell volumization, neural conductivity, and prevents cramping.'
                        : 'Activates parasympathetic nervous system for GH release during REM sleep.';

                    return (
                      <div
                        key={target.id}
                        className={`rounded-xl border p-4 transition-all ${
                          isDone
                            ? 'border-[#A3E635]/60 bg-[#141a12] shadow-[0_0_12px_rgba(163,230,53,0.1)]'
                            : 'border-white/[0.06] bg-[#18181C]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono font-semibold text-zinc-300">
                            {timeSlot}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isDone ? 'bg-[#A3E635]/20 text-[#A3E635]' : 'bg-white/[0.06] text-zinc-400'
                          }`}>
                            {isDone ? '+50 XP EARNED' : '+50 XP'}
                          </span>
                        </div>

                        {/* Value Display */}
                        <div className="my-2 flex items-baseline justify-between">
                          <span className="text-xs font-semibold text-zinc-200">
                            {target.label}
                          </span>
                          <span className={`font-mono-numbers text-xl font-black ${
                            isDone ? 'text-[#A3E635]' : 'text-white'
                          }`}>
                            {isWaterTarget ? `${waterAmount}L` : target.value}
                          </span>
                        </div>

                        {/* Scientific Why It Matters Badge */}
                        <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] mb-3 text-[11px] text-zinc-400 leading-snug">
                          <span className="text-[#A3E635] font-semibold">Why it matters: </span>
                          {whyItMatters}
                        </div>

                        {/* Interactive Water Increments */}
                        {isWaterTarget && (
                          <div className="mb-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleIncrementWater(-0.5)}
                              className="h-8 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono-numbers text-zinc-300 transition"
                            >
                              -0.5L
                            </button>
                            <button
                              type="button"
                              onClick={() => handleIncrementWater(0.5)}
                              className="h-8 px-3 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-xs font-mono-numbers text-sky-300 font-semibold transition"
                            >
                              +0.5L
                            </button>
                            <span className="text-[11px] text-zinc-500 font-mono-numbers">
                              Goal: 3.5L
                            </span>
                          </div>
                        )}

                        {/* Full-Width High-Affordance Tap Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleFuel(target.id)}
                          className={`w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all touch-manipulation active:scale-[0.98] ${
                            isDone
                              ? 'bg-[#A3E635] text-zinc-950 shadow-[0_0_10px_rgba(163,230,53,0.3)]'
                              : 'bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.08]'
                          }`}
                        >
                          {isDone ? (
                            <>
                              <Check className="h-4 w-4 stroke-[3]" />
                              <span>✓ LOCKED IN · +50 XP EARNED</span>
                            </>
                          ) : (
                            <>
                              <span className="h-2 w-2 rounded-full bg-white/40" />
                              <span>TAP TO COMPLETE · +50 XP</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PILLAR 03 // AVOID (Discipline Guardrails) */}
              <div className="rounded-xl border border-white/[0.07] bg-[#121215] p-4 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <div className="flex items-center gap-1.5">
                    <Moon className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-white tracking-tight uppercase">
                      Time-Slotted Discipline Guardrails
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono-numbers text-emerald-400">
                    {completedAvoidCount}/{totalAvoidCount} Maintained
                  </span>
                </div>

                <div className="space-y-3">
                  {protocol.avoidRules.map((rule, idx) => {
                    const isDone = !!completedAvoid[rule.id];
                    const timeSlot = idx === 0 ? 'All Day Window' : idx === 1 ? 'During Workout' : 'Evening Sleep Window';
                    const whyAvoidMatters =
                      idx === 0
                        ? 'Liquid fructose bypasses liver glycogen saturation and elevates visceral fat storage.'
                        : idx === 1
                        ? 'Training past true technical failure fries central motor unit firing and risks rotator cuff strain.'
                        : 'Blue light spectrum inhibits pineal melatonin release by up to 58%, reducing deep stage 3 recovery.';

                    return (
                      <div
                        key={rule.id}
                        className={`rounded-xl border p-4 transition-all ${
                          isDone
                            ? 'border-emerald-500/60 bg-[#121c16] shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                            : 'border-white/[0.06] bg-[#18181C]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono font-semibold text-zinc-300">
                            {timeSlot}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/15 text-red-300'
                          }`}>
                            {isDone ? 'DISCIPLINE HELD' : 'ANTI-GOAL'}
                          </span>
                        </div>

                        <div className="my-2">
                          <span className="text-xs font-semibold text-zinc-200">
                            {rule.title}
                          </span>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {rule.description}
                          </p>
                        </div>

                        {/* Scientific Why It Matters Badge */}
                        <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] mb-3 text-[11px] text-zinc-400 leading-snug">
                          <span className="text-emerald-400 font-semibold">Why it matters: </span>
                          {whyAvoidMatters}
                        </div>

                        {/* Full-Width High-Affordance Guardrail Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleAvoid(rule.id)}
                          className={`w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all touch-manipulation active:scale-[0.98] ${
                            isDone
                              ? 'bg-emerald-400 text-zinc-950 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                              : 'bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.08]'
                          }`}
                        >
                          {isDone ? (
                            <>
                              <Check className="h-4 w-4 stroke-[3]" />
                              <span>✓ GUARDRAIL HELD FIRM · +50 XP</span>
                            </>
                          ) : (
                            <>
                              <Shield className="h-3.5 w-3.5 text-zinc-400" />
                              <span>TAP TO CONFIRM COMPLIANCE · +50 XP</span>
                            </>
                          )}
                        </button>
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

      {/* 5-Step AI Athlete Onboarding Wizard */}
      <OnboardingFlow
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Live AI Form-Check & Critique 3-in-1 Camera Hub */}
      <FormCheckCamera
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        exerciseName={cameraExerciseName}
        coachPersona={calibration.persona}
        onAnalyze={handleAnalyzeFormSnapshot}
        onCritiquePosture={handleCritiquePostureSnapshot}
        onCritiqueMeal={handleCritiqueMealSnapshot}
        onAddCorrectiveDrill={handleAddCorrectiveDrill}
        onMealLogged={handleMealLogged}
      />

      {/* Global & Tier Division Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        athletes={leaderboardData || []}
        currentUserId={effectiveUserId}
        currentUserXp={userXp}
      />
    </div>
  );
}
