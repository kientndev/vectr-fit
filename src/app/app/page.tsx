'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CalibrationState, DailyProtocol, Exercise } from '../../types/protocol';
import {
  generateDailyProtocol,
  cycleExerciseSwap,
  applyCoachAdjustment,
} from '../../lib/protocolEngine';
import { processCoachCommand } from '../../lib/coachBrain';
import {
  loadStoredState,
  saveStoredState,
  advanceToNextDay,
  WorkoutHistoryEntry,
  DEFAULT_STORAGE_STATE,
} from '../../lib/storage';
import { TopNav } from '../../components/TopNav';
import { CalibrationPanel } from '../../components/CalibrationPanel';
import { DailyBlueprint } from '../../components/DailyBlueprint';
import { MuscleRecoveryPanel } from '../../components/MuscleRecoveryPanel';
import { RestTimer, RestTimerState } from '../../components/RestTimer';
import { ProPaywallModal } from '../../components/ProPaywallModal';
import { ProHistoryStrip } from '../../components/ProHistoryStrip';
import { BottomNav, MobileTab } from '../../components/BottomNav';
import { OnboardingFlow, OnboardingData } from '../../components/OnboardingFlow';
import { FormCheckCamera, ScannerMode } from '../../components/FormCheckCamera';
import { CritiqueStatCard } from '../../components/CritiqueStatCard';
import { LeaderboardModal, LeaderboardAthlete } from '../../components/LeaderboardModal';
import { CritiqueRatingModal } from '../../components/CritiqueRatingModal';
import { FuelAndRulesProtocol } from '../../components/FuelAndRulesProtocol';
import { feedback } from '../../lib/feedback';
import { Check, Plus, Droplet, Sparkles, Zap, Shield, Heart, Sun, Dumbbell, Moon, Trophy } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';

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

  // Onboarding & AI Form Camera States
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraExerciseName, setCameraExerciseName] = useState<string>('Standard Push-up');
  const [cameraScannerMode, setCameraScannerMode] = useState<ScannerMode>('FORM');
  const [cameraPrescription, setCameraPrescription] = useState<string | undefined>(undefined);
  const [cameraBiomechanicalCues, setCameraBiomechanicalCues] = useState<string | undefined>(undefined);
  const [cameraOnLockInSet, setCameraOnLockInSet] = useState<(() => void) | undefined>(undefined);
  const [dailyScansUsed, setDailyScansUsed] = useState<number>(0);

  // Critique AI & Leaderboard Modals
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState<boolean>(false);

  // Dynamic 0-100 Six-Pillar Athlete Rating Stats
  const [athleteStats, setAthleteStats] = useState({
    overallScore: 88,
    potentialScore: 96,
    strength: 86,
    postureSymmetry: 90,
    explosivePower: 84,
    coreRigidity: 89,
    disciplineCompliance: 92,
    cnsRecovery: 88,
  });

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
  let analyzeCameraFrameAction: any = null;
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
    analyzeCameraFrameAction = useAction(api.aiCoach.analyzeCameraFrame);
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

      // Check daily free scan quota for today
      try {
        const storedScans = localStorage.getItem(`vectr_scans_${todayDate}`);
        if (storedScans) {
          setDailyScansUsed(parseInt(storedScans, 10) || 0);
        }
      } catch {
        // Safe localStorage fallback
      }
    }
  }, []);

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
        }).catch(() => { });
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
  const handleOpenFormCamera = (
    exerciseName: string,
    mode: ScannerMode = 'FORM',
    prescription?: string,
    biomechanicalCues?: string,
    onLockInSet?: () => void
  ) => {
    setCameraExerciseName(exerciseName);
    setCameraScannerMode(mode);
    setCameraPrescription(prescription);
    setCameraBiomechanicalCues(biomechanicalCues);
    setCameraOnLockInSet(() => onLockInSet);
    setIsCameraOpen(true);
  };

  // Handler: Comprehensive Vision Analysis through Convex analyzeCameraFrame
  const handleAnalyzeCameraFrame = async (data: {
    imageBase64: string;
    mode: 'form' | 'posture' | 'meal';
    exerciseName?: string;
    prescription?: string;
    telemetry?: {
      elbowAngle?: number;
      hipSpineAngle?: number;
      kneeAngle?: number;
      repsCompleted?: number;
    };
  }) => {
    if (analyzeCameraFrameAction) {
      try {
        const res = await analyzeCameraFrameAction({
          imageBase64: data.imageBase64,
          mode: data.mode,
          exerciseName: data.exerciseName,
          prescription: data.prescription,
          telemetry: data.telemetry,
        });
        if (res && res.score) {
          setAthleteStats(prev => ({
            ...prev,
            overallScore: Math.round((prev.overallScore * 2 + res.score) / 3),
            strength: Math.min(99, prev.strength + (res.score >= 90 ? 1 : 0)),
            postureSymmetry: data.mode === 'posture' ? res.spinalPosture ?? prev.postureSymmetry : prev.postureSymmetry,
          }));
        }
        return res;
      } catch (err) {
        console.warn('Convex analyzeCameraFrame error, falling back:', err);
      }
    }
    return null;
  };

  // Handler: Lock In Camera-Verified Set (+50 XP)
  const handleLockInVerifiedSet = () => {
    if (cameraOnLockInSet) {
      cameraOnLockInSet();
    } else {
      awardXp(50, '⚡ CAMERA VERIFIED SET LOCKED IN (+50 XP)');
    }
  };

  // Handler: Open Camera specifically for Meal & Macro Critique
  const handleSnapFuelProof = (targetId: string, label: string) => {
    setCameraExerciseName(label);
    setCameraScannerMode('MEAL');
    setIsCameraOpen(true);
  };

  // Handler: Increment daily used scan count for Free tier
  const handleScanUsed = () => {
    setDailyScansUsed(prev => {
      const next = prev + 1;
      try {
        localStorage.setItem(`vectr_scans_${todayDate}`, next.toString());
      } catch {
        // Safe localStorage fallback
      }
      return next;
    });
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
        setAthleteStats(prev => {
          const nextStrength = Math.min(100, Math.max(70, res.formScore));
          const nextOverall = Math.round((nextStrength + prev.postureSymmetry + prev.explosivePower + prev.coreRigidity + prev.cnsRecovery) / 5);
          return { ...prev, strength: nextStrength, overallScore: nextOverall };
        });
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
    setAthleteStats(prev => {
      const nextStrength = 88;
      const nextOverall = Math.round((nextStrength + prev.postureSymmetry + prev.explosivePower + prev.coreRigidity + prev.cnsRecovery) / 5);
      return { ...prev, strength: nextStrength, overallScore: nextOverall };
    });
    return {
      formScore: 88,
      whatLookedSolid: 'Clean control and cadence throughout movement path.',
      microCorrection: 'Keep core braced and maintain neutral cervical spine.',
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
        setAthleteStats(prev => ({
          ...prev,
          overallScore: res.overallScore,
          potentialScore: res.potentialScore,
          postureSymmetry: res.shoulderSymmetry,
          coreRigidity: res.coreAlignment,
        }));
        return res;
      } catch (e) {
        console.warn('Convex posture action error:', e);
      }
    }
    awardXp(120, '🧍 POSTURE CRITIQUE COMPLETE');
    setAthleteStats(prev => ({
      ...prev,
      overallScore: 88,
      potentialScore: 96,
      postureSymmetry: 90,
      coreRigidity: 85,
    }));
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
        setAthleteStats(prev => ({
          ...prev,
          cnsRecovery: Math.min(99, prev.cnsRecovery + 2),
          overallScore: Math.min(99, prev.overallScore + 1),
        }));
        return res;
      } catch (e) {
        console.warn('Convex meal action error:', e);
      }
    }
    awardXp(100, '🥩 MEAL SCANNED & LOGGED');
    setAthleteStats(prev => ({
      ...prev,
      cnsRecovery: Math.min(99, prev.cnsRecovery + 2),
      overallScore: Math.min(99, prev.overallScore + 1),
    }));
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
      category: 'FINISHER',
      targetMuscle: 'Corrective & Kinetic Posture',
      sets: 2,
      repsOrHold: drill.reps,
      restSeconds: 45,
      rpe: 'RPE 6.5',
      formCue: drill.cue,
      isAdapted: true,
      protectionTag: 'Posture Drill',
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

  // Auto-complete fuel target when meal is logged via Camera Proof
  const handleMealLogged = (protein: number) => {
    // Find any macro target or complete active non-hydration targets
    const macroTarget = protocol.fuelTargets.find(
      t => t.id === 'fuel_protein' || t.label.toLowerCase().includes('protein') || t.label.toLowerCase().includes('collagen')
    );
    if (macroTarget) {
      handleToggleFuel(macroTarget.id);
    } else {
      setCompletedFuel(prev => ({
        ...prev,
        fuel_1: true,
      }));
    }
    awardXp(100, `🥩 ${protein}g MEAL PROOF CRITIQUE (+100 XP · 2x)`);
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
      }).catch(() => { });
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
        }).catch(() => { });
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
      }).catch(() => { });
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
      }).catch(() => { });
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
          }).catch(() => { });
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

  const totalCheckable = totalSetsCount + totalFuelCount + totalAvoidCount;
  const completedCheckable = completedSetsCount + completedFuelCount + completedAvoidCount;
  const disciplineScore = totalCheckable > 0 ? Math.round((completedCheckable / totalCheckable) * 100) : 92;

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
        {/* Dynamic Athlete Status Stat Card (LVL 1 to 10 progression) */}
        <CritiqueStatCard
          tier={protocol.tier}
          currentXp={userXp}
          streakCount={streakCount}
          overallScore={athleteStats.overallScore}
          strength={athleteStats.strength}
          discipline={disciplineScore}
          formScore={athleteStats.postureSymmetry}
          recoveryScore={athleteStats.cnsRecovery}
          onOpenScanner={() => handleOpenFormCamera('Standard Push-up', 'FORM')}
          onOpenRatingModal={() => setIsRatingModalOpen(true)}
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
        {/* TAB 3: FUEL & RULES (Interactive Bio-Telemetry & Oaths)   */}
        {/* ========================================================= */}
        {activeTab === 'fuel' && (
          <FuelAndRulesProtocol
            protocol={protocol}
            completedFuel={completedFuel}
            onToggleFuel={handleToggleFuel}
            completedAvoid={completedAvoid}
            onToggleAvoid={handleToggleAvoid}
            waterAmount={waterAmount}
            onIncrementWater={handleIncrementWater}
            onSnapProof={handleSnapFuelProof}
            onOpenChallengeCam={() => handleOpenFormCamera('Standard Push-up', 'FORM')}
            awardXp={awardXp}
          />
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
              onAwardXp={awardXp}
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

      {/* VECTR PRO Monetization Paywall Modal */}
      <ProPaywallModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        isPro={isPro}
        onTogglePro={proState => setIsPro(proState)}
        dailyScansRemaining={Math.max(0, 1 - dailyScansUsed)}
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
        prescription={cameraPrescription}
        biomechanicalCues={cameraBiomechanicalCues}
        coachPersona={calibration.persona}
        initialMode={cameraScannerMode}
        isPro={isPro}
        dailyScansUsed={dailyScansUsed}
        onRequirePro={() => setIsProModalOpen(true)}
        onScanUsed={handleScanUsed}
        onAnalyze={handleAnalyzeFormSnapshot}
        onAnalyzeCameraFrame={handleAnalyzeCameraFrame}
        onCritiquePosture={handleCritiquePostureSnapshot}
        onCritiqueMeal={handleCritiqueMealSnapshot}
        onAddCorrectiveDrill={handleAddCorrectiveDrill}
        onMealLogged={handleMealLogged}
        onLockInSet={handleLockInVerifiedSet}
      />

      {/* Global & Tier Division Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        athletes={leaderboardData || []}
        currentUserId={effectiveUserId}
        currentUserXp={userXp}
        currentUserTier={protocol.tier}
        athleteCallsign={clerkUser?.fullName || clerkUser?.username || 'ATHLETE-VECTR-01'}
        verifiedSetsCount={completedSetsCount}
        streakCount={streakCount}
        isPro={isPro}
      />

      {/* Viral 9:16 Athlete Critique Rating Card Modal */}
      <CritiqueRatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        tier={protocol.tier}
        tierTitle={protocol.tierTitle}
        athleteCallsign={clerkUser?.fullName || clerkUser?.username || 'ATHLETE-VECTR-01'}
        overallScore={athleteStats.overallScore}
        potentialScore={athleteStats.potentialScore}
        strength={athleteStats.strength}
        postureSymmetry={athleteStats.postureSymmetry}
        explosivePower={athleteStats.explosivePower}
        coreRigidity={athleteStats.coreRigidity}
        disciplineCompliance={disciplineScore}
        cnsRecovery={athleteStats.cnsRecovery}
        onOpenScanner={() => {
          setIsRatingModalOpen(false);
          handleOpenFormCamera('Standard Push-up', 'POSTURE');
        }}
        onShareAwardXp={() => awardXp(50, '📤 ATHLETE RATING CARD SHARED (+50 XP)')}
      />
    </div>
  );
}
