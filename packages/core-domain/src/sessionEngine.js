function clone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function toIso(nowMs) {
  return new Date(nowMs).toISOString();
}

function ensureExerciseStatus(session) {
  if (!session.exercises.length) return;
  const currentExercise = session.exercises[session.currentExerciseIndex];
  if (currentExercise && currentExercise.status === "pending") {
    currentExercise.status = "in_progress";
  }
}

function finalizeTimer(session, nowMs) {
  if (session.globalTimer.runningSince !== null) {
    session.globalTimer.accumulatedMs += nowMs - session.globalTimer.runningSince;
    session.globalTimer.runningSince = null;
  }
  session.elapsedMs = session.globalTimer.accumulatedMs;
}

export function getElapsedMs(session, nowMs = Date.now()) {
  if (!session) return 0;
  if (session.globalTimer.runningSince === null) {
    return session.globalTimer.accumulatedMs;
  }
  return session.globalTimer.accumulatedMs + (nowMs - session.globalTimer.runningSince);
}

function parseKg(loadStr) {
  if (!loadStr || loadStr === "-") return NaN;
  const match = String(loadStr).match(/^(\d+(?:[.,]\d+)?)/)
  return match ? parseFloat(match[1].replace(",", ".")) : NaN;
}

function roundTo2_5(kg) {
  return Math.round(kg / 2.5) * 2.5;
}

function formatLoad(kg) {
  const rounded = roundTo2_5(kg);
  return Number.isInteger(rounded) ? `${rounded} kg` : `${rounded.toFixed(1)} kg`;
}

export function buildSessionRun({
  userId,
  dayId,
  day,
  planVersion,
  restSeconds = 60,
  nowMs = Date.now(),
}) {
  const warmupExercises = (day?.warmup ?? []).map((warmup, warmupIndex) => ({
    id: warmup.id ?? `${dayId}-wu-${warmupIndex + 1}`,
    name: warmup.name,
    description: warmup.detail ?? null,
    videoUrl: warmup.videoUrl ?? null,
    previewImageUrl: warmup.previewImageUrl ?? null,
    phase: "warmup",
    status: "pending",
    sets: [{
      id: `${warmup.id ?? `wu-${warmupIndex + 1}`}-set-1`,
      index: 0,
      targetReps: "-",
      targetLoad: "-",
      actualReps: "-",
      actualLoad: "-",
      validated: false,
      validatedAt: null,
      restSeconds: 0,
    }],
  }));

  const mainExercises = (day?.main ?? []).map((exercise, exerciseIndex) => ({
    id: exercise.id ?? `${dayId}-ex-${exerciseIndex + 1}`,
    name: exercise.name,
    tag: exercise.tag ?? null,
    tagColor: exercise.tagColor ?? null,
    description: exercise.description ?? null,
    note: exercise.note ?? null,
    videoUrl: exercise.videoUrl ?? null,
    previewImageUrl: exercise.previewImageUrl ?? null,
    phase: "main",
    status: "pending",
    sets: (exercise.series ?? []).map((serie, setIndex) => ({
      id: `${exercise.id ?? `ex-${exerciseIndex + 1}`}-set-${setIndex + 1}`,
      index: setIndex,
      targetReps: serie.reps ?? "-",
      targetLoad: serie.load ?? "-",
      actualReps: serie.reps ?? "-",
      actualLoad: serie.load ?? "-",
      validated: false,
      validatedAt: null,
      restSeconds,
    })),
  }));

  // Auto-compute warm-up loads for Activation exercises:
  // When an exercise with tag "Activation" is immediately followed by one with the same name,
  // pre-fill its sets at 50% (set 1) and 75% (set 2) of the next exercise's first set load.
  for (let i = 0; i < mainExercises.length - 1; i++) {
    const act = mainExercises[i];
    const principal = mainExercises[i + 1];
    if (
      act.tag === "Activation" &&
      act.name.trim() === principal.name.trim()
    ) {
      const refKg = parseKg(principal.sets[0]?.targetLoad);
      if (!isNaN(refKg)) {
        if (act.sets[0]) {
          const load = formatLoad(refKg * 0.5);
          act.sets[0].targetLoad = load;
          act.sets[0].actualLoad = load;
          act.sets[0].targetReps = "15";
          act.sets[0].actualReps = "15";
        }
        if (act.sets[1]) {
          const load = formatLoad(refKg * 0.75);
          act.sets[1].targetLoad = load;
          act.sets[1].actualLoad = load;
          act.sets[1].targetReps = "15";
          act.sets[1].actualReps = "15";
        }
      }
    }
  }

  const exercises = [...warmupExercises, ...mainExercises];

  const session = {
    id: `run-${userId}-${dayId}-${nowMs}`,
    userId,
    dayId,
    planVersion,
    status: exercises.length ? "running" : "completed",
    startedAt: toIso(nowMs),
    endedAt: exercises.length ? null : toIso(nowMs),
    elapsedMs: 0,
    completedExercisesCount: 0,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    rest: {
      active: false,
      remainingSeconds: 0,
      endsAtMs: null,
      defaultSeconds: restSeconds,
    },
    globalTimer: {
      accumulatedMs: 0,
      runningSince: exercises.length ? nowMs : null,
    },
    exercises,
  };

  ensureExerciseStatus(session);
  return session;
}

