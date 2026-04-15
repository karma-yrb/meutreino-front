/**
 * Calorie estimation based on MET (Metabolic Equivalent of Task).
 *
 * Formula: calories = MET × weight(kg) × duration(h)
 *
 * MET values sourced from the Compendium of Physical Activities.
 */

const MET_MAP = {
  // ── Lower body ──────────────────────────────────
  "leg extension": 5.0,
  "squat barre libre": 6.0,
  "soulevé de terre jambes tendues": 6.0,
  "mollets debout": 4.0,
  "mollets presse 45°": 4.0,
  "leg press 45": 5.5,
  "flexion ischio-jambiers assis": 5.0,
  "abducteurs machine tronc penché": 4.5,

  // ── Upper body push ─────────────────────────────
  "développé incliné": 5.0,
  "pec deck": 4.5,
  "développé militaire": 5.0,
  "élévation latérale": 4.0,
  "développé militaire + élévation latérale": 5.0,

  // ── Upper body pull ─────────────────────────────
  "tirage vertical": 5.0,
  "tirage barre penché": 5.5,
  "rowing assis poulie basse": 5.0,

  // ── Arms ────────────────────────────────────────
  "triceps corde poulie haute": 4.0,
  "triceps corde + curl 21": 4.5,
  "triceps français + curl poulie": 4.5,

  // ── Core ────────────────────────────────────────
  "abdos ciseaux + abdos inférieurs": 3.5,
  "abdos inférieurs + abdos v-sit": 3.5,
  "extension lombaire": 3.5,

  // ── Cardio ──────────────────────────────────────
  "cardio post-entraînement": 9.5,
  "cardio": 8.0,

  // ── Warmup / stretches (not scored at exercise level) ──
  "étirement": 2.3,
  "mobilité": 2.5,
};

const DEFAULT_MET = 5.0;

/**
 * Get MET value for an exercise name.
 * Handles supersets ("A + B") by averaging the two METs.
 */
function getExerciseMet(name) {
  if (!name) return DEFAULT_MET;
  const lower = name.toLowerCase().trim();

  // Direct match
  if (MET_MAP[lower] !== undefined) return MET_MAP[lower];

  // Superset: average MET of sub-exercises
  if (lower.includes(" + ")) {
    const parts = lower.split(/\s*\+\s*/);
    const mets = parts.map((p) => MET_MAP[p.trim()] ?? DEFAULT_MET);
    return mets.reduce((a, b) => a + b, 0) / mets.length;
  }

  // Partial keyword match
  for (const [key, met] of Object.entries(MET_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return met;
  }

  return DEFAULT_MET;
}

/**
 * Parse a reps value that may contain a duration string like "21 min" or "30 s".
 * Returns duration in seconds, or 0 if it's a normal rep count.
 */
function parseRepsDuration(repsValue) {
  if (!repsValue || typeof repsValue !== "string") return 0;
  const minMatch = repsValue.match(/(\d+)\s*min/i);
  if (minMatch) return parseInt(minMatch[1], 10) * 60;
  const secMatch = repsValue.match(/(\d+)\s*s(?:ec)?/i);
  if (secMatch) return parseInt(secMatch[1], 10);
  return 0;
}

/**
 * Parse tempo string (e.g. "3020") to get time-under-tension per rep in seconds.
 * Tempo format: eccentric / pause bottom / concentric / pause top.
 */
function parseTempo(tempo) {
  if (!tempo || typeof tempo !== "string") return 4; // default ~4s/rep
  const digits = tempo.replace(/\D/g, "");
  if (digits.length < 4) return 4;
  return [...digits].slice(0, 4).reduce((sum, d) => sum + parseInt(d, 10), 0) || 4;
}

/**
 * Estimate duration (in hours) of a single exercise based on its series.
 * Accounts for:
 * - Cardio exercises with duration in reps field (e.g. "21 min")
 * - Time under tension from tempo × reps
 * - Rest periods between sets
 */
function estimateExerciseDurationHours(series) {
  if (!Array.isArray(series) || series.length === 0) return 0;
  let totalSeconds = 0;

  for (const set of series) {
    // Check if reps is actually a duration (cardio)
    const repsDuration = parseRepsDuration(set.reps);
    if (repsDuration > 0) {
      totalSeconds += repsDuration;
      continue;
    }

    // Musculation: estimate from reps × tempo + rest
    const reps = parseInt(set.reps, 10) || 10;
    const tempoSeconds = parseTempo(set.tempo);
    const setDuration = reps * tempoSeconds;
    totalSeconds += setDuration;

    const rest = parseFloat(set.rest);
    if (!isNaN(rest) && rest > 0) {
      totalSeconds += rest;
    } else {
      // When rest is "-" or unspecified, assume ~60s default rest
      totalSeconds += 60;
    }
  }
  return totalSeconds / 3600;
}

/**
 * Estimate calories for a single exercise.
 * @param {string} exerciseName
 * @param {Array} series - array of set objects
 * @param {number} weightKg - user's body weight
 * @returns {number} estimated kcal (rounded)
 */
export function estimateExerciseCalories(exerciseName, series, weightKg) {
  if (!weightKg || weightKg <= 0) return 0;
  const met = getExerciseMet(exerciseName);
  const hours = estimateExerciseDurationHours(series);
  return Math.round(met * weightKg * hours);
}

/**
 * Estimate total calories for a full session (array of exercises).
 * @param {Array} exercises - array of { name, series } objects
 * @param {number} weightKg - user's body weight
 * @returns {number} estimated total kcal (rounded)
 */
export function estimateSessionCalories(exercises, weightKg) {
  if (!Array.isArray(exercises) || !weightKg || weightKg <= 0) return 0;
  return exercises.reduce(
    (total, ex) => total + estimateExerciseCalories(ex.name, ex.series, weightKg),
    0,
  );
}

/**
 * Estimate session calories using actual elapsed time (more accurate for run mode).
 * @param {Array} exercises - session exercises with MET-mapped names
 * @param {number} weightKg - user's body weight
 * @param {number} elapsedMs - actual session elapsed time in ms
 * @returns {number} estimated kcal (rounded)
 */
export function estimateSessionCaloriesFromElapsed(exercises, weightKg, elapsedMs) {
  if (!weightKg || weightKg <= 0 || !elapsedMs || elapsedMs <= 0) return 0;
  if (!Array.isArray(exercises) || exercises.length === 0) return 0;

  // Weighted average MET across all exercises
  const mets = exercises.map((ex) => getExerciseMet(ex.name));
  const avgMet = mets.reduce((a, b) => a + b, 0) / mets.length;
  const hours = elapsedMs / 3600000;
  return Math.round(avgMet * weightKg * hours);
}
