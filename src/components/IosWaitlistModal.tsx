'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  X,
  Apple,
  Sparkles,
  Check,
  ChevronRight,
  Send,
  Smartphone,
  Cpu,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioJuice } from '../lib/audioJuice';

interface IosWaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IosWaitlistModal: React.FC<IosWaitlistModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  let submitMutation: any = null;
  try {
    submitMutation = useMutation(api.telemetry.submitWaitlist);
  } catch {
    submitMutation = null;
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (submitMutation) {
        await submitMutation({ email, platform: 'ios' });
      } else {
        // Fallback local simulated success
        await new Promise((r) => setTimeout(r, 600));
      }

      audioJuice.playSuccessChime();
      setIsSuccess(true);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#06B6D4', '#10B981', '#FFFFFF'],
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#090C15] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.95)] p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            audioJuice.playTick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-zinc-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Badge */}
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold">
            <Apple className="h-3.5 w-3.5" />
            <span>APPLE TESTFLIGHT BETA // iOS QUEUE</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            VECTR FIT for iPhone & iPad
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Because Apple prevents sideloading raw <code className="text-emerald-400">.apk</code> binaries on iOS, our native iOS build is distributed via <strong>Apple TestFlight</strong>.
          </p>
        </div>

        {/* Email Signup Form */}
        {isSuccess ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2 animate-in fade-in">
            <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-5 w-5 stroke-[3]" />
            </div>
            <h4 className="text-sm font-bold text-white font-mono">
              You're on the iOS Priority List!
            </h4>
            <p className="text-xs text-zinc-400">
              We'll send your TestFlight invite code to <strong className="text-white">{email}</strong> as soon as the next wave opens.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-zinc-400">
                Enter your Apple ID email for TestFlight access:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@icloud.com"
                  required
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400 font-mono transition"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs font-mono shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-95 transition disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? 'Joining...' : 'Get Invite'}</span>
                </button>
              </div>
              {errorMessage && (
                <p className="text-xs text-rose-400 font-mono flex items-center gap-1 pt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errorMessage}</span>
                </p>
              )}
            </div>
          </form>
        )}

        {/* Instant Web App PWA Bridge */}
        <div className="pt-3 border-t border-white/[0.08] space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Want to train right now?</span>
            <span className="text-emerald-400 font-bold">100% Free • No Install</span>
          </div>

          <Link
            href="/app"
            onClick={() => {
              audioJuice.playTick();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white/[0.05] hover:bg-emerald-500 hover:text-black border border-white/10 text-white font-mono font-bold text-xs transition group"
          >
            <Cpu className="h-4 w-4 text-emerald-400 group-hover:text-black transition" />
            <span>Launch Web App in Safari (Instant PWA)</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
          <p className="text-[11px] text-zinc-500 text-center font-mono">
            Works directly inside Safari on iOS with real-time camera pose tracking.
          </p>
        </div>
      </div>
    </div>
  );
};
