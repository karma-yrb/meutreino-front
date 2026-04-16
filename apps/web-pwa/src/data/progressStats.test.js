import { describe, expect, test } from "vitest";
import {
  computeStats,
  computeTotalCalories,
  extractPersonalRecords,
  computeWeeklyCalories,
  buildActivityHeatmap,
} from "./progressStats.js";

// ── Helpers ──────────────────────────────────────────

function makeSession(overrides = {}) {
  return {
    id: `run-${Math.random().toString(36).slice(2)}`,
    userId: "user-1",
    dayId: "lundi",
    status: "completed",
    startedAt: "2026-04-01T08:00:00.000Z",
    endedAt: "2026-04-01T08:45:00.000Z",
    finishedAt: "2026-04-01T08:45:00.000Z",
    elapsedMs: 45 * 60_000,
    exercises: [
      {
        name: "Squat barre libre",
        phase: "main",
        status: "completed",
        sets: [
          { targetReps: "10", actualReps: "10", targetLoad: "40 kg", actualLoad: "40 kg", validated: true },
          { targetReps: "10", actualReps: "10", targetLoad: "40 kg", actualLoad: "45 kg", validated: true },
        ],
      },
      {
        name: "Leg Extension",
        phase: "main",
        status: "completed",
        sets: [
          { targetReps: "12", actualReps: "12", targetLoad: "70 kg", actualLoad: "70 kg", validated: true },
        ],
      },
    ],
    ...overrides,
  };
}

function makeWarmupExercise() {
  return {
    name: "Étirement fessier",
    phase: "warmup",
    status: "completed",
    sets: [{ targetReps: "-", actualReps: "-", targetLoad: "-", actualLoad: "-", validated: true }],
  };
}

// ── computeStats ─────────────────────────────────────

describe("computeStats", () => {
  test("returns zeros for empty sessions", () => {
    const stats = computeStats([]);
    expect(stats).toEqual({
      total: 0,
      completedCount: 0,
      completionRate: 0,
      activeDays: 0,
      avgDurationMin: 0,
    });
  });

  test("counts completed vs total", () => {
    const sessions = [
      makeSession({ status: "completed" }),
      makeSession({ status: "stopped" }),
      makeSession({ status: "completed" }),
    ];
    const stats = computeStats(sessions);
    expect(stats.total).toBe(3);
    expect(stats.completedCount).toBe(2);
    expect(stats.completionRate).toBe(67);
  });

  test("counts unique active days", () => {
    const sessions = [
      makeSession({ dayId: "lundi" }),
      makeSession({ dayId: "lundi" }),
      makeSession({ dayId: "mercredi" }),
    ];
    const stats = computeStats(sessions);
    expect(stats.activeDays).toBe(2);
  });

  test("computes average duration from elapsedMs", () => {
    const sessions = [
      makeSession({ elapsedMs: 30 * 60_000, startedAt: null, finishedAt: null }),
      makeSession({ elapsedMs: 60 * 60_000, startedAt: null, finishedAt: null }),
    ];
    const stats = computeStats(sessions);
    expect(stats.avgDurationMin).toBe(45);
  });
});

// ── computeTotalCalories ─────────────────────────────

describe("computeTotalCalories", () => {
  test("returns 0 for no sessions", () => {
    expect(computeTotalCalories([], 78)).toBe(0);
  });

  test("returns 0 for invalid weight", () => {
    expect(computeTotalCalories([makeSession()], 0)).toBe(0);
    expect(computeTotalCalories([makeSession()], -1)).toBe(0);
  });

  test("calculates calories from completed sessions", () => {
    const sessions = [makeSession({ elapsedMs: 45 * 60_000 })];
    const cal = computeTotalCalories(sessions, 78);
    expect(cal).toBeGreaterThan(100);
    expect(cal).toBeLessThan(1000);
  });

  test("ignores non-completed sessions", () => {
    const sessions = [
      makeSession({ status: "running", elapsedMs: 45 * 60_000 }),
      makeSession({ status: "stopped", elapsedMs: 60 * 60_000 }),
    ];
    const cal = computeTotalCalories(sessions, 78);
    expect(cal).toBe(0);
  });

  test("ignores warmup exercises", () => {
    const sessions = [
      makeSession({
        elapsedMs: 45 * 60_000,
        exercises: [makeWarmupExercise()],
      }),
    ];
    const cal = computeTotalCalories(sessions, 78);
    expect(cal).toBe(0);
  });
});

