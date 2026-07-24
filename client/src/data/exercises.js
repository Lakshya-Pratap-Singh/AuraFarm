// exercises.js — Exercise model + mock data for Exercise Forge (v1).
//
// This is mock data only, as specified — no backend/API call, no mission
// system linkage. Real content (media hosting, mission/XP hooks) is a
// later phase; this file exists so the Exercise Forge page has something
// real to render against the correct shape.

import { MUSCLE_GROUPS } from "./muscleGroups.js";

/**
 * @typedef {Object} Exercise
 * @property {string} id
 * @property {string} name
 * @property {string} muscleGroup - One of MUSCLE_GROUPS (data/muscleGroups.js).
 * @property {string} difficulty  - One of DIFFICULTY_LEVELS.
 * @property {string} equipment   - One of EQUIPMENT_TYPES.
 * @property {string} gifUrl      - Path/URL to a demo GIF (mock — not a resolvable asset yet).
 * @property {string} videoUrl    - Path/URL to a demo video (mock — not a resolvable asset yet).
 * @property {string} description
 */

export const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];

/** Accent color per difficulty level, for badge styling. Centralized here so ExerciseForge.jsx never hardcodes a color-per-level switch. */
export const DIFFICULTY_COLORS = {
  Beginner: "#4ade80",
  Intermediate: "#eab308",
  Advanced: "#ef4444",
};

export const EQUIPMENT_TYPES = [
  "Bodyweight",
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Kettlebell",
  "Resistance Band",
];

/**
 * Builds a validated Exercise record. Throws at mock-data-authoring time
 * (module load) rather than silently accepting a typo'd muscleGroup/
 * difficulty/equipment — this file is the only place that should ever
 * construct an Exercise, so failing loudly here is safe.
 *
 * @param {Partial<Exercise>} fields
 * @returns {Exercise}
 */
function createExercise(fields) {
  if (!MUSCLE_GROUPS.includes(fields.muscleGroup)) {
    throw new Error(`Exercise "${fields.name}" has unknown muscleGroup "${fields.muscleGroup}".`);
  }
  if (!DIFFICULTY_LEVELS.includes(fields.difficulty)) {
    throw new Error(`Exercise "${fields.name}" has unknown difficulty "${fields.difficulty}".`);
  }
  if (!EQUIPMENT_TYPES.includes(fields.equipment)) {
    throw new Error(`Exercise "${fields.name}" has unknown equipment "${fields.equipment}".`);
  }
  return {
    id: fields.id,
    name: fields.name,
    muscleGroup: fields.muscleGroup,
    difficulty: fields.difficulty,
    equipment: fields.equipment,
    gifUrl: fields.gifUrl ?? "",
    videoUrl: fields.videoUrl ?? "",
    description: fields.description ?? "",
  };
}

