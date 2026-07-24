// src/data/muscles.js
//
// Central mock dataset for the AuraForge Body Explorer.
// Shape is intentionally flat & serializable so it can later be swapped
// for an API response without touching any component code.
//
// NOTE: masteryLevel / xp values are placeholders only.
// They are NOT wired to AuraFarm's real XP system (see Critical Rules).

const placeholderThumb = (seed) =>
  `https://placehold.co/320x180/141420/A855F7?text=${encodeURIComponent(seed)}`;

const makeVideo = (title, muscle, duration, difficulty, xp) => ({
  id: `${muscle}-vid-${title.toLowerCase().replace(/\s+/g, "-")}`,
  title,
  thumbnail: placeholderThumb(title),
  duration,
  difficulty,
  targetMuscle: muscle,
  xpReward: xp,
});

const makeExercise = (name, difficulty, equipment, area, sets, reps, instructions) => ({
  id: name.toLowerCase().replace(/\s+/g, "-"),
  name,
  difficulty,
  equipment,
  targetArea: area,
  sets,
  reps,
  instructions,
});

const makeMission = (title, xp, difficulty, time) => ({
  id: title.toLowerCase().replace(/\s+/g, "-"),
  title,
  xpReward: xp,
  difficulty,
  estimatedTime: time,
});

const defaultRecovery = {
  stretches: ["Standing wall stretch, 30s hold", "Cross-body reach, 3 reps per side"],
  mobilityDrills: ["Controlled circles, 10 reps", "Band pull-apart, 12 reps"],
  recoveryTips: ["Prioritize 48h before re-training this region", "Light active movement beats total rest"],
  sleepRecommendation: "7-9 hours; growth hormone release peaks in early deep-sleep cycles",
};

const defaultNutrition = {
  proteinSuggestion: "0.7-1g protein per lb bodyweight daily, spread across meals",
  hydration: "Half your bodyweight (lb) in oz of water per day, more on training days",
  recoveryFoods: ["Greek yogurt + berries", "Salmon + rice", "Eggs + whole grain toast"],
  caloriesGuidance: "Slight surplus (~10%) for growth phases, maintenance for recomposition",
};

const objectiveConnections = {
  build: "Build Physique",
  strength: "Gain Strength",
  endurance: "Improve Endurance",
};

function muscle({
  id,
  name,
  category,
  difficulty,
  description,
  masteryLevel,
  xp,
  xpToNext,
  primaryFunction,
  secondaryFunction,
  synergists,
  movementPattern,
  commonUses,
  objectives,
}) {
  return {
    id,
    name,
    category,
    difficulty,
    description,
    masteryLevel,
    xp,
    xpToNext,
    objectiveConnections: objectives.map((o) => objectiveConnections[o]),
    resources: {
      videos: [
        makeVideo(`${name} Fundamentals`, name, "6:20", "Beginner", 25),
        makeVideo(`${name} Growth Protocol`, name, "11:05", "Intermediate", 40),
      ],
      exercises: [
        makeExercise(
          `${name} Isolation Set`,
          difficulty,
          "Dumbbell",
          name,
          3,
          "10-12",
          [
            "Set up with a full, controlled range of motion.",
            "Move through the concentric phase for 1-2 seconds.",
            "Pause briefly at peak contraction.",
            "Lower with control over 2-3 seconds.",
          ]
        ),
        makeExercise(
          `${name} Compound Movement`,
          difficulty === "Beginner" ? "Intermediate" : "Advanced",
          "Barbell",
          name,
          4,
          "6-8",
          [
            "Brace core and set a neutral spine.",
            "Drive through the primary movement pattern.",
            "Keep tension on the target region throughout.",
            "Reset fully between reps.",
          ]
        ),
      ],
      anatomy: {
        primaryFunction,
        secondaryFunction,
        synergistMuscles: synergists,
        movementPattern,
        commonUses,
      },
      recovery: defaultRecovery,
      nutrition: defaultNutrition,
      missions: [
        makeMission(`Complete 3 Sets — ${name}`, 30, "Easy", "10 min"),
        makeMission(`${name} Full Workout`, 75, "Medium", "35 min"),
        makeMission(`${name} Mobility Session`, 20, "Easy", "8 min"),
        makeMission(`${name} Recovery Session`, 15, "Easy", "12 min"),
        makeMission(`Hydration Goal`, 10, "Easy", "All day"),
      ],
    },
    masteryUI: {
      level: masteryLevel,
      xp,
      xpToNext,
      progressPct: Math.round((xp / xpToNext) * 100),
    },
  };
}

