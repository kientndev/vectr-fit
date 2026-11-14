'use client';

import React from 'react';
import { DailyProtocol, JointSoreness } from '../types/protocol';
import { Activity } from 'lucide-react';

interface MuscleRecoveryPanelProps {
  protocol: DailyProtocol;
  completedSets: Record<string, boolean>;
  soreJoints: JointSoreness[];
  energy: number;
}

interface MuscleGroupStatus {
  name: string;
  readiness: number; // 0 - 100
  statusLabel: string;
  category: 'OPTIMAL' | 'RECOVERING' | 'FATIGUED';
}

export const MuscleRecoveryPanel: React.FC<MuscleRecoveryPanelProps> = ({
  protocol,
  completedSets,
  soreJoints,
  energy,
}) => {
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

  const calculateStatus = (
    name: string,
    setsDone: number,
    isJointFlagged: boolean,
    baselineReadiness: number
  ): MuscleGroupStatus => {
    if (isJointFlagged) {
      return {
        name,
        readiness: 42,
        statusLabel: 'Fatigued',
        category: 'FATIGUED',
      };
    }

    if (setsDone >= 6) {
      return {
        name,
        readiness: 55,
        statusLabel: 'Recovering (36h)',
        category: 'RECOVERING',
      };
    } else if (setsDone > 0) {
      return {
        name,
        readiness: 72,
        statusLabel: 'Recovering (24h)',
        category: 'RECOVERING',
      };
    }

    return {
      name,
      readiness: baselineReadiness,
      statusLabel: 'Optimal',
      category: 'OPTIMAL',
    };
  };

  const groups: MuscleGroupStatus[] = [
    calculateStatus('Chest & Push', pushSetsDone, soreJoints.includes('Wrists') && pushSetsDone > 0, 96),
    calculateStatus('Back & Pull', pullSetsDone, false, 94),
    calculateStatus('Shoulders & Delts', shoulderSetsDone, soreJoints.includes('Shoulders'), soreJoints.includes('Shoulders') ? 38 : 92),
    calculateStatus('Legs & Posterior', legSetsDone, soreJoints.includes('Knees'), soreJoints.includes('Knees') ? 40 : 95),
    calculateStatus('Core & Trunk', coreSetsDone, soreJoints.includes('Lower Back'), soreJoints.includes('Lower Back') ? 44 : 98),
    {
      name: 'CNS Readiness',
      readiness: energy <= 2 ? 45 : soreJoints.some(j => j !== 'None') ? 65 : 92,
      statusLabel: energy <= 2 ? 'Fatigued' : soreJoints.some(j => j !== 'None') ? 'Compensating' : 'Optimal',
      category: energy <= 2 ? 'FATIGUED' : soreJoints.some(j => j !== 'None') ? 'RECOVERING' : 'OPTIMAL',
    },
  ];

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#121215] p-4 sm:p-5 space-y-3.5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#A3E635]" />
          <h3 className="text-xs font-semibold text-white tracking-tight">
            Muscle Recovery Telemetry
          </h3>
        </div>
        <span className="text-[11px] text-zinc-500">
          6-Zone Kinetics
        </span>
      </div>

      {/* 6 Muscle Groups Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {groups.map(group => {
          const isFatigued = group.category === 'FATIGUED';
          const isRecovering = group.category === 'RECOVERING';

          return (
            <div
              key={group.name}
              className="rounded-lg border border-white/[0.06] bg-[#18181C] p-3 transition hover:border-white/[0.12]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-200">
                  {group.name}
                </span>
                <span
                  className={`font-mono-numbers text-xs font-semibold ${
                    isFatigued
                      ? 'text-rose-400'
                      : isRecovering
                      ? 'text-amber-400'
                      : 'text-[#A3E635]'
                  }`}
                >
                  {group.readiness}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isFatigued
                      ? 'bg-rose-500'
                      : isRecovering
                      ? 'bg-amber-400'
                      : 'bg-[#A3E635]'
                  }`}
                  style={{ width: `${group.readiness}%` }}
                />
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[11px]">
                <span
                  className={`font-medium ${
                    isFatigued
                      ? 'text-rose-400'
                      : isRecovering
                      ? 'text-amber-400'
                      : 'text-zinc-400'
                  }`}
                >
                  {group.statusLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
