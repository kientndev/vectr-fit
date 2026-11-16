'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  calculateAngle,
  evaluateExerciseForm,
  RepCounterEngine,
  ExerciseType,
  FormEvaluation,
  JointAngles,
  Point2D,
  ACCENT_COLORS,
} from '../lib/biomechanics';
import { audioJuice } from '../lib/audioJuice';
import {
  Activity,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Camera,
  Film,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  Download,
  Info,
} from 'lucide-react';

interface BiomechanicsArenaProps {
  onOpenDownloadModal: () => void;
}

export const BiomechanicsArena: React.FC<BiomechanicsArenaProps> = ({ onOpenDownloadModal }) => {
  // Arena State
  const [activeTab, setActiveTab] = useState<'sandbox' | 'webcam' | 'sample'>('sandbox');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>('squat');
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Sandbox Controls
  const [depthPercent, setDepthPercent] = useState<number>(15); // 0 (Lockout) to 100 (Deep)
  const [torsoLeanDeg, setTorsoLeanDeg] = useState<number>(8); // -10° to 45°
  const [autoSimulate, setAutoSimulate] = useState<boolean>(false);
  const [simulateBadForm, setSimulateBadForm] = useState<boolean>(false);

  // Telemetry Readouts
  const [angles, setAngles] = useState<JointAngles>({
    kneeAngle: 165,
    hipAngle: 168,
    torsoAngle: 8,
    elbowAngle: 165,
    shoulderAngle: 90,
  });

  const [evaluation, setEvaluation] = useState<FormEvaluation>({
    status: 'OPTIMAL',
    score: 96,
    isTargetDepth: false,
    isLockout: true,
    jointColors: {
      knee: ACCENT_COLORS.optimal,
      hip: ACCENT_COLORS.neutral,
      elbow: ACCENT_COLORS.dim,
      spine: ACCENT_COLORS.optimal,
      shoulder: ACCENT_COLORS.neutral,
    },
    coachCue: 'Ready. Descend with weight through heels.',
    subCue: 'Spine neutral and braced.',
  });

  // Rep Machine & Feed
  const [repCount, setRepCount] = useState<number>(0);
  const [repPopAnimation, setRepPopAnimation] = useState<boolean>(false);
  const [screenFlash, setScreenFlash] = useState<boolean>(false);
  const [coachFeed, setCoachFeed] = useState<Array<{ id: number; time: string; text: string; type: 'success' | 'warn' | 'info' }>>([
    { id: 1, time: '00:01.2', text: '⚡ VECTR Biomechanics Engine v2.4 initialized', type: 'info' },
    { id: 2, time: '00:02.0', text: '🎯 33-point skeletal tracking online at 60 FPS', type: 'info' },
  ]);

  // Zeigarnik Conversion Hook Trigger (after 3 reps or 8 seconds interactive exploration)
  const [showZeigarnikHook, setShowZeigarnikHook] = useState(false);
  const userInteractionTimeRef = useRef<number>(Date.now());

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [isWasmLoading, setIsWasmLoading] = useState<boolean>(false);

  // Rep Counter Engine Ref
  const repEngineRef = useRef<RepCounterEngine | null>(null);

  // Initialize Rep Engine
  useEffect(() => {
    repEngineRef.current = new RepCounterEngine(
      selectedExercise,
      (newCount, durationMs, avgScore) => {
        setRepCount(newCount);
        setRepPopAnimation(true);
        setScreenFlash(true);
        audioJuice.playRepBeep();

        setTimeout(() => setRepPopAnimation(false), 450);
        setTimeout(() => setScreenFlash(false), 300);

        const timeStr = `${Math.floor((durationMs / 1000) * 10) / 10}s`;
        setCoachFeed(prev => [
          {
            id: Date.now(),
            time: `+${timeStr}`,
            text: `🔥 REP ${newCount} LOCKED IN! (${avgScore}% Form Accuracy)`,
            type: 'success',
          },
          ...prev.slice(0, 6),
        ]);

        // Zeigarnik trigger: 3 reps reached
        if (newCount >= 3) {
          setShowZeigarnikHook(true);
        }
      },
      (phase) => {
        if (phase === 'BOTTOM_HOLD') {
          audioJuice.playSuccessChime();
        }
      }
    );
  }, [selectedExercise]);

  // Track user interactive engagement for Zeigarnik effect (8 seconds threshold)
  useEffect(() => {
    const timer = setInterval(() => {
      if (Date.now() - userInteractionTimeRef.current >= 8000 && !showZeigarnikHook) {
        setShowZeigarnikHook(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [showZeigarnikHook]);

  // Handle Exercise Change
  const handleSelectExercise = (ex: ExerciseType) => {
    audioJuice.playTick();
    setSelectedExercise(ex);
    setRepCount(0);
    setDepthPercent(ex === 'pushup' ? 10 : ex === 'curl' ? 10 : 15);
    if (repEngineRef.current) {
      repEngineRef.current.setExercise(ex);
    }
  };

  // Toggle Sound
  const handleToggleMute = () => {
    const muted = audioJuice.toggleMute();
    setIsAudioMuted(muted);
    if (!muted) audioJuice.playTick();
  };

  // --------------------------------------------------------------------------
  // MODE A: Interactive Kinematic Rig Sandbox Math & Drawing Loop
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'sandbox' && activeTab !== 'sample') return;

    let animId: number;
    let t = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear with dark obsidian background
      ctx.fillStyle = '#07090E';
      ctx.fillRect(0, 0, width, height);

      // Draw Perspective Cyberpunk Grid
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;

      // Horizontal ground plane
      const horizonY = height * 0.78;
      for (let y = horizonY; y < height; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vanishing point perspective lines
      const vanishingX = width * 0.5;
      for (let x = -width * 0.4; x <= width * 1.4; x += 45) {
        ctx.beginPath();
        ctx.moveTo(vanishingX, horizonY - 40);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      ctx.restore();

      // Auto-simulate physics progression
      let currentDepth = depthPercent;
      let currentLean = torsoLeanDeg;

      if (autoSimulate || activeTab === 'sample') {
        t += 0.024;
        // Smooth sine wave: 0% to 100% and back
        const cycle = (Math.sin(t) + 1) / 2; // 0 to 1
        currentDepth = cycle * 100;
        setDepthPercent(Math.round(currentDepth));

        if (simulateBadForm) {
          // Add excessive forward torso lean or knee cave
          currentLean = 10 + cycle * 38;
          setTorsoLeanDeg(Math.round(currentLean));
        } else {
          currentLean = 6 + cycle * 12;
          setTorsoLeanDeg(Math.round(currentLean));
        }
      }

      // Calculate kinematic joint positions based on exercise
      const calculatedAngles = calculateRigAngles(selectedExercise, currentDepth, currentLean);
      setAngles(calculatedAngles);

      // Evaluate form
      const evalResult = evaluateExerciseForm(selectedExercise, calculatedAngles);
      setEvaluation(evalResult);

      // Update rep engine
      if (repEngineRef.current) {
        repEngineRef.current.update(calculatedAngles, evalResult.score);
      }

      // Draw Rig
      drawRig(ctx, width, height, selectedExercise, currentDepth, currentLean, evalResult);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeTab, selectedExercise, depthPercent, torsoLeanDeg, autoSimulate, simulateBadForm]);

  // Compute Rig Angles
  const calculateRigAngles = (
    exercise: ExerciseType,
    depth: number,
    lean: number
  ): JointAngles => {
    const fraction = depth / 100;

    if (exercise === 'squat') {
      // Depth 0% -> 170° knee, Depth 100% -> 80° knee
      const kneeAngle = Math.round(170 - fraction * 90);
      const hipAngle = Math.round(168 - fraction * 85 - lean * 0.5);
      const torsoAngle = Math.round(lean);
      return { kneeAngle, hipAngle, torsoAngle, elbowAngle: 165, shoulderAngle: 85 };
    }

    if (exercise === 'pushup') {
      // Depth 0% -> 165° elbow, Depth 100% -> 75° elbow
      const elbowAngle = Math.round(165 - fraction * 90);
      const hipAngle = Math.round(simulateBadForm ? 140 : 172); // hip sag if bad form
      const torsoAngle = Math.round(fraction * 6);
      return { kneeAngle: 175, hipAngle, torsoAngle, elbowAngle, shoulderAngle: 90 };
    }

    // Bicep Curl
    // Depth 0% -> 165° elbow, Depth 100% -> 48° elbow
    const elbowAngle = Math.round(165 - fraction * 115);
    const torsoAngle = Math.round(simulateBadForm ? lean + 16 : lean);
    return { kneeAngle: 175, hipAngle: 175, torsoAngle, elbowAngle, shoulderAngle: 90 };
  };

  // Draw 2D Articulated Rig
  const drawRig = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    exercise: ExerciseType,
    depth: number,
    lean: number,
    evalResult: FormEvaluation
  ) => {
    ctx.save();
    const fraction = depth / 100;
    const groundY = height * 0.78;
    const centerX = width * 0.5;

    if (exercise === 'squat') {
      // Squat Rig Coordinates
      const footX = centerX;
      const footY = groundY;
      const ankleX = footX;
      const ankleY = footY - 15;

      const shinLen = 95;
      const thighLen = 100;
      const torsoLen = 110;

      // Knee moves forward slightly as hip sinks back and down
      const kneeX = ankleX + Math.sin(fraction * 0.45) * 45;
      const kneeY = ankleY - Math.cos(fraction * 0.45) * shinLen;

      const hipDrop = fraction * 85;
      const hipX = kneeX - Math.sin(fraction * 0.95 + 0.3) * thighLen;
      const hipY = kneeY - Math.cos(fraction * 0.95 + 0.3) * thighLen + hipDrop * 0.4;

      const leanRad = (lean * Math.PI) / 180;
      const shoulderX = hipX + Math.sin(leanRad) * torsoLen;
      const shoulderY = hipY - Math.cos(leanRad) * torsoLen;

      const headX = shoulderX + Math.sin(leanRad * 0.6) * 36;
      const headY = shoulderY - Math.cos(leanRad * 0.6) * 36;

      // Arms holding barbell / hands forward
      const elbowX = shoulderX + 35;
      const elbowY = shoulderY + 30;
      const wristX = shoulderX + 45;
      const wristY = shoulderY + 10;

      // Draw vector ground line
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 120, groundY);
      ctx.lineTo(centerX + 120, groundY);
      ctx.stroke();

      // Draw Center of Mass plumb line
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(shoulderX, headY - 10);
      ctx.lineTo(shoulderX, groundY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Bones
      drawBone(ctx, ankleX, ankleY, footX, footY, ACCENT_COLORS.dim);
      drawBone(ctx, ankleX, ankleY, kneeX, kneeY, evalResult.jointColors.knee);
      drawBone(ctx, kneeX, kneeY, hipX, hipY, evalResult.jointColors.knee);
      drawBone(ctx, hipX, hipY, shoulderX, shoulderY, evalResult.jointColors.spine);
      drawBone(ctx, shoulderX, shoulderY, elbowX, elbowY, ACCENT_COLORS.neutral);
      drawBone(ctx, elbowX, elbowY, wristX, wristY, ACCENT_COLORS.neutral);

      // Draw Radial Angle Arc at Knee
      drawAngleArc(
        ctx,
        kneeX,
        kneeY,
        ankleX,
        ankleY,
        hipX,
        hipY,
        evalResult.jointColors.knee,
        `${angles.kneeAngle}°`
      );

      // Draw Head
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = ACCENT_COLORS.optimal;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(headX, headY, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw Joints
      drawJointNode(ctx, ankleX, ankleY, ACCENT_COLORS.neutral);
      drawJointNode(ctx, kneeX, kneeY, evalResult.jointColors.knee, true);
      drawJointNode(ctx, hipX, hipY, evalResult.jointColors.hip, true);
      drawJointNode(ctx, shoulderX, shoulderY, ACCENT_COLORS.neutral);
    } else if (exercise === 'pushup') {
      // Push-Up Rig Coordinates (Horizontal Plank)
      const footX = centerX - 140;
      const footY = groundY - 20;

      const hipX = footX + 110;
      const hipSag = simulateBadForm ? 35 : 0;
      const hipY = footY - 15 + hipSag;

      const shoulderX = hipX + 105;
      const shoulderY = groundY - 100 + fraction * 60; // chest lowers

      const headX = shoulderX + 28;
      const headY = shoulderY - 8;

      // Wrist firmly on ground under shoulder
      const wristX = shoulderX - 10;
      const wristY = groundY;

      // Elbow flares back and bends as chest drops
      const elbowX = (shoulderX + wristX) / 2 - 25 - fraction * 20;
      const elbowY = (shoulderY + wristY) / 2 - 20 + fraction * 10;

      // Draw ground
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 180, groundY);
      ctx.lineTo(centerX + 180, groundY);
      ctx.stroke();

      // Draw Bones
      drawBone(ctx, footX, footY, hipX, hipY, ACCENT_COLORS.neutral);
      drawBone(ctx, hipX, hipY, shoulderX, shoulderY, evalResult.jointColors.spine);
      drawBone(ctx, shoulderX, shoulderY, elbowX, elbowY, evalResult.jointColors.elbow);
      drawBone(ctx, elbowX, elbowY, wristX, wristY, evalResult.jointColors.elbow);

      // Draw Radial Angle Arc at Elbow
      drawAngleArc(
        ctx,
        elbowX,
        elbowY,
        shoulderX,
        shoulderY,
        wristX,
        wristY,
        evalResult.jointColors.elbow,
        `${angles.elbowAngle}°`
      );

      // Draw Head
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = ACCENT_COLORS.optimal;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(headX, headY, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw Joints
      drawJointNode(ctx, footX, footY, ACCENT_COLORS.neutral);
      drawJointNode(ctx, hipX, hipY, evalResult.jointColors.hip, true);
      drawJointNode(ctx, shoulderX, shoulderY, ACCENT_COLORS.neutral);
      drawJointNode(ctx, elbowX, elbowY, evalResult.jointColors.elbow, true);
      drawJointNode(ctx, wristX, wristY, ACCENT_COLORS.neutral);
    } else {
      // Bicep Curl Rig (Standing)
      const footX = centerX;
      const footY = groundY;

      const hipX = centerX;
      const hipY = groundY - 140;

      const leanRad = (lean * Math.PI) / 180;
      const shoulderX = hipX + Math.sin(leanRad) * 110;
      const shoulderY = hipY - Math.cos(leanRad) * 110;

      const headX = shoulderX + Math.sin(leanRad * 0.5) * 32;
      const headY = shoulderY - Math.cos(leanRad * 0.5) * 32;

      // Upper arm hangs down
      const elbowX = shoulderX + 8;
      const elbowY = shoulderY + 80;

      // Forearm curls up
      const curlRad = ((165 - angles.elbowAngle) * Math.PI) / 180;
      const wristX = elbowX + Math.sin(curlRad) * 75;
      const wristY = elbowY - Math.cos(curlRad) * 75;

      // Draw ground
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 80, groundY);
      ctx.lineTo(centerX + 80, groundY);
      ctx.stroke();

      // Draw Bones
      drawBone(ctx, footX, footY, hipX, hipY, ACCENT_COLORS.neutral);
      drawBone(ctx, hipX, hipY, shoulderX, shoulderY, evalResult.jointColors.spine);
      drawBone(ctx, shoulderX, shoulderY, elbowX, elbowY, ACCENT_COLORS.neutral);
      drawBone(ctx, elbowX, elbowY, wristX, wristY, evalResult.jointColors.elbow);

      // Draw Radial Angle Arc at Elbow
      drawAngleArc(
        ctx,
        elbowX,
        elbowY,
        shoulderX,
        shoulderY,
        wristX,
        wristY,
        evalResult.jointColors.elbow,
        `${angles.elbowAngle}°`
      );

      // Draw Head
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = ACCENT_COLORS.optimal;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(headX, headY, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw Joints
      drawJointNode(ctx, footX, footY, ACCENT_COLORS.neutral);
      drawJointNode(ctx, hipX, hipY, ACCENT_COLORS.neutral);
      drawJointNode(ctx, shoulderX, shoulderY, ACCENT_COLORS.neutral);
      drawJointNode(ctx, elbowX, elbowY, evalResult.jointColors.elbow, true);
      drawJointNode(ctx, wristX, wristY, ACCENT_COLORS.optimal);
    }

    ctx.restore();
  };

  // Helper: Draw Glowing Bone
  const drawBone = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string
  ) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  };

  // Helper: Draw Joint Node
  const drawJointNode = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    isPulsing = false
  ) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = isPulsing ? 18 : 8;

    ctx.beginPath();
    ctx.arc(x, y, isPulsing ? 7 : 5, 0, Math.PI * 2);
    ctx.fill();

    // Subtle outer ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, isPulsing ? 12 : 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  // Helper: Draw Radial Angle Arc & Degree Badge
  const drawAngleArc = (
    ctx: CanvasRenderingContext2D,
    vx: number,
    vy: number,
    p1x: number,
    p1y: number,
    p2x: number,
    p2y: number,
    color: string,
    label: string
  ) => {
    ctx.save();
    const r = 38;
    const a1 = Math.atan2(p1y - vy, p1x - vx);
    const a2 = Math.atan2(p2y - vy, p2x - vx);

    // Arc fill
    ctx.fillStyle = `${color}25`;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.arc(vx, vy, r, a1, a2, false);
    ctx.closePath();
    ctx.fill();

    // Arc stroke
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(vx, vy, r, a1, a2, false);
    ctx.stroke();

    // Degree Badge
    const midAngle = (a1 + a2) / 2;
    const labelX = vx + Math.cos(midAngle) * (r + 24);
    const labelY = vy + Math.sin(midAngle) * (r + 24);

    ctx.fillStyle = '#07090E';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(labelX - 22, labelY - 11, 44, 22, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, labelX, labelY);
    ctx.restore();
  };

  // --------------------------------------------------------------------------
  // MODE B: Live Webcam AI via @mediapipe/tasks-vision
  // --------------------------------------------------------------------------
  const startWebcamMode = async () => {
    setActiveTab('webcam');
    setWebcamError(null);
    setIsWasmLoading(true);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Webcam not supported in this environment');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });

      webcamStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Dynamically load MediaPipe tasks-vision on demand
      const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });

      setIsWasmLoading(false);

      // Run real-time detection loop
      let animId: number;
      const detectFrame = () => {
        if (!videoRef.current || !canvasRef.current || videoRef.current.readyState < 2) {
          animId = requestAnimationFrame(detectFrame);
          return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const results = landmarker.detectForVideo(video, performance.now());

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results && results.landmarks && results.landmarks.length > 0) {
          const lm = results.landmarks[0];
          // Landmark trigonometry: Hip 23/24, Knee 25/26, Ankle 27/28
          const kneeDeg = calculateAngle(lm[23], lm[25], lm[27]);
          const hipDeg = calculateAngle(lm[11], lm[23], lm[25]);
          const elbowDeg = calculateAngle(lm[11], lm[13], lm[15]);

          const liveAngles: JointAngles = {
            kneeAngle: kneeDeg,
            hipAngle: hipDeg,
            torsoAngle: 10,
            elbowAngle: elbowDeg,
            shoulderAngle: 90,
          };
          setAngles(liveAngles);

          const evalRes = evaluateExerciseForm(selectedExercise, liveAngles);
          setEvaluation(evalRes);

          if (repEngineRef.current) {
            repEngineRef.current.update(liveAngles, evalRes.score);
          }

          // Draw skeleton on canvas
          ctx.save();
          ctx.strokeStyle = evalRes.status === 'OPTIMAL' ? ACCENT_COLORS.optimal : ACCENT_COLORS.critical;
          ctx.lineWidth = 4;
          lm.forEach((pt: any) => {
            ctx.fillStyle = ACCENT_COLORS.optimal;
            ctx.beginPath();
            ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 4, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        }

        animId = requestAnimationFrame(detectFrame);
      };

      animId = requestAnimationFrame(detectFrame);
    } catch (err: any) {
      console.warn('Webcam initiation fallback:', err);
      setWebcamError('Camera permission not granted or device camera unavailable. Switched to Kinematic Sandbox.');
      setIsWasmLoading(false);
      setActiveTab('sandbox');
    }
  };

  const stopWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach(track => track.stop());
      webcamStreamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  return (
    <div
      id="arena"
      className={`relative rounded-3xl bg-[#090C14] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-300 ${
        screenFlash ? 'ring-2 ring-emerald-400/80 shadow-[0_0_80px_rgba(16,185,129,0.4)]' : ''
      }`}
    >
      {/* Arena Header Deck */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 border-b border-white/[0.08] bg-black/40">
        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <button
            type="button"
            onClick={() => {
              audioJuice.playTick();
              stopWebcam();
              setActiveTab('sandbox');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'sandbox'
                ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Kinematic Sandbox</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioJuice.playTick();
              startWebcamMode();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'webcam'
                ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Live Webcam AI</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioJuice.playTick();
              stopWebcam();
              setActiveTab('sample');
              setAutoSimulate(true);
            }}
            className={`hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'sample'
                ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Film className="h-3.5 w-3.5" />
            <span>Pre-Loaded Athlete</span>
          </button>
        </div>

        {/* Audio Mute & Tactical HUD FPS Indicator */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 bg-white/[0.03] border border-white/[0.08] px-2.5 py-1 rounded-lg">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-200 font-bold">60.2 FPS</span>
            <span className="text-zinc-600">|</span>
            <span className="text-cyan-400 font-bold">12ms LATENCY</span>
          </div>

          <button
            type="button"
            onClick={handleToggleMute}
            title={isAudioMuted ? 'Unmute tactical audio' : 'Mute audio'}
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-400 hover:text-white transition"
          >
            {isAudioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Arena Workspace (Grid: Viewport + Telemetry Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left / Center Viewport (Canvas / Video) */}
        <div className="lg:col-span-8 relative min-h-[380px] sm:min-h-[440px] flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-[#07090E] to-[#0A0D17]">
          {/* Top Viewport Floating Badges */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 font-mono text-[11px] text-zinc-300 flex items-center gap-1.5">
                <span className="text-emerald-400">●</span> {selectedExercise.toUpperCase()} ENGINE
              </span>
              <span
                className={`px-2.5 py-1 rounded-md backdrop-blur-md font-mono text-[11px] font-bold border transition-colors ${
                  evaluation.status === 'OPTIMAL'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : evaluation.status === 'WARNING'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}
              >
                {evaluation.status}
              </span>
            </div>

            {/* Target Depth Status Pill */}
            <div className="font-mono text-[11px]">
              {evaluation.isTargetDepth ? (
                <span className="px-2 py-1 rounded bg-emerald-500 text-black font-extrabold flex items-center gap-1 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                  <Zap className="h-3 w-3 fill-black" /> DEPTH REACHED
                </span>
              ) : (
                <span className="px-2 py-1 rounded bg-white/[0.05] border border-white/10 text-zinc-400">
                  {selectedExercise === 'squat' ? 'TARGET: 90° PARALLEL' : 'TARGET: 90° INFLECTION'}
                </span>
              )}
            </div>
          </div>

          {/* HTML5 Canvas Viewport Feed */}
          <div className="relative flex-1 flex items-center justify-center my-3 overflow-hidden rounded-2xl border border-white/[0.05]">
            <canvas
              ref={canvasRef}
              width={640}
              height={440}
              className="w-full h-full max-h-[420px] object-contain select-none cursor-grab active:cursor-grabbing"
            />

            {/* Webcam hidden video element for MediaPipe stream */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`absolute inset-0 w-full h-full object-cover pointer-events-none scale-x-[-1] opacity-35 ${
                activeTab === 'webcam' ? 'block' : 'hidden'
              }`}
            />

            {isWasmLoading && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-20 font-mono">
                <div className="h-8 w-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-3" />
                <span className="text-xs text-white font-bold">LOADING CLIENT-SIDE MEDIAPIPE WASM...</span>
                <span className="text-[11px] text-zinc-400 mt-1">Zero cloud latency • Model loaded in local browser RAM</span>
              </div>
            )}

            {webcamError && (
              <div className="absolute top-4 left-4 right-4 bg-amber-500/20 border border-amber-500/40 p-3 rounded-xl font-mono text-xs text-amber-300 flex items-center gap-2 z-20">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{webcamError}</span>
              </div>
            )}
          </div>

          {/* Bottom Interactive Control Deck (Scrubbers & Simulation Toggles) */}
          <div className="z-10 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/[0.08] p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Depth Scrubber */}
              <div className="w-full sm:w-1/2 space-y-1">
                <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Sliders className="h-3 w-3 text-cyan-400" /> MOVEMENT DEPTH:
                  </span>
                  <span className="text-white font-bold">{depthPercent}% (Angle: {angles.kneeAngle}°)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={depthPercent}
                  onChange={(e) => {
                    audioJuice.playTick();
                    setAutoSimulate(false);
                    setDepthPercent(Number(e.target.value));
                    userInteractionTimeRef.current = Date.now();
                  }}
                  className="w-full h-2 rounded-lg bg-zinc-800 appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
                />
              </div>

              {/* Simulation Quick Toggles */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    audioJuice.playTick();
                    setSimulateBadForm(false);
                    setAutoSimulate(!autoSimulate);
                    userInteractionTimeRef.current = Date.now();
                  }}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold border transition ${
                    autoSimulate && !simulateBadForm
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-white/[0.04] text-zinc-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{autoSimulate && !simulateBadForm ? 'Pause Simulation' : 'Auto-Simulate Good Rep'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    audioJuice.playWarningBuzz();
                    setAutoSimulate(true);
                    setSimulateBadForm(!simulateBadForm);
                    userInteractionTimeRef.current = Date.now();
                  }}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold border transition ${
                    simulateBadForm
                      ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                      : 'bg-white/[0.04] text-zinc-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Simulate Bad Form</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Telemetry HUD Sidebar */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-white/[0.08] bg-[#0A0E18]/80 p-5 sm:p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* 1. Exercise Selector Pills */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-bold">
                SELECT ATHLETIC VECTOR
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/50 border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => handleSelectExercise('squat')}
                  className={`py-2 px-1 text-center rounded-lg text-xs font-mono font-bold transition ${
                    selectedExercise === 'squat'
                      ? 'bg-emerald-500 text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Squat
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectExercise('pushup')}
                  className={`py-2 px-1 text-center rounded-lg text-xs font-mono font-bold transition ${
                    selectedExercise === 'pushup'
                      ? 'bg-emerald-500 text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Push-Up
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectExercise('curl')}
                  className={`py-2 px-1 text-center rounded-lg text-xs font-mono font-bold transition ${
                    selectedExercise === 'curl'
                      ? 'bg-emerald-500 text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Bicep Curl
                </button>
              </div>
            </div>

            {/* 2. Giant Animated Rep Counter & Accuracy Gauge */}
            <div className="rounded-2xl bg-black/60 border border-white/[0.08] p-4 text-center relative overflow-hidden">
              <div className="absolute top-2 right-3 font-mono text-[9px] text-zinc-500 uppercase">
                HYSTERESIS GATE
              </div>
              <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-semibold">
                VALIDATED REPETITIONS
              </span>
              <div
                className={`font-mono text-5xl sm:text-6xl font-black text-white tracking-tight my-2 transition-transform duration-200 ${
                  repPopAnimation ? 'scale-125 text-emerald-400' : 'scale-100'
                }`}
              >
                {String(repCount).padStart(2, '0')}
              </div>

              {/* Accuracy Meter Bar */}
              <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-zinc-400">BIOMECHANICAL ACCURACY</span>
                  <span className="text-emerald-400 font-bold">{evaluation.score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${evaluation.score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Live Joint Telemetry Grid */}
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase">
                  {selectedExercise === 'squat' ? 'KNEE FLEXION' : 'ELBOW FLEXION'}
                </span>
                <div className="text-base font-bold text-white">
                  {selectedExercise === 'squat' ? `${angles.kneeAngle}°` : `${angles.elbowAngle}°`}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase">SPINE ALIGNMENT</span>
                <div className="text-base font-bold text-emerald-400">{angles.hipAngle}°</div>
              </div>
            </div>

            {/* 4. Terminal-Style AI Coach Log Feed */}
            <div className="rounded-2xl bg-black/70 border border-white/[0.08] p-3.5 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[10px] text-zinc-400">
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <Activity className="h-3 w-3" /> AI COACH DIRECTIVE
                </span>
                <span className="text-zinc-500">LIVE STREAM</span>
              </div>

              {/* Dynamic primary cue banner */}
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold leading-relaxed">
                {evaluation.coachCue}
              </div>

              {/* Scrolling history ticker */}
              <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                {coachFeed.map(feed => (
                  <div key={feed.id} className="text-[11px] text-zinc-400 flex items-start gap-1.5">
                    <span className="text-zinc-600 font-bold shrink-0">{feed.time}</span>
                    <span className={feed.type === 'success' ? 'text-emerald-400' : 'text-zinc-300'}>
                      {feed.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reset Stats Button */}
          <button
            type="button"
            onClick={() => {
              audioJuice.playTick();
              setRepCount(0);
              if (repEngineRef.current) repEngineRef.current.reset();
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white font-mono text-xs transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo Reps</span>
          </button>
        </div>
      </div>

      {/* STEP 4: The Zeigarnik Effect Slide-in Conversion Banner */}
      {showZeigarnikHook && (
        <div className="border-t border-emerald-500/30 bg-gradient-to-r from-emerald-950/90 via-[#07090E]/95 to-cyan-950/90 p-4 sm:p-5 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🔥 You just tested 1 of 40+ AI-tracked exercises</span>
              </h4>
              <p className="text-xs text-zinc-300 mt-0.5">
                Want 60 FPS full-body skeletal tracking, real-time voice coaching & custom workout splits in your pocket?
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              audioJuice.playSuccessChime();
              onOpenDownloadModal();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs font-mono shadow-[0_0_25px_rgba(16,185,129,0.5)] transition shrink-0 flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Get the Full Android App (.APK) — Free Early Access</span>
          </button>
        </div>
      )}
    </div>
  );
};
