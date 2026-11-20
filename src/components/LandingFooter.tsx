'use client';

import React from 'react';
import Link from 'next/link';
import { ScrollReveal } from './ScrollReveal';
import { Activity, ShieldCheck, Download, Smartphone, Cpu, ExternalLink } from 'lucide-react';
import { audioJuice } from '../lib/audioJuice';

interface LandingFooterProps {
  onOpenDownloadModal: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onOpenDownloadModal }) => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#05070B] text-zinc-400 font-mono text-xs overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Info (Slides & Floats in from Left) */}
          <ScrollReveal
            direction="converge-left"
            distance={80}
            duration={0.75}
            tilt={true}
            className="md:col-span-5 space-y-4"
          >
            <Link
              href="/"
              onClick={() => audioJuice.playTick()}
              className="flex items-center gap-2.5"
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 p-[1px]">
                <div className="h-full w-full rounded-[11px] bg-[#07090E] flex items-center justify-center">
                  <Activity className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
              <span className="font-extrabold text-lg tracking-wider text-white">
                VECTR<span className="text-emerald-400">FIT</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              Real-time mobile skeletal computer vision & deterministic calisthenics/strength training OS. 100% on-device WebAssembly execution.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Production Version: v1.2.0-beta • APK Ready</span>
            </div>
          </ScrollReveal>

          {/* Nav Links (Floats in from Center/Up) */}
          <ScrollReveal direction="up" distance={50} delay={0.1} className="md:col-span-3 space-y-3">
            <span className="text-white font-bold text-xs uppercase tracking-wider block">
              Navigation
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#arena" className="hover:text-emerald-400 transition">
                  Interactive Rig Sandbox
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-emerald-400 transition">
                  Engine Architecture
                </a>
              </li>
              <li>
                <a href="#install-guide" className="hover:text-emerald-400 transition">
                  Android Installation Guide
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-emerald-400 transition">
                  Privacy & VirusTotal Audit
                </a>
              </li>
              <li>
                <Link href="/app" className="text-cyan-400 hover:underline flex items-center gap-1">
                  <Cpu className="h-3 w-3" /> Launch Workout Console
                </Link>
              </li>
            </ul>
          </ScrollReveal>

          {/* Quick Download CTA (Slides & Floats in from Right) */}
          <ScrollReveal
            direction="converge-right"
            distance={80}
            delay={0.15}
            duration={0.75}
            tilt={true}
            className="md:col-span-4 space-y-3"
          >
            <span className="text-white font-bold text-xs uppercase tracking-wider block">
              Direct Binary Release
            </span>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Download the unsigned APK binary directly to your Android device with zero Google Play restrictions.
            </p>
            <button
              type="button"
              onClick={() => {
                audioJuice.playSuccessChime();
                onOpenDownloadModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/[0.05] hover:bg-emerald-500 hover:text-black border border-white/10 text-white font-bold text-xs transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .APK (8.7MB)</span>
            </button>
          </ScrollReveal>
        </div>

        {/* Bottom Credits & Legal */}
        <ScrollReveal direction="up" distance={20} className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-600">
          <div>
            © {new Date().getFullYear()} VECTR FIT Biomechanics Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by MediaPipe WASM</span>
            <span>•</span>
            <span>Zero Remote Telemetry</span>
            <span>•</span>
            <span>Offline Android Runtime</span>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
};
