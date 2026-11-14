import { CalibrationState } from '../types/protocol';

export interface WorkoutHistoryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  path: string;
  tier: number;
  objective: string;
  score: number; // percentage completed
  setsCompleted: number;
  totalSets: number;
}

export interface StoredAppState {
  calibration: CalibrationState;
  completedSets: Record<string, boolean>;
  completedFuel: Record<string, boolean>;
  completedAvoid: Record<string, boolean>;
  streakCount: number;
  lastCompletedDate: string; // YYYY-MM-DD
  completedWorkouts: WorkoutHistoryEntry[];
  isPro: boolean;
}

const STORAGE_KEY = 'vectr_fit_state_v1';

export const DEFAULT_STORAGE_STATE: StoredAppState = {
  calibration: {
    modality: 'BODYWEIGHT',
    tier: 3,
    objective: 'SKILLS',
    persona: 'TACTICAL_SCIENTIST',
    energy: 4,
    timeWindow: 45,
    soreJoints: ['None'],
  },
  completedSets: {},
  completedFuel: {},
  completedAvoid: {},
  streakCount: 1,
  lastCompletedDate: new Date().toISOString().split('T')[0],
  completedWorkouts: [
    {
      id: 'hist_sample_1',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      path: 'BODYWEIGHT',
      tier: 3,
      objective: 'SKILLS',
      score: 100,
      setsCompleted: 14,
      totalSets: 14,
    },
    {
      id: 'hist_sample_2',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      path: 'BODYWEIGHT',
      tier: 3,
      objective: 'SKILLS',
      score: 92,
      setsCompleted: 13,
      totalSets: 14,
    },
  ],
  isPro: false,
};

export function loadStoredState(): StoredAppState {
  if (typeof window === 'undefined') {
    return DEFAULT_STORAGE_STATE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STORAGE_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STORAGE_STATE,
      ...parsed,
      calibration: {
        ...DEFAULT_STORAGE_STATE.calibration,
        ...(parsed.calibration || {}),
      },
    };
  } catch (err) {
    console.warn('Failed to parse stored VECTR FIT state:', err);
    return DEFAULT_STORAGE_STATE;
  }
}

export function saveStoredState(state: Partial<StoredAppState>): void {
  if (typeof window === 'undefined') return;

  try {
    const current = loadStoredState();
    const updated = {
      ...current,
      ...state,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save VECTR FIT state to localStorage:', err);
  }
}

export function advanceToNextDay(current: StoredAppState, currentScore: number, totalSets: number, completedSets: number): StoredAppState {
  const today = new Date().toISOString().split('T')[0];
  const newStreak = currentScore >= 75 ? current.streakCount + 1 : current.streakCount;

  const newHistoryEntry: WorkoutHistoryEntry = {
    id: `workout_${Date.now()}`,
    date: today,
    path: current.calibration.modality,
    tier: current.calibration.tier,
    objective: current.calibration.objective,
    score: currentScore,
    setsCompleted: completedSets,
    totalSets: totalSets,
  };

  const nextState: StoredAppState = {
    ...current,
    completedSets: {},
    completedFuel: {},
    completedAvoid: {},
    streakCount: newStreak,
    lastCompletedDate: today,
    completedWorkouts: [newHistoryEntry, ...current.completedWorkouts.slice(0, 13)], // retain 14 days
  };

  saveStoredState(nextState);
  return nextState;
}

