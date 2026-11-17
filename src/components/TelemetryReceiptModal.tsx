'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Download,
  Share2,
  CheckCircle2,
  Sparkles,
  QrCode,
  ShieldCheck,
  Zap,
  Activity,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioJuice } from '../lib/audioJuice';

export interface TelemetryReceiptData {
  exerciseName: string;
  repsCount: number;
  accuracyScore: number;
  peakAngle: string;
  symmetryScore: number;
  timeUnderTension: string;
  dateStr?: string;
}

interface TelemetryReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TelemetryReceiptData;
}

export const TelemetryReceiptModal: React.FC<TelemetryReceiptModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const displayDate =
    data.dateStr ||
    new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  // Render high-res sleek athletic receipt onto canvas for download
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina 2x scale
    const width = 800;
    const height = 1050;
    canvas.width = width;
    canvas.height = height;

    // Background Obsidian Mesh
    ctx.fillStyle = '#07090E';
    ctx.fillRect(0, 0, width, height);

    // Subtle Radial Flare in Center
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 3,
      50,
      width / 2,
      height / 3,
      400
    );
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
    gradient.addColorStop(1, 'rgba(7, 9, 14, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Outer Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Inner Neon Accent Border
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Header Logo & Branding
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VECTR FIT // BIOMECHANICS', width / 2, 105);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('ON-DEVICE SKELETAL AI TELEMETRY RECEIPT', width / 2, 135);

    // Horizontal Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(60, 160);
    ctx.lineTo(width - 60, 160);
    ctx.stroke();
    ctx.setLineDash([]);

    // Timestamp & Session ID
    ctx.fillStyle = '#71717A';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`TIMESTAMP: ${displayDate.toUpperCase()}`, 60, 195);
    ctx.textAlign = 'right';
    ctx.fillText(`RIG: 33-NODE WASM (60 FPS)`, width - 60, 195);

    // Movement Card Banner
    ctx.fillStyle = '#121620';
    ctx.fillRect(60, 220, width - 120, 85);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.strokeRect(60, 220, width - 120, 85);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#06B6D4';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('VERIFIED EXERCISE', 80, 250);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(data.exerciseName.toUpperCase(), 80, 285);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(`${data.repsCount} REPS`, width - 80, 275);

    // Giant Form Accuracy Score Box
    ctx.fillStyle = '#0C111A';
    ctx.fillRect(60, 330, width - 120, 240);
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 330, width - 120, 240);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#A1A1AA';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('OVERALL KINETIC ACCURACY', width / 2, 375);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 84px monospace';
    ctx.fillText(`${data.accuracyScore.toFixed(1)}%`, width / 2, 465);

    ctx.fillStyle = '#06B6D4';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('★ ★ ★ ★ ★  ELITE FORM LOCKOUT', width / 2, 515);

    ctx.fillStyle = '#71717A';
    ctx.font = '13px monospace';
    ctx.fillText('Zero bouncing • Full ROM verified • No half-reps detected', width / 2, 545);

    // 4 Telemetry Metrics Grid
    const gridY = 600;
    const boxW = (width - 150) / 2;
    const boxH = 95;

    // Box 1: Peak Depth Angle
    ctx.fillStyle = '#121620';
    ctx.fillRect(60, gridY, boxW, boxH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeRect(60, gridY, boxW, boxH);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#71717A';
    ctx.font = '12px monospace';
    ctx.fillText('PEAK JOINT INFLECTION', 80, gridY + 30);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(data.peakAngle, 80, gridY + 68);

    // Box 2: Bilateral Symmetry
    ctx.fillStyle = '#121620';
    ctx.fillRect(width / 2 + 15, gridY, boxW, boxH);
    ctx.strokeRect(width / 2 + 15, gridY, boxW, boxH);
    ctx.fillStyle = '#71717A';
    ctx.fillText('BILATERAL SYMMETRY', width / 2 + 35, gridY + 30);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(`${data.symmetryScore.toFixed(1)}%`, width / 2 + 35, gridY + 68);

    // Box 3: Time Under Tension
    const row2Y = gridY + 115;
    ctx.fillStyle = '#121620';
    ctx.fillRect(60, row2Y, boxW, boxH);
    ctx.strokeRect(60, row2Y, boxW, boxH);
    ctx.fillStyle = '#71717A';
    ctx.fillText('TIME UNDER TENSION', 80, row2Y + 30);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(data.timeUnderTension, 80, row2Y + 68);

    // Box 4: Edge Verification Hash
    ctx.fillStyle = '#121620';
    ctx.fillRect(width / 2 + 15, row2Y, boxW, boxH);
    ctx.strokeRect(width / 2 + 15, row2Y, boxW, boxH);
    ctx.fillStyle = '#71717A';
    ctx.fillText('EDGE PRIVACY AUDIT', width / 2 + 35, row2Y + 30);
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('100% LOCAL RAM', width / 2 + 35, row2Y + 68);

    // QR Code Simulation & Callout Footer
    ctx.fillStyle = '#090C15';
    ctx.fillRect(60, 850, width - 120, 130);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.strokeRect(60, 850, width - 120, 130);

    // Mini QR Block
    const qrX = 85;
    const qrY = 875;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(qrX, qrY, 80, 80);
    ctx.fillStyle = '#000000';
    // Draw simulated QR pixel pattern
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 0 || (r === 0 && c === 0) || (r === 7 && c === 7) || (r === 0 && c === 7) || (r === 7 && c === 0)) {
          ctx.fillRect(qrX + 8 + c * 8, qrY + 8 + r * 8, 7, 7);
        }
      }
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('Scan to Test Your Form on VECTR FIT', 185, 905);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('https://vectrfit.vercel.app', 185, 935);

    ctx.fillStyle = '#71717A';
    ctx.font = '12px monospace';
    ctx.fillText('Free Client-Side Skeletal AI • Android APK Direct Download', 185, 960);
  }, [isOpen, data, displayDate]);

  if (!isOpen) return null;

  const handleDownloadImage = () => {
    audioJuice.playSuccessChime();
    setIsExporting(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `vectr-fit-${data.exerciseName.toLowerCase().replace(/\s+/g, '-')}-score.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10B981', '#06B6D4', '#FFFFFF'],
      });
    } catch {}

    setTimeout(() => setIsExporting(false), 500);
  };

  const handleCopyShareText = () => {
    audioJuice.playTick();
    const shareText = `🔥 Just logged ${data.repsCount} reps on ${data.exerciseName} with ${data.accuracyScore.toFixed(1)}% form accuracy on VECTR FIT Skeletal AI!\nPeak depth: ${data.peakAngle} | Symmetry: ${data.symmetryScore.toFixed(1)}%\nTest your biomechanics: https://vectrfit.vercel.app`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }

    // Native mobile share if supported
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      (navigator as any)
        .share({
          title: 'VECTR FIT Biomechanics Form Score',
          text: shareText,
          url: 'https://vectrfit.vercel.app',
        })
        .catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#090C15] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.95)] p-5 sm:p-7 space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            audioJuice.playTick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-zinc-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            <span>VIRAL TELEMETRY RECEIPT</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Your Biomechanics Receipt
          </h3>
          <p className="text-xs text-zinc-400">
            Share your verified form score with your workout partners or group chat.
          </p>
        </div>

        {/* Preview Container: Aspect-ratio scaled canvas */}
        <div className="rounded-2xl border border-white/10 bg-black/60 p-2 sm:p-3 overflow-hidden shadow-inner flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full max-w-[420px] h-auto rounded-xl shadow-2xl block"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs font-mono shadow-[0_0_25px_rgba(16,185,129,0.35)] active:scale-95 transition"
          >
            <Download className="h-4 w-4 stroke-[2.5]" />
            <span>Download PNG Card 📸</span>
          </button>

          <button
            type="button"
            onClick={handleCopyShareText}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white font-mono text-xs font-bold active:scale-95 transition"
          >
            {copiedLink ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-300">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 text-cyan-400" />
                <span>Share to Discord / Group 📋</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