// ── extractPersonalRecords ───────────────────────────

describe("extractPersonalRecords", () => {
  test("returns empty array for no sessions", () => {
    expect(extractPersonalRecords([])).toEqual([]);
  });

  test("extracts max load per exercise", () => {
    const sessions = [
      makeSession({
        exercises: [
          {
            name: "Squat barre libre",
            phase: "main",
            status: "completed",
            sets: [
              { actualLoad: "40 kg", actualReps: "10", validated: true },
              { actualLoad: "60 kg", actualReps: "8", validated: true },
            ],
          },
        ],
      }),
      makeSession({
        exercises: [
          {
            name: "Squat barre libre",
            phase: "main",
            status: "completed",
            sets: [
              { actualLoad: "50 kg", actualReps: "10", validated: true },
            ],
          },
        ],
      }),
    ];
    const records = extractPersonalRecords(sessions);
    expect(records).toHaveLength(1);
    expect(records[0].exercise).toBe("Squat barre libre");
    expect(records[0].load).toBe(60);
    expect(records[0].reps).toBe("8");
  });

  test("ignores non-validated sets", () => {
    const sessions = [
      makeSession({
        exercises: [
          {
            name: "Leg Extension",
            phase: "main",
            status: "completed",
            sets: [
              { actualLoad: "100 kg", actualReps: "5", validated: false },
            ],
          },
        ],
      }),
    ];
    expect(extractPersonalRecords(sessions)).toEqual([]);
  });

  test("sorts records by load descending", () => {
    const sessions = [
      makeSession({
        exercises: [
          {
            name: "Leg Extension",
            phase: "main",
            status: "completed",
            sets: [{ actualLoad: "30 kg", actualReps: "12", validated: true }],
          },
          {
            name: "Squat barre libre",
            phase: "main",
            status: "completed",
            sets: [{ actualLoad: "80 kg", actualReps: "8", validated: true }],
          },
        ],
      }),
    ];
    const records = extractPersonalRecords(sessions);
    expect(records[0].exercise).toBe("Squat barre libre");
    expect(records[1].exercise).toBe("Leg Extension");
  });
});

// ── computeWeeklyCalories ────────────────────────────

describe("computeWeeklyCalories", () => {
  test("returns empty for no sessions", () => {
    expect(computeWeeklyCalories([], 78)).toEqual([]);
  });

  test("groups sessions by ISO week", () => {
    const sessions = [
      makeSession({ startedAt: "2026-04-06T08:00:00Z", elapsedMs: 40 * 60_000 }),
      makeSession({ startedAt: "2026-04-07T08:00:00Z", elapsedMs: 40 * 60_000 }),
      makeSession({ startedAt: "2026-04-13T08:00:00Z", elapsedMs: 40 * 60_000 }),
    ];
    const weeks = computeWeeklyCalories(sessions, 78);
    expect(weeks.length).toBe(2);
    expect(weeks[0].count).toBe(2);
    expect(weeks[1].count).toBe(1);
    expect(weeks[0].calories).toBeGreaterThan(0);
  });
});

// ── buildActivityHeatmap ─────────────────────────────

describe("buildActivityHeatmap", () => {
  test("returns empty object for no sessions", () => {
    expect(buildActivityHeatmap([])).toEqual({});
  });

  test("counts sessions per day", () => {
    const sessions = [
      makeSession({ startedAt: "2026-04-01T08:00:00Z" }),
      makeSession({ startedAt: "2026-04-01T18:00:00Z" }),
      makeSession({ startedAt: "2026-04-02T08:00:00Z" }),
    ];
    const map = buildActivityHeatmap(sessions);
    expect(map["2026-04-01"]).toBe(2);
    expect(map["2026-04-02"]).toBe(1);
  });

  test("ignores non-completed sessions", () => {
    const sessions = [
      makeSession({ status: "running", startedAt: "2026-04-01T08:00:00Z" }),
    ];
    expect(buildActivityHeatmap(sessions)).toEqual({});
  });
});
