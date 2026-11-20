'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Download, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  Check, 
  X, 
  ExternalLink, 
  Cpu, 
  Zap,
  Apple
} from 'lucide-react';
import { audioJuice } from '../lib/audioJuice';

interface InstallAppButtonProps {
  className?: string;
  variant?: 'primary' | 'navbar' | 'compact';
  onOpenApkModal?: () => void;
  showApkFallback?: boolean;
}

export const InstallAppButton: React.FC<InstallAppButtonProps> = ({
  className = '',
  variant = 'primary',
  onOpenApkModal,
  showApkFallback = true,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIosModalOpen, setIsIosModalOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Detect standalone mode
    const checkStandalone = () => {
      const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIosStandalone = (window.navigator as any).standalone === true;
      const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();
      return isDisplayStandalone || isIosStandalone || isCapacitor;
    };

    setIsStandalone(checkStandalone());

    // 2. Platform detection
    const ua = navigator.userAgent || '';
    setIsIos(/iPhone|iPad|iPod/i.test(ua) && !(window as any).MSStream);
    setIsAndroid(/Android/i.test(ua));

    // 3. Listen for browser install prompt (Android/Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('[VECTR-PWA] Captured beforeinstallprompt event');
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('[VECTR-PWA] App installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    audioJuice.playSuccessChime();

    // Already standalone/installed -> navigate straight to web workout app
    if (isStandalone || isInstalled) {
      window.location.assign('/app');
      return;
    }

    // Android/Chrome with deferred prompt ready -> trigger 1-tap native install sheet
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn('[VECTR-PWA] Prompt error:', err);
      }
      return;
    }

    // iOS Safari -> open glassmorphic installation guide drawer
    if (isIos) {
      setIsIosModalOpen(true);
      return;
    }

    // Fallback: If on Android without prompt, or if user prefers APK modal
    if (isAndroid && onOpenApkModal) {
      onOpenApkModal();
      return;
    }

    // Desktop or non-mobile fallback -> Open the live web app directly
    window.location.assign('/app');
  };

  // ── Render Navbar Compact Button ─────────────────────────────
  if (variant === 'navbar') {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleInstallClick}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-black font-extrabold text-xs font-mono shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-95 transition-all cursor-pointer ${className}`}
        >
          <Smartphone className="h-3.5 w-3.5 fill-black" />
          <span>{isStandalone || isInstalled ? 'Launch App' : 'Install App'}</span>
        </button>

        {isIosModalOpen && (
          <IosInstallModal onClose={() => setIsIosModalOpen(false)} />
        )}
      </div>
    );
  }

  // ── Render Primary Hero / Download Hub CTA ──────────────────
  return (
    <div className="flex flex-col items-start gap-2.5 w-full sm:w-auto">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={handleInstallClick}
          className={`group relative flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-300 hover:from-emerald-300 hover:via-cyan-300 hover:to-emerald-200 text-black font-black text-sm sm:text-base font-mono shadow-[0_0_35px_rgba(16,185,129,0.45)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] active:scale-[0.98] transition-all cursor-pointer ${className}`}
        >
          {/* Ambient Kinetic Pulse */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-black" />
          </span>

          {isStandalone || isInstalled ? (
            <>
              <Cpu className="h-5 w-5" />
              <span>Launch Web Workout App</span>
            </>
          ) : isIos ? (
            <>
              <Apple className="h-5 w-5 fill-black" />
              <span>Install VECTR FIT (iOS)</span>
            </>
          ) : (
            <>
              <Smartphone className="h-5 w-5" />
              <span>Install App (1-Tap Native)</span>
            </>
          )}
        </button>

        {/* Quick Launch Web App Direct Link if not standalone */}
        {!isStandalone && !isInstalled && (
          <Link
            href="/app"
            onClick={() => audioJuice.playTick()}
            className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-cyan-500/40 text-xs font-mono font-bold text-zinc-300 hover:text-white transition active:scale-[0.98]"
          >
            <span>Run In Browser</span>
            <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
          </Link>
        )}
      </div>

      {/* Subtle Secondary APK Manual Download Link */}
      {showApkFallback && onOpenApkModal && !isStandalone && (
        <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-zinc-400">
          <span>Prefer raw binary?</span>
          <button
            type="button"
            onClick={() => {
              audioJuice.playTick();
              onOpenApkModal();
            }}
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-semibold transition"
          >
            Download Android .APK manually
          </button>
        </div>
      )}

      {/* iOS PWA Step-by-Step Installation Modal */}
      {isIosModalOpen && (
        <IosInstallModal onClose={() => setIsIosModalOpen(false)} />
      )}
    </div>
  );
};

// ── iOS PWA 2-Step Installation Drawer / Modal ───────────────────
interface IosInstallModalProps {
  onClose: () => void;
}

export const IosInstallModal: React.FC<IosInstallModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-[#090C15] border border-cyan-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-left space-y-6"
      >
        {/* Top bar with close button */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Apple className="h-4 w-4 fill-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">Install on iPhone / iPad</h3>
              <p className="text-[11px] font-mono text-zinc-400">Zero App Store download required</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2-Step Instructions */}
        <div className="space-y-4">
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono font-black text-xs">
              1
            </div>
            <div className="space-y-1 text-xs leading-relaxed">
              <p className="font-bold text-white flex items-center gap-1.5">
                <span>Tap the Share Button</span>
                <Share2 className="h-3.5 w-3.5 text-cyan-400" />
              </p>
              <p className="text-zinc-400">
                In Safari, tap the <strong>Share</strong> icon in the bottom menu bar of your browser.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-black text-xs">
              2
            </div>
            <div className="space-y-1 text-xs leading-relaxed">
              <p className="font-bold text-white flex items-center gap-1.5">
                <span>Tap &ldquo;Add to Home Screen&rdquo;</span>
                <PlusSquare className="h-3.5 w-3.5 text-emerald-400" />
              </p>
              <p className="text-zinc-400">
                Scroll down the share sheet and select <strong>Add to Home Screen</strong>, then tap <strong>Add</strong> in the top-right corner.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Confirmation Pill */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs font-mono text-emerald-300">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Launches full-screen at 60 FPS with camera AI offline.</span>
        </div>

        {/* Continue in Browser fallback button */}
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/app"
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition"
          >
            <span>Continue Using In Browser</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
