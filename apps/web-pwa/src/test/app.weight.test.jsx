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

describe("Weight page integration", () => {
  test("shows empty state when no records", async () => {
    await loginAsUser();
    await navigateTo("/poids");
    await screen.findByRole("heading", { name: /Suivi du poids/i });

    expect(screen.getByText("Aucune pesée enregistrée.")).toBeInTheDocument();
    expect(screen.getByLabelText("Poids en kg")).toBeInTheDocument();
  });

  test("adds a weight record and displays it in history", async () => {
    const user = await loginAsUser();
    await navigateTo("/poids");
    await screen.findByRole("heading", { name: /Suivi du poids/i });

    const input = screen.getByLabelText("Poids en kg");
    await user.type(input, "78.5");
    await user.click(screen.getByRole("button", { name: /Ajouter/i }));

    await waitFor(() => {
      const summary = screen.getByText(/kg/, { selector: ".weight-current" });
      expect(summary).toHaveTextContent("78.5 kg");
    });

    // History list shows the record
    const historySection = screen.getByText("Historique").closest("section");
    expect(within(historySection).getByText("78.5 kg")).toBeInTheDocument();
  });

  test("upserts weight for same day instead of duplicating", async () => {
    const user = await loginAsUser();
    await navigateTo("/poids");
    await screen.findByRole("heading", { name: /Suivi du poids/i });

    // Add first record
    await user.type(screen.getByLabelText("Poids en kg"), "80");
    await user.click(screen.getByRole("button", { name: /Ajouter/i }));
    await waitFor(() => {
      expect(screen.getByText(/kg/, { selector: ".weight-current" })).toHaveTextContent("80");
    });

    // Add second record same day — should update, not duplicate
    await user.type(screen.getByLabelText("Poids en kg"), "79");
    await user.click(screen.getByRole("button", { name: /Ajouter/i }));
    await waitFor(() => {
      expect(screen.getByText(/kg/, { selector: ".weight-current" })).toHaveTextContent("79");
    });

    // Should have exactly 1 item in history
    const historySection = screen.getByText("Historique").closest("section");
    const items = within(historySection).getAllByText(/kg/);
    expect(items).toHaveLength(1);
  });

  test("deletes a weight record", async () => {
    const user = await loginAsUser();
    await db.weightHistory.bulkAdd([
      { userId: "user-1", weightKg: 80, recordedAt: "2026-04-01T08:00:00Z" },
      { userId: "user-1", weightKg: 78, recordedAt: "2026-04-05T08:00:00Z" },
    ]);

    await navigateTo("/poids");
    await screen.findByRole("heading", { name: /Suivi du poids/i });

    await waitFor(() => {
      expect(screen.getByText(/kg/, { selector: ".weight-current" })).toHaveTextContent("78");
    });

    const deleteButtons = screen.getAllByRole("button", { name: /Supprimer pesée/i });
    expect(deleteButtons).toHaveLength(2);

    // Delete the first one in the list (most recent = 78 kg)
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/kg/, { selector: ".weight-current" })).toHaveTextContent("80");
    });
    // 78 kg should no longer be in the history
    const historySection = screen.getByText("Historique").closest("section");
    expect(within(historySection).queryByText("78 kg")).not.toBeInTheDocument();
  });

  test("displays BMI when height is available in profile", async () => {
    await loginAsUser();
    await db.weightHistory.bulkAdd([
      { userId: "user-1", weightKg: 78, recordedAt: "2026-04-10T08:00:00Z" },
    ]);

    await navigateTo("/poids");
    await screen.findByRole("heading", { name: /Suivi du poids/i });

    await waitFor(() => {
      // user profile has heightCm=179, weight=78 → BMI = 78/(1.79²) ≈ 24.3
      expect(screen.getByText(/IMC/)).toBeInTheDocument();
      expect(screen.getByText(/24\.3/)).toBeInTheDocument();
      expect(screen.getByText(/Poids normal/)).toBeInTheDocument();
    });
  });

  test("displays weight diff from first to latest", async () => {
    await loginAsUser();
    await db.weightHistory.bulkAdd([
      { userId: "user-1", weightKg: 82, recordedAt: "2026-04-01T08:00:00Z" },
      { userId: "user-1", weightKg: 78, recordedAt: "2026-04-10T08:00:00Z" },
    ]);

    await navigateTo("/poids");
    await screen.findByRole("heading", { name: /Suivi du poids/i });

    await waitFor(() => {
      expect(screen.getByText(/kg/, { selector: ".weight-current" })).toHaveTextContent("78");
      expect(screen.getByText("-4 kg")).toBeInTheDocument();
    });
  });

  test("back button navigates to progress page", async () => {
    const user = await loginAsUser();
    await navigateTo("/poids");
    await screen.findByRole("heading", { name: /Suivi du poids/i });

    await user.click(screen.getByRole("button", { name: "Retour" }));
    await screen.findByRole("heading", { name: /Progrès/i });
  });
});