export const MUSCLE_GROUPS = [
  muscle({
    id: "chest",
    name: "Chest",
    category: "Push",
    difficulty: "Beginner",
    description:
      "The pectoral muscles power pressing movements and control shoulder horizontal flexion.",
    masteryLevel: 3,
    xp: 310,
    xpToNext: 500,
    primaryFunction: "Horizontal shoulder flexion",
    secondaryFunction: "Shoulder internal rotation",
    synergists: ["Shoulders", "Triceps"],
    movementPattern: "Horizontal Push",
    commonUses: ["Bench press", "Push-ups", "Cable fly"],
    objectives: ["build", "strength"],
  }),
  muscle({
    id: "shoulders",
    name: "Shoulders",
    category: "Push",
    difficulty: "Intermediate",
    description:
      "The deltoids stabilize and drive nearly every overhead and rotational arm movement.",
    masteryLevel: 2,
    xp: 180,
    xpToNext: 400,
    primaryFunction: "Shoulder abduction & flexion",
    secondaryFunction: "Joint stabilization",
    synergists: ["Chest", "Upper Back", "Triceps"],
    movementPattern: "Vertical Push",
    commonUses: ["Overhead press", "Lateral raise", "Arnold press"],
    objectives: ["build", "endurance"],
  }),
  muscle({
    id: "biceps",
    name: "Biceps",
    category: "Arms",
    difficulty: "Beginner",
    description:
      "The biceps brachii flexes the elbow and supinates the forearm, key to all pulling work.",
    masteryLevel: 4,
    xp: 420,
    xpToNext: 600,
    primaryFunction: "Elbow flexion",
    secondaryFunction: "Forearm supination",
    synergists: ["Forearms", "Upper Back"],
    movementPattern: "Pull",
    commonUses: ["Barbell curl", "Chin-up", "Hammer curl"],
    objectives: ["build", "strength"],
  }),
  muscle({
    id: "triceps",
    name: "Triceps",
    category: "Arms",
    difficulty: "Beginner",
    description:
      "The triceps brachii extends the elbow and is the primary driver of pressing lockout strength.",
    masteryLevel: 2,
    xp: 150,
    xpToNext: 350,
    primaryFunction: "Elbow extension",
    secondaryFunction: "Shoulder stabilization",
    synergists: ["Chest", "Shoulders"],
    movementPattern: "Push",
    commonUses: ["Dips", "Skull crushers", "Cable pushdown"],
    objectives: ["build", "strength"],
  }),
  muscle({
    id: "forearms",
    name: "Forearms",
    category: "Arms",
    difficulty: "Beginner",
    description:
      "Forearm flexors and extensors govern grip strength and wrist control across all lifts.",
    masteryLevel: 1,
    xp: 60,
    xpToNext: 250,
    primaryFunction: "Grip strength & wrist flexion",
    secondaryFunction: "Wrist extension & stabilization",
    synergists: ["Biceps"],
    movementPattern: "Grip / Stabilize",
    commonUses: ["Farmer's carry", "Wrist curls", "Dead hangs"],
    objectives: ["endurance", "strength"],
  }),
  muscle({
    id: "abs",
    name: "Abs",
    category: "Core",
    difficulty: "Beginner",
    description:
      "The rectus abdominis flexes the spine and anchors nearly every core-stability pattern.",
    masteryLevel: 3,
    xp: 275,
    xpToNext: 500,
    primaryFunction: "Spinal flexion",
    secondaryFunction: "Intra-abdominal pressure control",
    synergists: ["Obliques"],
    movementPattern: "Core Flexion",
    commonUses: ["Crunches", "Hanging leg raise", "Cable crunch"],
    objectives: ["build", "endurance"],
  }),
  muscle({
    id: "obliques",
    name: "Obliques",
    category: "Core",
    difficulty: "Intermediate",
    description:
      "Internal and external obliques rotate and laterally flex the trunk, key to rotational power.",
    masteryLevel: 1,
    xp: 40,
    xpToNext: 250,
    primaryFunction: "Trunk rotation",
    secondaryFunction: "Lateral flexion",
    synergists: ["Abs"],
    movementPattern: "Rotation",
    commonUses: ["Russian twist", "Woodchopper", "Side plank"],
    objectives: ["build", "endurance"],
  }),
  muscle({
    id: "quadriceps",
    name: "Quadriceps",
    category: "Legs",
    difficulty: "Intermediate",
    description:
      "The quads extend the knee and are the primary drivers of squatting and running power.",
    masteryLevel: 5,
    xp: 590,
    xpToNext: 800,
    primaryFunction: "Knee extension",
    secondaryFunction: "Hip flexion (rectus femoris)",
    synergists: ["Glutes", "Hamstrings"],
    movementPattern: "Squat",
    commonUses: ["Back squat", "Leg press", "Lunges"],
    objectives: ["strength", "endurance"],
  }),
  muscle({
    id: "hamstrings",
    name: "Hamstrings",
    category: "Legs",
    difficulty: "Intermediate",
    description:
      "The hamstrings extend the hip and flex the knee, critical for hinge and sprint mechanics.",
    masteryLevel: 2,
    xp: 140,
    xpToNext: 400,
    primaryFunction: "Hip extension",
    secondaryFunction: "Knee flexion",
    synergists: ["Glutes", "Quadriceps"],
    movementPattern: "Hinge",
    commonUses: ["Romanian deadlift", "Leg curl", "Good morning"],
    objectives: ["strength", "build"],
  }),
  muscle({
    id: "calves",
    name: "Calves",
    category: "Legs",
    difficulty: "Beginner",
    description:
      "The gastrocnemius and soleus drive ankle plantarflexion for walking, running, and jumping.",
    masteryLevel: 1,
    xp: 80,
    xpToNext: 250,
    primaryFunction: "Ankle plantarflexion",
    secondaryFunction: "Knee flexion assist (gastrocnemius)",
    synergists: ["Hamstrings"],
    movementPattern: "Plantarflexion",
    commonUses: ["Standing calf raise", "Seated calf raise", "Jump rope"],
    objectives: ["endurance", "build"],
  }),
  muscle({
    id: "upperBack",
    name: "Upper Back",
    category: "Pull",
    difficulty: "Intermediate",
    description:
      "The rhomboids and mid-traps retract the shoulder blades, key for posture and pulling strength.",
    masteryLevel: 3,
    xp: 320,
    xpToNext: 500,
    primaryFunction: "Scapular retraction",
    secondaryFunction: "Postural support",
    synergists: ["Lats", "Traps"],
    movementPattern: "Horizontal Pull",
    commonUses: ["Seated row", "Face pull", "Reverse fly"],
    objectives: ["build", "strength"],
  }),
  muscle({
    id: "lats",
    name: "Lats",
    category: "Pull",
    difficulty: "Intermediate",
    description:
      "The latissimus dorsi drives shoulder extension and adduction, the engine of vertical pulling.",
    masteryLevel: 4,
    xp: 450,
    xpToNext: 600,
    primaryFunction: "Shoulder adduction & extension",
    secondaryFunction: "Trunk stabilization",
    synergists: ["Biceps", "Upper Back"],
    movementPattern: "Vertical Pull",
    commonUses: ["Pull-up", "Lat pulldown", "Barbell row"],
    objectives: ["build", "strength"],
  }),
  muscle({
    id: "traps",
    name: "Traps",
    category: "Pull",
    difficulty: "Beginner",
    description:
      "The trapezius elevates and stabilizes the shoulder girdle across pressing and pulling work.",
    masteryLevel: 2,
    xp: 190,
    xpToNext: 400,
    primaryFunction: "Scapular elevation",
    secondaryFunction: "Neck stabilization",
    synergists: ["Shoulders", "Upper Back"],
    movementPattern: "Shrug / Elevate",
    commonUses: ["Barbell shrug", "Farmer's carry", "Upright row"],
    objectives: ["strength", "endurance"],
  }),
  muscle({
    id: "glutes",
    name: "Glutes",
    category: "Legs",
    difficulty: "Beginner",
    description:
      "The glute complex extends and rotates the hip, the single largest driver of lower-body power.",
    masteryLevel: 3,
    xp: 340,
    xpToNext: 500,
    primaryFunction: "Hip extension",
    secondaryFunction: "Hip external rotation",
    synergists: ["Hamstrings", "Quadriceps"],
    movementPattern: "Hip Extension",
    commonUses: ["Hip thrust", "Squat", "Cable kickback"],
    objectives: ["build", "strength"],
  }),
];

export const getMuscleById = (id) => MUSCLE_GROUPS.find((m) => m.id === id);

export const RESOURCE_TAB_ORDER = [
  "videos",
  "exercises",
  "anatomy",
  "recovery",
  "nutrition",
  "missions",
];
