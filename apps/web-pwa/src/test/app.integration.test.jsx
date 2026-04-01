import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

vi.mock("@meutreino/core-domain", async () => {
  const actual = await vi.importActual("@meutreino/core-domain");
  return {
    ...actual,
    getCurrentDayId: () => "lundi",
  };
});

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

describe("App integration", () => {
  test("login redirects to home and loads session of current day", async () => {
    const user = await loginAsUser();

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Visualiser" })).toBeInTheDocument();
      expect(screen.queryByText("Pas de seance configuree pour aujourd hui.")).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Deconnexion" }));
    await screen.findByRole("heading", { name: "Connexion" });
  });

  test("home links to weekly sections with view and run actions for each day", async () => {
    const user = await loginAsUser();
    await user.click(screen.getByRole("link", { name: "Voir la semaine" }));

    await screen.findByRole("heading", { name: "Sections de la semaine" });

    const mondayCard = screen.getByTestId("week-day-lundi");
    expect(within(mondayCard).getByRole("link", { name: "Visualiser" })).toHaveAttribute("href", "/jour/lundi");
    expect(within(mondayCard).getByRole("link", { name: "Lancer session" })).toHaveAttribute("href", "/session/lundi");

    const sundayCard = screen.getByTestId("week-day-dimanche");
    expect(within(sundayCard).getByRole("link", { name: "Visualiser" })).toHaveAttribute("href", "/jour/dimanche");
    expect(within(sundayCard).queryByRole("link", { name: "Lancer session" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("week-day-samedi")).not.toBeInTheDocument();
  });

  test("visualization mode allows editing reps/load and series count", async () => {
    const user = await loginAsUser();
    await navigateTo("/jour/lundi");
    await screen.findByRole("heading", { name: "Exercices" });

    const firstExercise = screen.getByTestId("exercise-0");
    const repsInput = within(firstExercise).getAllByRole("textbox")[0];
    const loadInput = within(firstExercise).getAllByRole("textbox")[1];
    const seriesCount = within(firstExercise).getByTestId("exercise-0-series-count");

    expect(seriesCount).toHaveTextContent("2 series");

    fireEvent.change(repsInput, { target: { value: "18" } });
    fireEvent.change(loadInput, { target: { value: "72 kg" } });
    await user.click(within(firstExercise).getByRole("button", { name: "+ Serie" }));

    await waitFor(() => {
      expect(loadInput).toHaveValue("72 kg");
      expect(seriesCount).toHaveTextContent("3 series");
    });

  });

  test("run mode validates one set then starts and skips rest timer", async () => {
    const user = await loginAsUser();
    await navigateTo("/session/lundi");

    await screen.findByRole("heading", { name: /Session en cours/i });
    expect(screen.getByTestId("current-series-label")).toHaveTextContent("Serie 1/2");

    await user.click(screen.getByRole("button", { name: "Valider la serie" }));
    await screen.findByTestId("rest-box");
    expect(screen.getByTestId("current-series-label")).toHaveTextContent("Serie 2/2");

    await user.click(screen.getByRole("button", { name: "Passer le timer" }));
    await waitFor(() => {
      expect(screen.queryByTestId("rest-box")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Valider la serie" })).toBeInTheDocument();
    });

  });
});
