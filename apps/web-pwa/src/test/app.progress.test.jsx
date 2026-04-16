import { describe, expect, test } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { db } from "../services/storage/db";

async function loginAsUser() {
  window.history.replaceState({}, "", "/");
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("heading", { name: "Connexion" });
  await user.clear(screen.getByLabelText("Email"));
  await user.type(screen.getByLabelText("Email"), "user@local");
  await user.clear(screen.getByLabelText("Mot de passe"));
  await user.type(screen.getByLabelText("Mot de passe"), "user123");
  await user.click(screen.getByRole("button", { name: "Se connecter" }));
  await screen.findByRole("heading", { name: /Bienvenue/i });
  return user;
}

async function navigateTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function makeCompletedSession(id, overrides = {}) {
  return {
    id,
    userId: "user-1",
    dayId: "lundi",
    planVersion: "2026-04-v1",
    status: "completed",
    startedAt: "2026-04-01T08:00:00.000Z",
    endedAt: "2026-04-01T08:45:00.000Z",
    finishedAt: "2026-04-01T08:45:00.000Z",
    elapsedMs: 45 * 60_000,
    completedExercisesCount: 2,
    currentExerciseIndex: 1,
    currentSetIndex: 0,
    rest: { active: false, remainingSeconds: 0, endsAtMs: null, defaultSeconds: 60 },
    globalTimer: { accumulatedMs: 45 * 60_000, runningSince: null },
    exercises: [
      {
        id: "lun-ex-1",
        name: "Squat barre libre",
        phase: "main",
        status: "completed",
        sets: [
          { id: "s1", index: 0, targetReps: "10", targetLoad: "40 kg", actualReps: "10", actualLoad: "40 kg", validated: true, validatedAt: "2026-04-01T08:10:00Z", restSeconds: 60 },
          { id: "s2", index: 1, targetReps: "10", targetLoad: "40 kg", actualReps: "10", actualLoad: "50 kg", validated: true, validatedAt: "2026-04-01T08:15:00Z", restSeconds: 60 },
        ],
      },
      {
        id: "lun-ex-2",
        name: "Leg Extension",
        phase: "main",
        status: "completed",
        sets: [
          { id: "s3", index: 0, targetReps: "12", targetLoad: "70 kg", actualReps: "12", actualLoad: "75 kg", validated: true, validatedAt: "2026-04-01T08:30:00Z", restSeconds: 60 },
        ],
      },
    ],
    ...overrides,
  };
}

describe("Progress page integration", () => {
  test("displays stats cards including calories when sessions exist", async () => {
    await loginAsUser();
    await db.sessions.bulkPut([
      makeCompletedSession("run-1"),
      makeCompletedSession("run-2", {
        dayId: "mercredi",
        startedAt: "2026-04-03T08:00:00Z",
        endedAt: "2026-04-03T08:30:00Z",
        elapsedMs: 30 * 60_000,
        globalTimer: { accumulatedMs: 30 * 60_000, runningSince: null },
      }),
    ]);

    await navigateTo("/progres");
    await screen.findByRole("heading", { name: /Progrès/i });

    await waitFor(() => {
      expect(screen.getByText("Séances totales").closest(".stat-card")).toHaveTextContent("2");
      expect(screen.getByText("Séances terminées").closest(".stat-card")).toHaveTextContent("2");
      expect(screen.getByText("Taux de complétion").closest(".stat-card")).toHaveTextContent("100%");
      expect(screen.getByText("Jours actifs").closest(".stat-card")).toHaveTextContent("2");
      expect(screen.getByText("Calories brûlées").closest(".stat-card")).toBeInTheDocument();
    });

    const calCard = screen.getByText("Calories brûlées").closest(".stat-card");
    expect(calCard).toHaveTextContent("kcal");
    expect(calCard.querySelector(".stat-card-value").textContent).not.toBe("0kcal");
  });

  test("displays personal records section with max loads", async () => {
    await loginAsUser();
    await db.sessions.bulkPut([makeCompletedSession("run-1")]);

    await navigateTo("/progres");
    await screen.findByRole("heading", { name: /Progrès/i });

    await waitFor(() => {
      expect(screen.getByText("Records personnels")).toBeInTheDocument();
    });

    const recordsSection = screen.getByText("Records personnels").closest(".progress-section");
    expect(within(recordsSection).getByText("Leg Extension")).toBeInTheDocument();
    expect(within(recordsSection).getByText(/75 kg/)).toBeInTheDocument();
    expect(within(recordsSection).getByText("Squat barre libre")).toBeInTheDocument();
    expect(within(recordsSection).getByText(/50 kg/)).toBeInTheDocument();
  });

  test("shows empty state when no sessions", async () => {
    await loginAsUser();
    await navigateTo("/progres");
    await screen.findByRole("heading", { name: /Progrès/i });

    await waitFor(() => {
      expect(screen.getByText("Aucune séance enregistrée pour le moment.")).toBeInTheDocument();
      expect(screen.getByText("Séances totales").closest(".stat-card")).toHaveTextContent("0");
      expect(screen.getByText("Calories brûlées").closest(".stat-card")).toHaveTextContent("0");
    });

    expect(screen.queryByText("Records personnels")).not.toBeInTheDocument();
  });

  test("heatmap grid renders when sessions exist", async () => {
    await loginAsUser();
    const today = new Date();
    await db.sessions.bulkPut([
      makeCompletedSession("run-1", { startedAt: today.toISOString() }),
    ]);

    await navigateTo("/progres");
    await screen.findByRole("heading", { name: /Progrès/i });

    await waitFor(() => {
      expect(screen.getByTestId("heatmap-grid")).toBeInTheDocument();
      expect(screen.getByText("Activité (90 jours)")).toBeInTheDocument();
    });
  });

  test("progression chart shows exercise selector with sessions data", async () => {
    await loginAsUser();
    await db.sessions.bulkPut([
      makeCompletedSession("run-1", { startedAt: "2026-04-01T08:00:00Z" }),
      makeCompletedSession("run-2", {
        startedAt: "2026-04-03T08:00:00Z",
        exercises: [
          {
            id: "ex-a",
            name: "Squat barre libre",
            phase: "main",
            status: "completed",
            sets: [
              { id: "sa", index: 0, targetReps: "10", targetLoad: "50 kg", actualReps: "10", actualLoad: "55 kg", validated: true, validatedAt: "2026-04-03T08:15:00Z", restSeconds: 60 },
            ],
          },
        ],
      }),
    ]);

    await navigateTo("/progres");
    await screen.findByRole("heading", { name: /Progrès/i });

    await waitFor(() => {
      expect(screen.getByTestId("progression-chart")).toBeInTheDocument();
      expect(screen.getByText("Progression")).toBeInTheDocument();
      expect(screen.getByLabelText("Exercice")).toBeInTheDocument();
    });
  });
});
