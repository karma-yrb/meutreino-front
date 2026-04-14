import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPlanDayUpdaterFromSession,
  buildSessionRun,
  getElapsedMs,
  pauseSession,
  restartCurrentExercise,
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

function sampleDayWithWarmup() {
  return {
    ...sampleDay(),
    warmup: [
      { id: "wu1", name: "Warmup 1", detail: "30 sec", previewImageUrl: "https://example.com/wu1.jpg" },
      { id: "wu2", name: "Warmup 2", detail: "10 reps" },
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

test("restartCurrentExercise reopens exercise and keeps actual values", () => {
  let session = buildSessionRun({
    userId: "u1",
    dayId: "lundi",
    day: sampleDay(),
    planVersion: "2026-04-v1",
    nowMs: 1000,
  });

  session.exercises[0].sets[0].actualReps = "14";
  session.exercises[0].sets[0].actualLoad = "35";
  session = skipRestTimer(validateCurrentSet(session, { nowMs: 2000 }));
  session = skipRestTimer(validateCurrentSet(session, { nowMs: 3000 }));

  assert.equal(session.exercises[0].status, "completed");
  assert.equal(session.completedExercisesCount, 1);

  session.currentExerciseIndex = 0;
  session.currentSetIndex = 1;
  const restarted = restartCurrentExercise(session, { nowMs: 3500 });

  assert.equal(restarted.exercises[0].status, "in_progress");
  assert.equal(restarted.completedExercisesCount, 0);
  assert.equal(restarted.currentSetIndex, 0);
  assert.equal(restarted.exercises[0].sets[0].validated, false);
  assert.equal(restarted.exercises[0].sets[1].validated, false);
  assert.equal(restarted.exercises[0].sets[0].actualReps, "14");
  assert.equal(restarted.exercises[0].sets[0].actualLoad, "35");
});

test("buildSessionRun includes warmup steps before main and skips warmup rest", () => {
  let session = buildSessionRun({
    userId: "u1",
    dayId: "lundi",
    day: sampleDayWithWarmup(),
    planVersion: "2026-04-v1",
    nowMs: 1000,
  });

  assert.equal(session.exercises.length, 4);
  assert.equal(session.exercises[0].name, "Warmup 1");
  assert.equal(session.exercises[0].phase, "warmup");
  assert.equal(session.exercises[0].sets[0].restSeconds, 0);
  assert.equal(session.exercises[0].previewImageUrl, "https://example.com/wu1.jpg");
  assert.equal(session.exercises[2].phase, "main");

  session = validateCurrentSet(session, { nowMs: 1500 });
  assert.equal(session.currentExerciseIndex, 1);
  assert.equal(session.rest.active, false);

  session = validateCurrentSet(session, { nowMs: 2000 });
  assert.equal(session.currentExerciseIndex, 2);
  assert.equal(session.rest.active, false);

  session = validateCurrentSet(session, { nowMs: 2500 });
  assert.equal(session.currentExerciseIndex, 2);
  assert.equal(session.currentSetIndex, 1);
  assert.equal(session.rest.active, true);
  assert.equal(session.rest.remainingSeconds, 60);
});

test("buildPlanDayUpdaterFromSession returns null for non-finalized sessions", () => {
  const session = buildSessionRun({
    userId: "u1",
    dayId: "lundi",
    day: sampleDay(),
    planVersion: "2026-04-v1",
    nowMs: 1000,
  });

  assert.equal(buildPlanDayUpdaterFromSession(session), null);
  assert.equal(buildPlanDayUpdaterFromSession(null), null);
});

test("buildPlanDayUpdaterFromSession writes actual values back to day plan series", () => {
  let session = buildSessionRun({
    userId: "u1",
    dayId: "lundi",
    day: sampleDay(),
    planVersion: "2026-04-v1",
    nowMs: 1000,
  });

  // Modify actual values for first exercise, first set
  session.exercises[0].sets[0].actualReps = "14";
  session.exercises[0].sets[0].actualLoad = "25kg";

  // Complete the session
  session = skipRestTimer(validateCurrentSet(session, { nowMs: 2000 }));
  session = skipRestTimer(validateCurrentSet(session, { nowMs: 3000 }));
  session = validateCurrentSet(session, { nowMs: 4000 });
  assert.equal(session.status, "completed");

  const updater = buildPlanDayUpdaterFromSession(session);
  assert.ok(updater);

  const originalDay = sampleDay();
  const updatedDay = updater(originalDay);

  // First exercise, first set should have new values
  assert.equal(updatedDay.main[0].series[0].reps, "14");
  assert.equal(updatedDay.main[0].series[0].load, "25kg");
  // First exercise, second set keeps actual (defaulted from target)
  assert.equal(updatedDay.main[0].series[1].reps, "12");
  assert.equal(updatedDay.main[0].series[1].load, "20kg");
  // Second exercise keeps actual (defaulted from target)
  assert.equal(updatedDay.main[1].series[0].reps, "8");
  assert.equal(updatedDay.main[1].series[0].load, "30kg");
});

test("buildPlanDayUpdaterFromSession works with stopped sessions", () => {
  let session = buildSessionRun({
    userId: "u1",
    dayId: "lundi",
    day: sampleDay(),
    planVersion: "2026-04-v1",
    nowMs: 1000,
  });

  session.exercises[0].sets[0].actualReps = "15";
  session = skipRestTimer(validateCurrentSet(session, { nowMs: 2000 }));

  // Import stopSession indirectly — it's already tested, just set status
  session.status = "stopped";
  session.endedAt = new Date(5000).toISOString();

  const updater = buildPlanDayUpdaterFromSession(session);
  assert.ok(updater);

  const updatedDay = updater(sampleDay());
  assert.equal(updatedDay.main[0].series[0].reps, "15");
});
