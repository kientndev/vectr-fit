import {
  CalibrationState,
  DailyProtocol,
  DifficultyTier,
  Exercise,
  FuelTarget,
  AvoidRule,
  ProtocolBlock,
  Modality,
  JointSoreness,
  ExerciseSwapOption,
  CoachApiResponse,
} from '../types/protocol';

export const TIER_CONFIG: Record<DifficultyTier, { name: string; tag: string; description: string }> = {
  1: {
    name: 'FOUNDATION',
    tag: 'TIER 1 // FOUNDATION',
    description: 'Beginner fundamentals, tendon conditioning & joint preparation.',
  },
  2: {
    name: 'CONDITIONED',
    tag: 'TIER 2 // CONDITIONED',
    description: 'Solid strict repetitions, core rigidity & aerobic/strength base volume.',
  },
  3: {
    name: 'WARRIOR',
    tag: 'TIER 3 // WARRIOR',
    description: 'Strict Pull-ups/Dips, Diamond Push-ups / Heavy Barbell Compound Sets.',
  },
  4: {
    name: 'ELITE',
    tag: 'TIER 4 // ELITE',
    description: 'Archer Pull-ups, Pistol Squats, Pseudo-Planche / High-RPE Barbell Lifts.',
  },
  5: {
    name: 'APEX',
    tag: 'TIER 5 // APEX',
    description: 'Muscle-Up Transitions, Tuck/Straddle Planche, Typewriters / Peaking Protocols.',
  },
};

interface BaseExerciseData {
  id: string;
  name: string;
  targetMuscle: string;
  category: 'WARMUP' | 'PRIMARY' | 'VOLUME' | 'SECONDARY' | 'FINISHER';
  defaultSets: number;
  repsByTier: Record<DifficultyTier, string>;
  baseRestSeconds: number;
  baseRPE: number;
  cuesByTier: Record<DifficultyTier, string>;
  stressJoints: ('Wrists' | 'Shoulders' | 'Knees' | 'Lower Back')[];
  jointAlternatives?: Partial<Record<JointSoreness, {
    name: string;
    targetMuscle: string;
    formCue: string;
    reps: string;
    reason: string;
    protectionTag: string;
  }>>;
  swapsByTier?: Record<DifficultyTier, ExerciseSwapOption[]>;
}

