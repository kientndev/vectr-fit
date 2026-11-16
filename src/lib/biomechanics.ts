/**
 * VECTR FIT Biomechanics Engine v2.4
 * Pure TypeScript vector mathematics, joint angle calculation,
 * exercise form evaluation, and stateful hysteresis rep machine.
 */

export interface Point2D {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export type ExerciseType = 'squat' | 'pushup' | 'curl';

export interface JointAngles {
  kneeAngle: number;
  hipAngle: number;
  torsoAngle: number; // Angle relative to vertical (0 = upright)
  elbowAngle: number;
  shoulderAngle: number;
}

export type FormStatus = 'OPTIMAL' | 'WARNING' | 'CRITICAL';

export interface FormEvaluation {
  status: FormStatus;
  score: number; // 0 - 100
  isTargetDepth: boolean;
  isLockout: boolean;
  jointColors: {
    knee: string;
    hip: string;
    elbow: string;
    spine: string;
    shoulder: string;
  };
  coachCue: string;
  subCue: string;
}

export type RepPhase = 'IDLE' | 'ECCENTRIC' | 'BOTTOM_HOLD' | 'CONCENTRIC' | 'LOCKOUT';

export interface RepStats {
  repCount: number;
  currentPhase: RepPhase;
  phaseProgress: number; // 0 - 100%
  repDurationMs: number;
  averageFormScore: number;
  peakVelocity: number;
}

// Visual color palette standards
export const ACCENT_COLORS = {
  optimal: '#10B981', // Neon Emerald
  neutral: '#06B6D4', // Electric Cyan
  warning: '#F59E0B', // Amber
  critical: '#EF4444', // Crimson Pulse
  dim: '#64748B',     // Slate
};

/**
 * Computes exact interior joint angle in degrees (0° - 180°)
 * where point B is the vertex (e.g. Hip -> Knee -> Ankle, or Shoulder -> Elbow -> Wrist)
 */
export function calculateAngle(a: Point2D, b: Point2D, c: Point2D): number {
  if (!a || !b || !c) return 180;
  
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  
  return Math.round(angle * 10) / 10;
}

/**
 * Evaluates real-time exercise biomechanics and posture rules
 */
export function evaluateExerciseForm(
  exercise: ExerciseType,
  angles: JointAngles
): FormEvaluation {
  const { kneeAngle, hipAngle, torsoAngle, elbowAngle } = angles;

  if (exercise === 'squat') {
    // Squat Rules:
    // Lockout: Knee > 165°
    // Parallel: Knee <= 95°
    // Deep squat: Knee <= 80°
    // Torso warning: torsoAngle > 40° (excessive forward lean / spinal shear)
    const isLockout = kneeAngle >= 165;
    const isTargetDepth = kneeAngle <= 95;
    const isExcessiveTorsoLean = torsoAngle > 38;
    const isKneeValgusAngle = kneeAngle < 65; // extreme compression

    let status: FormStatus = 'OPTIMAL';
    let score = 96;
    let coachCue = '🔥 Perfect Form. Drive through mid-foot.';
    let subCue = 'Neutral spine maintained with locked core.';

    const colors = {
      knee: isTargetDepth ? ACCENT_COLORS.optimal : ACCENT_COLORS.neutral,
      hip: isExcessiveTorsoLean ? ACCENT_COLORS.warning : ACCENT_COLORS.neutral,
      elbow: ACCENT_COLORS.dim,
      spine: isExcessiveTorsoLean ? ACCENT_COLORS.critical : ACCENT_COLORS.optimal,
      shoulder: ACCENT_COLORS.neutral,
    };

    if (isExcessiveTorsoLean) {
      status = 'WARNING';
      score = 72;
      coachCue = '⚠️ Chest Up! Torso leaning too far forward.';
      subCue = 'Engage lats and keep sternum proud to protect lumbar spine.';
      colors.spine = ACCENT_COLORS.warning;
    } else if (isKneeValgusAngle) {
      status = 'CRITICAL';
      score = 55;
      coachCue = '🛑 Excessive Depth / Knee Flare Detected.';
      subCue = 'Stop at parallel (90°) to prevent patellar tendon strain.';
      colors.knee = ACCENT_COLORS.critical;
    } else if (isTargetDepth) {
      status = 'OPTIMAL';
      score = 99;
      coachCue = '⚡ Parallel Depth Hit (90°)! Drive back up!';
      subCue = 'Glute & quad torque synchronized perfectly.';
      colors.knee = ACCENT_COLORS.optimal;
      colors.hip = ACCENT_COLORS.optimal;
    } else if (isLockout) {
      status = 'OPTIMAL';
      score = 94;
      coachCue = '✅ Full Hip Lockout. Ready for descent.';
      subCue = 'Take a breath, brace diaphragm 360°.';
    } else {
      score = 88;
      coachCue = '⬇️ Descending — Keep knees tracking over toes.';
      subCue = 'Maintain controlled 3-second eccentric tempo.';
    }

    return {
      status,
      score,
      isTargetDepth,
      isLockout,
      jointColors: colors,
      coachCue,
      subCue,
    };
  }

  if (exercise === 'pushup') {
    // Push-Up Rules:
    // Lockout: Elbow >= 160°
    // Depth: Elbow <= 90°
    // Spine sag: hipAngle < 155°
    const isLockout = elbowAngle >= 160;
    const isTargetDepth = elbowAngle <= 90;
    const isHipSag = hipAngle < 155;

    let status: FormStatus = 'OPTIMAL';
    let score = 95;
    let coachCue = '🔥 Solid Plank Line. Drive through palms.';
    let subCue = 'Full anterior serratus & triceps engagement.';

    const colors = {
      knee: ACCENT_COLORS.neutral,
      hip: isHipSag ? ACCENT_COLORS.critical : ACCENT_COLORS.optimal,
      elbow: isTargetDepth ? ACCENT_COLORS.optimal : ACCENT_COLORS.neutral,
      spine: isHipSag ? ACCENT_COLORS.critical : ACCENT_COLORS.optimal,
      shoulder: ACCENT_COLORS.neutral,
    };

    if (isHipSag) {
      status = 'CRITICAL';
      score = 60;
      coachCue = '⚠️ Hip Sag Detected — Squeeze Glutes & Core!';
      subCue = 'Preserve rigid hollow-body alignment. Avoid lumbar hyperextension.';
      colors.hip = ACCENT_COLORS.critical;
      colors.spine = ACCENT_COLORS.critical;
    } else if (isTargetDepth) {
      status = 'OPTIMAL';
      score = 98;
      coachCue = '⚡ Full 90° Chest Depth Reached!';
      subCue = 'Elbows tucked 45° to ribcage. Explode upward.';
      colors.elbow = ACCENT_COLORS.optimal;
    } else if (isLockout) {
      status = 'OPTIMAL';
      score = 94;
      coachCue = '✅ Clean Top Lockout with Scapular Protraction.';
      subCue = 'Push floor away at the peak of the press.';
    } else {
      score = 89;
      coachCue = '⬇️ Lower chest steadily to 1 inch above floor.';
      subCue = 'Maintain rigid core bracing.';
    }

    return {
      status,
      score,
      isTargetDepth,
      isLockout,
      jointColors: colors,
      coachCue,
      subCue,
    };
  }

  // Exercise: Curl (Bicep / Arm Flexion)
  // Lockout: Elbow >= 155°
  // Peak Flexion: Elbow <= 60°
  // Torso swing: torsoAngle > 18°
  const isLockout = elbowAngle >= 155;
  const isTargetDepth = elbowAngle <= 60;
  const isBodySwing = torsoAngle > 18;

  let status: FormStatus = 'OPTIMAL';
  let score = 96;
  let coachCue = '🔥 Pure Bicep Isolation. Zero Momentum.';
  let subCue = 'Peak bicep peak contraction triggered.';

  const colors = {
    knee: ACCENT_COLORS.neutral,
    hip: ACCENT_COLORS.neutral,
    elbow: isTargetDepth ? ACCENT_COLORS.optimal : ACCENT_COLORS.neutral,
    spine: isBodySwing ? ACCENT_COLORS.warning : ACCENT_COLORS.optimal,
    shoulder: isBodySwing ? ACCENT_COLORS.warning : ACCENT_COLORS.neutral,
  };

  if (isBodySwing) {
    status = 'WARNING';
    score = 68;
    coachCue = '⚠️ Torso Swing Detected — Eliminate Momentum!';
    subCue = 'Pin elbows to sides. Control the eccentric lowering.';
    colors.spine = ACCENT_COLORS.warning;
  } else if (isTargetDepth) {
    status = 'OPTIMAL';
    score = 99;
    coachCue = '⚡ Peak Bicep Contraction Squeezed!';
    subCue = 'Hold for 1s pause before lowering with control.';
    colors.elbow = ACCENT_COLORS.optimal;
  } else if (isLockout) {
    status = 'OPTIMAL';
    score = 92;
    coachCue = '✅ Full Arm Extension. Initiate next curl.';
    subCue = 'Avoid resting at bottom. Maintain active tendon tension.';
  } else {
    score = 88;
    coachCue = '⬆️ Squeeze bicep upward without elbow drift.';
    subCue = 'Keep wrists neutral and firm.';
  }

  return {
    status,
    score,
    isTargetDepth,
    isLockout,
    jointColors: colors,
    coachCue,
    subCue,
  };
}

/**
 * Stateful Hysteresis Rep Counter State Machine
 * Prevents false double-counts by enforcing strict phase transitions
 * with realistic timing hysteresis.
 */
export class RepCounterEngine {
  private repCount = 0;
  private phase: RepPhase = 'IDLE';
  private phaseStartTime = Date.now();
  private repStartTime = Date.now();
  private scoresInRep: number[] = [];
  private lastAngle = 180;
  private peakVelocity = 0;

