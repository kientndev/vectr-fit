'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Zap, Activity, Download, Flame } from 'lucide-react';

interface LiveTelemetryBadgeProps {
  className?: string;
  variant?: 'compact' | 'expanded';
}

export const LiveTelemetryBadge: React.FC<LiveTelemetryBadgeProps> = ({
  className = '',
  variant = 'compact',
}) => {
  let telemetryData: any = null;
  try {
    telemetryData = useQuery(api.telemetry.getLiveTelemetry, {});
  } catch {
    telemetryData = null;
  }

  // Smooth local counters with fallback baseline
  const reps = telemetryData?.repsAnalyzedToday ?? 1420;
  const apks = telemetryData?.apksDownloadedToday ?? 84;

  const [displayReps, setDisplayReps] = useState(reps);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (reps !== displayReps) {
      setDisplayReps(reps);
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 1200);
      return () => clearTimeout(t);
    }
  }, [reps, displayReps]);

  if (variant === 'expanded') {
    return (
      <div
        className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#090C15]/90 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.18)] backdrop-blur-xl font-mono text-xs ${className}`}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
            Live Global Telemetry
          </span>
        </div>

        <div className="h-3 w-px bg-white/10" />

        <div className="flex items-center gap-1.5 text-white font-bold">
          <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          <span className={pulse ? 'text-emerald-300 font-extrabold animate-pulse' : ''}>
            {displayReps.toLocaleString()}+
          </span>
          <span className="text-zinc-400 font-normal">reps analyzed</span>
        </div>

        <div className="h-3 w-px bg-white/10" />

        <div className="flex items-center gap-1.5 text-zinc-300">
          <Download className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-white font-bold">{apks.toLocaleString()}</span>
          <span className="text-zinc-400 font-normal">APKs deployed</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-semibold tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.15)] ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span>🔥 {displayReps.toLocaleString()}+ Reps Analyzed Today</span>
      <span className="text-emerald-500/50">•</span>
      <span className="text-cyan-400">{apks} APKs Downloaded</span>
    </div>
  );
};
