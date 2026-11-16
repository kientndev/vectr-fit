'use client';

import React, { useState } from 'react';
import { ScrollReveal } from './ScrollReveal';
import {
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Lock,
  QrCode,
  FileCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { audioJuice } from '../lib/audioJuice';

interface DownloadHubProps {
  onOpenDownloadModal: () => void;
}

export const DownloadHub: React.FC<DownloadHubProps> = ({ onOpenDownloadModal }) => {
  return (
    <section id="install-guide" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 overflow-hidden">
      {/* Section Header */}
      <ScrollReveal direction="up" distance={40} className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
          <Download className="h-3.5 w-3.5" />
          <span>DIRECT INSTALLATION HUB</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Install VECTR FIT in 30 Seconds.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            No Play Store Needed.
          </span>
        </h2>
        <p className="text-sm sm:text-base text-zinc-400">
          Experience unthrottled 60 FPS hardware acceleration with direct developer access.
        </p>
      </ScrollReveal>

      {/* Main Download & Stepper Card */}
      <div className="rounded-3xl bg-[#090C15] border border-white/[0.08] p-6 sm:p-10 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Direct Action & Metadata (Floats in from Left) */}
          <ScrollReveal direction="left" distance={60} duration={0.8} className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                Official Android APK Package
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                VECTR FIT v1.2.0-beta
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Direct early access binary package. Fully offline-capable, lightweight footprint, and zero cloud subscriptions required for core skeletal tracking.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  audioJuice.playSuccessChime();
                  onOpenDownloadModal();
                }}
                className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm font-mono shadow-[0_0_30px_rgba(16,185,129,0.45)] active:scale-95 transition"
              >
                <Download className="h-4 w-4" />
                <span>Download .APK Package (42MB)</span>
              </button>

              <span className="text-xs font-mono text-zinc-500 text-center sm:text-left">
                Build: 2026.11.beta • Android 9.0+
              </span>
            </div>

            {/* Desktop QR Scanner Bridge */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.06] flex items-center justify-between gap-4 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-white font-bold flex items-center gap-1.5">
                  <QrCode className="h-4 w-4 text-cyan-400" /> Desktop User? Scan & Install
                </span>
                <p className="text-[11px] text-zinc-400">
                  Open your Android camera and scan this code to download the APK immediately.
                </p>
              </div>

              <div className="p-2 rounded-xl bg-white shrink-0">
                <svg width="60" height="60" viewBox="0 0 33 33" fill="none">
                  <rect width="33" height="33" fill="white" />
                  <path d="M2 2h9v9H2zM4 4v5h5V4zm18-2h9v9h-9zm2 2v5h5V4zM2 22h9v9H2zm2 2v5h5v-5zm18 3h4v4h-4zm5-5h4v4h-4zm-5 5h4v4h-4zm5 5h4v4h-4zm-9-5h3v3h-3zm0-5h3v3h-3zm-5-3h3v3h-3zm-3 3h3v3h-3zm0 4h3v3h-3z" fill="black" />
                </svg>
              </div>
            </div>
          </ScrollReveal>

          {/* Right Column: 3-Step Visual Stepper (Floats in from Right) */}
          <ScrollReveal direction="right" distance={60} duration={0.8} delay={0.15} className="lg:col-span-6 space-y-4">
            <span className="text-xs font-mono text-zinc-400 uppercase font-bold tracking-wider block">
              3-Step Installation Protocol
            </span>

            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/[0.06] flex items-start gap-4">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs shrink-0">
                01
              </div>
              <div className="space-y-1 font-mono text-xs">
                <span className="text-white font-bold block text-sm">Download the .APK File</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Tap the button above. The raw file <code className="text-emerald-400">vectr-fit-latest.apk</code> will save directly into your Android Downloads.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/[0.06] flex items-start gap-4">
              <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs shrink-0">
                02
              </div>
              <div className="space-y-1 font-mono text-xs">
                <span className="text-white font-bold block text-sm">Tap "Download Anyway"</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Android browsers show a standard prompt for any app distributed directly by developers. VECTR FIT is 100% clean and verified on VirusTotal.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/[0.06] flex items-start gap-4">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs shrink-0">
                03
              </div>
              <div className="space-y-1 font-mono text-xs">
                <span className="text-white font-bold block text-sm">Install & Launch</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Tap the completed notification, select "Install", and grant camera access for real-time 60 FPS skeletal analysis.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Security Verification Panel (Floats in with Staggered Directions) */}
      <div id="security" className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <ScrollReveal direction="left" distance={50} duration={0.7} className="flex">
          <div className="w-full p-5 rounded-2xl bg-[#090C15] border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>0/72 VirusTotal Detections</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Every APK release undergoes automated SHA-256 static analysis against 72 antivirus engines. Zero malware, zero adware.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" distance={50} duration={0.7} delay={0.1} className="flex">
          <div className="w-full p-5 rounded-2xl bg-[#090C15] border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Lock className="h-4 w-4" />
              <span>100% On-Device Privacy</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Your live camera frames never touch the cloud or remote servers. Computer vision processing executes exclusively inside device RAM.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" distance={50} duration={0.7} delay={0.2} className="flex">
          <div className="w-full p-5 rounded-2xl bg-[#090C15] border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <FileCheck className="h-4 w-4" />
              <span>Offline Autonomy</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              No active WiFi or LTE cellular connection required. Train in basement powerlifting gyms, parks, or off-grid shelters without interruption.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