export function updateCurrentSetValues(session, patch) {
  const next = clone(session);
  if (!next || next.status === "completed" || next.status === "stopped") {
    return next;
  }
  const exercise = next.exercises[next.currentExerciseIndex];
  const set = exercise?.sets[next.currentSetIndex];
  if (!set || set.validated) return next;

  if (Object.prototype.hasOwnProperty.call(patch, "actualReps")) {
    set.actualReps = patch.actualReps;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "actualLoad")) {
    set.actualLoad = patch.actualLoad;
  }
  return next;
}

export function tickSession(session, nowMs = Date.now()) {
  const next = clone(session);
  if (next.rest.active && next.rest.endsAtMs !== null) {
    const remainingMs = Math.max(0, next.rest.endsAtMs - nowMs);
    next.rest.remainingSeconds = Math.ceil(remainingMs / 1000);
    if (remainingMs === 0) {
      next.rest.active = false;
      next.rest.endsAtMs = null;
      next.rest.remainingSeconds = 0;
    }
  }
  return next;
}

export function skipRestTimer(session) {
  const next = clone(session);
  next.rest.active = false;
  next.rest.remainingSeconds = 0;
  next.rest.endsAtMs = null;
  return next;
}

export function pauseSession(session, nowMs = Date.now()) {
  const next = clone(session);
  if (next.status !== "running") return next;
  next.status = "paused";
  if (next.globalTimer.runningSince !== null) {
    next.globalTimer.accumulatedMs += nowMs - next.globalTimer.runningSince;
    next.globalTimer.runningSince = null;
  }
  next.elapsedMs = next.globalTimer.accumulatedMs;
  return next;
}

export function resumeSession(session, nowMs = Date.now()) {
  const next = clone(session);
  if (next.status !== "paused") return next;
  next.status = "running";
  if (next.globalTimer.runningSince === null) {
    next.globalTimer.runningSince = nowMs;
  }
  return next;
}

export function stopSession(session, nowMs = Date.now()) {
  const next = clone(session);
  if (next.status === "completed" || next.status === "stopped") return next;
  next.status = "stopped";
  next.endedAt = toIso(nowMs);
  next.rest.active = false;
  next.rest.remainingSeconds = 0;
  next.rest.endsAtMs = null;
  finalizeTimer(next, nowMs);
  return next;
}

