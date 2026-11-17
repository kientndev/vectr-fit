'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TelemetryNavbar } from '../components/TelemetryNavbar';
import { HeroSection } from '../components/HeroSection';
import { FeatureBentoGrid } from '../components/FeatureBentoGrid';
import { DownloadHub } from '../components/DownloadHub';
import { LandingFooter } from '../components/LandingFooter';
import { ApkDownloadModal } from '../components/ApkDownloadModal';
import { IosWaitlistModal } from '../components/IosWaitlistModal';
import { audioJuice } from '../lib/audioJuice';
import { Cpu, Smartphone } from 'lucide-react';

export default function LandingPage() {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isIosModalOpen, setIsIosModalOpen] = useState(false);
  const [isNativeCapacitor, setIsNativeCapacitor] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.()) {
      setIsNativeCapacitor(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#07090E] text-zinc-100 selection:bg-emerald-400 selection:text-black font-sans relative overflow-x-hidden telemetry-grid">
      {/* Sticky Telemetry Navbar */}
      <TelemetryNavbar onOpenDownloadModal={() => setIsDownloadModalOpen(true)} />

      {/* Main Landing Sections */}
      <main className="space-y-4">
        {/* Hero Section with Embedded Biomechanics Arena */}
        <HeroSection
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
          onOpenIosModal={() => setIsIosModalOpen(true)}
        />

        {/* Feature Bento Grid with 4 Interactive Cards */}
        <FeatureBentoGrid />

        {/* Download Hub & Visual Stepper */}
        <DownloadHub
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
          onOpenIosModal={() => setIsIosModalOpen(true)}
        />
      </main>

      {/* Modern Dark Cyberpunk Footer */}
      <LandingFooter onOpenDownloadModal={() => setIsDownloadModalOpen(true)} />

      {/* APK Direct Download Modal */}
      <ApkDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

      {/* Apple iOS TestFlight Waitlist Modal */}
      <IosWaitlistModal
        isOpen={isIosModalOpen}
        onClose={() => setIsIosModalOpen(false)}
      />

      {/* Floating Tactical Console Quick-Launcher */}
      <div className="fixed bottom-5 right-5 z-40">
        <Link
          href="/app"
          onClick={() => audioJuice.playTick()}
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-black/80 hover:bg-[#090C15] border border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] backdrop-blur-xl text-xs font-mono font-bold text-white transition-all active:scale-95"
        >
          <div className="relative flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping absolute" />
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
          </div>
          <span className="text-zinc-300 group-hover:text-cyan-300 transition">
            Launch Web Workout App
          </span>
          <Cpu className="h-3.5 w-3.5 text-cyan-400 group-hover:rotate-90 transition-transform duration-300" />
        </Link>
      </div>
    </div>
  );
}