// Master Exercise Library covering both Modalities, 5 Tiers, Joint Alternatives & Swap Pools
const EXERCISE_LIBRARY: Record<Modality, Record<string, BaseExerciseData[]>> = {
  BODYWEIGHT: {
    WARMUP: [
      {
        id: 'bw_warm_scap',
        name: 'Scapular Pulls & Active Hang',
        targetMuscle: 'Scapular Depressors & Lat Origin',
        category: 'WARMUP',
        defaultSets: 2,
        repsByTier: {
          1: '20s Passive Hang + 6 Scap Shrugs',
          2: '30s Active Hang + 8 Scap Pulls',
          3: '35s Hollow Body Hang + 10 Scap Pulls',
          4: '40s False Grip Hang + 12 Scap Pulls',
          5: '45s Single-Arm Scap Shrug Transitions',
        },
        baseRestSeconds: 45,
        baseRPE: 5,
        cuesByTier: {
          1: 'Keep shoulders relaxed then depress blades down away from ears smoothly.',
          2: 'Engage lats without bending elbows; keep ribcage clamped downwards.',
          3: 'Lock hollow body: glutes squeezed, posterior pelvic tilt while pulling scapulae.',
          4: 'Cue active external rotation; feel lat latissimus dorsi firing instantly.',
          5: 'Shift weight unilaterally without rotational torso compensation.',
        },
        stressJoints: ['Wrists', 'Shoulders'],
        jointAlternatives: {
          Wrists: {
            name: 'Forearm Prone Scapular Retractions on Mat',
            targetMuscle: 'Scapular Stabilizers & Mid-Traps',
            formCue: 'Rest on forearms with zero wrist flexion; drive blades down and together.',
            reps: '12 controlled reps (3s hold)',
            reason: 'Eliminates hanging wrist shear forces while priming scapular control',
            protectionTag: 'WRIST PROTECTION',
          },
          Shoulders: {
            name: 'Supine Scapular Floor Slides with Neutral Hands',
            targetMuscle: 'Lower Traps & Serratus Anterior',
            formCue: 'Keep lower back glued flat; slide elbows up slowly without pain.',
            reps: '10 slow deliberate reps',
            reason: 'Deloads glenohumeral impingement angle completely',
            protectionTag: 'SHOULDER PROTECTION',
          },
        },
        swapsByTier: {
          1: [
            { name: 'Dead Bug Arm Sweeps', targetMuscle: 'Scapula & Deep Core', repsOrHold: '8 reps/side', formCue: 'Keep ribs flat on floor.' },
            { name: 'Band Scapular Pull-Apart', targetMuscle: 'Rear Delts & Traps', repsOrHold: '15 reps', formCue: 'Squeeze shoulder blades with locked elbows.' },
          ],
          2: [
            { name: 'Prone Cobra Scapular Hold', targetMuscle: 'Thoracic Extensors', repsOrHold: '30s isometric', formCue: 'Rotate thumbs up to ceiling.' },
            { name: 'Ring Active Hang & Rotate', targetMuscle: 'Rotator Cuff & Lats', repsOrHold: '30s hold', formCue: 'Slow neutral-to-supinated grip rotations.' },
          ],
          3: [
            { name: 'Ring Scapular Shrugs (Neutral)', targetMuscle: 'Lats & Rhomboids', repsOrHold: '12 reps', formCue: 'Depress and retract scapulae with zero elbow bend.' },
            { name: 'Inverted Row Scapular Lock', targetMuscle: 'Mid-Traps', repsOrHold: '10 reps (2s pause)', formCue: 'Hold top squeeze without hyperextending neck.' },
          ],
          4: [
            { name: 'Archer Scapular Pull-ups', targetMuscle: 'Unilateral Lat Stabilizers', repsOrHold: '6 reps/side', formCue: 'Shift torso to one side without momentum.' },
            { name: 'Skin the Cat (Controlled Negatives)', targetMuscle: 'Shoulder Mobility & Core', repsOrHold: '4 controlled reps', formCue: 'Slow eccentric through full German hang.' },
          ],
          5: [
            { name: 'Front Lever Scapular Pulls', targetMuscle: 'Lower Lats & Core Rigidity', repsOrHold: '5 reps in tuck', formCue: 'Pull straight arms down toward hips.' },
            { name: 'Single-Arm Ring Hang with Rotation', targetMuscle: 'Maximal Scapular Strength', repsOrHold: '20s/side', formCue: 'Breathe and maintain steady shoulder packing.' },
          ],
        },
      },
      {
        id: 'bw_warm_mobility',
        name: 'Wrist Extension Prep & Quadruped Rocking',
        targetMuscle: 'Wrist Flexor/Extensor Tendons & Forearms',
        category: 'WARMUP',
        defaultSets: 2,
        repsByTier: {
          1: '10 Gentle Forward Rocks',
          2: '12 Dynamic Clockwise & Counter Rocks',
          3: '15 First-Knuckle Push-ups on Knees',
          4: '20s Lean Angle Hold in Pseudo-Planche Stance',
          5: '25s Full Planche Lean on Flat Palms',
        },
        baseRestSeconds: 45,
        baseRPE: 5,
        cuesByTier: {
          1: 'Spread fingers wide; apply equal pressure through all knuckle pads.',
          2: 'Keep elbows locked fully extended; rotate elbow pits forward.',
          3: 'Control descent; build tendon elasticity through carpal tunnel.',
          4: 'Lean forward until shoulders pass fingertips by 3–4 inches.',
          5: 'Aggressive hollow-body protraction; dig fingertips into ground like claws.',
        },
        stressJoints: ['Wrists'],
        jointAlternatives: {
          Wrists: {
            name: 'Closed-Fist Quadruped Isometric Hold',
            targetMuscle: 'Forearm Stabilizers & Wrist Neutral Aligners',
            formCue: 'Stack knuckles directly beneath shoulders in neutral alignment; zero carpal angle.',
            reps: '30s isometric brace',
            reason: 'Completely removes carpal hyperextension stress',
            protectionTag: 'WRIST PROTECTION',
          },
        },
        swapsByTier: {
          1: [{ name: 'Forearm Finger Pulses on Wall', targetMuscle: 'Extensors', repsOrHold: '15 pulses', formCue: 'Press fingertips lightly into wall.' }],
          2: [{ name: 'Reverse Wrist Rocks on Knees', targetMuscle: 'Flexor Carpi', repsOrHold: '10 gentle rocks', formCue: 'Palms up, gentle rearward lean.' }],
          3: [{ name: 'Parallette Neutral Wrist Hold', targetMuscle: 'Forearms & Grip', repsOrHold: '30s hold', formCue: 'Maintain neutral vertical wrist column.' }],
          4: [{ name: 'Fingertip Push-up Hold', targetMuscle: 'Digital Flexors', repsOrHold: '20s hold', formCue: 'Dome fingers like claws.' }],
          5: [{ name: 'Back of Hand Push-up Negatives', targetMuscle: 'Extensor Carpi Tendons', repsOrHold: '6 reps', formCue: 'Extreme control on padded surface.' }],
        },
      },
    ],
    PRIMARY: [
      {
        id: 'bw_primary_pull',
        name: 'Horizontal to Vertical Pull Progression',
        targetMuscle: 'Latissimus Dorsi, Biceps & Rear Deltoids',
        category: 'PRIMARY',
        defaultSets: 4,
        repsByTier: {
          1: 'Incline Australian Rows: 8-10 reps',
          2: 'Chest-to-Bar Inverted Rows: 10-12 reps',
          3: 'Strict Tactical Pull-ups: 6-8 reps (No Kip)',
          4: 'Archer Pull-ups: 4-5 reps per side (Strict)',
          5: 'Bar Muscle-Up Transition to Dip: 3-5 reps (Dead-Hang)',
        },
        baseRestSeconds: 90,
        baseRPE: 8,
        cuesByTier: {
          1: 'Keep body in one straight rigid plank; touch lower chest to bar.',
          2: 'Drive elbows back behind body; squeeze scapulae for 1 full second at apex.',
          3: 'Dead-hang start; drive elbows down toward back pockets; clear chin effortlessly.',
          4: 'Keep assistive arm fully locked straight across bar like an archer bow.',
          5: 'Violent hip-to-rib drive, quick wrist rollover; catch in solid high dip support.',
        },
        stressJoints: ['Wrists', 'Shoulders'],
        jointAlternatives: {
          Wrists: {
            name: 'Gymnastic Ring Neutral-Grip Pull-ups / Bodyweight Rows',
            targetMuscle: 'Lats & Brachialis',
            formCue: 'Allow rings to naturally rotate to neutral grip as you pull.',
            reps: '6-8 strict reps with 2s squeeze',
            reason: 'Free ring rotation alleviates static carpal/forearm torsion',
            protectionTag: 'WRIST PROTECTION',
          },
          Shoulders: {
            name: 'Neutral-Grip Inverted Row with Scapular Retraction Focus',
            targetMuscle: 'Mid-Traps, Rhomboids & Posterior Delts',
            formCue: 'Limit elbow excursion past torso plane; lock shoulder blades down first.',
            reps: '8-10 controlled reps',
            reason: 'Eliminates overhead glenohumeral impingement arc',
            protectionTag: 'SHOULDER PROTECTION',
          },
        },
        swapsByTier: {
          1: [
            { name: 'Doorframe Towel Rows', targetMuscle: 'Lats & Upper Back', repsOrHold: '10-12 reps', formCue: 'Squeeze shoulder blades against doorframe.' },
            { name: 'Jackknife Pull-ups with Box Support', targetMuscle: 'Vertical Lats', repsOrHold: '8-10 reps', formCue: 'Feet flat on box to unload bodyweight.' },
          ],
          2: [
            { name: 'Strict Chin-ups (Underhand Grip)', targetMuscle: 'Biceps & Lower Lats', repsOrHold: '6-8 reps', formCue: 'Elbows tucked tight, chin clears bar.' },
            { name: 'Wide-Grip Inverted Australian Rows', targetMuscle: 'Rear Delts & Rhomboids', repsOrHold: '10 reps', formCue: 'Pull sternum into bar with wide flare.' },
          ],
          3: [
            { name: 'Neutral-Grip Parallel Bar Pull-ups', targetMuscle: 'Brachialis & Lats', repsOrHold: '7-9 reps', formCue: 'Palms facing each other; pull chin past hands.' },
            { name: 'Chest-to-Bar Weighted Pull-ups (+5kg)', targetMuscle: 'Upper Lat Fiber Density', repsOrHold: '5 reps', formCue: 'Touch upper sternum to steel bar.' },
            { name: 'L-Sit Pull-ups (Strict)', targetMuscle: 'Lats & Core Compression', repsOrHold: '5-6 reps', formCue: 'Legs held at 90 degrees throughout whole set.' },
          ],
          4: [
            { name: 'Typewriter Pull-ups', targetMuscle: 'Unilateral Upper Back', repsOrHold: '3 reps/side', formCue: 'Pull to top, slide horizontally from side to side.' },
            { name: 'Mixed-Grip Commando Pull-ups', targetMuscle: 'Rotational Pull Chain', repsOrHold: '8 alternating reps', formCue: 'Head alternates left and right of bar.' },
          ],
          5: [
            { name: 'Slow-Tempo Bar Muscle-Up (3s pause at dip)', targetMuscle: 'Full Pull-to-Push Nexus', repsOrHold: '3-4 reps', formCue: 'Minimal swing, smooth transition over bar.' },
            { name: 'Weighted Tactical Pull-ups (+20kg / 45lb)', targetMuscle: 'Maximal Lat Motor Units', repsOrHold: '3 reps @ RPE 9', formCue: 'Explosive drive from dead hang.' },
          ],
        },
      },
      {
        id: 'bw_primary_push',
        name: 'Overhead & Horizontal Push Mastery',
        targetMuscle: 'Pectoralis Major, Anterior Deltoids & Triceps',
        category: 'PRIMARY',
        defaultSets: 4,
        repsByTier: {
          1: 'Elevated Push-ups on Parallel Handles: 8-10 reps',
          2: 'Strict Floor Push-ups with 2s Chest Pause: 10-12 reps',
          3: 'Diamond Push-ups + Parallel Bar Dips: 8 reps each',
          4: 'Wall Handstand Push-ups (Strict): 5-6 reps',
          5: 'Freestanding / Deficit Handstand Push-ups or Planche Push-ups: 3-5 reps',
        },
        baseRestSeconds: 90,
        baseRPE: 8.5,
        cuesByTier: {
          1: 'Maintain unbroken core plank; tuck elbows at 45 degrees to protect shoulders.',
          2: 'Bury chest to 1 inch off deck; do not let hips sag or flare neck forward.',
          3: 'Keep forearms perpendicular; descend until upper arms hit parallel.',
          4: 'Descend with head forward in tripod position; press up and through the window.',
          5: 'Protract serratus maximally at top; lock out with zero spinal arching.',
        },
        stressJoints: ['Wrists', 'Shoulders'],
        jointAlternatives: {
          Wrists: {
            name: 'Forearm Plank Push-ups or Fist/Parallette Push-ups',
            targetMuscle: 'Chest, Triceps & Serratus',
            formCue: 'Grip parallettes or rest on closed knuckles; wrist column remains completely straight.',
            reps: '8-10 strict reps',
            reason: 'Eliminates 90-degree carpal extension pressure entirely',
            protectionTag: 'WRIST PROTECTION',
          },
          Shoulders: {
            name: 'Hands-Elevated Incline Push-ups with 30° Elbow Tuck',
            targetMuscle: 'Mid-Chest & Triceps',
            formCue: 'Keep shoulders depressed down away from ears; stop before shoulder capsule rolls.',
            reps: '8-10 reps with 1s pause',
            reason: 'Eliminates overhead and deep humeral head extension shear',
            protectionTag: 'SHOULDER PROTECTION',
          },
        },
        swapsByTier: {
          1: [
            { name: 'Knee Push-ups with 3-Second Negative', targetMuscle: 'Chest & Core', repsOrHold: '10 reps', formCue: 'Lower slow and controlled for 3 seconds.' },
            { name: 'Incline Bench Press-Away', targetMuscle: 'Anterior Deltoids', repsOrHold: '12 reps', formCue: 'Push body away from elevated surface.' },
          ],
          2: [
            { name: 'Wide-Stance Hand Release Push-ups', targetMuscle: 'Pecs & Scapula', repsOrHold: '10 reps', formCue: 'Lift hands off floor at bottom to ensure full ROM.' },
            { name: 'Pike Push-ups on Flat Ground', targetMuscle: 'Shoulders & Triceps', repsOrHold: '8-10 reps', formCue: 'Hips high in air, head touches forward.' },
          ],
          3: [
            { name: 'Elevated Feet Pike Push-ups', targetMuscle: 'Anterior Delts & Upper Pecs', repsOrHold: '6-8 reps', formCue: 'Feet on 18-inch box; push vertically upward.' },
            { name: 'Ring Dips (Turn Out at Top)', targetMuscle: 'Lower Chest & Triceps', repsOrHold: '6-8 reps', formCue: 'Turn rings out 45 degrees at top lockout.' },
            { name: 'Archer Push-ups on Deck', targetMuscle: 'Chest & Unilateral Push', repsOrHold: '5 reps/side', formCue: 'Slide one arm straight out like an archer.' },
          ],
          4: [
            { name: 'Pseudo-Planche Push-ups with Forward Lean', targetMuscle: 'Anterior Delts & Biceps Tendon', repsOrHold: '6 reps', formCue: 'Hands at waist level; lean aggressively forward.' },
            { name: 'Deficit Parallette Handstand Push-ups', targetMuscle: 'Full Shoulder Girdle', repsOrHold: '4-5 reps', formCue: 'Head drops below handle level for maximum stretch.' },
          ],
          5: [
            { name: 'Tuck Planche Push-ups', targetMuscle: 'Maximal Shoulder Flexors & Core', repsOrHold: '3-4 reps', formCue: 'Feet hover completely off floor throughout reps.' },
            { name: '90-Degree Handstand Push-up Transition', targetMuscle: 'Planche to Handstand Chain', repsOrHold: '2-3 reps', formCue: 'Control the bent-arm planche lever before vertical press.' },
          ],
        },
      },
    ],
    VOLUME: [
      {
        id: 'bw_vol_legs',
        name: 'Unilateral Lower Body Power & Control',
        targetMuscle: 'Quadriceps, Glutes & Adductors',
        category: 'VOLUME',
        defaultSets: 3,
        repsByTier: {
          1: 'Assisted Box Step-ups with Knee Drive: 10 reps/side',
          2: 'Elevated Rear-Foot Bulgarian Split Squats: 10 reps/side',
          3: 'Assisted Pistol Squats to Box: 6-8 reps/side',
          4: 'Strict Full-Depth Pistol Squats: 5 reps/side (Slow Eccentric)',
          5: 'Dragon Pistol Squats or Explosive Switch Pistols: 5 reps/side',
        },
        baseRestSeconds: 75,
        baseRPE: 7.5,
        cuesByTier: {
          1: 'Drive through full foot on box; minimize pushing off trailing toe.',
          2: 'Keep torso pitched slightly forward to place direct torque on glute/quad nexus.',
          3: 'Reach hands forward as counterbalance; sit back into hip pocket.',
          4: 'Descend smoothly for 3 seconds; keep free leg held parallel to deck.',
          5: 'Wrap trailing leg behind smoothly without losing ankle arch stiffness.',
        },
        stressJoints: ['Knees'],
        jointAlternatives: {
          Knees: {
            name: 'Single-Leg Romanian Deadlift & Glute Bridge Hold',
            targetMuscle: 'Hamstrings, Gluteus Medius & Posterior Chain',
            formCue: 'Micro-bend working knee and hinge purely at the hip; tabletop back.',
            reps: '8 reps per side + 30s bridge hold',
            reason: 'Transfers load completely into hips and hamstrings away from patellar tendon',
            protectionTag: 'KNEE PROTECTION',
          },
        },
        swapsByTier: {
          1: [{ name: 'Prisoner Air Squats with 3s Pause', targetMuscle: 'Quads & Glutes', repsOrHold: '12 reps', formCue: 'Knees track over pinky toes.' }],
          2: [{ name: 'Reverse Walking Lunges', targetMuscle: 'Glutes & Hip Flexors', repsOrHold: '10 steps/leg', formCue: 'Step backward smoothly; tap knee lightly.' }],
          3: [
            { name: 'Shrimp Squats (Holding One Ankle)', targetMuscle: 'Quads & Balance', repsOrHold: '5 reps/side', formCue: 'Tap rear knee to floor while holding foot.' },
            { name: 'Sissy Squats with Support', targetMuscle: 'Rectus Femoris', repsOrHold: '8 reps', formCue: 'Lean back from knees with rigid hips.' },
          ],
          4: [{ name: 'Jumping Bulgarian Split Squats', targetMuscle: 'Explosive Leg Power', repsOrHold: '6 reps/side', formCue: 'Absorb landing softly without knee collapse.' }],
          5: [{ name: 'Nordic Hamstring Curl (Assisted Eccentric)', targetMuscle: 'Hamstring Tendon Resilience', repsOrHold: '5 slow reps', formCue: '5-second lowering phase; catch with hands.' }],
        },
      },
      {
        id: 'bw_vol_core',
        name: 'Midline Compression & Gymnastic Core',
        targetMuscle: 'Rectus Abdominis, Transverse Abdominis & Hip Flexors',
        category: 'VOLUME',
        defaultSets: 3,
        repsByTier: {
          1: 'Dead Bug with Hollow Core Hold: 10 reps/side',
          2: 'Hanging Knee Raises to Armpits: 10-12 reps',
          3: 'Strict Toes-to-Bar with Zero Swing: 8 reps',
          4: 'L-Sit Hold on Floor or Parallettes: 20-25s unbroken',
          5: 'Dragon Flag Lever Pulses / Straddle Planche Hold: 6 reps / 15s hold',
        },
        baseRestSeconds: 60,
        baseRPE: 7.5,
        cuesByTier: {
          1: 'Flatten lumbar spine completely into floor with zero daylight beneath.',
          2: 'Tilt pelvis up before pulling knees; avoid pendulum momentum.',
          3: 'Initiate with lat engagement; tap toes between hands in controlled rhythm.',
          4: 'Depress shoulders aggressively; lock quads and point toes forward.',
          5: 'Keep straight line from shoulders to ankles; hinge strictly at glenohumeral pivot.',
        },
        stressJoints: ['Lower Back', 'Wrists'],
        jointAlternatives: {
          'Lower Back': {
            name: 'Hanging Hollow Tuck Hold with Posterior Pelvic Lock',
            targetMuscle: 'Deep Core & Hip Flexors',
            formCue: 'Roll pelvis toward sternum; keep lumbar rounded in safe flexion-free hollow arc.',
            reps: '25-30s hold',
            reason: 'Decompresses the spine while firing deep anterior core stabilizers',
            protectionTag: 'LOWER BACK PROTECTION',
          },
          Wrists: {
            name: 'Hollow Body Floor Rocks',
            targetMuscle: 'Anterior Core & Hip Flexors',
            formCue: 'Arms extended overhead or crossed over chest; zero hand ground contact.',
            reps: '20 rocks',
            reason: 'Zero hand support required',
            protectionTag: 'WRIST PROTECTION',
          },
        },
        swapsByTier: {
          1: [{ name: 'Bird Dog with 2s Squeeze', targetMuscle: 'Posterior Slings & Core', repsOrHold: '8 reps/side', formCue: 'Opposite arm and leg reach long.' }],
          2: [{ name: 'Plank Knee-to-Elbow Drives', targetMuscle: 'Obliques & Serratus', repsOrHold: '10 reps/side', formCue: 'Drive knee to outside of tricep.' }],
          3: [
            { name: 'Hanging Windshield Wipers', targetMuscle: 'Obliques & Rotational Core', repsOrHold: '6 reps/side', formCue: 'Control feet sweeping like a metronome.' },
            { name: 'V-Up Pulses', targetMuscle: 'Rectus Abdominis', repsOrHold: '12 strict reps', formCue: 'Snap up simultaneously from hollow.' },
          ],
          4: [{ name: 'Straddle L-Sit on Floor', targetMuscle: 'Hip Flexors & Core Compression', repsOrHold: '15s hold', formCue: 'Spread legs in straddle; push floor away.' }],
          5: [{ name: 'Full Dragon Flag Iso-Holds (Bruce Lee Style)', targetMuscle: 'Total Body Kinetic Tension', repsOrHold: '4 reps (4s hold)', formCue: 'Straight body line from shoulders to toes.' }],
        },
      },
    ],
    FINISHER: [
      {
        id: 'bw_fin_burn',
        name: 'Metabolic Calisthenics Finisher Matrix',
        targetMuscle: 'Full Body Conditioning & Glycolytic Capacity',
        category: 'FINISHER',
        defaultSets: 3,
        repsByTier: {
          1: '30s Mountain Climbers + 30s High Planks (3 Rounds)',
          2: '40s Explosive Jumping Jacks + 20s Push-up Hold',
          3: '50 Burpees for Time (Target: Sub 3:30) with chest to deck',
          4: 'Death by Pull-up & Dip Ladder (EMOM 5 min)',
          5: 'Tabata Muscle-Up Transitions + Planche Leans (4 min max density)',
        },
        baseRestSeconds: 45,
        baseRPE: 9,
        cuesByTier: {
          1: 'Breathe rhythmically; maintain level hips without bouncing.',
          2: 'Stay light on balls of feet; absorb landing quietly.',
          3: 'Pace your breathing: exhale sharply on push-up press and jump.',
          4: 'Zero technical deterioration; abort set if form breaks down.',
          5: 'Sustain explosive motor output even under heavy lactic accumulation.',
        },
        stressJoints: ['Wrists', 'Shoulders', 'Knees'],
        jointAlternatives: {
          Wrists: {
            name: 'Forearm Plank Saws & Isometric Hollow Body Rocks',
            targetMuscle: 'Core & Systemic Aerobic Engine',
            formCue: 'Rest on elbows and forearms; rock forward and backward via ankle flex.',
            reps: '45s on / 15s off x 3 rounds',
            reason: 'Delivers full metabolic burn without palm ground contact',
            protectionTag: 'WRIST PROTECTION',
          },
          Knees: {
            name: 'Upper Body Shadow Boxing with Resistance Bands',
            targetMuscle: 'Delts, Core & Cardiovascular System',
            formCue: 'Fast hands, stable hips; zero knee impact or pivoting.',
            reps: '45s high cadence x 3 rounds',
            reason: 'Zero lower body impact while demanding high cardiovascular output',
            protectionTag: 'KNEE PROTECTION',
          },
          Shoulders: {
            name: 'High-Knee Sprint in Place + Core Hollow Flutters',
            targetMuscle: 'Cardiovascular & Hip Flexors',
            formCue: 'Drive knees fast; arms relaxed at side without overhead load.',
            reps: '45s on / 15s off x 3 rounds',
            reason: 'Deloads shoulder girdle completely',
            protectionTag: 'SHOULDER PROTECTION',
          },
        },
        swapsByTier: {
          1: [{ name: 'Speed Skaters (Low Impact)', targetMuscle: 'Lateral Cardio', repsOrHold: '30s on / 30s off', formCue: 'Step laterally with soft foot strike.' }],
          2: [{ name: 'Bear Crawl Forward & Backward', targetMuscle: 'Full Body Stability', repsOrHold: '40s continuous', formCue: 'Knees hovering 2 inches off floor.' }],
          3: [{ name: 'EMOM 5m: 5 Pull-ups + 10 Push-ups + 15 Squats', targetMuscle: 'Metabolic Conditioning', repsOrHold: '5 rounds', formCue: 'Sprint each minute; rest remaining seconds.' }],
          4: [{ name: 'Tabata 100m Shuttle Runs + Burpees', targetMuscle: 'Anaerobic Threshold', repsOrHold: '8 rounds (20s/10s)', formCue: 'All-out velocity.' }],
          5: [{ name: 'Bar Muscle-Up Every Minute on the Minute (5 min)', targetMuscle: 'Peak Power Endurance', repsOrHold: '3 reps EMOM', formCue: 'Clean explosive drive every round.' }],
        },
      },
    ],
  },
  GYM: {
    WARMUP: [
      {
        id: 'gym_warm_rotator',
        name: 'Cable / Band Face Pulls with External Rotation',
        targetMuscle: 'Rear Deltoids, Infraspinatus & Teres Minor',
        category: 'WARMUP',
        defaultSets: 2,
        repsByTier: {
          1: '12 reps with light resistance band',
          2: '15 reps on cable stack (Rope Attachment)',
          3: '15 reps with 2s pause in double-biceps pose',
          4: '18 reps with 3s eccentric negative',
          5: '20 reps with dynamic tempo changes (light load)',
        },
        baseRestSeconds: 45,
        baseRPE: 5,
        cuesByTier: {
          1: 'Pull rope toward forehead; lead with thumbs pointing backward.',
          2: 'Keep elbows high at eye level; squeeze scapulae backward.',
          3: 'Rotate hands back behind elbows at peak contraction.',
          4: 'Decelerate smoothly back to start position; maintain constant tension.',
          5: 'Prime the rotator cuff; do not recruit upper traps or sway torso.',
        },
        stressJoints: ['Shoulders'],
        jointAlternatives: {
          Shoulders: {
            name: 'Chest-Supported Prone Y-T-W Scapular Series',
            targetMuscle: 'Lower Traps & Rhomboids',
            formCue: 'Lie prone on 45° incline bench; raise arms without weights, thumbs up.',
            reps: '8 reps per position',
            reason: 'Eliminates active cable shear on anterior rotator cuff',
            protectionTag: 'SHOULDER PROTECTION',
          },
        },
        swapsByTier: {
          1: [{ name: 'Dumbbell External Rotations on Knee', targetMuscle: 'Infraspinatus', repsOrHold: '12 reps/side', formCue: 'Elbow pinned to knee; slow rotation.' }],
          2: [{ name: 'Overhead Band Dislocates', targetMuscle: 'Shoulder Capsule', repsOrHold: '15 smooth passes', formCue: 'Keep elbows locked straight.' }],
          3: [{ name: 'Prone Dumbbell Cuban Press', targetMuscle: 'Rotator Cuff & Delts', repsOrHold: '10 reps', formCue: 'High row, rotate up, press forward.' }],
          4: [{ name: 'Cable Powell Raise on Incline Bench', targetMuscle: 'Posterior Deltoid & Teres', repsOrHold: '12 reps/side', formCue: 'Slow 3-second lowering.' }],
          5: [{ name: 'Kettlebell Arm Bar Hold', targetMuscle: 'Glenohumeral Joint Centration', repsOrHold: '30s/side', formCue: 'Keep gaze on kettlebell; stack shoulder.' }],
        },
      },
      {
        id: 'gym_warm_hips',
        name: 'Kettlebell Goblet Squat & Hip Prying',
        targetMuscle: 'Ankle Dorsiflexion, Hip Capsule & Core Bracing',
        category: 'WARMUP',
        defaultSets: 2,
        repsByTier: {
          1: '8 reps with 10kg KB (hold bottom for 3s)',
          2: '10 reps with 16kg KB (elbows inside knees pry)',
          3: '12 reps with 20kg KB + 5 Hip Openers',
          4: '12 reps with 24kg KB + Overhead Reach at bottom',
          5: '15 reps with 28kg KB (Pause & Dynamic Weight Shift)',
        },
        baseRestSeconds: 45,
        baseRPE: 5,
        cuesByTier: {
          1: 'Keep chest tall; use elbows to gently push knees outward.',
          2: 'Breathe deeply into pelvis at the bottom; expand ribcage.',
          3: 'Keep whole foot glued down: heel, big toe base, pinky toe base.',
          4: 'Reach one arm up to ceiling without collapsing knee inwards.',
          5: 'Prime ankle dorsiflexion while maintaining active neutral lumbar spine.',
        },
        stressJoints: ['Knees', 'Lower Back'],
        jointAlternatives: {
          Knees: {
            name: 'Supine Glute Hamstring Curl on Gym Swiss Ball / Glute Bridge',
            targetMuscle: 'Hamstrings & Glutes',
            formCue: 'Bridge hips up and curl heels toward glutes without knee shearing forces.',
            reps: '12 reps (2s peak hold)',
            reason: 'Prepares posterior chain without patellar tendon compression',
            protectionTag: 'KNEE PROTECTION',
          },
          'Lower Back': {
            name: 'Bodyweight Box Squat with Vertical Torso Support',
            targetMuscle: 'Quads & Glutes',
            formCue: 'Sit back to a bench or plyo box with tall torso; zero lumbar flexion.',
            reps: '10 smooth reps',
            reason: 'Deloads spinal erectors via bench depth stop',
            protectionTag: 'LOWER BACK PROTECTION',
          },
        },
        swapsByTier: {
          1: [{ name: 'Hip 90/90 Dynamic Rotations', targetMuscle: 'Internal & External Hip Rotation', repsOrHold: '6 reps/side', formCue: 'Rotate knees smoothly between sides.' }],
          2: [{ name: 'Dumbbell Romanian Deadlift (Warmup)', targetMuscle: 'Hamstrings & Erector Spinae', repsOrHold: '10 reps (light)', formCue: 'Hinge hips backward with flat spine.' }],
          3: [{ name: 'Cossack Squat with 8kg Kettlebell', targetMuscle: 'Adductors & Ankle', repsOrHold: '6 reps/side', formCue: 'Sit deep into trailing hip.' }],
          4: [{ name: 'Overhead Barbell Squat (Empty Bar Mobility)', targetMuscle: 'Thoracic & Hip Mobility', repsOrHold: '8 pause reps', formCue: 'Lock bar over base of neck.' }],
          5: [{ name: 'Sled Pull Backward (Warmup)', targetMuscle: 'Patellar Tendon & VMO Bloodflow', repsOrHold: '50 meters', formCue: 'Rolling toe to heel; constant quad tension.' }],
        },
      },
    ],
    PRIMARY: [
      {
        id: 'gym_primary_heavy',
        name: 'Barbell Compound Anchor Lift',
        targetMuscle: 'Primary Motor Units: Quads, Glutes & Thoracic Spine',
        category: 'PRIMARY',
        defaultSets: 4,
        repsByTier: {
          1: 'Dumbbell Romanian Deadlift / Goblet Squat: 8 reps @ RPE 7',
          2: 'Barbell Back Squat / Conventional Trap Bar: 6-8 reps @ RPE 7.5',
          3: 'Heavy Barbell Back Squat: 4-5 sets x 5 reps @ RPE 8',
          4: 'Paused Competition Back Squat or Deadlift: 4 sets x 3 reps @ RPE 8.5',
          5: 'Heavy Double/Triple Peaking Protocol: 5 sets x 2 reps @ RPE 9 (1RM ~88-92%)',
        },
        baseRestSeconds: 120,
        baseRPE: 8.5,
        cuesByTier: {
          1: 'Hinge hips back toward rear wall; feel tension stretch in hamstrings.',
          2: 'Take a 360-degree diaphragmatic breath; brace abs against weight belt.',
          3: 'Root feet into floor; drive knees out over pinky toes out of the hole.',
          4: 'Dead stop for 1 full second at parallel; eliminate stretch reflex completely.',
          5: 'Explosive concentric intent; transfer maximal force into bar from first millimeter.',
        },
        stressJoints: ['Lower Back', 'Knees'],
        jointAlternatives: {
          'Lower Back': {
            name: 'Safety Squat Bar / Trap Bar Deadlift with High Handles / Belt Squat',
            targetMuscle: 'Leg Drive & Gluteus Maximus',
            formCue: 'Keep torso completely vertical; high handles eliminate axial lumbar torque.',
            reps: '6-8 reps @ RPE 7.5',
            reason: 'Transfers shear stress off lower back into pure quadricep/glute mechanics',
            protectionTag: 'LOWER BACK PROTECTION',
          },
          Knees: {
            name: 'Barbell Romanian Deadlift / High Box Squat with Vertical Shins',
            targetMuscle: 'Hamstrings & Posterior Chain',
            formCue: 'Keep shins perpendicular to floor throughout movement; zero forward knee travel.',
            reps: '6-8 controlled reps @ RPE 7.5',
            reason: 'Completely unloads patellofemoral joint while preserving heavy compound stimulus',
            protectionTag: 'KNEE PROTECTION',
          },
        },
        swapsByTier: {
          1: [
            { name: 'Kettlebell Suitcase Deadlift', targetMuscle: 'Glutes & Lateral Core', repsOrHold: '8 reps/side', formCue: 'Stand tall with neutral spine; resist tilting.' },
            { name: 'Dumbbell Box Squat', targetMuscle: 'Quads & Glutes', repsOrHold: '10 reps', formCue: 'Sit back to box; pause without rocking.' },
          ],
          2: [
            { name: 'Trap Bar Deadlift (High Handles)', targetMuscle: 'Posterior Chain & Quads', repsOrHold: '6-8 reps', formCue: 'Drive ground away with mid-foot pressure.' },
            { name: 'Front Squat with Cross-Arm Grip', targetMuscle: 'Quads & Upper Back', repsOrHold: '6 reps', formCue: 'Elbows high; vertical chest foundation.' },
          ],
          3: [
            { name: 'Conventional Barbell Deadlift', targetMuscle: 'Full Posterior Chain & Traps', repsOrHold: '4 sets x 5 reps', formCue: 'Pull slack out of bar; engage lats like bending a rod.' },
            { name: 'Safety Squat Bar Squat', targetMuscle: 'Quads & Spinal Erectors', repsOrHold: '4 sets x 6 reps', formCue: 'Grip front handles; upright vertical posture.' },
            { name: 'Barbell Zercher Squat', targetMuscle: 'Core, Biceps & Quads', repsOrHold: '4 sets x 5 reps', formCue: 'Bar cradled in elbow crooks; brace abs like stone.' },
          ],
          4: [
            { name: 'Deficit Deadlift (from 2-inch block)', targetMuscle: 'Initial Floor Pull Drive', repsOrHold: '4 sets x 3 reps', formCue: 'Leg press the floor away from the deficit.' },
            { name: 'Paused Front Squats (2s deep pause)', targetMuscle: 'Quads & Thoracic Rigidity', repsOrHold: '4 sets x 3 reps', formCue: 'Motionless pause at full depth.' },
          ],
          5: [
            { name: 'Cluster Deadlift Sets (1+1+1 @ 90% 1RM)', targetMuscle: 'Maximum Central Motor Drive', repsOrHold: '3 clusters (20s intra-rest)', formCue: 'Maximal neuro-muscular force delivery.' },
            { name: 'Pin Squats from Sticking Point', targetMuscle: 'Concentric Force Development', repsOrHold: '4 sets x 2 reps', formCue: 'Rest bar on safety pins; drive from dead stop.' },
          ],
        },
      },
      {
        id: 'gym_primary_press',
        name: 'Upper Body Heavy Compound Press',
        targetMuscle: 'Pectoralis Major, Anterior Deltoids & Triceps Lateral Head',
        category: 'PRIMARY',
        defaultSets: 4,
        repsByTier: {
          1: 'Flat Dumbbell Press: 8-10 reps @ RPE 7',
          2: 'Barbell Bench Press: 6-8 reps @ RPE 7.5',
          3: 'Heavy Barbell Bench Press: 4 sets x 5 reps @ RPE 8',
          4: 'Paused Barbell Bench Press / Incline DB: 4 sets x 4 reps @ RPE 8.5',
          5: 'Barbell Bench 1RM Peaking Cluster: 5 sets x 2 reps @ RPE 9 (with 2s chest pause)',
        },
        baseRestSeconds: 100,
        baseRPE: 8.5,
        cuesByTier: {
          1: 'Keep dumbbells at 45° angle to torso; drive smoothly up over mid-chest.',
          2: 'Retract and depress shoulder blades into bench; create stable arch foundation.',
          3: 'Tuck elbows on descent; drive feet into floor for leg drive out of the pause.',
          4: 'Touch sternum motionless; fire out of the bottom without bouncing off ribs.',
          5: 'Squeeze bar as hard as humanly possible; lock out with violent tricep intent.',
        },
        stressJoints: ['Wrists', 'Shoulders'],
        jointAlternatives: {
          Wrists: {
            name: 'Neutral-Grip Dumbbell Floor Press or Swiss Bar Press',
            targetMuscle: 'Pectorals & Triceps',
            formCue: 'Keep palms facing each other; knuckles point directly up toward ceiling.',
            reps: '6-8 reps with pause',
            reason: 'Swiss neutral bar and floor press lock carpal joints in absolute neutral axis',
            protectionTag: 'WRIST PROTECTION',
          },
          Shoulders: {
            name: 'Low-Incline Neutral Dumbbell Press / Landmine Chest Press',
            targetMuscle: 'Upper Chest & Triceps',
            formCue: 'Set bench to lowest incline (15°); tuck elbows closely and press in natural arc.',
            reps: '8-10 clean reps',
            reason: 'Landmine and low-incline mechanics reduce subacromial space impingement',
            protectionTag: 'SHOULDER PROTECTION',
          },
        },
        swapsByTier: {
          1: [
            { name: 'Floor Dumbbell Press with Neutral Grip', targetMuscle: 'Chest & Triceps', repsOrHold: '10 reps', formCue: 'Elbows touch floor gently to protect shoulders.' },
            { name: 'Incline Push-ups with Handles', targetMuscle: 'Pectorals', repsOrHold: '12 reps', formCue: 'Maintain steady torso plank.' },
          ],
          2: [
            { name: 'Incline Dumbbell Press (30° Angle)', targetMuscle: 'Clavicular Pec Head', repsOrHold: '8-10 reps', formCue: 'Lower weights smoothly with flared stretch.' },
            { name: 'Standing Overhead Barbell Press', targetMuscle: 'Deltoids & Triceps', repsOrHold: '6 reps', formCue: 'Glutes clamped, press directly over mid-foot.' },
          ],
          3: [
            { name: 'Weighted Dips (+10kg)', targetMuscle: 'Lower Chest & Triceps', repsOrHold: '6 reps @ RPE 8', formCue: 'Slight forward torso lean for chest recruitment.' },
            { name: 'Incline Barbell Bench Press', targetMuscle: 'Upper Chest & Front Delts', repsOrHold: '6 reps @ RPE 8', formCue: 'Touch upper chest beneath collarbone.' },
            { name: 'Dumbbell Flat Bench Press with 2s Pause', targetMuscle: 'Chest Stretch Hypertrophy', repsOrHold: '8 reps', formCue: 'Deep pectoral stretch at bottom.' },
          ],
          4: [
            { name: 'Spoto Press (1-Inch Off Chest Freeze)', targetMuscle: 'Triceps & Reversal Strength', repsOrHold: '4 sets x 4 reps', formCue: 'Hover motionless 1 inch above sternum.' },
            { name: 'Heavy Standing Push Press', targetMuscle: 'Full Body Kinetic Push', repsOrHold: '4 sets x 3 reps', formCue: 'Violent dip and drive through legs.' },
          ],
          5: [
            { name: 'Board Press / Floor Press with Chains (+20kg)', targetMuscle: 'Overload Lockout Strength', repsOrHold: '3 sets x 3 reps', formCue: 'Violent tricep drive at lockout.' },
            { name: 'Peaking Pause Bench (3s Pause on Chest)', targetMuscle: 'Absolute Bottom Strength', repsOrHold: '4 sets x 2 reps @ RPE 9', formCue: 'Zero bounce; pure starting power.' },
          ],
        },
      },
    ],
    VOLUME: [
      {
        id: 'gym_vol_pull',
        name: 'Heavy Horizontal Cable / Barbell Row',
        targetMuscle: 'Latissimus Dorsi, Rhomboids & Erector Spinae',
        category: 'VOLUME',
        defaultSets: 3,
        repsByTier: {
          1: 'Seated Cable Row with Neutral V-Bar: 10-12 reps',
          2: 'Chest-Supported Dumbbell Row: 8-10 reps',
          3: 'Barbell Pendlay Row (from Floor): 6-8 strict reps',
          4: 'Heavy Pendlay Row: 4 sets x 5 reps (Dead Stop)',
          5: 'Meadows Row / Heavy Kroc Rows: 6 heavy reps + 15 burnout reps per side',
        },
        baseRestSeconds: 80,
        baseRPE: 8,
        cuesByTier: {
          1: 'Initiate by squeezing back; do not swing torso back and forth.',
          2: 'Keep chest planted into pad; drive elbows back toward hips.',
          3: 'Torso remains parallel to floor; pull bar explosively into lower ribcage.',
          4: 'Reset every single repetition on floor plates; zero body English.',
          5: 'Use straps if grip limits you; initiate pull strictly with lat flare.',
        },
        stressJoints: ['Lower Back', 'Wrists'],
        jointAlternatives: {
          'Lower Back': {
            name: 'Chest-Supported Machine Row / Neutral Incline DB Row',
            targetMuscle: 'Lats & Upper Back',
            formCue: 'Pad fully supports upper chest; zero activation required of lower back erectors.',
            reps: '8-10 controlled reps',
            reason: 'Deloads spinal erectors 100% while allowing maximal lat overload',
            protectionTag: 'LOWER BACK PROTECTION',
          },
          Wrists: {
            name: 'Cable Row with Neutral Ergonomic Stirrups & Lifting Straps',
            targetMuscle: 'Mid-Back & Lats',
            formCue: 'Hook straps so tension pulls from wrists without intense finger flexor strain.',
            reps: '10-12 smooth reps',
            reason: 'Removes flexor tendon shear and wrist torque',
            protectionTag: 'WRIST PROTECTION',
          },
        },
        swapsByTier: {
          1: [{ name: 'Single-Arm Dumbbell Row on Bench', targetMuscle: 'Lat & Rhomboid', repsOrHold: '10 reps/side', formCue: 'Pull dumbbell toward hip.' }],
          2: [{ name: 'T-Bar Row with Chest Support', targetMuscle: 'Mid-Back Thickness', repsOrHold: '8-10 reps', formCue: 'Squeeze shoulder blades together.' }],
          3: [
            { name: 'Barbell Bent-Over Row (Underhand Yates Style)', targetMuscle: 'Lower Lats & Biceps', repsOrHold: '8 reps', formCue: 'Torso at 60°; pull bar into belly button.' },
            { name: 'Seal Row on Elevated Bench', targetMuscle: 'Pure Lat Hypertrophy', repsOrHold: '8 strict reps', formCue: 'Dead stop on floor; zero hip drive.' },
          ],
          4: [{ name: 'Meadows Row (Landmine Setup)', targetMuscle: 'Outer Lat Width', repsOrHold: '8 reps/side', formCue: 'Elbow flared out; pull with lat flare.' }],
          5: [{ name: 'Heavy Barbell Pendlay Row (+100kg)', targetMuscle: 'Explosive Back Drive', repsOrHold: '5 reps @ RPE 8.5', formCue: 'Reset every rep on floor.' }],
        },
      },
      {
        id: 'gym_vol_legs',
        name: 'Unilateral Knee/Hip Hypertrophy Block',
        targetMuscle: 'Quadriceps Vastus Lateralis & Hamstrings',
        category: 'VOLUME',
        defaultSets: 3,
        repsByTier: {
          1: 'Leg Press with High & Wide Stance: 12 reps',
          2: 'Dumbbell Bulgarian Split Squat: 8-10 reps/side',
          3: 'Heavy Barbell Walking Lunges: 10 steps per leg',
          4: 'Deficit Bulgarian Split Squats (Front foot elevated): 8 reps/side with pause',
          5: 'Hatfield Split Squat / Heavy 1-Leg Leg Press: 6 heavy reps + drop set',
        },
        baseRestSeconds: 75,
        baseRPE: 8,
        cuesByTier: {
          1: 'Keep lower back glued to pad; do not allow pelvis to tuck under at bottom.',
          2: 'Sink down and back into rear hip; keep front knee tracked over second toe.',
          3: 'Control knee touch softly to floor; push forward through lead heel.',
          4: 'Extra range of motion deep in the hole creates massive mechanical stretch.',
          5: 'Hold rack for balance to maximize pure motor recruitment without stability bottlenecks.',
        },
        stressJoints: ['Knees'],
        jointAlternatives: {
          Knees: {
            name: 'Seated Hamstring Leg Curl + 45° Hyperextension',
            targetMuscle: 'Biceps Femoris & Gluteus Maximus',
            formCue: 'Point toes toward shins; pull heels aggressively under seat; zero knee extension load.',
            reps: '10-12 reps with 2s squeeze',
            reason: 'Posterior-chain isolated work bypasses the patellofemoral cartilage entirely',
            protectionTag: 'KNEE PROTECTION',
          },
        },
        swapsByTier: {
          1: [{ name: 'Goblet Box Squats with Vertical Shins', targetMuscle: 'Glutes & Quads', repsOrHold: '12 reps', formCue: 'Sit back into box.' }],
          2: [{ name: 'Dumbbell Romanian Deadlift with 3s Negative', targetMuscle: 'Hamstrings', repsOrHold: '10 reps', formCue: 'Feel deep hamstring stretch.' }],
          3: [
            { name: 'Barbell Hip Thrust with 2s Pause', targetMuscle: 'Gluteus Maximus', repsOrHold: '8-10 reps', formCue: 'Drive hips up; lock out with glutes.' },
            { name: 'Hack Squat Machine (Foot Placement High)', targetMuscle: 'Quads & Glutes', repsOrHold: '8 reps', formCue: 'Sink deep into knee bend.' },
          ],
          4: [{ name: 'Single-Leg Barbell Romanian Deadlift', targetMuscle: 'Hamstrings & Stability', repsOrHold: '6 reps/side', formCue: 'Hips square to deck.' }],
          5: [{ name: 'Safety Bar Reverse Lunge from Block', targetMuscle: 'Unilateral Peak Strength', repsOrHold: '5 reps/side', formCue: 'Vertical torso, deep hip drop.' }],
        },
      },
    ],
    FINISHER: [
      {
        id: 'gym_fin_conditioning',
        name: 'Iron Conditioning & Loaded Carry',
        targetMuscle: 'Trap Bar Carry, Forearms, Core & Lungs',
        category: 'FINISHER',
        defaultSets: 3,
        repsByTier: {
          1: 'Farmer Walks with Dumbbells: 40 meters x 3 rounds',
          2: 'Heavy Kettlebell Suitcase Carry: 30 meters per side x 3 rounds',
          3: 'Heavy Trap Bar Farmer Walk: 50 meters with 1.25x Bodyweight',
          4: 'Assault Bike Sprint 15s Max Wattage + 40m Heavy Prowler Push x 4 rounds',
          5: 'D-Ball / Sandbag to Shoulder Carry 50m @ 70kg + SkiErg Burnout (3 Rounds)',
        },
        baseRestSeconds: 60,
        baseRPE: 9,
        cuesByTier: {
          1: 'Stand tall with proud chest; take short, disciplined, heel-to-toe strides.',
          2: 'Resist lateral flexion; core must stay completely vertical like a steel pillar.',
          3: 'Pack lats down and back; crush handles with vice-like grip.',
          4: 'All-out anaerobic drive; breathe deeply during transitions.',
          5: 'Lap the stone tight to chest; march with authoritative forward cadence.',
        },
        stressJoints: ['Wrists', 'Lower Back', 'Knees'],
        jointAlternatives: {
          Wrists: {
            name: 'Zercher Carry in Elbow Crooks / Safety Bar Yoke Walk',
            targetMuscle: 'Core, Traps & Anterior Chain',
            formCue: 'Cradle weight in the crook of elbows; hands clasped together with zero wrist load.',
            reps: '40 meters x 3 rounds',
            reason: 'Transfers loaded carry weight into forearms and thoracic core without hand grip strain',
            protectionTag: 'WRIST PROTECTION',
          },
          'Lower Back': {
            name: 'Rogue Sled Drag (Forward & Backward) with Hip Harness',
            targetMuscle: 'Leg Drive & Cardiovascular Engine',
            formCue: 'Tether harness to waist; lean forward and drive through legs without spinal load.',
            reps: '40 meters continuous x 3 rounds',
            reason: 'Zero axial or compressive load on the lumbar vertebrae',
            protectionTag: 'LOWER BACK PROTECTION',
          },
          Knees: {
            name: 'Backward Sled Drag on Turf with Incline Torso',
            targetMuscle: 'Vastus Medialis Strengthening with zero shearing',
            formCue: 'Toe-to-heel rolling steps; maintain steady tension in quads.',
            reps: '30 meters x 3 rounds',
            reason: 'Rehabilitates knees by strengthening VMO without compressive patellar spikes',
            protectionTag: 'KNEE PROTECTION',
          },
        },
        swapsByTier: {
          1: [{ name: 'Dumbbell Goblet Carry', targetMuscle: 'Anterior Core & Lungs', repsOrHold: '50 meters x 3 rounds', formCue: 'Hold dumbbell tight against sternum.' }],
          2: [{ name: 'Kettlebell Overhead Waiter Walk', targetMuscle: 'Shoulder Centration & Core', repsOrHold: '30 meters/side x 3', formCue: 'Lock arm vertically over head.' }],
          3: [
            { name: 'RowErg 500m Sprint Intervals', targetMuscle: 'Full Body Aerobic/Anaerobic', repsOrHold: '3 x 500m (Target sub 1:40)', formCue: 'Leg drive, hip swing, arm pull.' },
            { name: 'Kettlebell Snatch Density Protocol', targetMuscle: 'Posterior Power & Grip', repsOrHold: '10 reps/side x 4 rounds', formCue: 'Punch hand through at top lockout.' },
          ],
          4: [{ name: 'Heavy Prowler Sled Push (+100kg)', targetMuscle: 'Quadricep & Lung Engine', repsOrHold: '40m x 4 sprints', formCue: 'Low handles, drive toes into turf.' }],
          5: [{ name: 'Sandbag Clean and Bear Hug Carry (80kg)', targetMuscle: 'Full Body Bracing & Grip', repsOrHold: '50m x 3 rounds', formCue: 'Bear-hug tight to chest; march tall.' }],
        },
      },
    ],
  },
};

