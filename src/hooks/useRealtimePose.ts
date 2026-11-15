'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface PoseLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface JointAngleTelemetry {
  elbowAngle: number;
  leftElbowAngle: number;
  rightElbowAngle: number;
  shoulderAngle: number;
  hipSpineAngle: number;
  kneeAngle: number;
  leftKneeAngle: number;
  rightKneeAngle: number;
  isPoseDetected: boolean;
  landmarks: PoseLandmark[] | null;
}

// MediaPipe 33 Landmark Skeletal Bone Connections
export const POSE_CONNECTIONS: [number, number][] = [
  // Torso Box
  [11, 12],
  [11, 23],
  [12, 24],
  [23, 24],
  // Left Arm
  [11, 13],
  [13, 15],
  // Right Arm
  [12, 14],
  [14, 16],
  // Left Leg
  [23, 25],
  [25, 27],
  [27, 29],
  [29, 31],
  // Right Leg
  [24, 26],
  [26, 28],
  [28, 30],
  [30, 32],
  // Spine & Head Anchor
  [0, 11],
  [0, 12],
];

// 2D Trigonometric Angle Calculator (Degrees between vectors BA and BC)
export function calculateJointAngle(
  a: PoseLandmark,
  b: PoseLandmark,
  c: PoseLandmark
): number {
  if (!a || !b || !c) return 180;
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return Math.round(angle);
}

export function useRealtimePose(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const landmarkerRef = useRef<any>(null);
  const lastVideoTimeRef = useRef<number>(-1);

  // Initialize MediaPipe PoseLandmarker
  useEffect(() => {
    let isCancelled = false;

    async function initMediaPipe() {
      if (typeof window === 'undefined') return;

      try {
        setIsModelLoading(true);
        setModelError(null);

        const { FilesetResolver, PoseLandmarker } = await import(
          '@mediapipe/tasks-vision'
        );

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        if (isCancelled) return;

        // Try GPU delegate first, fallback to CPU if needed
        let landmarker: any = null;
        try {
          landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        } catch {
          landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        }

        if (!isCancelled) {
          landmarkerRef.current = landmarker;
          setIsModelLoading(false);
        }
      } catch (err: any) {
        console.warn('MediaPipe PoseLandmarker load notice (optical fallback active):', err);
        if (!isCancelled) {
          setModelError(err?.message || 'MediaPipe initialization fallback');
          setIsModelLoading(false);
        }
      }
    }

    initMediaPipe();

    return () => {
      isCancelled = true;
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch {}
        landmarkerRef.current = null;
      }
    };
  }, []);

  // Process a frame through PoseLandmarker and return angles
  const detectPose = useCallback((): JointAngleTelemetry | null => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !landmarker || video.readyState < 2) {
      return null;
    }

    if (video.currentTime === lastVideoTimeRef.current) {
      return null;
    }
    lastVideoTimeRef.current = video.currentTime;

    try {
      const startTimeMs = performance.now();
      const results = landmarker.detectForVideo(video, startTimeMs);

      if (!results || !results.landmarks || results.landmarks.length === 0) {
        return {
          elbowAngle: 175,
          leftElbowAngle: 175,
          rightElbowAngle: 175,
          shoulderAngle: 90,
          hipSpineAngle: 180,
          kneeAngle: 180,
          leftKneeAngle: 180,
          rightKneeAngle: 180,
          isPoseDetected: false,
          landmarks: null,
        };
      }

      const lm: PoseLandmark[] = results.landmarks[0];

      // Landmark indices according to MediaPipe standard:
      // 11: L Shoulder, 12: R Shoulder
      // 13: L Elbow,    14: R Elbow
      // 15: L Wrist,    16: R Wrist
      // 23: L Hip,      24: R Hip
      // 25: L Knee,     26: R Knee
      // 27: L Ankle,    28: R Ankle

      const lElbow = calculateJointAngle(lm[11], lm[13], lm[15]);
      const rElbow = calculateJointAngle(lm[12], lm[14], lm[16]);

      // Choose active arm by landmark visibility or max flexion
      const lElbowVis = lm[13]?.visibility ?? 0.8;
      const rElbowVis = lm[14]?.visibility ?? 0.8;
      const activeElbow = lElbowVis > rElbowVis ? lElbow : rElbow;

      // Shoulder angles (Hip -> Shoulder -> Elbow)
      const lShoulder = calculateJointAngle(lm[23], lm[11], lm[13]);
      const rShoulder = calculateJointAngle(lm[24], lm[12], lm[14]);
      const activeShoulder = lElbowVis > rElbowVis ? lShoulder : rShoulder;

      // Spine & Hip Alignment (Shoulder -> Hip -> Knee)
      const midShoulder: PoseLandmark = {
        x: (lm[11].x + lm[12].x) / 2,
        y: (lm[11].y + lm[12].y) / 2,
      };
      const midHip: PoseLandmark = {
        x: (lm[23].x + lm[24].x) / 2,
        y: (lm[23].y + lm[24].y) / 2,
      };
      const midKnee: PoseLandmark = {
        x: (lm[25].x + lm[26].x) / 2,
        y: (lm[25].y + lm[26].y) / 2,
      };
      const hipSpineAngle = calculateJointAngle(midShoulder, midHip, midKnee);

      // Knee angles (Hip -> Knee -> Ankle)
      const lKnee = calculateJointAngle(lm[23], lm[25], lm[27]);
      const rKnee = calculateJointAngle(lm[24], lm[26], lm[28]);
      const activeKnee = (lm[25]?.visibility ?? 0.8) > (lm[26]?.visibility ?? 0.8) ? lKnee : rKnee;

      return {
        elbowAngle: activeElbow,
        leftElbowAngle: lElbow,
        rightElbowAngle: rElbow,
        shoulderAngle: activeShoulder,
        hipSpineAngle,
        kneeAngle: activeKnee,
        leftKneeAngle: lKnee,
        rightKneeAngle: rKnee,
        isPoseDetected: true,
        landmarks: lm,
      };
    } catch (e) {
      console.warn('Frame detection notice:', e);
      return null;
    }
  }, [videoRef]);

  return {
    isModelLoading,
    modelError,
    detectPose,
  };
}
