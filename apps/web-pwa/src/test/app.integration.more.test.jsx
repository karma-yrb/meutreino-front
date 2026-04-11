import { describe, expect, test } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function loginAs(email, password) {
  window.history.replaceState({}, "", "/");
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("heading", { name: "Connexion" });
  await user.clear(screen.getByLabelText("Email"));
  await user.type(screen.getByLabelText("Email"), email);
  await user.clear(screen.getByLabelText("Mot de passe"));
  await user.type(screen.getByLabelText("Mot de passe"), password);
  await user.click(screen.getByRole("button", { name: "Se connecter" }));
  await screen.findByRole("heading", { name: /Bienvenue/i });
  return user;
}

async function navigateTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

describe("App integration additional", () => {
  test("session supports pause, resume and stop with persistence", async () => {
    const user = await loginAs("user@local", "user123");
    await navigateTo("/session/lundi");
    await screen.findByRole("heading", { name: /Session en cours/i });

    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByRole("button", { name: "Reprendre" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Arreter la session" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Valider la serie" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Reprendre" }));
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Arreter la session" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Pause" }));
    await user.click(screen.getByRole("button", { name: "Arreter la session" }));
    await waitFor(() => {
      expect(screen.getByTestId("session-status")).toHaveTextContent("stopped");
      expect(screen.getByRole("button", { name: "Retour accueil" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Retour accueil" }));
    await waitFor(() => {
      expect(screen.getByText(/stopped/i)).toBeInTheDocument();
    });
  });

  test("session can be completed end-to-end", async () => {
    const user = await loginAs("user@local", "user123");
    await navigateTo("/session/lundi");
    await screen.findByRole("heading", { name: /Session en cours/i });

    for (let i = 0; i < 60; i += 1) {
      if (screen.queryByRole("button", { name: "Retour accueil" })) {
        break;
      }

      const restBox = screen.queryByTestId("rest-box");
      if (restBox) {
        await user.click(within(restBox).getByRole("button", { name: "Passer le timer" }));
      } else {
        const validateBtn = screen.queryByRole("button", { name: "Valider la serie" });
        if (validateBtn) {
          await user.click(validateBtn);
        }
      }
    }

    expect(screen.getByTestId("session-status")).toHaveTextContent("completed");
    expect(screen.getByRole("button", { name: "Retour accueil" })).toBeInTheDocument();
    expect(screen.getByText("10/10")).toBeInTheDocument();
  }, 10000);

  test("role navigation and guard behavior for admin and coach", async () => {
    const user = await loginAs("admin@local", "admin123");
    expect(screen.getByRole("link", { name: "Admin" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Coach" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Admin" }));
    await screen.findByRole("heading", { name: "Admin - Templates" });

    await user.click(screen.getByRole("button", { name: "Deconnexion" }));
    await screen.findByRole("heading", { name: "Connexion" });

    cleanup();
    const coachUser = await loginAs("coach@local", "coach123");
    expect(screen.getByRole("link", { name: "Coach" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();

    await coachUser.click(screen.getByRole("link", { name: "Coach" }));
    await screen.findByRole("heading", { name: "Coach - Utilisateurs assignes" });

    await navigateTo("/admin/templates");
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "Admin - Templates" })).not.toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /Bienvenue/i })).toBeInTheDocument();
    });
  });

  test.todo("coach can edit assigned user plan and persist reps/load updates");
  test.todo("running session resumes after app reload or app reopen");
});