export function generateDailyProtocol(calibration: CalibrationState): DailyProtocol {
  const { modality, tier, objective, persona, energy, timeWindow, soreJoints } = calibration;
  const isLowEnergy = energy <= 2;
  const library = EXERCISE_LIBRARY[modality];
  const adaptationsSummary: string[] = [];

  // Helper to adapt exercise based on flagged sore joints
  const adaptExercise = (base: BaseExerciseData, targetCategory: Exercise['category']): Exercise => {
    let finalName = base.name;
    let finalMuscle = base.targetMuscle;
    let finalCue = base.cuesByTier[tier] || 'Execute with strict cadence and full control.';
    let finalReps = base.repsByTier[tier] || '8-10 reps';
    let isAdapted = false;
    let adaptationReason: string | undefined = undefined;
    let protectionTag: string | undefined = undefined;
    let originalExerciseName: string | undefined = undefined;

    // Check if any flagged joint matches exercise stress joints
    const matchingJoint = soreJoints.find(j => j !== 'None' && base.stressJoints.includes(j as any));
    if (matchingJoint && base.jointAlternatives && base.jointAlternatives[matchingJoint]) {
      const alt = base.jointAlternatives[matchingJoint]!;
      originalExerciseName = base.name;
      finalName = alt.name;
      finalMuscle = alt.targetMuscle;
      finalCue = alt.formCue;
      finalReps = alt.reps;
      isAdapted = true;
      protectionTag = alt.protectionTag;
      adaptationReason = `Adapted for ${matchingJoint} recovery: ${alt.reason}`;
      const summaryText = `Swapped "${originalExerciseName}" for "${finalName}" (${protectionTag} active)`;
      if (!adaptationsSummary.includes(summaryText)) {
        adaptationsSummary.push(summaryText);
      }
    }

    // Adjust sets and RPE based on Energy
    let sets = base.defaultSets;
    let rpeVal = base.baseRPE;

    if (isLowEnergy) {
      rpeVal = Math.max(5.5, rpeVal - 1.5);
      if (sets > 3) sets -= 1;
      finalCue = `[LOW CNS PROTOCOL] ` + finalCue;
    } else if (energy === 5) {
      rpeVal = Math.min(9.5, rpeVal + 0.5);
    }

    // Fine-tune rest based on objective
    let restSec = base.baseRestSeconds;
    if (objective === 'STRENGTH') {
      restSec += 30;
    } else if (objective === 'SHRED') {
      restSec = Math.max(30, restSec - 15);
    }

    // Build swap options pool for 1-click manual swaps
    const tierSwaps = base.swapsByTier && base.swapsByTier[tier] ? base.swapsByTier[tier] : [];
    const swapPool: ExerciseSwapOption[] = [
      {
        name: finalName,
        targetMuscle: finalMuscle,
        repsOrHold: finalReps,
        formCue: finalCue,
        restSeconds: restSec,
        rpe: `RPE ${rpeVal.toFixed(1)}`,
      },
      ...tierSwaps.map(s => ({
        name: s.name,
        targetMuscle: s.targetMuscle,
        repsOrHold: s.repsOrHold,
        formCue: s.formCue,
        restSeconds: s.restSeconds || restSec,
        rpe: s.rpe || `RPE ${rpeVal.toFixed(1)}`,
      })),
    ];

    return {
      id: `${base.id}_${tier}_${modality}`,
      name: finalName,
      targetMuscle: finalMuscle,
      sets,
      repsOrHold: finalReps,
      restSeconds: restSec,
      rpe: `RPE ${rpeVal.toFixed(1)}`,
      formCue: finalCue,
      isAdapted,
      adaptationReason,
      protectionTag,
      originalExerciseName,
      category: targetCategory,
      swapPool,
      currentSwapIndex: 0,
    };
  };

  // Build Blocks based on Time Window
  const blocks: ProtocolBlock[] = [];

  // Block 1: Warmup
  const warmExercises = library.WARMUP.slice(0, timeWindow === 20 ? 1 : 2).map(e => adaptExercise(e, 'WARMUP'));
  blocks.push({
    type: 'WARMUP',
    title: 'BLOCK 01 // DYNAMIC PRIMING & JOINT PREP',
    subtitle: timeWindow === 20 ? 'High-efficiency 3-minute neural priming' : 'Rotator cuff, scapulae, and hip capsule activation',
    exercises: warmExercises,
  });

  // Block 2: Primary Compound / Skill
  const primaryCount = timeWindow === 20 ? 1 : library.PRIMARY.length;
  const primaryExercises = library.PRIMARY.slice(0, primaryCount).map(e => adaptExercise(e, 'PRIMARY'));
  blocks.push({
    type: 'PRIMARY',
    title: 'BLOCK 02 // PRIMARY SKILL & COMPOUND ANCHOR',
    subtitle: `${TIER_CONFIG[tier].name} Tier Neurological Output & Heavy Mechanical Tension`,
    exercises: primaryExercises,
  });

  // Block 3: Volume / Accessory (Only for 45m and 60m)
  if (timeWindow >= 45) {
    const volExercises = library.VOLUME.map(e => adaptExercise(e, 'VOLUME'));
    blocks.push({
      type: 'VOLUME',
      title: 'BLOCK 03 // HYPERTROPHY & ACCESSORY DENSITY',
      subtitle: 'Targeted muscular volume, unilateral stability & core rigidity',
      exercises: volExercises,
    });
  }

  // Block 4: Secondary Unilateral Block (Only for 60m full session)
  if (timeWindow === 60) {
    const auxExercises: Exercise[] = [
      {
        id: `aux_core_${tier}_${modality}`,
        name: modality === 'BODYWEIGHT' ? 'Ring Pelican Curls or Incline Tricep Extensions' : 'Cable Face Pulls Superset with Overhead Rope Extensions',
        targetMuscle: 'Elbow Flexor / Extensor Joint Health & Tendon Resilience',
        sets: 3,
        repsOrHold: '12-15 reps (Strict Eccentric)',
        restSeconds: 60,
        rpe: isLowEnergy ? 'RPE 6.5' : 'RPE 8.0',
        formCue: 'Full active stretch at the bottom; lock joint at the apex without hyperextending.',
        category: 'SECONDARY',
        swapPool: [
          {
            name: modality === 'BODYWEIGHT' ? 'Ring Pelican Curls or Incline Tricep Extensions' : 'Cable Face Pulls Superset with Overhead Rope Extensions',
            targetMuscle: 'Elbow Flexor / Extensor Joint Health',
            repsOrHold: '12-15 reps',
            formCue: 'Full active stretch at the bottom.',
            restSeconds: 60,
            rpe: 'RPE 7.5',
          },
          {
            name: modality === 'BODYWEIGHT' ? 'Parallette Tricep Dips' : 'Dumbbell Hammer Curls',
            targetMuscle: 'Arm Hypertrophy & Joint Balance',
            repsOrHold: '10-12 reps',
            formCue: 'Controlled eccentric cadence.',
            restSeconds: 60,
            rpe: 'RPE 7.5',
          },
        ],
        currentSwapIndex: 0,
      },
      {
        id: `aux_stability_${tier}_${modality}`,
        name: modality === 'BODYWEIGHT' ? 'Jefferson Curl / Elephant Walk Stretch' : 'Standing Calf Raise with 3-Second Achilles Stretch',
        targetMuscle: 'Posterior Kinetic Chain & Fascial Elasticity',
        sets: 3,
        repsOrHold: '10 deliberate reps',
        restSeconds: 60,
        rpe: 'RPE 6.0',
        formCue: 'Articulate vertebra by vertebra or hold deep dorsiflexion stretch smoothly.',
        category: 'SECONDARY',
        swapPool: [
          {
            name: modality === 'BODYWEIGHT' ? 'Jefferson Curl / Elephant Walk Stretch' : 'Standing Calf Raise with 3-Second Achilles Stretch',
            targetMuscle: 'Posterior Kinetic Chain & Fascial Elasticity',
            repsOrHold: '10 deliberate reps',
            formCue: 'Articulate vertebra by vertebra smoothly.',
            restSeconds: 60,
            rpe: 'RPE 6.0',
          },
          {
            name: modality === 'BODYWEIGHT' ? 'Seated Straddle Good Mornings' : 'Seated Soleus Calf Raise',
            targetMuscle: 'Ankle & Hip Fascial Tension',
            repsOrHold: '12 reps',
            formCue: 'Deep 3-second stretch pause.',
            restSeconds: 60,
            rpe: 'RPE 6.0',
          },
        ],
        currentSwapIndex: 0,
      },
    ];

    blocks.push({
      type: 'SECONDARY',
      title: 'BLOCK 04 // STRUCTURAL BALANCE & KINETIC HEALTH',
      subtitle: 'Joint longevity, antagonist balance & fascial chain elasticity',
      exercises: auxExercises,
    });
  }

  // Block Final: Finisher
  const finisherExercises = library.FINISHER.slice(0, 1).map(e => adaptExercise(e, 'FINISHER'));
  blocks.push({
    type: 'FINISHER',
    title: timeWindow === 20 ? 'BLOCK 03 // METABOLIC FINISHER' : timeWindow === 45 ? 'BLOCK 04 // METABOLIC FINISHER' : 'BLOCK 05 // METABOLIC FINISHER',
    subtitle: 'Lactic buffering capacity, cardiovascular fortitude & post-activation burn',
    exercises: finisherExercises,
  });

  // Coach Directives & Voice Banner
  const coachDirective = generateCoachVoice(persona, energy, tier, modality, objective, soreJoints);

  // Pillar 02: Fuel & Recovery Targets
  const fuelTargets = generateFuelTargets(objective, energy);

  // Pillar 03: Discipline Avoid Guardrails
  const avoidRules = generateAvoidRules(tier, modality, objective, soreJoints, energy);

  return {
    id: `proto_${modality}_${tier}_${timeWindow}_${energy}`,
    generatedAt: '08:00 AM (SYNC ACTIVE)',
    modality,
    tier,
    tierTitle: TIER_CONFIG[tier].name,
    objectiveLabel: getObjectiveLabel(objective),
    persona,
    timeWindow,
    energy,
    coachDirective,
    blocks,
    fuelTargets,
    avoidRules,
    adaptationsSummary,
  };
}

