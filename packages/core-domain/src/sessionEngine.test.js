import test from "node:test";
import assert from "node:assert/strict";
import {
  buildSessionRun,
  getElapsedMs,
  pauseSession,
  resumeSession,
  skipRestTimer,
  validateCurrentSet,
} from "./index.js";

function sampleDay() {
  return {
    id: "lundi",
    title: "Demo",
    main: [
      {
        id: "ex1",
        name: "Exercise 1",
        series: [
          { reps: "10", load: "20kg" },
          { reps: "12", load: "20kg" },
        ],
      },
      {
        id: "ex2",
        name: "Exercise 2",
        series: [{ reps: "8", load: "30kg" }],
      },
    ],
  };
}

test("buildSessionRun initializes with running status and first exercise in progress", () => {
  const session = buildSessionRun({
    userId: "u1",
    dayId: "lundi",
    day: sampleDay(),
    planVersion: "2026-04-v1",
    nowMs: 1000,
  });

  assert.equal(session.status, "running");
  assert.equal(session.currentExerciseIndex, 0);
  assert.equal(session.currentSetIndex, 0);
  assert.equal(session.exercises[0].status, "in_progress");
  assert.equal(session.exercises[1].status, "pending");
});

test("validateCurrentSet starts rest timer and advances set focus", () => {
  const session = buildSessionRun({
    userId: "u1",
    dayId: "lundi",
    day: sampleDay(),
    planVersion: "2026-04-v1",
    nowMs: 1000,
  });

  const updated = validateCurrentSet(session, { nowMs: 2000, restSeconds: 60 });
  assert.equal(updated.exercises[0].sets[0].validated, true);
  assert.equal(updated.currentExerciseIndex, 0);
  assert.equal(updated.currentSetIndex, 1);
  assert.equal(updated.rest.active, true);
  assert.equal(updated.rest.remainingSeconds, 60);
});

test("skipRestTimer disables active rest state", () => {
  const session = buildSessionRun({
    userId: "u1",
    dayId: "lundi",
    day: sampleDay(),
    planVersion: "2026-04-v1",
    nowMs: 1000,
  });

  const afterValidate = validateCurrentSet(session, { nowMs: 2000, restSeconds: 60 });
  const skipped = skipRestTimer(afterValidate);
  assert.equal(skipped.rest.active, false);
  assert.equal(skipped.rest.remainingSeconds, 0);
});

test("last set of last exercise completes session and counts exercises", () => {
  let session = buildSessionRun({
    userId: "u1",
    dayId: "lundi",
    day: sampleDay(),
    planVersion: "2026-04-v1",
    nowMs: 1000,
  });

  session = skipRestTimer(validateCurrentSet(session, { nowMs: 2000 }));
  session = skipRestTimer(validateCurrentSet(session, { nowMs: 3000 }));
  session = validateCurrentSet(session, { nowMs: 4000 });

  assert.equal(session.status, "completed");
  assert.equal(session.completedExercisesCount, 2);
  assert.ok(session.endedAt);
});

test("pauseSession and resumeSession keep elapsed timer coherent", () => {
  let session = buildSessionRun({
    userId: "u1",
    dayId: "lundi",
    day: sampleDay(),
    planVersion: "2026-04-v1",
    nowMs: 1000,
  });

  session = pauseSession(session, 7000);
  assert.equal(getElapsedMs(session, 7000), 6000);

  session = resumeSession(session, 9000);
  assert.equal(getElapsedMs(session, 11000), 8000);
});

