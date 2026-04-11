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

  test("warmup video opens inside the app modal", async () => {
    const user = await loginAsUser();
    await navigateTo("/jour/lundi");
    await screen.findByRole("button", { name: /chauffement/i });

    await user.click(screen.getByRole("button", { name: /chauffement/i }));
    await user.click(screen.getAllByRole("button", { name: /Vid/i })[0]);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByTitle(/Video -/i)).toBeInTheDocument();
  });

  test("run mode validates one set then starts and skips rest timer", async () => {
    const user = await loginAsUser();
    await navigateTo("/session/lundi");

    await screen.findByRole("heading", { name: /Session en cours/i });
    expect(screen.getByTestId("current-series-label")).toHaveTextContent("Serie 1/");

    for (let i = 0; i < 12; i += 1) {
      if (screen.queryByTestId("rest-box")) break;
      await user.click(screen.getByRole("button", { name: "Valider la serie" }));
    }

    await screen.findByTestId("rest-box");
    await user.click(screen.getByRole("button", { name: "Passer le timer" }));

    await waitFor(() => {
      expect(screen.queryByTestId("rest-box")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Valider la serie" })).toBeInTheDocument();
    });
  });

  test("run mode only accepts numeric values for repetitions and weight", async () => {
    await loginAsUser();
    await navigateTo("/session/lundi");
    await screen.findByRole("heading", { name: /Session en cours/i });

    const repsInput = screen.getByLabelText("Repetitions");
    const loadInput = screen.getByLabelText("Poids");

    fireEvent.change(repsInput, { target: { value: "12abc" } });
    fireEvent.change(loadInput, { target: { value: "4kg" } });
    expect(repsInput).toHaveValue("12");
    expect(loadInput).toHaveValue("4");

    fireEvent.change(loadInput, { target: { value: "4,5kg" } });
    expect(loadInput).toHaveValue("4.5");
  });

  test("completed exercise keeps sets validated and can be restarted without resetting values", async () => {
    const user = await loginAsUser();
    await navigateTo("/session/lundi");
    await screen.findByRole("heading", { name: /Session en cours/i });

    for (let i = 0; i < 20; i += 1) {
      if (screen.getByTestId("current-series-label").textContent === "Serie 1/2") break;
      const restBox = screen.queryByTestId("rest-box");
      if (restBox) {
        await user.click(within(restBox).getByRole("button", { name: "Passer le timer" }));
      } else {
        await user.click(screen.getByRole("button", { name: "Valider la serie" }));
      }
    }

    fireEvent.change(screen.getByLabelText("Repetitions"), { target: { value: "14" } });
    fireEvent.change(screen.getByLabelText("Poids"), { target: { value: "35" } });

    await user.click(screen.getByRole("button", { name: "Valider la serie" }));
    await user.click(screen.getByRole("button", { name: "Passer le timer" }));
    await user.click(screen.getByRole("button", { name: "Valider la serie" }));
    await user.click(screen.getByRole("button", { name: "Passer le timer" }));

    await user.click(screen.getByRole("button", { name: /Focus exercice Leg Extension/i }));

    const seriesList = screen.getByLabelText("Series");
    expect(within(seriesList).queryByText(/en cours/i)).not.toBeInTheDocument();
    expect(within(seriesList).getAllByText(/Valid/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Recommencer l exercice" }));
    expect(screen.getByTestId("current-series-label")).toHaveTextContent("Serie 1/2");
    expect(screen.getByLabelText("Repetitions")).toHaveValue("14");
    expect(screen.getByLabelText("Poids")).toHaveValue("35");
  });
});
