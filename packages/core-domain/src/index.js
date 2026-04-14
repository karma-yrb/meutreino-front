export const DAY_IDS = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

const JS_DAY_INDEX_TO_ID = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
];

export function getCurrentDayId(date = new Date()) {
  return JS_DAY_INDEX_TO_ID[date.getDay()];
}

export function getWeekKey(date = new Date()) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export {
  buildPlanDayUpdaterFromSession,
  buildSessionRun,
  getElapsedMs,
  pauseSession,
  resumeSession,
  restartCurrentExercise,
  skipRestTimer,
  stopSession,
  tickSession,
  updateCurrentSetValues,
  validateCurrentSet,
} from "./sessionEngine.js";
