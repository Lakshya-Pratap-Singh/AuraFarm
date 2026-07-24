// exerciseService.js — Exercise Forge (service layer)
//
// The only module ExerciseForge.jsx (or any future consumer) should import
// to read muscle groups / exercises. Keeps data/exercises.js and
// data/muscleGroups.js free of any UI concerns, and keeps the page free of
// any direct data-shape knowledge — same pattern as resourceMappingService.js.
//
// Pure, synchronous, no side effects. Not connected to the mission/XP
// system in any way.

import { MUSCLE_GROUPS, MUSCLE_GROUP_CONFIG, isValidMuscleGroup } from "../data/muscleGroups.js";
import { EXERCISES, DIFFICULTY_COLORS } from "../data/exercises.js";

/**
 * @typedef {Object} MuscleGroupSummary
 * @property {string} key   - Muscle group name, e.g. "Chest".
 * @property {string} icon
 * @property {string} color
 * @property {number} exerciseCount
 */

/**
 * @returns {MuscleGroupSummary[]} All 11 muscle groups with their exercise counts.
 */
export function getAllMuscleGroups() {
  return MUSCLE_GROUPS.map((key) => ({
    key,
    ...MUSCLE_GROUP_CONFIG[key],
    exerciseCount: EXERCISES.filter((ex) => ex.muscleGroup === key).length,
  }));
}

/**
 * @param {string|null|undefined} muscleGroup
 * @returns {import("../data/exercises.js").Exercise[]} Exercises for that muscle group, or [] if unrecognized.
 */
export function getExercisesForMuscleGroup(muscleGroup) {
  if (!isValidMuscleGroup(muscleGroup)) return [];
  return EXERCISES.filter((ex) => ex.muscleGroup === muscleGroup);
}

/**
 * @param {string} id
 * @returns {import("../data/exercises.js").Exercise|null}
 */
export function getExerciseById(id) {
  return EXERCISES.find((ex) => ex.id === id) ?? null;
}

/**
 * @returns {number} Total mock exercises across all muscle groups.
 */
export function getTotalExerciseCount() {
  return EXERCISES.length;
}

/**
 * @param {string} difficulty
 * @returns {string} Accent color hex for a difficulty badge; falls back to a neutral gray.
 */
export function getDifficultyColor(difficulty) {
  return DIFFICULTY_COLORS[difficulty] ?? "#5e5571";
}