// 1-Click Manual Exercise Swap: cycles through the exercise's swap pool
export function cycleExerciseSwap(exercise: Exercise): Exercise {
  if (!exercise.swapPool || exercise.swapPool.length <= 1) {
    return exercise;
  }

  const currentIndex = exercise.currentSwapIndex || 0;
  const nextIndex = (currentIndex + 1) % exercise.swapPool.length;
  const nextOption = exercise.swapPool[nextIndex];

  return {
    ...exercise,
    name: nextOption.name,
    targetMuscle: nextOption.targetMuscle,
    repsOrHold: nextOption.repsOrHold,
    formCue: nextOption.formCue,
    restSeconds: nextOption.restSeconds || exercise.restSeconds,
    rpe: nextOption.rpe || exercise.rpe,
    currentSwapIndex: nextIndex,
  };
}

// Apply coach adjustment response to active protocol
export function applyCoachAdjustment(protocol: DailyProtocol, coachResp: CoachApiResponse): DailyProtocol {
  const updatedBlocks = protocol.blocks.map(b => ({
    ...b,
    exercises: b.exercises.map(e => ({ ...e })),
  }));

  // If coach modified specific exercises, apply them
  if (coachResp.modifiedWorkout?.blockOverrides) {
    for (const override of coachResp.modifiedWorkout.blockOverrides) {
      if (updatedBlocks[override.blockIndex] && override.exerciseOverrides) {
        override.exerciseOverrides.forEach((exOverride, exIdx) => {
          if (updatedBlocks[override.blockIndex].exercises[exIdx]) {
            updatedBlocks[override.blockIndex].exercises[exIdx] = {
              ...updatedBlocks[override.blockIndex].exercises[exIdx],
              ...exOverride,
            };
          }
        });
      }
    }
  }

  return {
    ...protocol,
    coachDirective: coachResp.directive,
    blocks: updatedBlocks,
    activeCommand: coachResp.adjustmentsSummary,
  };
}

