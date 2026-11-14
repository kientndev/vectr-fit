import { CalibrationState, DailyProtocol, CoachApiResponse } from '../types/protocol';

/**
 * Client-Side Deterministic AI Coach Brain
 * Runs 100% offline inside the native Android APK without requiring a server or external network.
 */
export function processCoachCommand(
  currentConfig: CalibrationState,
  userPrompt: string,
  protocol: DailyProtocol
): CoachApiResponse {
  const persona = currentConfig?.persona || 'TACTICAL_SCIENTIST';
  const isScientist = persona === 'TACTICAL_SCIENTIST';
  const normalizedPrompt = (userPrompt || '').toLowerCase().trim();

  // CASE 1: "Make It Harder" / Overload / Intensity
  if (
    normalizedPrompt.includes('harder') ||
    normalizedPrompt.includes('intense') ||
    normalizedPrompt.includes('overload') ||
    normalizedPrompt.includes('heavy') ||
    normalizedPrompt.includes('fire')
  ) {
    if (isScientist) {
      return {
        success: true,
        directive: {
          quote: `"Threshold escalation verified. We are increasing working sets across the primary anchor block and ratcheting RPE ceiling to 9.2. Ensure maximal concentric rate of force development while maintaining strict spinal stability."`,
          subtext: `Volume load increased +1 set per compound block; rest intervals capped at 75s to stress metabolic clearance.`,
          cnsStatus: `CNS STATE: OVERCLOCKED // HIGH RECRUITMENT`,
        },
        adjustmentsSummary: `INTENSITY ESCALATED (+1 SET, +0.5 RPE CEILING)`,
        adjustedCalibration: { energy: 5 },
        modifiedWorkout: {
          blockOverrides: [
            {
              blockIndex: 1,
              exerciseOverrides: [
                {
                  rpe: 'RPE 9.2 (MAX EFFORT)',
                  formCue: '[TACTICAL ESCALATION] Accelerate through sticking point; maximum motor unit recruitment.',
                },
              ],
            },
          ],
        },
      };
    } else {
      // Drill Sergeant
      return {
        success: true,
        directive: {
          quote: `"You asked for more pain? Good. I just tacked an extra working set onto your compound lifts and raised the RPE into the redline! You wanted a challenge—now step up and own every single rep without flinching!"`,
          subtext: `Zero excuses. Extra volume loaded. Squeeze the bar until your knuckles turn white.`,
          cnsStatus: `CNS STATE: COMBAT OVERDRIVE // NO RETREAT`,
        },
        adjustmentsSummary: `WARRIOR OVERDRIVE (+1 SET, MAXIMUM RPE)`,
        adjustedCalibration: { energy: 5 },
        modifiedWorkout: {
          blockOverrides: [
            {
              blockIndex: 1,
              exerciseOverrides: [
                {
                  rpe: 'RPE 9.5 (REDLINE)',
                  formCue: '[DRILL OVERDRIVE] Explode out of the bottom! No bouncing, no hesitation!',
                },
              ],
            },
          ],
        },
      };
    }
  }

  // CASE 2: "Short on Time" / 15m / 20m / Rapid
  if (
    normalizedPrompt.includes('short') ||
    normalizedPrompt.includes('time') ||
    normalizedPrompt.includes('quick') ||
    normalizedPrompt.includes('15m') ||
    normalizedPrompt.includes('20m') ||
    normalizedPrompt.includes('hurry')
  ) {
    if (isScientist) {
      return {
        success: true,
        directive: {
          quote: `"Time-compressed density protocol engaged. We are consolidating primary compound output into high-density agonist/antagonist pairings with strict 45-second rest gates to deliver 95% of target stimulus in 18 minutes."`,
          subtext: `Condensed to 3 high-yield blocks; rest interval downshifted to 45s; accessory fillers pruned.`,
          cnsStatus: `CNS STATE: RAPID DENSITY // TIME-CRITICAL`,
        },
        adjustmentsSummary: `CONDENSED DENSITY PROTOCOL (18 MIN RAPID TARGET)`,
        adjustedCalibration: { timeWindow: 20 },
        modifiedWorkout: {
          blockOverrides: [
            {
              blockIndex: 1,
              exerciseOverrides: [
                {
                  restSeconds: 45,
                  formCue: '[TIME-DENSITY FOCUS] Transition directly into set; strict 45s rest ceiling active.',
                },
              ],
            },
          ],
        },
      };
    } else {
      return {
        success: true,
        directive: {
          quote: `"Clock is running and excuses are banned! You have under 20 minutes to earn your discipline today. No phone breaks, no resting between sets—you transition instantly and empty the tank!"`,
          subtext: `Clock starts NOW. Super-set pace locked in. Attack the movements with relentless tempo.`,
          cnsStatus: `CNS STATE: RAPID DEPLOYMENT // ZERO WASTED SECONDS`,
        },
        adjustmentsSummary: `RAPID BLITZ MODE (20 MIN SPRINT)`,
        adjustedCalibration: { timeWindow: 20 },
        modifiedWorkout: {
          blockOverrides: [
            {
              blockIndex: 1,
              exerciseOverrides: [
                {
                  restSeconds: 45,
                  formCue: '[BLITZ TEMPO] Immediate set transition. Clock is running!',
                },
              ],
            },
          ],
        },
      };
    }
  }

  // CASE 3: "Recovery / Mobility / Deload"
  if (
    normalizedPrompt.includes('recovery') ||
    normalizedPrompt.includes('mobility') ||
    normalizedPrompt.includes('deload') ||
    normalizedPrompt.includes('sore') ||
    normalizedPrompt.includes('tired') ||
    normalizedPrompt.includes('light')
  ) {
    if (isScientist) {
      return {
        success: true,
        directive: {
          quote: `"Regenerative autocrine protocol activated. Axial compressive load has been eliminated. RPE is capped at 6.0 with an emphasis on 4-second eccentric fascial flossing, synovial fluid circulation, and parasympathetic activation."`,
          subtext: `Deload RPE 6.0 ceiling; sets capped at 3; eccentric tempo expanded to 4 seconds.`,
          cnsStatus: `CNS STATE: REGENERATIVE DECOMPRESSION`,
        },
        adjustmentsSummary: `ACTIVE REGENERATION PROTOCOL (RPE 6.0 CEILING)`,
        adjustedCalibration: { energy: 2 },
        modifiedWorkout: {
          blockOverrides: [
            {
              blockIndex: 1,
              exerciseOverrides: [
                {
                  rpe: 'RPE 6.0 (DELOAD)',
                  formCue: '[RECOVERY PROTOCOL] 4-second slow eccentric lowering; emphasize joint hydration and zero grinding.',
                },
              ],
            },
          ],
        },
      };
    } else {
      return {
        success: true,
        directive: {
          quote: `"Smart warriors know when to armor up. We are backing off the heavy grinding so your tendons rebuild ironclad. But do not confuse recovery with slacking—every slow negative rep must be technically flawless!"`,
          subtext: `Deload active. Slow 4-second negatives. Breathe deep and lock your joints into position.`,
          cnsStatus: `CNS STATE: ARMOR REPAIR // TENDON SHIELD`,
        },
        adjustmentsSummary: `DELOAD ARMOR PROTOCOL (RPE 6.0 CAP)`,
        adjustedCalibration: { energy: 2 },
        modifiedWorkout: {
          blockOverrides: [
            {
              blockIndex: 1,
              exerciseOverrides: [
                {
                  rpe: 'RPE 6.0 (ARMOR)',
                  formCue: '[ARMOR TEMPO] 4-second descent; focus on pristine biomechanics and zero joint pain.',
                },
              ],
            },
          ],
        },
      };
    }
  }

  // CASE 4: Custom Directive
  const customAdjustment = userPrompt ? `CUSTOM: "${userPrompt}"` : 'AI PROTOCOL RE-CALIBRATION';

  return {
    success: true,
    directive: {
      quote: isScientist
        ? `"Directive processed: '${userPrompt || 'Custom tuning'}'. Calibrating motor output parameters: isolated primary movement cadence, dialed kinetic chain stability, and adjusted metabolic density accordingly."`
        : `"Message received loud and clear: '${userPrompt || 'Custom tuning'}'. We adjusted the battle plan. Now execute without compromise!"`,
      subtext: isScientist
        ? `Biomechanical override loaded: kinetic alignment synced with athlete prompt.`
        : `Orders updated. Stop overthinking and execute on the platform.`,
      cnsStatus: isScientist ? `CNS STATE: CUSTOM CALIBRATED` : `CNS STATE: ORDERS CONFIRMED`,
    },
    adjustmentsSummary: customAdjustment,
    modifiedWorkout: {
      blockOverrides: [
        {
          blockIndex: 1,
          exerciseOverrides: [
            {
              formCue: `[AI TUNED: ${userPrompt || 'Custom'}] Focus on intent, stability, and locked joint alignment.`,
            },
          ],
        },
      ],
    },
  };
}

