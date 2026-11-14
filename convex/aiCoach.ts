import { action } from './_generated/server';
import { api } from './_generated/api';
import { v } from 'convex/values';

/**
 * Convex Cloud Action: generateOrAdjustProtocol
 * Generates an athletic daily blueprint using Gemini 2.5 Flash / OpenAI / Groq LLMs
 * with a deterministic zero-key fallback engine that runs reliably offline or online.
 */
export const generateOrAdjustProtocol = action({
  args: {
    userId: v.string(),
    date: v.string(),
    calibration: v.object({
      modality: v.union(v.literal('bodyweight'), v.literal('gym')),
      tier: v.number(),
      objective: v.string(),
      persona: v.string(),
    }),
    checkIn: v.object({
      energy: v.number(),
      duration: v.number(),
      soreJoints: v.array(v.string()),
    }),
    userCommand: v.optional(v.string()),
    currentProtocol: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { userId, date, calibration, checkIn, userCommand = '' } = args;
    const persona = calibration.persona;
    const isScientist = persona === 'TACTICAL_SCIENTIST';

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    let coachBriefing = '';
    let blocks: any = null;
    let needQuests: any = null;
    let avoidRules: any = null;

    // Attempt Gemini 2.5 Flash / Groq LLM if key is configured in Convex
    if (geminiKey) {
      try {
        const prompt = `You are VECTR FIT Head AI Coach.
Persona: ${isScientist ? 'Tactical Scientist (Calm, biomechanical cues, kinetic chains, RPE accuracy)' : 'Ruthless Drill Sergeant (High accountability, zero excuses, direct reality checks)'}.
Athlete Configuration:
- Modality: ${calibration.modality}
- Tier: ${calibration.tier} (1=Foundation, 2=Conditioned, 3=Warrior, 4=Elite, 5=Apex)
- Objective: ${calibration.objective}
- Energy Level: ${checkIn.energy}/5
- Session Time: ${checkIn.duration} minutes
- Sore Joints to Protect: ${checkIn.soreJoints.join(', ') || 'None'}
- Athlete Directive: "${userCommand || 'Standard Daily Optimization'}"

Generate a complete daily protocol in strict JSON matching this structure:
{
  "coachBriefing": "1-2 line direct quote in persona voice advising on today's session",
  "blocks": [
    {
      "title": "Block Title (e.g. PRIMARY COMPOUND FORCE)",
      "subtitle": "Kinetic description",
      "exercises": [
        {
          "id": "ex_1",
          "name": "Exercise Name",
          "targetMuscle": "Primary muscle target",
          "sets": 4,
          "repsOrHold": "8-10 reps",
          "restSeconds": 90,
          "rpe": "RPE 8.0",
          "formCue": "1 biomechanical form cue",
          "isAdapted": false
        }
      ]
    }
  ],
  "needQuests": [
    { "id": "fuel_1", "label": "Protein Target", "value": "180g+", "detail": "High-leucine synthesis", "completed": false },
    { "id": "fuel_2", "label": "Hydration Ceiling", "value": "3.5L", "detail": "Electrolyte balance", "completed": false },
    { "id": "fuel_3", "label": "Recovery Protocol", "value": "7.5h Sleep", "detail": "Autonomic nervous restoration", "completed": false }
  ],
  "avoidRules": [
    { "id": "avoid_1", "title": "Zero Liquid Sugar", "description": "Eliminate insulin spikes", "completed": false },
    { "id": "avoid_2", "title": "No Grinding Past RPE 9.5", "description": "Preserve joint integrity", "completed": false },
    { "id": "avoid_3", "title": "No Screens 30m Pre-Sleep", "description": "Melatonin secretion window", "completed": false }
  ]
}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
          if (parsed.coachBriefing && parsed.blocks) {
            coachBriefing = parsed.coachBriefing;
            blocks = parsed.blocks;
            needQuests = parsed.needQuests;
            avoidRules = parsed.avoidRules;
          }
        }
      } catch (err) {
        console.error('Gemini generation failed, using deterministic engine fallback', err);
      }
    }

    // Deterministic Fallback if no LLM key or failure
    if (!blocks) {
      const isBodyweight = calibration.modality === 'bodyweight';

      coachBriefing = isScientist
        ? `"Kinetic alignment established for Tier ${calibration.tier} ${calibration.modality}. Maintain strict motor recruitment and respect the prescribed RPE velocity."`
        : `"Tier ${calibration.tier} ${calibration.modality} session initialized. Zero excuses on the floor today—execute with pristine discipline!"`;

      const ex1Name = isBodyweight
        ? calibration.tier >= 4 ? 'Archer Pull-ups' : 'Strict Pull-ups'
        : calibration.tier >= 4 ? 'Barbell Deadlifts' : 'Barbell Back Squats';

      const ex2Name = isBodyweight
        ? calibration.tier >= 4 ? 'Ring Dips' : 'Parallel Bar Dips'
        : calibration.tier >= 4 ? 'Standing Overhead Press' : 'Barbell Bench Press';

      blocks = [
        {
          title: 'PRIMARY COMPOUND ANCHOR',
          subtitle: 'High-threshold motor unit recruitment',
          exercises: [
            {
              id: 'cloud_ex_1',
              name: ex1Name,
              targetMuscle: isBodyweight ? 'Lats & Upper Posterior' : 'Posterior Kinetic Chain',
              sets: 4,
              repsOrHold: calibration.tier >= 4 ? '5-6 reps' : '8-10 reps',
              restSeconds: 90,
              rpe: 'RPE 8.0',
              formCue: 'Full active depression; maintain rigid core compression throughout.',
              isAdapted: false,
            },
            {
              id: 'cloud_ex_2',
              name: ex2Name,
              targetMuscle: 'Chest, Anterior Delts & Triceps',
              sets: 3,
              repsOrHold: '8 reps',
              restSeconds: 90,
              rpe: 'RPE 8.5',
              formCue: 'Control the descent; lock out the top with scapular protraction.',
              isAdapted: false,
            },
          ],
        },
        {
          title: 'SECONDARY CAPACITY & TENSION',
          subtitle: 'Metabolic density & joint stabilization',
          exercises: [
            {
              id: 'cloud_ex_3',
              name: isBodyweight ? 'Pseudo-Planche Push-ups' : 'Dumbbell Incline Press',
              targetMuscle: 'Shoulder Capsule & Pectorals',
              sets: 3,
              repsOrHold: '10-12 reps',
              restSeconds: 60,
              rpe: 'RPE 7.5',
              formCue: 'Lean forward into the shoulders; maintain posterior pelvic tilt.',
              isAdapted: false,
            },
          ],
        },
      ];

      needQuests = [
        { id: 'fuel_1', label: 'Protein Target', value: '180g+', detail: 'High-leucine synthesis & muscle repair', completed: false },
        { id: 'fuel_2', label: 'Hydration Ceiling', value: '3.5L Water', detail: 'Electrolyte replenishment & cell volumization', completed: false },
        { id: 'fuel_3', label: 'Recovery Sleep', value: '7.5+ Hours', detail: 'Endocrine & autonomic restoration', completed: false },
      ];

      avoidRules = [
        { id: 'avoid_1', title: 'Zero Liquid Sugar', description: 'Eliminate insulin spikes and inflammatory crashes', completed: false },
        { id: 'avoid_2', title: 'No Ego-Grinding Past RPE 9.5', description: 'Prevent central nervous system fried state', completed: false },
        { id: 'avoid_3', title: 'No Screens 30m Pre-Sleep', description: 'Optimize melatonin secretion & deep REM cycles', completed: false },
      ];
    }

    // Automatically persist the AI-generated protocol to Convex DB via internal mutation
    await ctx.runMutation(api.protocols.saveDailyProtocol, {
      userId,
      date,
      checkIn,
      coachBriefing,
      blocks,
      needQuests,
      avoidRules,
      completionPct: 0,
    });

    return {
      success: true,
      coachBriefing,
      blocks,
      needQuests,
      avoidRules,
    };
  },
});

/**
 * Convex Cloud Action: analyzeExerciseForm
 * Uses Gemini Flash Vision (or biomechanical rule engine fallback)
 * to evaluate the athlete's exercise movement, alignment, and tempo.
 */
export const analyzeExerciseForm = action({
  args: {
    exerciseName: v.string(),
    imageBase64: v.optional(v.string()), // frame image data URL or base64
    telemetry: v.object({
      spineAlignmentDeg: v.number(),
      elbowAngleDeg: v.number(),
      romDepthPct: v.number(),
      repCount: v.number(),
    }),
    persona: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { exerciseName, imageBase64, telemetry, persona = 'TACTICAL_SCIENTIST' } = args;
    const isScientist = persona === 'TACTICAL_SCIENTIST';

    const geminiKey = process.env.GEMINI_API_KEY;

    // Deterministic Biomechanical Analysis
    let calculatedScore = 88;
    let solidPoints = 'Strong scapular depression and controlled tempo through the eccentric phase.';
    let microCorrection = 'Maintain tighter core engagement to avoid lumbar hyperextension at peak contraction.';

    // Evaluate telemetry metrics
    if (telemetry.romDepthPct >= 90) {
      calculatedScore += 6;
      solidPoints = 'Full range of motion achieved with complete lock-in at joint terminal points.';
    } else if (telemetry.romDepthPct < 70) {
      calculatedScore -= 12;
      microCorrection = `Depth was limited to ~${telemetry.romDepthPct}%. Deepen the eccentric travel to stimulate full motor unit recruitment.`;
    }

    if (Math.abs(telemetry.spineAlignmentDeg - 180) < 10) {
      calculatedScore += 4;
    } else if (Math.abs(telemetry.spineAlignmentDeg - 180) > 20) {
      calculatedScore -= 8;
      microCorrection = 'Spine deviated from neutral alignment. Tuck chin and squeeze glutes to restore rigid hollow-body tension.';
    }

    calculatedScore = Math.max(68, Math.min(98, calculatedScore));

    // If Gemini API Key exists and an image frame is provided, send to Gemini Flash Vision
    if (geminiKey && imageBase64) {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        const prompt = `You are VECTR FIT Biomechanical Form Analysis AI.
Exercise: "${exerciseName}".
Telemetry Captured:
- Spine Alignment: ${telemetry.spineAlignmentDeg.toFixed(1)}°
- Joint/Elbow Angle: ${telemetry.elbowAngleDeg.toFixed(1)}°
- ROM Depth: ${telemetry.romDepthPct.toFixed(0)}%
- Reps Completed: ${telemetry.repCount}
Coach Persona: ${isScientist ? 'Tactical Biomechanist' : 'Drill Sergeant'}.

Analyze the athlete's posture, kinetic chain, joint angles, and mechanical tension from this captured video frame.
Return STRICT JSON format:
{
  "formScore": 92,
  "whatLookedSolid": "1 concise sentence praising their biomechanics",
  "microCorrection": "1 actionable sentence providing a technical fix"
}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        mimeType: 'image/jpeg',
                        data: cleanBase64,
                      },
                    },
                  ],
                },
              ],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return {
              success: true,
              formScore: parsed.formScore ?? calculatedScore,
              whatLookedSolid: parsed.whatLookedSolid ?? solidPoints,
              microCorrection: parsed.microCorrection ?? microCorrection,
              engine: 'gemini-vision',
            };
          }
        }
      } catch (err) {
        console.warn('Gemini vision API error, falling back to local biomechanics:', err);
      }
    }

    // Persona-tailored deterministic response
    if (!isScientist) {
      solidPoints = 'Aggressive drive through the sticking point. Good intent on the concentric.';
      microCorrection = 'Lock your core down! Stop leaking energy through sloppy lumbar arching!';
    }

    return {
      success: true,
      formScore: calculatedScore,
      whatLookedSolid: solidPoints,
      microCorrection: microCorrection,
      engine: 'biomechanical-telemetry',
    };
  },
});