function getObjectiveLabel(obj: CalibrationState['objective']): string {
  switch (obj) {
    case 'SHRED': return 'SHRED & CONDITIONING';
    case 'HYPERTROPHY': return 'LEAN HYPERTROPHY';
    case 'SKILLS': return 'EXPLOSIVE POWER & SKILLS';
    case 'STRENGTH': return 'PURE STRENGTH';
  }
}

function generateCoachVoice(
  persona: CalibrationState['persona'],
  energy: CalibrationState['energy'],
  tier: DifficultyTier,
  modality: Modality,
  objective: CalibrationState['objective'],
  soreJoints: JointSoreness[]
) {
  const hasInjuries = soreJoints.filter(j => j !== 'None').length > 0;
  const isScientist = persona === 'TACTICAL_SCIENTIST';

  if (isScientist) {
    if (energy <= 2) {
      return {
        quote: `"Central Nervous System battery is operating at suboptimal capacity (Level ${energy}/5). We are intentionally dampening peak RPE thresholds to 6.5–7.0. Our objective today is neurological preservation, pristine motor unit patterning, and zero systemic burnout."`,
        subtext: `Biomechanical prescription: dialed down volume, heightened technical precision, optimized rest intervals.`,
        cnsStatus: `CNS STATE: DEFICIT (RECOVERY PROTOCOL ACTIVE)`,
      };
    } else if (hasInjuries) {
      return {
        quote: `"Joint telemetry flagged kinetic chain friction at [${soreJoints.filter(j => j !== 'None').join(', ')}]. We have re-routed axial load angles and isolated stable levers to safeguard joint integrity while preserving mechanical tension."`,
        subtext: `Kinetic adaptation verified: substitute movement patterns loaded with zero compromise on target hypertrophy.`,
        cnsStatus: `CNS STATE: CALIBRATED (JOINT SPARING ENABLED)`,
      };
    } else {
      return {
        quote: `"Biomechanics primed. You are dialed into ${TIER_CONFIG[tier].name} execution on ${modality === 'BODYWEIGHT' ? 'Calisthenics levers' : 'Gym Iron compounds'}. Focus on high-velocity concentric drive, 2-second controlled eccentrics, and rigid core bracing."`,
        subtext: `Motor recruitment peak expected. Ensure exact rest interval compliance for complete ATP-PC resynthesis.`,
        cnsStatus: `CNS STATE: PEAK READINESS (OPTIMAL OUTPUT)`,
      };
    }
  } else {
    // DRILL SERGEANT
    if (energy <= 2) {
      return {
        quote: `"You say your energy is low? The calendar doesn't care and your goals don't care. We adjusted the intensity so you don't snap your tendons, but you STILL SHOW UP and you STILL LOCK IN. Every single rep will be strict!"`,
        subtext: `Zero room for slacking. Lower volume means you owe me absolute perfection on every millimeter.`,
        cnsStatus: `CNS STATE: LOW BATTERY // ZERO EXCUSES PERMITTED`,
      };
    } else if (hasInjuries) {
      return {
        quote: `"Joints barking? Good, we adapt like warriors. We swapped the high-stress lifts for bulletproof alternatives. You will attack these substitute movements with violent intent and respect the line!"`,
        subtext: `Work around the pain, don't quit. Mind the cues, clamp your core down, and execute without hesitation.`,
        cnsStatus: `CNS STATE: ARMORED & ADAPTED // ENGAGE`,
      };
    } else {
      return {
        quote: `"TIER ${tier} ${TIER_CONFIG[tier].name}. Today is not a casual jog in the park. You chose ${modality} and you chose ${getObjectiveLabel(objective)}. Step up, grip the bar, and leave zero doubt on that platform!"`,
        subtext: `No phone scrolling between sets. Eyes locked, timer running. Earn your recovery tonight.`,
        cnsStatus: `CNS STATE: MAXIMUM COMBAT READINESS`,
      };
    }
  }
}