export function validateCurrentSet(session, { nowMs = Date.now(), restSeconds } = {}) {
  const next = clone(session);

  if (next.status !== "running" || next.rest.active) {
    return next;
  }

  const exercise = next.exercises[next.currentExerciseIndex];
  const set = exercise?.sets[next.currentSetIndex];
  if (!exercise || !set || set.validated) {
    return next;
  }

  set.validated = true;
  set.validatedAt = toIso(nowMs);
  if (!set.actualReps || set.actualReps === "-") {
    set.actualReps = set.targetReps;
  }
  if (!set.actualLoad || set.actualLoad === "-") {
    set.actualLoad = set.targetLoad;
  }

  const isLastSetOfExercise = next.currentSetIndex === exercise.sets.length - 1;
  const isLastExercise = next.currentExerciseIndex === next.exercises.length - 1;

  if (isLastSetOfExercise) {
    if (exercise.status !== "completed") {
      exercise.status = "completed";
      next.completedExercisesCount += 1;
    }
  }

  if (isLastSetOfExercise && isLastExercise) {
    next.status = "completed";
    next.endedAt = toIso(nowMs);
    next.rest.active = false;
    next.rest.remainingSeconds = 0;
    next.rest.endsAtMs = null;
    finalizeTimer(next, nowMs);
    return next;
  }

  if (isLastSetOfExercise) {
    next.currentExerciseIndex += 1;
    next.currentSetIndex = 0;
    ensureExerciseStatus(next);
  } else {
    next.currentSetIndex += 1;
  }

  const restDuration = typeof restSeconds === "number"
    ? restSeconds
    : (typeof set.restSeconds === "number" ? set.restSeconds : next.rest.defaultSeconds);

  if (restDuration > 0) {
    next.rest.active = true;
    next.rest.remainingSeconds = restDuration;
    next.rest.endsAtMs = nowMs + (restDuration * 1000);
  } else {
    next.rest.active = false;
    next.rest.remainingSeconds = 0;
    next.rest.endsAtMs = null;
  }
  return next;
}

export function restartCurrentExercise(session, { nowMs = Date.now() } = {}) {
  const next = clone(session);
  if (!next || next.status === "stopped") return next;

  const exercise = next.exercises[next.currentExerciseIndex];
  if (!exercise) return next;

  const wasCompleted = exercise.status === "completed";

  for (const set of exercise.sets) {
    set.validated = false;
    set.validatedAt = null;
  }

  exercise.status = "in_progress";
  next.currentSetIndex = 0;

  if (wasCompleted && next.completedExercisesCount > 0) {
    next.completedExercisesCount -= 1;
  }

  next.rest.active = false;
  next.rest.remainingSeconds = 0;
  next.rest.endsAtMs = null;

  if (next.status === "completed") {
    next.status = "running";
    next.endedAt = null;
    if (next.globalTimer.runningSince === null) {
      next.globalTimer.runningSince = nowMs;
    }
  }

  return next;
}

/**
 * Extract the actual values from a completed/stopped session and return
 * an updater function that writes them back into a day plan's series.
 * This makes the user's last-used reps/load the new defaults for next time.
 *
 * Only main-phase exercises are written back (warmup has no series).
 */
export function buildPlanDayUpdaterFromSession(session) {
  if (!session || (session.status !== "completed" && session.status !== "stopped")) {
    return null;
  }

  const mainExercises = session.exercises.filter((ex) => ex.phase === "main");
  if (!mainExercises.length) return null;

  // Build a map exerciseId → updated series values
  const exerciseUpdates = new Map();
  for (const exercise of mainExercises) {
    exerciseUpdates.set(exercise.id, exercise.sets.map((set) => ({
      reps: set.actualReps ?? set.targetReps,
      load: set.actualLoad ?? set.targetLoad,
    })));
  }

  return function updateDay(day) {
    const nextMain = (day.main ?? []).map((exercise) => {
      const updates = exerciseUpdates.get(exercise.id);
      if (!updates) return exercise;

      const nextSeries = (exercise.series ?? []).map((serie, idx) => {
        const update = updates[idx];
        if (!update) return serie;
        return { ...serie, reps: update.reps, load: update.load };
      });

      return { ...exercise, series: nextSeries };
    });

    return { ...day, main: nextMain };
  };
}
