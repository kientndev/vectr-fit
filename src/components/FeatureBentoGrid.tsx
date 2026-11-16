'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Zap,
  Cpu,
  Layers,
  CheckCircle2,
  XCircle,
  Activity,
  Dumbbell,
  Target,
  Sparkles,
} from 'lucide-react';
import { audioJuice } from '../lib/audioJuice';

export const FeatureBentoGrid: React.FC = () => {
  // Card 1 State: 33-Point Scanner Coordinate Tracking
  const [activeJoint, setActiveJoint] = useState<{ name: string; x: string; y: string; z: string }>({
    name: 'Right Patella / Knee',
    x: '0.482',
    y: '0.741',
    z: '-0.182',
  });

  // Card 2 State: Anti-Cheat Rep Comparison Toggle
  const [repMode, setRepMode] = useState<'half' | 'strict'>('strict');

  // Card 4 State: Calisthenics & Strength Movement Preview
  const [activeMovement, setActiveMovement] = useState<'pullup' | 'squat' | 'plank' | 'pushup'>('pullup');

  const movementsData = {
    pullup: {
      title: 'Strict Pull-Up / Chin-Up',
      targetThreshold: 'Chin > Bar threshold (<85° Elbow Flexion)',
      muscles: 'Latissimus Dorsi, Biceps, Rhomboids',
      cue: 'Dead hang lockout at bottom -> Chin fully clears bar without kipping.',
    },
    squat: {
      title: 'Barbell & Bodyweight Squat',
      targetThreshold: 'Hip Crease Below Knee (<90° Parallel)',
      muscles: 'Quadriceps, Gluteus Maximus, Adductors',
      cue: 'Knees track over toes -> Full hip extension at top lockout.',
    },
    plank: {
      title: 'Hollow-Body Military Plank',
      targetThreshold: '175° - 180° Rigid Spine Alignment',
      muscles: 'Rectus Abdominis, Transverse Core, Glutes',
      cue: 'Zero lumbar sag -> Posterior pelvic tilt locked throughout hold.',
    },
    pushup: {
      title: 'Strict Ground Push-Up',
      targetThreshold: '<90° Elbow Flexion at Chest Touch',
      muscles: 'Pectoralis Major, Anterior Deltoids, Triceps',
      cue: 'Elbows tucked 45° -> Full lockout with scapular protraction.',
    },
  };

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold">
          <Activity className="h-3.5 w-3.5" />
          <span>ENGINE ARCHITECTURE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Engineered for Mathematical Perfection.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Zero Guesswork.
          </span>
        </h2>
        <p className="text-sm sm:text-base text-zinc-400">
          Every millisecond of your workout is evaluated by a client-side computer vision pipeline calibrated for elite kinetic compliance.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* CARD 1: 33-Point 3D Skeletal Mesh (Col-Span 7) */}
        <div className="md:col-span-7 rounded-3xl bg-[#090C15] border border-white/[0.08] p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between group hover:border-emerald-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> 33-POINT SKELETAL TOPOLOGY
              </span>
              <span className="text-[11px] font-mono text-zinc-500">60 FPS REAL-TIME</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Sub-Millimeter 3D Joint Tracking
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
              Hover over anatomical nodes to inspect real-time spatial XYZ coordinates calculated directly in your browser.
            </p>
          </div>

          {/* Interactive Wireframe Anatomical Map */}
          <div className="my-6 p-5 rounded-2xl bg-black/50 border border-white/[0.06] relative z-10 space-y-4">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-zinc-400">ACTIVE LANDMARK:</span>
              <span className="text-emerald-400 font-bold">{activeJoint.name}</span>
            </div>

            {/* Simulated Coordinate Grid */}
            <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] text-zinc-500 block">AXIS X</span>
                <span className="font-bold text-cyan-400">{activeJoint.x}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] text-zinc-500 block">AXIS Y</span>
                <span className="font-bold text-emerald-400">{activeJoint.y}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] text-zinc-500 block">AXIS Z (DEPTH)</span>
                <span className="font-bold text-amber-400">{activeJoint.z}</span>
              </div>
            </div>

            {/* Interactive Anatomical Node Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                { name: 'C7 Cervical Spine', x: '0.502', y: '0.241', z: '-0.045' },
                { name: 'Right Glenohumeral / Shoulder', x: '0.628', y: '0.298', z: '-0.120' },
                { name: 'Left Olecranon / Elbow', x: '0.342', y: '0.450', z: '-0.080' },
                { name: 'Sacroiliac / Hip Vertex', x: '0.500', y: '0.550', z: '0.010' },
                { name: 'Right Patella / Knee', x: '0.482', y: '0.741', z: '-0.182' },
                { name: 'Lateral Malleolus / Ankle', x: '0.470', y: '0.920', z: '-0.050' },
              ].map(joint => (
                <button
                  key={joint.name}
                  type="button"
                  onMouseEnter={() => {
                    audioJuice.playTick();
                    setActiveJoint(joint);
                  }}
                  onClick={() => {
                    audioJuice.playTick();
                    setActiveJoint(joint);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                    activeJoint.name === joint.name
                      ? 'bg-emerald-500 text-black font-bold shadow-md'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 border border-white/[0.06]'
                  }`}
                >
                  {joint.name}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            33 landmarks processed at 60Hz with zero video transmission to remote servers
          </div>
        </div>

        {/* CARD 2: Anti-Cheat Rep Validation (Col-Span 5) */}
        <div className="md:col-span-5 rounded-3xl bg-[#090C15] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between group hover:border-cyan-500/40 transition-all duration-300">
          <div className="space-y-3">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" /> REPUTATION INTEGRITY
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Anti-Cheat Rep Hysteresis
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              VECTR FIT enforces strict state machines. Half-reps and bouncing are filtered out mathematically.
            </p>
          </div>

          {/* Interactive Toggle Comparison */}
          <div className="my-6 space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/60 border border-white/[0.08] font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  audioJuice.playWarningBuzz();
                  setRepMode('half');
                }}
                className={`py-2 px-3 rounded-lg text-center font-bold transition ${
                  repMode === 'half'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Half-Rep (Cheat)
              </button>
              <button
                type="button"
                onClick={() => {
                  audioJuice.playSuccessChime();
                  setRepMode('strict');
                }}
                className={`py-2 px-3 rounded-lg text-center font-bold transition ${
                  repMode === 'strict'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Full ROM Lockout
              </button>
            </div>

            {/* Visual Rep Outcome Status */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                repMode === 'strict'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-rose-500/10 border-rose-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                {repMode === 'strict' ? (
                  <CheckCircle2 className="h-7 w-7 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="h-7 w-7 text-rose-400 shrink-0" />
                )}
                <div className="font-mono">
                  <div className={`text-sm font-bold ${repMode === 'strict' ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {repMode === 'strict' ? 'REP COUNTED (+1)' : 'REP REJECTED (0 COUNTED)'}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {repMode === 'strict'
                      ? 'Inflection at 88° + Lockout at 168° verified.'
                      : 'Inflection stopped short at 112°. Parallel failed.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="font-mono text-[11px] text-zinc-500">
            Enforces full concentric & eccentric ranges across 40+ athletic disciplines.
          </div>
        </div>

        {/* CARD 3: Zero-Latency On-Device Edge AI (Col-Span 5) */}
        <div className="md:col-span-5 rounded-3xl bg-[#090C15] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between group hover:border-emerald-500/40 transition-all duration-300">
          <div className="space-y-3">
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 fill-current" /> ZERO-LATENCY EDGE ENGINE
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              12ms On-Device Inference
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Cloud AI video analysis lags by 450ms+ and devours your data plan. VECTR FIT runs 100% on local NPU / GPU silicon.
            </p>
          </div>

          {/* Animated Latency Comparison Chart */}
          <div className="my-6 space-y-4 font-mono">
            {/* VECTR FIT Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5" /> VECTR FIT (On-Device WebAssembly)
                </span>
                <span className="text-white font-extrabold">12ms</span>
              </div>
              <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 w-[12%] shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
              </div>
            </div>

            {/* Cloud Video API Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Traditional Cloud Video AI</span>
                <span className="text-rose-400 font-bold">480ms (40x Slower)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-rose-500 w-[85%]" />
              </div>
            </div>
          </div>

          <div className="font-mono text-[11px] text-zinc-500 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            Zero battery drain • Works in remote gyms with zero internet access
          </div>
        </div>

        {/* CARD 4: Calisthenics & Strength Ready (Col-Span 7) */}
        <div className="md:col-span-7 rounded-3xl bg-[#090C15] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between group hover:border-cyan-500/40 transition-all duration-300">
          <div className="space-y-3">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold flex items-center gap-1.5">
              <Dumbbell className="h-3.5 w-3.5" /> 40+ SUPPORTED DISCIPLINES
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              From Bodyweight Mastery to Heavy Iron
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Tailored biomechanical models for calisthenics, powerlifting, bodybuilding, and mobility work.
            </p>
          </div>

          {/* Interactive Movement Tabs & Live Preview */}
          <div className="my-6 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              {(['pullup', 'squat', 'plank', 'pushup'] as const).map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    audioJuice.playTick();
                    setActiveMovement(key);
                  }}
                  className={`py-2 px-2 text-center rounded-xl font-bold transition capitalize ${
                    activeMovement === key
                      ? 'bg-cyan-500 text-black shadow-md'
                      : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Movement Specs Display */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.08] space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-white font-bold border-b border-white/[0.06] pb-2">
                <span>{movementsData[activeMovement].title}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ACTIVE CRITERIA
                </span>
              </div>
              <div className="text-zinc-300">
                <span className="text-zinc-500">Threshold: </span>
                {movementsData[activeMovement].targetThreshold}
              </div>
              <div className="text-zinc-300">
                <span className="text-zinc-500">Primary Muscles: </span>
                {movementsData[activeMovement].muscles}
              </div>
              <div className="text-emerald-300 italic pt-1 border-t border-white/[0.04]">
                "{movementsData[activeMovement].cue}"
              </div>
            </div>
          </div>

          <div className="font-mono text-[11px] text-zinc-500">
            Instant voice cues keep your eyes locked on the exercise, not the screen.
          </div>
        </div>
      </div>
    </section>
  );
};
