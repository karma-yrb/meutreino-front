import { estimateSessionCaloriesFromElapsed } from "./calorieEstimation.js";

/**
 * Compute basic aggregated statistics from a list of sessions.
 */
export function computeStats(sessions) {
  const completed = sessions.filter((s) => s.status === "completed");
  const total = sessions.length;
  const completedCount = completed.length;
  const completionRate =
    total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const uniqueDays = [
    ...new Set(completed.map((s) => s.dayId)),
  ];

  const totalDurationMs = completed.reduce((sum, s) => {
    if (!s.startedAt || !s.finishedAt) {
      if (s.elapsedMs > 0) return sum + s.elapsedMs;
      return sum;
    }
    return (
      sum +
      (new Date(s.finishedAt).getTime() - new Date(s.startedAt).getTime())
    );
  }, 0);
  const avgDurationMin =
    completedCount > 0
      ? Math.round(totalDurationMs / completedCount / 60000)
      : 0;

  return {
    total,
    completedCount,
    completionRate,
    activeDays: uniqueDays.length,
    avgDurationMin,
  };
}

/**
 * Compute cumulated calories across all completed sessions.
 */
export function computeTotalCalories(sessions, weightKg) {
  if (!weightKg || weightKg <= 0) return 0;
  return sessions
    .filter((s) => s.status === "completed")
    .reduce((sum, s) => {
      const elapsed = s.elapsedMs || 0;
      const exercises = (s.exercises || []).filter(
        (e) => e.phase === "main",
      );
      return sum + estimateSessionCaloriesFromElapsed(exercises, weightKg, elapsed);
    }, 0);
}

/**
 * Extract personal records (max load in kg) per exercise across all sessions.
 * Returns sorted array: [{ exercise, load, reps, date }]
 */
export function extractPersonalRecords(sessions) {
  const records = new Map();

  for (const session of sessions) {
    if (session.status !== "completed") continue;
    const date = session.startedAt ?? session.endedAt ?? null;
    for (const exercise of session.exercises || []) {
      if (exercise.phase !== "main") continue;
      for (const set of exercise.sets || []) {
        if (!set.validated) continue;
        const loadStr = set.actualLoad || set.targetLoad || "";
        const match = String(loadStr).match(/^(\d+(?:[.,]\d+)?)/);
        if (!match) continue;
        const load = parseFloat(match[1].replace(",", "."));
        if (isNaN(load) || load <= 0) continue;

        const key = exercise.name;
        const current = records.get(key);
        if (!current || load > current.load) {
          records.set(key, {
            exercise: exercise.name,
            load,
            reps: set.actualReps || set.targetReps || "-",
            date,
          });
        }
      }
    }
  }

  return [...records.values()].sort((a, b) => b.load - a.load);
}

/**
 * Compute weekly calorie totals from sessions.
 * Returns array sorted by week: [{ week: "2026-W03", calories, count }]
 */
export function computeWeeklyCalories(sessions, weightKg) {
  if (!weightKg || weightKg <= 0) return [];

  const weekMap = new Map();
  for (const s of sessions) {
    if (s.status !== "completed") continue;
    const dateStr = s.startedAt || s.endedAt;
    if (!dateStr) continue;
    const d = new Date(dateStr);
    const week = getISOWeekLabel(d);
    const elapsed = s.elapsedMs || 0;
    const exercises = (s.exercises || []).filter((e) => e.phase === "main");
    const cal = estimateSessionCaloriesFromElapsed(exercises, weightKg, elapsed);

    const entry = weekMap.get(week) || { week, calories: 0, count: 0 };
    entry.calories += cal;
    entry.count += 1;
    weekMap.set(week, entry);
  }

  return [...weekMap.values()].sort((a, b) => a.week.localeCompare(b.week));
}

/**
 * Build a heatmap data structure: { [dateString]: sessionCount }.
 * Date strings in "YYYY-MM-DD" format.
 */
export function buildActivityHeatmap(sessions) {
  const map = {};
  for (const s of sessions) {
    if (s.status !== "completed") continue;
    const dateStr = s.startedAt || s.endedAt;
    if (!dateStr) continue;
    const day = new Date(dateStr).toISOString().slice(0, 10);
    map[day] = (map[day] || 0) + 1;
  }
  return map;
}

// ── Helpers ──────────────────────────────────────────

function getISOWeekLabel(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function parseKg(loadStr) {
  if (!loadStr || loadStr === "-") return 0;
  const match = String(loadStr).match(/^(\d+(?:[.,]\d+)?)/);
  return match ? parseFloat(match[1].replace(",", ".")) : 0;
}

/**
 * Build progression data for a given exercise across sessions.
 * Returns array of { date, maxLoad, totalVolume } sorted chronologically.
 * Volume = sum(reps × load) for all validated sets.
 */
export function buildExerciseProgression(sessions, exerciseName) {
  const points = [];
  const lowerName = exerciseName.toLowerCase();

  for (const s of sessions) {
    if (s.status !== "completed") continue;
    const dateStr = s.startedAt || s.endedAt;
    if (!dateStr) continue;

    for (const ex of s.exercises || []) {
      if (ex.phase !== "main") continue;
      if (ex.name.toLowerCase() !== lowerName) continue;

      let maxLoad = 0;
      let totalVolume = 0;
      for (const set of ex.sets || []) {
        if (!set.validated) continue;
        const load = parseKg(set.actualLoad || set.targetLoad);
        const reps = parseInt(set.actualReps || set.targetReps, 10) || 0;
        if (load > maxLoad) maxLoad = load;
        totalVolume += load * reps;
      }

      if (maxLoad > 0 || totalVolume > 0) {
        points.push({
          date: new Date(dateStr).toISOString().slice(0, 10),
          maxLoad,
          totalVolume: Math.round(totalVolume),
        });
      }
    }
  }

  return points.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get list of unique main exercise names from sessions.
 */
export function getExerciseNames(sessions) {
  const names = new Set();
  for (const s of sessions) {
    if (s.status !== "completed") continue;
    for (const ex of s.exercises || []) {
      if (ex.phase === "main" && ex.name) names.add(ex.name);
    }
  }
  return [...names].sort();
}
