'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Camera,
  Activity,
  Dna,
  Calendar,
  CheckCircle2,
  Shield,
  Zap,
} from 'lucide-react';

interface ProProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProProtocolModal: React.FC<ProProtocolModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
    }
  };

  const proFeatures = [
    {
      icon: Camera,
      title: 'COMPUTER VISION JOINT CADENCE',
      desc: 'Position your device camera. Our 60 FPS neural vision tracks hip/elbow angles, concentric velocity (m/s), and signals instant form breakdown cues in real-time.',
      badge: 'VISION AI v2.4',
    },
    {
      icon: Activity,
      title: 'HRV & CENTRAL NERVOUS SYSTEM SYNC',
      desc: 'Seamlessly pulls rMSSD HRV & sleep architecture from Whoop, Apple Watch, or Garmin to auto-tune daily volume before you even lace up your shoes.',
      badge: 'BIOMETRIC OS',
    },
    {
      icon: Dna,
      title: 'DYNAMIC MACRO & OSMOLALITY CYCLING',
      desc: 'Auto-calculates intra-workout sodium, potassium, and cluster dextrin ratios according to temperature, session intensity, and sweat rate.',
      badge: 'PRECISION FUEL',
    },
    {
      icon: Calendar,
      title: '12-WEEK PERIODIZED MESOCYCLES',
      desc: 'Auto-regulates volume accumulation, intensification, and deload weeks based on your actual logged reps and estimated 1RM progression.',
      badge: 'PERIODIZATION',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#a3e635]/40 bg-[#0F1420] p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 h-28 w-28 bg-[#a3e635]/10 rounded-bl-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-[#070A11] text-slate-400 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a3e635] text-black">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-black uppercase tracking-wider text-white">
                VECTR <span className="text-[#a3e635]">//</span> PRO PROTOCOL
              </span>
              <span className="rounded bg-[#a3e635]/20 border border-[#a3e635]/50 px-2 py-0.5 font-mono text-[10px] font-bold text-[#a3e635]">
                NEXT-GEN ATHLETICS
              </span>
            </div>
            <p className="font-mono text-xs text-slate-400">
              Elite hardware-accelerated coaching engine for serious competitors.
            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {proFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#070A11] p-3.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-4 w-4 text-[#a3e635]" />
                    <span className="font-mono text-[9px] font-bold text-[#38bdf8] bg-[#38bdf8]/10 px-1.5 py-0.5 rounded">
                      {feat.badge}
                    </span>
                  </div>
                  <h4 className="font-display text-xs font-bold uppercase text-white">
                    {feat.title}
                  </h4>
                  <p className="mt-1 font-sans text-[11px] leading-relaxed text-slate-400">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Waitlist / Early Access Form */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-[#070A11] p-4 text-center">
          {isSubscribed ? (
            <div className="flex flex-col items-center gap-1.5 py-2">
              <CheckCircle2 className="h-6 w-6 text-[#a3e635]" />
              <span className="font-display text-sm font-bold text-white">
                EARLY ACCESS VIP ACCESS CONFIRMED
              </span>
              <p className="font-mono text-xs text-slate-400">
                You are on the priority list. You will receive Beta access credentials shortly.
              </p>
            </div>
          ) : (
            <div>
              <div className="font-display text-xs font-bold uppercase text-slate-300">
                REQUEST VECTR PRO PRIVATE BETA INVITATION
              </div>
              <form onSubmit={handleSubmit} className="mt-3 flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="athlete@vectrfit.io"
                  required
                  className="flex-1 rounded-lg border border-slate-700 bg-[#0F1420] px-3 py-2 font-mono text-xs text-white placeholder-slate-500 focus:border-[#a3e635] focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#a3e635] px-4 py-2 font-display text-xs font-black uppercase tracking-wider text-black transition hover:bg-[#b5f548] active:scale-95"
                >
                  [ UNLOCK PRO ACCESS ]
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

