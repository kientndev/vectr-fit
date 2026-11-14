'use client';

import React, { useState } from 'react';
import {
  Modality,
  DifficultyTier,
  PrimaryObjective,
  CoachPersona,
  EnergyLevel,
  TimeWindow,
  JointSoreness,
  CalibrationState,
} from '../types/protocol';
import { TIER_CONFIG } from '../lib/protocolEngine';
import {
  Zap,
  Sliders,
  ChevronDown,
  ChevronUp,
  Brain,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

interface CalibrationPanelProps {
  state: CalibrationState;
  onChange: (updates: Partial<CalibrationState>) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export const CalibrationPanel: React.FC<CalibrationPanelProps> = ({
  state,
  onChange,
  onGenerate,
  isGenerating = false,
}) => {
  const {
    modality,
    tier,
    objective,
    persona,
    energy,
    timeWindow,
    soreJoints,
  } = state;

  const [isCheckInOpen, setIsCheckInOpen] = useState(true);

  const handleToggleJoint = (joint: JointSoreness) => {
    if (joint === 'None') {
      onChange({ soreJoints: ['None'] });
      return;
    }

    let next: JointSoreness[] = soreJoints.filter(j => j !== 'None');
    if (next.includes(joint)) {
      next = next.filter(j => j !== joint);
      if (next.length === 0) next = ['None'];
    } else {
      next.push(joint);
    }
    onChange({ soreJoints: next });
  };

  const jointOptions: { label: JointSoreness; text: string }[] = [
    { label: 'None', text: 'Clean' },
    { label: 'Wrists', text: 'Wrists' },
    { label: 'Shoulders', text: 'Shoulders' },
    { label: 'Knees', text: 'Knees' },
    { label: 'Lower Back', text: 'Lower Back' },
  ];

  const objectives: { id: PrimaryObjective; label: string; desc: string }[] = [
    { id: 'SHRED', label: 'Conditioning', desc: 'Metabolic work & high density' },
    { id: 'HYPERTROPHY', label: 'Hypertrophy', desc: 'Volume & progressive tension' },
    { id: 'SKILLS', label: 'Explosive Skills', desc: 'Levers, power & technique' },
    { id: 'STRENGTH', label: 'Pure Strength', desc: 'Low reps & max recruitment' },
  ];

  return (
    <aside className="w-full flex-shrink-0 lg:w-[320px] space-y-4">
      <div className="rounded-xl border border-white/[0.07] bg-[#121215] p-4 space-y-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Athlete Calibration
            </h2>
          </div>
          <span className="text-[11px] font-medium text-zinc-500">
            Auto-Sync
          </span>
        </div>

        {/* 1. Modality: 2-way Segmented Control */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Training Modality
          </label>
          <div className="grid grid-cols-2 rounded-lg bg-[#18181C] p-1 border border-white/[0.06]">
            <button
              type="button"
              onClick={() => onChange({ modality: 'BODYWEIGHT' })}
              className={`rounded-md py-1.5 text-xs font-medium transition-all ${
                modality === 'BODYWEIGHT'
                  ? 'bg-white/[0.12] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Bodyweight
            </button>
            <button
              type="button"
              onClick={() => onChange({ modality: 'GYM' })}
              className={`rounded-md py-1.5 text-xs font-medium transition-all ${
                modality === 'GYM'
                  ? 'bg-white/[0.12] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Gym Iron
            </button>
          </div>
        </div>

        {/* 2. Difficulty Tier: 5-step horizontal segmented bar */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-400">
              Difficulty Tier
            </label>
            <span className="text-xs font-semibold text-[#A3E635]">
              {TIER_CONFIG[tier].tag}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1 rounded-lg bg-[#18181C] p-1 border border-white/[0.06]">
            {([1, 2, 3, 4, 5] as DifficultyTier[]).map(t => {
              const active = tier === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange({ tier: t })}
                  className={`rounded-md py-1.5 text-xs font-medium transition-all ${
                    active
                      ? 'bg-[#A3E635] text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  T{t}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[11px] text-zinc-400 leading-snug">
            {TIER_CONFIG[tier].description}
          </p>
        </div>

        {/* 3. Primary Objective: Compact 2x2 Grid */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Primary Focus
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {objectives.map(item => {
              const active = objective === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChange({ objective: item.id })}
                  className={`flex flex-col items-start rounded-lg border px-2.5 py-2 text-left transition-all ${
                    active
                      ? 'border-[#A3E635]/60 bg-[#A3E635]/10 text-white'
                      : 'border-white/[0.06] bg-[#18181C] text-zinc-400 hover:border-white/[0.14] hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 w-full">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        active ? 'bg-[#A3E635]' : 'bg-zinc-600'
                      }`}
                    />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>
                  <span className="mt-0.5 text-[10px] text-zinc-400 line-clamp-1">
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Coach Persona */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Coach Persona
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => onChange({ persona: 'TACTICAL_SCIENTIST' })}
              className={`rounded-lg border px-2.5 py-2 text-left transition-all ${
                persona === 'TACTICAL_SCIENTIST'
                  ? 'border-sky-500/50 bg-sky-500/10 text-white'
                  : 'border-white/[0.06] bg-[#18181C] text-zinc-400 hover:border-white/[0.12] hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5 text-sky-400" />
                <span className="text-xs font-semibold">Scientist</span>
              </div>
              <p className="mt-0.5 text-[10px] text-zinc-400">
                Biomechanical & RPE cues
              </p>
            </button>

            <button
              type="button"
              onClick={() => onChange({ persona: 'DRILL_SERGEANT' })}
              className={`rounded-lg border px-2.5 py-2 text-left transition-all ${
                persona === 'DRILL_SERGEANT'
                  ? 'border-red-500/50 bg-red-500/10 text-white'
                  : 'border-white/[0.06] bg-[#18181C] text-zinc-400 hover:border-white/[0.12] hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-red-400" />
                <span className="text-xs font-semibold">Drill Sergeant</span>
              </div>
              <p className="mt-0.5 text-[10px] text-zinc-400">
                Direct & high accountability
              </p>
            </button>
          </div>
        </div>

        {/* 5. Collapsible Daily Readiness Check-In */}
        <div className="rounded-lg border border-white/[0.06] bg-[#18181C] overflow-hidden">
          <button
            type="button"
            onClick={() => setIsCheckInOpen(prev => !prev)}
            className="flex w-full items-center justify-between p-3 text-left transition hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-[#A3E635]" />
              <span className="text-xs font-semibold text-white">
                Daily Readiness Check-In
              </span>
            </div>
            {isCheckInOpen ? (
              <ChevronUp className="h-4 w-4 text-zinc-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            )}
          </button>

          {isCheckInOpen && (
            <div className="p-3 pt-0 space-y-3 border-t border-white/[0.04]">
              {/* Energy Level 1-5 */}
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="text-zinc-400">Energy Level</span>
                  <span className="font-mono-numbers text-zinc-200 font-medium">
                    {energy}/5
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {([1, 2, 3, 4, 5] as EnergyLevel[]).map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => onChange({ energy: val })}
                      className={`h-7 rounded-md text-xs font-mono-numbers transition-all ${
                        energy === val
                          ? 'bg-white text-zinc-950 font-bold shadow-sm'
                          : 'bg-[#121215] text-zinc-400 hover:text-white border border-white/[0.04]'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Window */}
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="text-zinc-400">Session Window</span>
                  <span className="font-mono-numbers text-zinc-200 font-medium">
                    {timeWindow} min
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {([20, 45, 60] as TimeWindow[]).map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => onChange({ timeWindow: time })}
                      className={`rounded-md py-1.5 text-xs font-mono-numbers transition-all ${
                        timeWindow === time
                          ? 'bg-white/[0.14] text-white font-medium border border-white/[0.12]'
                          : 'bg-[#121215] text-zinc-400 hover:text-white border border-white/[0.04]'
                      }`}
                    >
                      {time}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Joint Guardrails */}
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="text-zinc-400">Joint Protection</span>
                  <span className="text-[11px] text-zinc-500">
                    {soreJoints.includes('None') ? 'None' : `${soreJoints.length} Active`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {jointOptions.map(option => {
                    const selected = soreJoints.includes(option.label);
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => handleToggleJoint(option.label)}
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-all ${
                          selected
                            ? option.label === 'None'
                              ? 'bg-zinc-800 text-zinc-200 border border-white/[0.1]'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                            : 'bg-[#121215] text-zinc-400 hover:text-zinc-200 border border-white/[0.04]'
                        }`}
                      >
                        {option.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Regenerate Blueprint CTA */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#A3E635] px-4 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-[#bbf055] active:scale-[0.98] disabled:opacity-50 shadow-sm"
        >
          <Zap className="h-3.5 w-3.5 fill-current" />
          <span>{isGenerating ? 'Recalibrating...' : 'Regenerate Protocol'}</span>
        </button>
      </div>
    </aside>
  );
};