function generateFuelTargets(objective: CalibrationState['objective'], energy: CalibrationState['energy']): FuelTarget[] {
  switch (objective) {
    case 'SHRED':
      return [
        {
          id: 'fuel_protein',
          label: 'TARGET PROTEIN DENSITY',
          value: '2.2g / kg (1.0g / lb)',
          detail: 'High thermic effect of feeding. Split across 4 meals (approx 40g leucine-rich protein per feeding to spare muscle tissue).',
          metric: 'METABOLIC PRESERVATION',
        },
        {
          id: 'fuel_hydration',
          label: 'HYDRATION & ELECTROLYTE MATRIX',
          value: '3.8 Liters + 800mg Sodium',
          detail: 'Drink 750ml within 60 mins of waking. Sip electrolyte-infused water during training to maintain blood volume and blunt hunger signals.',
          metric: 'CELLULAR VOLUMIZATION',
        },
        {
          id: 'fuel_recovery',
          label: 'NEAT & CORTISOL DOWNSHIFT',
          value: '10,000 Steps + 15m Breathwork',
          detail: 'Low-intensity non-exercise physical activity keeps lipolysis active. Perform 4-7-8 box breathing post-workout to accelerate parasympathetic shift.',
          metric: 'AUTONOMIC RECOVERY',
        },
      ];
    case 'HYPERTROPHY':
      return [
        {
          id: 'fuel_protein',
          label: 'OPTIMAL PROTEIN SYNTHESIS',
          value: '2.0g / kg (0.9g / lb)',
          detail: 'Keep positive nitrogen balance. Include a whey/casein or high-bioavailability meal within 90 minutes post-session.',
          metric: 'ANABOLIC ACCELERATOR',
        },
        {
          id: 'fuel_hydration',
          label: 'PERI-WORKOUT GLYCOGEN RELOAD',
          value: '45g Fast Carbs + 3.5L Water',
          detail: 'Ingest 35-45g maltodextrin/cluster dextrin or ripe bananas pre/intra workout to maintain intracellular glycogen pressure and pump.',
          metric: 'SARCOPLASMIC PUMP',
        },
        {
          id: 'fuel_recovery',
          label: '8.5-HOUR DEEP SLEEP ANCHOR',
          value: '8h 30m Sleep Window',
          detail: 'Magnesium glycinate (400mg) 45 min before lights out. Pitch-black room at 18°C (65°F) for maximum nocturnal Growth Hormone release.',
          metric: 'NEURAL & TISSUE REPAIR',
        },
      ];
    case 'SKILLS':
      return [
        {
          id: 'fuel_protein',
          label: 'NEURAL TRANSMISSION RECOVERY',
          value: '1.8g / kg (0.85g / lb)',
          detail: 'Prioritize choline-rich whole eggs and wild fish to replenish acetylcholine pools depleted during high-skill motor unit training.',
          metric: 'NEURO-RECEPTOR FUEL',
        },
        {
          id: 'fuel_hydration',
          label: 'POTASSIUM & MAGNESIUM INFUSION',
          value: '3.5 Liters + 1,000mg Potassium',
          detail: 'Coconut water or electrolyte formulation to prevent isometric cramping during Planche, Front Lever, and Handstand holds.',
          metric: 'SYNAPTIC TRANSMISSION',
        },
        {
          id: 'fuel_recovery',
          label: 'MYOFASCIAL & TENDON NOURISHMENT',
          value: '15g Collagen Peptides + Vit C',
          detail: 'Take 30 mins prior to or immediately after skill work to direct amino acids into avascular distal biceps and wrist tendons.',
          metric: 'TENDON SHIELDING',
        },
      ];
    case 'STRENGTH':
      return [
        {
          id: 'fuel_protein',
          label: 'FORCE PRODUCTION NUTRITION',
          value: '2.0g / kg (0.95g / lb)',
          detail: 'Consistent daily protein threshold. 5g daily Creapure Creatine Monohydrate to guarantee 100% intracellular phosphocreatine stores.',
          metric: 'PHOSPHAGEN STORAGE',
        },
        {
          id: 'fuel_hydration',
          label: 'INTRA-SESSION SODIUM LOADING',
          value: '4.0 Liters + 1,200mg Sodium',
          detail: 'Pinch of Himalayan pink salt in your workout bottle to maintain optimal neuromuscular junction firing and prevent power dips.',
          metric: 'MOTOR FIRING RATE',
        },
        {
          id: 'fuel_recovery',
          label: 'CNS DECOMPRESSION PROTOCOL',
          value: 'Contrast Shower + 20m Legs Up Wall',
          detail: 'Alternate 1 min cold / 2 min hot for 4 rounds to flush metabolic byproduct; invert legs post-training to reset arterial pressure.',
          metric: 'CENTRAL NERVOUS SYSTEM REBOOT',
        },
      ];
  }
}

