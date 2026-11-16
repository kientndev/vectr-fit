'use client';

import React from 'react';
import { BiomechanicsArena } from './BiomechanicsArena';
import { ScrollReveal } from './ScrollReveal';
import {
  Download,
  ShieldCheck,
  Zap,
  Smartphone,
  ChevronDown,
  Check,
  Cpu,
  Lock,
} from 'lucide-react';
import { audioJuice } from '../lib/audioJuice';

interface HeroSectionProps {
  onOpenDownloadModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenDownloadModal }) => {
  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background Radial Glow & Mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Value Prop, Headline & Conversion CTAs (Floats in from Left) */}
        <ScrollReveal direction="left" distance={60} duration={0.8} className="lg:col-span-5 space-y-6 text-left">
          {/* Animated Tech Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <Zap className="h-3.5 w-3.5 fill-current animate-pulse" />
            <span>100% Client-Side Skeletal AI • 60 FPS Native Tracking</span>
          </div>

          {/* Main Headline with Gradient */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.12]">
            Stop Guessing Your Form.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-300">
              Train With Real-Time Skeletal AI.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-lg">
            VECTR FIT turns any mobile camera into an offline biomechanics laboratory. Tracks 33 body joints at 60 FPS, measures angles to the exact degree, auto-counts reps, and prevents injuries in real time.
          </p>

          {/* Dual Conversion CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                audioJuice.playSuccessChime();
                onOpenDownloadModal();
              }}
              className="group relative flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm font-mono shadow-[0_0_30px_rgba(16,185,129,0.45)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] active:scale-[0.98] transition-all"
            >
              <Download className="h-4 w-4 stroke-[2.5] group-hover:translate-y-0.5 transition-transform" />
              <span>Download VECTR FIT (.APK)</span>
              <span className="px-1.5 py-0.5 rounded bg-black/20 text-black text-[10px] font-bold">
                42MB
              </span>
            </button>

            <a
              href="#arena"
              onClick={() => audioJuice.playTick()}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-mono text-sm font-semibold transition"
            >
              <span>Test Live Demo</span>
              <ChevronDown className="h-4 w-4 text-emerald-400 animate-bounce" />
            </a>
          </div>

          {/* Trust Strip */}
          <div className="pt-4 border-t border-white/[0.08] space-y-2 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-zinc-300">VirusTotal Verified Clean • Zero Cloud Video Uploads</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-emerald-400" /> Runs 100% Offline
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-emerald-400" /> Android 9.0+ Ready
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-emerald-400" /> No Play Store Login
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Right Column: Embedded Biomechanics Arena (Floats in from Right) */}
        <ScrollReveal direction="right" distance={60} duration={0.85} delay={0.15} className="lg:col-span-7">
          <BiomechanicsArena onOpenDownloadModal={onOpenDownloadModal} />
        </ScrollReveal>
      </div>
    </section>
  );
};