/** @type {Exercise[]} */
export const EXERCISES = [
  // ── Chest ──────────────────────────────────────────────────
  createExercise({ id: "chest-01", name: "Barbell Bench Press", muscleGroup: "Chest", difficulty: "Intermediate", equipment: "Barbell", gifUrl: "/media/exercises/chest-01.gif", videoUrl: "/media/exercises/chest-01.mp4", description: "Flat barbell press targeting the chest, front delts, and triceps." }),
  createExercise({ id: "chest-02", name: "Push-Up", muscleGroup: "Chest", difficulty: "Beginner", equipment: "Bodyweight", gifUrl: "/media/exercises/chest-02.gif", videoUrl: "/media/exercises/chest-02.mp4", description: "Classic bodyweight chest press — scalable from knees to weighted." }),
  createExercise({ id: "chest-03", name: "Cable Fly", muscleGroup: "Chest", difficulty: "Intermediate", equipment: "Cable", gifUrl: "/media/exercises/chest-03.gif", videoUrl: "/media/exercises/chest-03.mp4", description: "Constant-tension isolation move for chest width and stretch." }),

  // ── Biceps ─────────────────────────────────────────────────
  createExercise({ id: "biceps-01", name: "Dumbbell Curl", muscleGroup: "Biceps", difficulty: "Beginner", equipment: "Dumbbell", gifUrl: "/media/exercises/biceps-01.gif", videoUrl: "/media/exercises/biceps-01.mp4", description: "Standard bicep isolation curl, alternating or simultaneous." }),
  createExercise({ id: "biceps-02", name: "Barbell Curl", muscleGroup: "Biceps", difficulty: "Intermediate", equipment: "Barbell", gifUrl: "/media/exercises/biceps-02.gif", videoUrl: "/media/exercises/biceps-02.mp4", description: "Heavier bilateral curl for overall bicep mass." }),
  createExercise({ id: "biceps-03", name: "Cable Hammer Curl", muscleGroup: "Biceps", difficulty: "Intermediate", equipment: "Cable", gifUrl: "/media/exercises/biceps-03.gif", videoUrl: "/media/exercises/biceps-03.mp4", description: "Neutral-grip curl emphasizing the brachialis and forearm." }),

  // ── Triceps ────────────────────────────────────────────────
  createExercise({ id: "triceps-01", name: "Triceps Pushdown", muscleGroup: "Triceps", difficulty: "Beginner", equipment: "Cable", gifUrl: "/media/exercises/triceps-01.gif", videoUrl: "/media/exercises/triceps-01.mp4", description: "Cable isolation move for the triceps, bar or rope attachment." }),
  createExercise({ id: "triceps-02", name: "Close-Grip Bench Press", muscleGroup: "Triceps", difficulty: "Intermediate", equipment: "Barbell", gifUrl: "/media/exercises/triceps-02.gif", videoUrl: "/media/exercises/triceps-02.mp4", description: "Compound press with a narrow grip to bias the triceps." }),
  createExercise({ id: "triceps-03", name: "Bench Dip", muscleGroup: "Triceps", difficulty: "Beginner", equipment: "Bodyweight", gifUrl: "/media/exercises/triceps-03.gif", videoUrl: "/media/exercises/triceps-03.mp4", description: "Bodyweight dip using a bench or chair for triceps and chest." }),

  // ── Shoulders ──────────────────────────────────────────────
  createExercise({ id: "shoulders-01", name: "Overhead Press", muscleGroup: "Shoulders", difficulty: "Intermediate", equipment: "Barbell", gifUrl: "/media/exercises/shoulders-01.gif", videoUrl: "/media/exercises/shoulders-01.mp4", description: "Standing barbell press for overall shoulder mass and stability." }),
  createExercise({ id: "shoulders-02", name: "Lateral Raise", muscleGroup: "Shoulders", difficulty: "Beginner", equipment: "Dumbbell", gifUrl: "/media/exercises/shoulders-02.gif", videoUrl: "/media/exercises/shoulders-02.mp4", description: "Isolation raise for side-delt width." }),
  createExercise({ id: "shoulders-03", name: "Face Pull", muscleGroup: "Shoulders", difficulty: "Beginner", equipment: "Cable", gifUrl: "/media/exercises/shoulders-03.gif", videoUrl: "/media/exercises/shoulders-03.mp4", description: "Rear-delt and rotator-cuff move, great for shoulder health." }),

  // ── Back ───────────────────────────────────────────────────
  createExercise({ id: "back-01", name: "Pull-Up", muscleGroup: "Back", difficulty: "Advanced", equipment: "Bodyweight", gifUrl: "/media/exercises/back-01.gif", videoUrl: "/media/exercises/back-01.mp4", description: "Vertical pulling staple for lat width." }),
  createExercise({ id: "back-02", name: "Barbell Row", muscleGroup: "Back", difficulty: "Intermediate", equipment: "Barbell", gifUrl: "/media/exercises/back-02.gif", videoUrl: "/media/exercises/back-02.mp4", description: "Horizontal pull for back thickness." }),
  createExercise({ id: "back-03", name: "Lat Pulldown", muscleGroup: "Back", difficulty: "Beginner", equipment: "Machine", gifUrl: "/media/exercises/back-03.gif", videoUrl: "/media/exercises/back-03.mp4", description: "Machine alternative to pull-ups, adjustable resistance." }),

  // ── Forearms ───────────────────────────────────────────────
  createExercise({ id: "forearms-01", name: "Wrist Curl", muscleGroup: "Forearms", difficulty: "Beginner", equipment: "Dumbbell", gifUrl: "/media/exercises/forearms-01.gif", videoUrl: "/media/exercises/forearms-01.mp4", description: "Direct forearm flexor isolation." }),
  createExercise({ id: "forearms-02", name: "Farmer's Carry", muscleGroup: "Forearms", difficulty: "Beginner", equipment: "Kettlebell", gifUrl: "/media/exercises/forearms-02.gif", videoUrl: "/media/exercises/forearms-02.mp4", description: "Loaded carry that builds grip and forearm endurance." }),
  createExercise({ id: "forearms-03", name: "Reverse Curl", muscleGroup: "Forearms", difficulty: "Intermediate", equipment: "Barbell", gifUrl: "/media/exercises/forearms-03.gif", videoUrl: "/media/exercises/forearms-03.mp4", description: "Overhand-grip curl for forearm extensors and brachialis." }),

  // ── Abs ────────────────────────────────────────────────────
  createExercise({ id: "abs-01", name: "Plank", muscleGroup: "Abs", difficulty: "Beginner", equipment: "Bodyweight", gifUrl: "/media/exercises/abs-01.gif", videoUrl: "/media/exercises/abs-01.mp4", description: "Isometric core hold for anti-extension strength." }),
  createExercise({ id: "abs-02", name: "Hanging Leg Raise", muscleGroup: "Abs", difficulty: "Advanced", equipment: "Bodyweight", gifUrl: "/media/exercises/abs-02.gif", videoUrl: "/media/exercises/abs-02.mp4", description: "Hanging raise targeting lower abs and hip flexors." }),
  createExercise({ id: "abs-03", name: "Cable Crunch", muscleGroup: "Abs", difficulty: "Intermediate", equipment: "Cable", gifUrl: "/media/exercises/abs-03.gif", videoUrl: "/media/exercises/abs-03.mp4", description: "Weighted spinal flexion for progressive ab overload." }),

  // ── Quads ──────────────────────────────────────────────────
  createExercise({ id: "quads-01", name: "Barbell Back Squat", muscleGroup: "Quads", difficulty: "Advanced", equipment: "Barbell", gifUrl: "/media/exercises/quads-01.gif", videoUrl: "/media/exercises/quads-01.mp4", description: "Foundational compound lift for overall leg mass." }),
  createExercise({ id: "quads-02", name: "Leg Press", muscleGroup: "Quads", difficulty: "Beginner", equipment: "Machine", gifUrl: "/media/exercises/quads-02.gif", videoUrl: "/media/exercises/quads-02.mp4", description: "Machine-guided squat pattern, easier to load safely." }),
  createExercise({ id: "quads-03", name: "Walking Lunge", muscleGroup: "Quads", difficulty: "Intermediate", equipment: "Dumbbell", gifUrl: "/media/exercises/quads-03.gif", videoUrl: "/media/exercises/quads-03.mp4", description: "Unilateral quad-dominant movement with a balance component." }),

  // ── Hamstrings ─────────────────────────────────────────────
  createExercise({ id: "hamstrings-01", name: "Romanian Deadlift", muscleGroup: "Hamstrings", difficulty: "Intermediate", equipment: "Barbell", gifUrl: "/media/exercises/hamstrings-01.gif", videoUrl: "/media/exercises/hamstrings-01.mp4", description: "Hip-hinge movement for hamstring and glute development." }),
  createExercise({ id: "hamstrings-02", name: "Lying Leg Curl", muscleGroup: "Hamstrings", difficulty: "Beginner", equipment: "Machine", gifUrl: "/media/exercises/hamstrings-02.gif", videoUrl: "/media/exercises/hamstrings-02.mp4", description: "Isolated hamstring curl on a machine." }),
  createExercise({ id: "hamstrings-03", name: "Kettlebell Swing", muscleGroup: "Hamstrings", difficulty: "Intermediate", equipment: "Kettlebell", gifUrl: "/media/exercises/hamstrings-03.gif", videoUrl: "/media/exercises/hamstrings-03.mp4", description: "Explosive hip-hinge for posterior-chain power." }),

  // ── Glutes ─────────────────────────────────────────────────
  createExercise({ id: "glutes-01", name: "Hip Thrust", muscleGroup: "Glutes", difficulty: "Intermediate", equipment: "Barbell", gifUrl: "/media/exercises/glutes-01.gif", videoUrl: "/media/exercises/glutes-01.mp4", description: "The most direct glute-loading movement available." }),
  createExercise({ id: "glutes-02", name: "Glute Bridge", muscleGroup: "Glutes", difficulty: "Beginner", equipment: "Bodyweight", gifUrl: "/media/exercises/glutes-02.gif", videoUrl: "/media/exercises/glutes-02.mp4", description: "Bodyweight regression of the hip thrust." }),
  createExercise({ id: "glutes-03", name: "Cable Kickback", muscleGroup: "Glutes", difficulty: "Beginner", equipment: "Cable", gifUrl: "/media/exercises/glutes-03.gif", videoUrl: "/media/exercises/glutes-03.mp4", description: "Single-leg isolation move for glute activation." }),

  // ── Calves ─────────────────────────────────────────────────
  createExercise({ id: "calves-01", name: "Standing Calf Raise", muscleGroup: "Calves", difficulty: "Beginner", equipment: "Machine", gifUrl: "/media/exercises/calves-01.gif", videoUrl: "/media/exercises/calves-01.mp4", description: "Standing raise targeting the gastrocnemius." }),
  createExercise({ id: "calves-02", name: "Seated Calf Raise", muscleGroup: "Calves", difficulty: "Beginner", equipment: "Machine", gifUrl: "/media/exercises/calves-02.gif", videoUrl: "/media/exercises/calves-02.mp4", description: "Seated variation emphasizing the soleus." }),
  createExercise({ id: "calves-03", name: "Dumbbell Calf Raise", muscleGroup: "Calves", difficulty: "Beginner", equipment: "Dumbbell", gifUrl: "/media/exercises/calves-03.gif", videoUrl: "/media/exercises/calves-03.mp4", description: "Single-dumbbell raise, works anywhere with a step or plate." }),
];
