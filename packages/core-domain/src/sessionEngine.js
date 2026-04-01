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

export function buildSessionRun({
  userId,
  dayId,
  day,
  planVersion,
  restSeconds = 60,
  nowMs = Date.now(),
}) {
  const exercises = (day?.main ?? []).map((exercise, exerciseIndex) => ({
    id: exercise.id ?? `${dayId}-ex-${exerciseIndex + 1}`,
    name: exercise.name,
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

  const restDuration = typeof restSeconds === "number" ? restSeconds : next.rest.defaultSeconds;
  next.rest.active = true;
  next.rest.remainingSeconds = restDuration;
  next.rest.endsAtMs = nowMs + (restDuration * 1000);
  return next;
}

