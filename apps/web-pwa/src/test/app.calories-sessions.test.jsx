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

function makeSession(id, overrides = {}) {
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
        id: "ex-1",
        name: "Squat barre libre",
        phase: "main",
        status: "completed",
        sets: [
          { id: "s1", index: 0, targetReps: "10", targetLoad: "40 kg", actualReps: "10", actualLoad: "40 kg", validated: true, validatedAt: "2026-04-01T08:10:00Z", restSeconds: 60 },
        ],
      },
    ],
    ...overrides,
  };
}

describe("Calories page integration", () => {
  test("shows total calories and session breakdown", async () => {
    await loginAsUser();
    await db.sessions.bulkPut([
      makeSession("cal-1"),
      makeSession("cal-2", {
        dayId: "mercredi",
        startedAt: "2026-04-03T08:00:00Z",
        endedAt: "2026-04-03T08:30:00Z",
        elapsedMs: 30 * 60_000,
        globalTimer: { accumulatedMs: 30 * 60_000, runningSince: null },
      }),
    ]);

    await navigateTo("/calories");
    await screen.findByRole("heading", { name: /Calories/i });

    await waitFor(() => {
      expect(screen.getByText(/kcal brûlées au total/)).toBeInTheDocument();
      expect(screen.getByText("Détail par séance")).toBeInTheDocument();
    });

    const list = screen.getByText("Détail par séance").closest("section");
    const items = within(list).getAllByText(/kcal/);
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  test("shows empty state when no sessions", async () => {
    await loginAsUser();
    await navigateTo("/calories");
    await screen.findByRole("heading", { name: /Calories/i });

    await waitFor(() => {
      expect(screen.getByText("Aucune séance complétée pour le moment.")).toBeInTheDocument();
    });
  });

  test("back button returns to progress page", async () => {
    const user = await loginAsUser();
    await navigateTo("/calories");
    await screen.findByRole("heading", { name: /Calories/i });

    await user.click(screen.getByRole("button", { name: "Retour" }));
    await screen.findByRole("heading", { name: /Progrès/i });
  });
});

describe("Sessions page integration", () => {
  test("shows all sessions with details", async () => {
    await loginAsUser();
    await db.sessions.bulkPut([
      makeSession("sess-1"),
      makeSession("sess-2", {
        dayId: "mercredi",
        startedAt: "2026-04-03T08:00:00Z",
        status: "stopped",
        elapsedMs: 20 * 60_000,
        completedExercisesCount: 1,
      }),
    ]);

    await navigateTo("/seances");
    await screen.findByRole("heading", { name: /Séances/i });

    await waitFor(() => {
      expect(screen.getByText("2 séances")).toBeInTheDocument();
      expect(screen.getByText("Terminée")).toBeInTheDocument();
      expect(screen.getByText("Arrêtée")).toBeInTheDocument();
    });
  });

  test("filters sessions by status", async () => {
    const user = await loginAsUser();
    await db.sessions.bulkPut([
      makeSession("sess-1"),
      makeSession("sess-2", { status: "stopped", startedAt: "2026-04-02T08:00:00Z" }),
    ]);

    await navigateTo("/seances");
    await screen.findByRole("heading", { name: /Séances/i });

    await waitFor(() => {
      expect(screen.getByText("2 séances")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Terminées" }));
    await waitFor(() => {
      expect(screen.getByText("1 séance")).toBeInTheDocument();
      expect(screen.getByText("Terminée")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Arrêtées" }));
    await waitFor(() => {
      expect(screen.getByText("1 séance")).toBeInTheDocument();
      expect(screen.getByText("Arrêtée")).toBeInTheDocument();
    });
  });

  test("shows empty state when no sessions", async () => {
    await loginAsUser();
    await navigateTo("/seances");
    await screen.findByRole("heading", { name: /Séances/i });

    await waitFor(() => {
      expect(screen.getByText("0 séances")).toBeInTheDocument();
      expect(screen.getByText("Aucune séance trouvée.")).toBeInTheDocument();
    });
  });

  test("back button returns to progress page", async () => {
    const user = await loginAsUser();
    await navigateTo("/seances");
    await screen.findByRole("heading", { name: /Séances/i });

    await user.click(screen.getByRole("button", { name: "Retour" }));
    await screen.findByRole("heading", { name: /Progrès/i });
  });
});
