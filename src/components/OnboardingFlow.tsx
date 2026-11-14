'use client';

import React, { useState } from 'react';
import { Modality, DifficultyTier, CoachPersona, JointSoreness } from '../types/protocol';
import { feedback } from '../lib/feedback';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Shield,
  Zap,
  Activity,
  Flame,
  Award,
} from 'lucide-react';

export interface OnboardingData {
  weightKg: number;
  heightCm: number;
  modality: Modality;
  maxPullups: string;
  maxPushups: string;
  calculatedTier: DifficultyTier;
  targetSkill: string;
  equipment: string[];
  sessionDuration: number;
  soreJoints: JointSoreness[];
  coachPersona: CoachPersona;
}

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: (data: OnboardingData) => void;
  onClose?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  isOpen,
  onComplete,
  onClose,
}) => {
  const [step, setStep] = useState<number>(1);

  // Step 1: Biometrics & Modality
  const [weightKg, setWeightKg] = useState<number>(75);
  const [heightCm, setHeightCm] = useState<number>(178);
  const [modality, setModality] = useState<Modality>('BODYWEIGHT');

  // Step 2: Baseline Strength Test
  const [maxPullups, setMaxPullups] = useState<string>('6-12');
  const [maxPushups, setMaxPushups] = useState<string>('20-35');

  // Step 3: Primary Skill / Target
  const [targetSkill, setTargetSkill] = useState<string>('First Muscle-Up');

  // Step 4: Equipment & Duration
  const [equipment, setEquipment] = useState<string[]>([
    'Pull-up Bar',
    'Dip Bars / Parallettes',
  ]);
  const [sessionDuration, setSessionDuration] = useState<number>(45);

  // Step 5: Joint Guardrails & Persona
  const [soreJoints, setSoreJoints] = useState<JointSoreness[]>(['None']);
  const [coachPersona, setCoachPersona] = useState<CoachPersona>('TACTICAL_SCIENTIST');

  if (!isOpen) return null;

  // Real-time Tier Calculation
  const calculateTier = (): DifficultyTier => {
    let score = 0;
    if (maxPullups === '0') score += 1;
    else if (maxPullups === '1-5') score += 2;
    else if (maxPullups === '6-12') score += 3;
    else if (maxPullups === '13-20') score += 4;
    else if (maxPullups === '20+') score += 5;

    if (maxPushups === '<10') score += 1;
    else if (maxPushups === '10-20') score += 2;
    else if (maxPushups === '20-35') score += 3;
    else if (maxPushups === '35-50') score += 4;
    else if (maxPushups === '50+') score += 5;

    const avg = Math.round(score / 2);
    return Math.max(1, Math.min(5, avg)) as DifficultyTier;
  };

  const calculatedTier = calculateTier();

  const getTierDetails = (t: DifficultyTier) => {
    switch (t) {
      case 1:
        return { name: 'Tier 1 · Foundation', desc: 'Eccentrics, hollow-body holds, and tendon baseline.' };
      case 2:
        return { name: 'Tier 2 · Conditioned', desc: 'Strict pull-ups, parallel bar dips, and structural work.' };
      case 3:
        return { name: 'Tier 3 · Warrior', desc: 'Explosive high pulls, L-sits, and ring strength mastery.' };
      case 4:
        return { name: 'Tier 4 · Elite', desc: 'Bar muscle-ups, handstand push-ups, and weighted compounds.' };
      case 5:
        return { name: 'Tier 5 · Apex', desc: 'Ring muscle-ups, straddle planche, and advanced levers.' };
    }
  };

  const toggleEquipment = (item: string) => {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter(e => e !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  const toggleJoint = (joint: JointSoreness) => {
    if (joint === 'None') {
      setSoreJoints(['None']);
      return;
    }
    let next: JointSoreness[] = soreJoints.filter(j => j !== 'None');
    if (next.includes(joint)) {
      next = next.filter(j => j !== joint);
      if (next.length === 0) next = ['None'];
    } else {
      next.push(joint);
    }
    setSoreJoints(next);
  };

  const handleNext = () => {
    feedback.hapticLight();
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Finalize
      feedback.hapticSuccess();
      feedback.playLevelUp();
      onComplete({
        weightKg,
        heightCm,
        modality,
        maxPullups,
        maxPushups,
        calculatedTier,
        targetSkill,
        equipment,
        sessionDuration,
        soreJoints,
        coachPersona,
      });
    }
  };

  const handleBack = () => {
    feedback.hapticLight();
    if (step > 1) setStep(step - 1);
  };

  const skillsList = [
    { title: 'First Muscle-Up', desc: 'Explosive false grip & transition mechanics' },
    { title: 'Tuck / Straddle Planche', desc: 'Straight-arm scapular protraction force' },
    { title: 'Handstand Push-Up', desc: 'Vertical pressing power & inverted balance' },
    { title: 'Explosive Martial Power', desc: 'Kinetic rotational speed & fast-twitch bursts' },
    { title: 'Aesthetic Hypertrophy', desc: 'Upper body V-taper & defined core conditioning' },
    { title: 'Raw Strength & Density', desc: 'Weighted calisthenics & heavy structural loads' },
  ];

  const equipmentOptions = [
    'Pull-up Bar',
    'Dip Bars / Parallettes',
    'Resistance Bands',
    'Gymnastic Rings',
    'Dumbbells / Barbell',
    'Floor Only',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 select-none">
      <div className="w-full max-w-lg rounded-2xl bg-[#121215] border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header / Progress Bar */}
        <div className="border-b border-white/[0.06] bg-[#18181C] p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#A3E635]/15 text-[#A3E635] text-xs font-bold font-mono">
                {step}
              </span>
              <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                AI Athlete Calibration
              </span>
            </div>
            <span className="text-xs font-mono text-zinc-500">Step {step} of 5</span>
          </div>

          {/* Stepper Dots / Bars */}
          <div className="grid grid-cols-5 gap-1.5 mt-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-[#A3E635]' : 'bg-white/[0.08]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* STEP 1: Biometrics & Modality */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Biometric Baseline & Training Path
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Calibrates leverage ratios, center of mass, and movement kinematics.
                </p>
              </div>

              {/* Modality Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400">Primary Modality</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModality('BODYWEIGHT')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition ${
                      modality === 'BODYWEIGHT'
                        ? 'border-[#A3E635] bg-[#A3E635]/10 text-white'
                        : 'border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Zap className="h-5 w-5 text-[#A3E635] mb-1.5" />
                    <span className="text-xs font-bold">Bodyweight Mastery</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">Calisthenics & Skills</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModality('GYM')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition ${
                      modality === 'GYM'
                        ? 'border-[#A3E635] bg-[#A3E635]/10 text-white'
                        : 'border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Activity className="h-5 w-5 text-amber-400 mb-1.5" />
                    <span className="text-xs font-bold">Iron & Hybrid</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">Gym Weights & Barbell</span>
                  </button>
                </div>
              </div>

              {/* Weight & Height Sliders/Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-zinc-400">Weight</span>
                    <span className="text-sm font-bold font-mono text-[#A3E635]">{weightKg} kg</span>
                  </div>
                  <input
                    type="range"
                    min="45"
                    max="140"
                    value={weightKg}
                    onChange={e => setWeightKg(Number(e.target.value))}
                    className="w-full accent-[#A3E635] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-600 mt-1">
                    <span>45kg</span>
                    <span>140kg</span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-zinc-400">Height</span>
                    <span className="text-sm font-bold font-mono text-[#A3E635]">{heightCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min="145"
                    max="210"
                    value={heightCm}
                    onChange={e => setHeightCm(Number(e.target.value))}
                    className="w-full accent-[#A3E635] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-600 mt-1">
                    <span>145cm</span>
                    <span>210cm</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Baseline Strength & Live Tier Assignment */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Baseline Strength Assessment
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Determines your motor unit recruitment capacity and workout density.
                </p>
              </div>

              {/* Dynamic Assigned Tier Badge */}
              <div className="rounded-xl border border-[#A3E635]/40 bg-[#162014] p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-[#A3E635] uppercase">
                    AI Auto-Calculated Tier
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    {getTierDetails(calculatedTier).name}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {getTierDetails(calculatedTier).desc}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A3E635] text-black font-extrabold text-lg shadow-[0_0_15px_rgba(163,230,53,0.35)]">
                  T{calculatedTier}
                </div>
              </div>

              {/* Pull-ups */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Max Strict Dead-Hang Pull-ups
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {['0', '1-5', '6-12', '13-20', '20+'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMaxPullups(val)}
                      className={`py-2 rounded-lg text-xs font-mono font-bold border transition ${
                        maxPullups === val
                          ? 'border-[#A3E635] bg-[#A3E635] text-black shadow-sm'
                          : 'border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Push-ups / Dips */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Max Strict Full-ROM Push-ups
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {['<10', '10-20', '20-35', '35-50', '50+'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMaxPushups(val)}
                      className={`py-2 rounded-lg text-xs font-mono font-bold border transition ${
                        maxPushups === val
                          ? 'border-[#A3E635] bg-[#A3E635] text-black shadow-sm'
                          : 'border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Primary Skill / Target */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Primary Athlete Target
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  The AI Coach structures compound strength blocks directly towards unlocking this milestone.
                </p>
              </div>

              <div className="space-y-2">
                {skillsList.map(item => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setTargetSkill(item.title)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                      targetSkill === item.title
                        ? 'border-[#A3E635] bg-[#A3E635]/10 text-white'
                        : 'border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{item.title}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</div>
                    </div>
                    {targetSkill === item.title && (
                      <div className="h-5 w-5 rounded-full bg-[#A3E635] flex items-center justify-center text-black shrink-0">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Equipment & Session Duration */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Available Equipment & Session Window
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Protocols adapt exclusively to the gear you have in your training space.
                </p>
              </div>

              {/* Equipment Multi-select */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">Select Available Gear</label>
                <div className="grid grid-cols-2 gap-2">
                  {equipmentOptions.map(eq => {
                    const isSelected = equipment.includes(eq);
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => toggleEquipment(eq)}
                        className={`p-2.5 rounded-lg border text-xs font-medium text-left flex items-center justify-between transition ${
                          isSelected
                            ? 'border-[#A3E635]/60 bg-[#A3E635]/10 text-white'
                            : 'border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{eq}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-[#A3E635] shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration Buttons */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-zinc-300">Standard Daily Window</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { dur: 20, label: '20 Min', desc: 'High Intensity' },
                    { dur: 45, label: '45 Min', desc: 'Standard Core' },
                    { dur: 60, label: '60 Min', desc: 'Max Volume' },
                  ].map(opt => (
                    <button
                      key={opt.dur}
                      type="button"
                      onClick={() => setSessionDuration(opt.dur)}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        sessionDuration === opt.dur
                          ? 'border-[#A3E635] bg-[#A3E635]/10 text-white'
                          : 'border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold font-mono">{opt.label}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Joint Guardrails & Persona */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Joint Guardrails & AI Coach Persona
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Protects vulnerable kinetic chains and selects your coaching feedback voice.
                </p>
              </div>

              {/* Sore Joints Guardrails */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">
                  Flag Any Sore Joints (Auto-Adapted Swaps)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['None', 'Wrists', 'Shoulders', 'Knees', 'Lower Back'] as JointSoreness[]).map(
                    joint => {
                      const isSelected = soreJoints.includes(joint);
                      return (
                        <button
                          key={joint}
                          type="button"
                          onClick={() => toggleJoint(joint)}
                          className={`p-2 rounded-lg border text-xs font-medium transition ${
                            isSelected
                              ? joint === 'None'
                                ? 'border-zinc-500 bg-white/10 text-white'
                                : 'border-rose-500/80 bg-rose-500/10 text-rose-300'
                              : 'border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {joint}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Coach Persona Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-zinc-300">AI Coach Persona</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCoachPersona('TACTICAL_SCIENTIST')}
                    className={`p-3 rounded-xl border text-left transition ${
                      coachPersona === 'TACTICAL_SCIENTIST'
                        ? 'border-[#A3E635] bg-[#A3E635]/10 text-white'
                        : 'border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#A3E635]">Tactical Scientist</div>
                    <div className="text-[10px] text-zinc-400 mt-1 leading-snug">
                      Biomechanical cues, RPE tracking, and joint preservation.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCoachPersona('DRILL_SERGEANT')}
                    className={`p-3 rounded-xl border text-left transition ${
                      coachPersona === 'DRILL_SERGEANT'
                        ? 'border-amber-400 bg-amber-400/10 text-white'
                        : 'border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-amber-400">Drill Sergeant</div>
                    <div className="text-[10px] text-zinc-400 mt-1 leading-snug">
                      High intensity, discipline enforcement, and zero excuses.
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/[0.06] bg-[#18181C] p-4 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/[0.04] border border-white/[0.08] active:scale-95 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex-1 max-w-xs flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#A3E635] text-black hover:bg-[#b0f340] active:scale-95 shadow-[0_0_20px_rgba(163,230,53,0.3)] transition"
          >
            {step < 5 ? (
              <>
                <span>Next Step</span>
                <ChevronRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 fill-black" />
                <span>Initialize AI Protocol</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

