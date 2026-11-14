export type Modality = 'BODYWEIGHT' | 'GYM';

export type DifficultyTier = 1 | 2 | 3 | 4 | 5;

export type PrimaryObjective = 
  | 'SHRED' 
  | 'HYPERTROPHY' 
  | 'SKILLS' 
  | 'STRENGTH';

export type CoachPersona = 'TACTICAL_SCIENTIST' | 'DRILL_SERGEANT';

export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export type TimeWindow = 20 | 45 | 60;

export type JointSoreness = 'None' | 'Wrists' | 'Shoulders' | 'Knees' | 'Lower Back';

export interface CalibrationState {
  modality: Modality;
  tier: DifficultyTier;
  objective: PrimaryObjective;
  persona: CoachPersona;
  energy: EnergyLevel;
  timeWindow: TimeWindow;
  soreJoints: JointSoreness[];
}

export interface ExerciseSwapOption {
  name: string;
  targetMuscle: string;
  repsOrHold: string;
  formCue: string;
  restSeconds?: number;
  rpe?: string;
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: number;
  repsOrHold: string;
  restSeconds: number;
  rpe: string;
  formCue: string;
  isAdapted?: boolean;
  adaptationReason?: string;
  protectionTag?: string;
  originalExerciseName?: string;
  category: 'WARMUP' | 'PRIMARY' | 'VOLUME' | 'SECONDARY' | 'FINISHER';
  swapPool?: ExerciseSwapOption[];
  currentSwapIndex?: number;
}

export interface ProtocolBlock {
  type: 'WARMUP' | 'PRIMARY' | 'VOLUME' | 'SECONDARY' | 'FINISHER';
  title: string;
  subtitle: string;
  exercises: Exercise[];
}

export interface FuelTarget {
  id: string;
  label: string;
  value: string;
  detail: string;
  metric: string;
}

export interface AvoidRule {
  id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING';
}

export interface DailyProtocol {
  id: string;
  generatedAt: string;
  modality: Modality;
  tier: DifficultyTier;
  tierTitle: string;
  objectiveLabel: string;
  persona: CoachPersona;
  timeWindow: TimeWindow;
  energy: EnergyLevel;
  coachDirective: {
    quote: string;
    subtext: string;
    cnsStatus: string;
  };
  blocks: ProtocolBlock[];
  fuelTargets: FuelTarget[];
  avoidRules: AvoidRule[];
  adaptationsSummary: string[];
  activeCommand?: string;
}

export interface CoachApiRequest {
  currentConfig: CalibrationState;
  userPrompt: string;
  protocol?: DailyProtocol;
}

export interface CoachApiResponse {
  success: boolean;
  directive: {
    quote: string;
    subtext: string;
    cnsStatus: string;
  };
  adjustmentsSummary: string;
  adjustedCalibration?: Partial<CalibrationState>;
  modifiedWorkout?: {
    blockOverrides?: {
      blockIndex: number;
      exerciseOverrides?: Partial<Exercise>[];
    }[];
  };
}