function generateAvoidRules(
  tier: DifficultyTier,
  modality: Modality,
  objective: CalibrationState['objective'],
  soreJoints: JointSoreness[],
  energy: CalibrationState['energy']
): AvoidRule[] {
  const rules: AvoidRule[] = [];

  // Form trap based on Modality & Tier
  if (modality === 'BODYWEIGHT') {
    if (tier >= 3) {
      rules.push({
        id: 'avoid_kip',
        title: 'AVOID MOMENTUM & KIPPING EXTENSION',
        description: 'Zero swinging of the knees or pike-kipping on pull-ups, muscle-ups, or dips. Kipping destroys tendon tension and robs you of genuine neurological adaptation.',
        severity: 'CRITICAL',
      });
    } else {
      rules.push({
        id: 'avoid_sag',
        title: 'AVOID LUMBAR SAG & BROKEN PLANKS',
        description: 'Never let your pelvis dip toward the deck during push-ups or core drills. Glutes must remain clamped in a rigid posterior pelvic tilt at all times.',
        severity: 'CRITICAL',
      });
    }
  } else {
    // GYM
    if (tier >= 3) {
      rules.push({
        id: 'avoid_bounce',
        title: 'AVOID CHEST-BOUNCING & SPINAL DRIFT',
        description: 'Never bounce barbell compound presses off the sternum or hyperextend lumbar vertebrae under back squat loads. Own the bottom 1-second isometric freeze.',
        severity: 'CRITICAL',
      });
    } else {
      rules.push({
        id: 'avoid_ego',
        title: 'AVOID EGO-LIFTING PAST CONTROLLED RPE',
        description: 'Do not chase weight on the bar if your concentric cadence stutters into broken form. Bar speed and joint alignment dictate load, not vanity.',
        severity: 'CRITICAL',
      });
    }
  }

  // Recovery / joint trap
  if (soreJoints.includes('Wrists') || soreJoints.includes('Shoulders')) {
    rules.push({
      id: 'avoid_joint_grind',
      title: 'AVOID GRINDING THROUGH SHARP JOINT FRICTION',
      description: 'Your recovery guardrails are active. If an exercise creates a sharp localized joint pinch, terminate the set immediately. Muscle burn is encouraged; joint pain is strictly banned.',
      severity: 'CRITICAL',
    });
  } else {
    rules.push({
      id: 'avoid_phone',
      title: 'AVOID REST-INTERVAL DILATION & PHONES',
      description: 'Do not allow 90-second rest windows to drift into 3-minute passive social media scrolling. Cognitive distraction blunts sympathetic motor drive and cools down muscle spindles.',
      severity: 'WARNING',
    });
  }

  // Energy/Nutrition Trap
  if (energy <= 2) {
    rules.push({
      id: 'avoid_stimulants',
      title: 'AVOID OVER-CAFFEINATING LOW CNS BATTERY',
      description: 'Do not slam 400mg of caffeine to mask autonomic fatigue. Masking systemic exhaustion with excessive stimulants triggers high cortisol and stalls protein synthesis.',
      severity: 'WARNING',
    });
  } else {
    rules.push({
      id: 'avoid_liquids',
      title: 'AVOID EMPTY POST-SESSION ALCOHOL & JUNK SUGARS',
      description: 'Avoid alcohol or heavy processed sugars within 6 hours of today’s session. Alcohol reduces myofibrillar protein synthesis by up to 37% and disrupts rapid eye movement repair.',
      severity: 'WARNING',
    });
  }

  return rules;
}
