'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Download, Smartphone, Menu, X, Activity, Cpu } from 'lucide-react';
import { audioJuice } from '../lib/audioJuice';

interface TelemetryNavbarProps {
  onOpenDownloadModal: () => void;
}

export const TelemetryNavbar: React.FC<TelemetryNavbarProps> = ({ onOpenDownloadModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#07090E]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.8)]'
          : 'bg-transparent border-b border-white/[0.03]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Mark with Pulse Status */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={() => audioJuice.playTick()}
            className="flex items-center gap-2.5 group"
          >
            <div className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-emerald-600 p-[1px] shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <div className="h-full w-full rounded-[11px] bg-[#07090E] flex items-center justify-center">
                <Activity className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-white font-mono flex items-center gap-1.5">
                VECTR<span className="text-emerald-400">FIT</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-1 -mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                ENGINE v2.4 ONLINE
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wide text-zinc-400">
          <a
            href="#arena"
            onClick={() => audioJuice.playTick()}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          >
            <span className="text-emerald-500/80 font-bold">01.</span> Live Sandbox
          </a>
          <a
            href="#features"
            onClick={() => audioJuice.playTick()}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          >
            <span className="text-emerald-500/80 font-bold">02.</span> AI Features
          </a>
          <a
            href="#install-guide"
            onClick={() => audioJuice.playTick()}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          >
            <span className="text-emerald-500/80 font-bold">03.</span> How It Works
          </a>
          <a
            href="#security"
            onClick={() => audioJuice.playTick()}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Security Verified
          </a>
          <Link
            href="/app"
            onClick={() => audioJuice.playTick()}
            className="px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition flex items-center gap-1"
          >
            <Cpu className="h-3 w-3 text-cyan-400" /> Workout Console
          </Link>
        </nav>

        {/* Action Controls & Primary CTA */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              audioJuice.playSuccessChime();
              onOpenDownloadModal();
            }}
            className="relative group overflow-hidden rounded-xl p-[1px] focus:outline-none"
          >
            {/* Shimmer sweep border */}
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500 rounded-xl animate-shimmer" />
            <span className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#07090E] text-white text-xs font-mono font-bold group-hover:bg-[#07090E]/90 transition">
              <Download className="h-3.5 w-3.5 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
              <span>Download .APK</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">
                v1.0.1 • 8.7MB
              </span>
            </span>
          </button>

          {/* Mobile menu hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/[0.05] border border-white/10 text-zinc-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#07090E]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-5 space-y-4 font-mono text-sm">
          <a
            href="#arena"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-300 hover:text-emerald-400"
          >
            01. Live Sandbox
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-300 hover:text-emerald-400"
          >
            02. AI Features
          </a>
          <a
            href="#install-guide"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-300 hover:text-emerald-400"
          >
            03. How It Works
          </a>
          <a
            href="#security"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-300 hover:text-emerald-400"
          >
            04. Security Verified
          </a>
          <Link
            href="/app"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-cyan-400 font-bold"
          >
            ⚡ Open Web Workout Console
          </Link>
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDownloadModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-black font-bold text-xs"
            >
              <Smartphone className="h-4 w-4" /> Download VECTR FIT APK (8.7MB)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