  constructor(
    private exercise: ExerciseType = 'squat',
    private onRepComplete?: (repCount: number, durationMs: number, avgScore: number) => void,
    private onPhaseChange?: (phase: RepPhase) => void
  ) {}

  public setExercise(exercise: ExerciseType) {
    this.exercise = exercise;
    this.reset();
  }

  public reset() {
    this.repCount = 0;
    this.phase = 'IDLE';
    this.scoresInRep = [];
    this.phaseStartTime = Date.now();
    this.repStartTime = Date.now();
    this.lastAngle = 180;
    this.peakVelocity = 0;
  }

  public update(angles: JointAngles, currentScore = 92): RepStats {
    const now = Date.now();
    const primaryAngle =
      this.exercise === 'squat'
        ? angles.kneeAngle
        : this.exercise === 'pushup'
        ? angles.elbowAngle
        : angles.elbowAngle;

    const angleDelta = Math.abs(primaryAngle - this.lastAngle);
    this.peakVelocity = Math.max(this.peakVelocity, angleDelta * 60); // deg/sec approximation
    this.lastAngle = primaryAngle;

    this.scoresInRep.push(currentScore);

    // Thresholds per exercise
    const isLockoutAngle =
      this.exercise === 'squat'
        ? primaryAngle >= 162
        : this.exercise === 'pushup'
        ? primaryAngle >= 155
        : primaryAngle >= 150;

    const isInflectionAngle =
      this.exercise === 'squat'
        ? primaryAngle <= 95
        : this.exercise === 'pushup'
        ? primaryAngle <= 92
        : primaryAngle <= 65;

    const isMidwayAngle =
      this.exercise === 'squat'
        ? primaryAngle < 150 && primaryAngle > 95
        : this.exercise === 'pushup'
        ? primaryAngle < 145 && primaryAngle > 92
        : primaryAngle < 140 && primaryAngle > 65;

    // State Transitions
    switch (this.phase) {
      case 'IDLE':
      case 'LOCKOUT': {
        if (isMidwayAngle) {
          this.setPhase('ECCENTRIC');
          this.repStartTime = now;
          this.scoresInRep = [currentScore];
        }
        break;
      }

      case 'ECCENTRIC': {
        if (isInflectionAngle) {
          this.setPhase('BOTTOM_HOLD');
        } else if (isLockoutAngle && now - this.phaseStartTime > 600) {
          // Aborted rep before hitting depth
          this.setPhase('LOCKOUT');
        }
        break;
      }

      case 'BOTTOM_HOLD': {
        // Must stay briefly or begin concentric drive
        if (!isInflectionAngle && primaryAngle > (this.exercise === 'curl' ? 70 : 100)) {
          this.setPhase('CONCENTRIC');
        }
        break;
      }

      case 'CONCENTRIC': {
        if (isLockoutAngle) {
          const repDuration = now - this.repStartTime;
          // Valid human rep duration threshold: 600ms - 8000ms
          if (repDuration >= 600 && repDuration <= 8000) {
            this.repCount += 1;
            const avgScore =
              this.scoresInRep.length > 0
                ? Math.round(this.scoresInRep.reduce((a, b) => a + b, 0) / this.scoresInRep.length)
                : currentScore;

            if (this.onRepComplete) {
              this.onRepComplete(this.repCount, repDuration, avgScore);
            }
          }
          this.setPhase('LOCKOUT');
        }
        break;
      }
    }

    // Progress estimation based on phase
    let phaseProgress = 0;
    if (this.phase === 'ECCENTRIC') {
      phaseProgress = Math.min(
        100,
        Math.max(10, Math.round(((165 - primaryAngle) / (165 - 90)) * 100))
      );
    } else if (this.phase === 'BOTTOM_HOLD') {
      phaseProgress = 100;
    } else if (this.phase === 'CONCENTRIC') {
      phaseProgress = Math.min(
        100,
        Math.max(10, Math.round(((primaryAngle - 90) / (165 - 90)) * 100))
      );
    } else {
      phaseProgress = 0;
    }

    return {
      repCount: this.repCount,
      currentPhase: this.phase,
      phaseProgress,
      repDurationMs: now - this.repStartTime,
      averageFormScore:
        this.scoresInRep.length > 0
          ? Math.round(this.scoresInRep.reduce((a, b) => a + b, 0) / this.scoresInRep.length)
          : currentScore,
      peakVelocity: Math.round(this.peakVelocity),
    };
  }

  private setPhase(newPhase: RepPhase) {
    if (this.phase !== newPhase) {
      this.phase = newPhase;
      this.phaseStartTime = Date.now();
      if (this.onPhaseChange) {
        this.onPhaseChange(newPhase);
      }
    }
  }

  public getRepCount(): number {
    return this.repCount;
  }
}
