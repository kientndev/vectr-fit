export type MovementType = 'PUSH' | 'PULL' | 'SQUAT' | 'HINGE' | 'CORE' | 'HOLD';

export interface ExerciseFormRule {
  movementType: MovementType;
  primaryJoint: string; // e.g. "Elbow", "Knee", "Shoulder"
  // ROM criteria
  inflectionMinAngle: number; // Peak contraction angle (e.g. 75-90 for pushup/squat bottom)
  inflectionMaxAngle: number;
  lockoutMinAngle: number;    // Terminal lockout angle (e.g. 160-180)
  
  // Good form boundaries
  minRomDepthPct: number;     // Must hit at least this depth % to qualify as valid rep (e.g. 80%)
  maxSpineDeviationDeg: number; // Maximum allowed deviation from 180 (e.g. 25 deg)
  
  // Visual cues
  readyCue: string;
  eccentricCue: string;
  concentricCue: string;
  lockoutCue: string;
}

export const EXERCISE_RULES: Record<string, ExerciseFormRule> = {
  // Push patterns
  'Push-up': {
    movementType: 'PUSH',
    primaryJoint: 'Elbow',
    inflectionMinAngle: 65,
    inflectionMaxAngle: 95,
    lockoutMinAngle: 155,
    minRomDepthPct: 80,
    maxSpineDeviationDeg: 20,
    readyCue: 'Assume plank position. Squeeze glutes and brace core.',
    eccentricCue: 'Descend with elbows at 45°. Chest to floor.',
    concentricCue: 'Drive through palms! Do not flare elbows.',
    lockoutCue: 'Lock out elbows and protract shoulder blades at top.',
  },
  'Standard Push-up': {
    movementType: 'PUSH',
    primaryJoint: 'Elbow',
    inflectionMinAngle: 65,
    inflectionMaxAngle: 95,
    lockoutMinAngle: 155,
    minRomDepthPct: 80,
    maxSpineDeviationDeg: 20,
    readyCue: 'Assume plank position. Squeeze glutes and brace core.',
    eccentricCue: 'Descend with elbows at 45°. Chest to floor.',
    concentricCue: 'Drive through palms! Do not flare elbows.',
    lockoutCue: 'Lock out elbows and protract shoulder blades at top.',
  },
  'Diamond Push-ups': {
    movementType: 'PUSH',
    primaryJoint: 'Elbow',
    inflectionMinAngle: 60,
    inflectionMaxAngle: 90,
    lockoutMinAngle: 160,
    minRomDepthPct: 85,
    maxSpineDeviationDeg: 20,
    readyCue: 'Thumbs and index fingers touching. Rigid hollow body.',
    eccentricCue: 'Control the descent. Lower chest towards diamond.',
    concentricCue: 'Squeeze triceps hard through the drive.',
    lockoutCue: 'Complete elbow extension at peak.',
  },
  'Dips': {
    movementType: 'PUSH',
    primaryJoint: 'Elbow',
    inflectionMinAngle: 75,
    inflectionMaxAngle: 95,
    lockoutMinAngle: 160,
    minRomDepthPct: 85,
    maxSpineDeviationDeg: 25,
    readyCue: 'Depress scapula. Torso slightly pitched forward.',
    eccentricCue: 'Lower until upper arms reach parallel (90°).',
    concentricCue: 'Drive straight up without swinging legs.',
    lockoutCue: 'Full lock at top. Push shoulders down.',
  },
  'Handstand Push-ups': {
    movementType: 'PUSH',
    primaryJoint: 'Elbow',
    inflectionMinAngle: 70,
    inflectionMaxAngle: 95,
    lockoutMinAngle: 160,
    minRomDepthPct: 80,
    maxSpineDeviationDeg: 25,
    readyCue: 'Vertical stacking: wrists, shoulders, hips in line.',
    eccentricCue: 'Lower head forward into tripod position.',
    concentricCue: 'Press floor away explosively through shoulders.',
    lockoutCue: 'Shrug shoulders to ears at top lockout.',
  },

  // Pull patterns
  'Pull-ups': {
    movementType: 'PULL',
    primaryJoint: 'Elbow',
    inflectionMinAngle: 50,
    inflectionMaxAngle: 85,
    lockoutMinAngle: 155,
    minRomDepthPct: 85,
    maxSpineDeviationDeg: 30,
    readyCue: 'Dead hang with active scapular engagement.',
    eccentricCue: 'Lower under control to full dead-hang stretch.',
    concentricCue: 'Drive elbows down to hips. Chin over bar.',
    lockoutCue: 'Full dead hang lockout between reps.',
  },
  'Strict Pull-ups': {
    movementType: 'PULL',
    primaryJoint: 'Elbow',
    inflectionMinAngle: 50,
    inflectionMaxAngle: 85,
    lockoutMinAngle: 155,
    minRomDepthPct: 85,
    maxSpineDeviationDeg: 30,
    readyCue: 'Dead hang with active scapular engagement.',
    eccentricCue: 'Lower under control to full dead-hang stretch.',
    concentricCue: 'Drive elbows down to hips. Chin over bar.',
    lockoutCue: 'Full dead hang lockout between reps.',
  },
  'Scapular Pulls & Active Hang': {
    movementType: 'PULL',
    primaryJoint: 'Shoulder',
    inflectionMinAngle: 140,
    inflectionMaxAngle: 165,
    lockoutMinAngle: 175,
    minRomDepthPct: 75,
    maxSpineDeviationDeg: 20,
    readyCue: 'Passive dead hang. Relax neck and trap tension.',
    eccentricCue: 'Slowly return to relaxed dead hang.',
    concentricCue: 'Depress and retract scapulae without bending elbows.',
    lockoutCue: 'Hold peak scapular depression for 2 seconds.',
  },
  'Inverted Rows': {
    movementType: 'PULL',
    primaryJoint: 'Elbow',
    inflectionMinAngle: 60,
    inflectionMaxAngle: 90,
    lockoutMinAngle: 155,
    minRomDepthPct: 80,
    maxSpineDeviationDeg: 15,
    readyCue: 'Straight line from heels to crown. Squeeze glutes.',
    eccentricCue: 'Lower until arms are fully extended.',
    concentricCue: 'Pull chest to bar. Pinch shoulder blades.',
    lockoutCue: 'Chest touching bar with zero hip sag.',
  },

  // Squat & Legs
  'Air Squats': {
    movementType: 'SQUAT',
    primaryJoint: 'Knee',
    inflectionMinAngle: 70,
    inflectionMaxAngle: 95,
    lockoutMinAngle: 165,
    minRomDepthPct: 85,
    maxSpineDeviationDeg: 25,
    readyCue: 'Feet shoulder-width apart, toes flared slightly.',
    eccentricCue: 'Hips back and down. Keep chest proud.',
    concentricCue: 'Drive through full foot, knees tracking over toes.',
    lockoutCue: 'Stand tall, squeeze glutes at full hip extension.',
  },
  'Pistol Squats': {
    movementType: 'SQUAT',
    primaryJoint: 'Knee',
    inflectionMinAngle: 55,
    inflectionMaxAngle: 85,
    lockoutMinAngle: 165,
    minRomDepthPct: 90,
    maxSpineDeviationDeg: 30,
    readyCue: 'Balance on one foot, counter-arm reached forward.',
    eccentricCue: 'Descend below parallel with free leg straight.',
    concentricCue: 'Press through midfoot without collapsing knee inward.',
    lockoutCue: 'Stand fully upright at top before next rep.',
  },
  'Bulgarian Split Squats': {
    movementType: 'SQUAT',
    primaryJoint: 'Knee',
    inflectionMinAngle: 75,
    inflectionMaxAngle: 95,
    lockoutMinAngle: 165,
    minRomDepthPct: 85,
    maxSpineDeviationDeg: 20,
    readyCue: 'Rear foot elevated on bench/box. Torso upright.',
    eccentricCue: 'Drop back knee towards floor smoothly.',
    concentricCue: 'Drive through lead front heel.',
    lockoutCue: 'Straighten front knee completely at top.',
  },
};

/**
 * Returns matching exercise rule with smart fallback based on name matching
 */
export function getExerciseRule(exerciseName: string): ExerciseFormRule {
  if (EXERCISE_RULES[exerciseName]) {
    return EXERCISE_RULES[exerciseName];
  }

  // Fallback fuzzy search by keyword
  const nameLower = exerciseName.toLowerCase();
  if (nameLower.includes('pull') || nameLower.includes('row') || nameLower.includes('hang') || nameLower.includes('chin')) {
    return EXERCISE_RULES['Pull-ups'];
  }
  if (nameLower.includes('squat') || nameLower.includes('lunge') || nameLower.includes('jump')) {
    return EXERCISE_RULES['Air Squats'];
  }
  if (nameLower.includes('dip')) {
    return EXERCISE_RULES['Dips'];
  }
  
  // Default to standard push pattern
  return EXERCISE_RULES['Standard Push-up'];
}
