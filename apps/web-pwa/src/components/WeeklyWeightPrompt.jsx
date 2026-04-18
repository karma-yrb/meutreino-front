import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWeight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { upsertWeightForToday } from "../services/storage/repositories/weightRepository";
import { dismissThisWeek } from "./weeklyWeightPromptUtils";

export function WeeklyWeightPrompt({ userId, onDone }) {
  const [weightInput, setWeightInput] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    const value = parseFloat(weightInput.replace(",", "."));
    if (!value || value <= 0 || value > 500) return;
    setSaving(true);
    await upsertWeightForToday(userId, value);
    setSaving(false);
    dismissThisWeek();
    onDone();
  }

  function handleSkip() {
    dismissThisWeek();
    onDone();
  }

  return (
    <section className="card weekly-weight-prompt" aria-label="Pesée hebdomadaire">
      <div className="weekly-weight-prompt__header">
        <span className="weekly-weight-prompt__title">
          <FontAwesomeIcon icon={faWeight} />
          Pesée de la semaine
        </span>
        <button
          className="weekly-weight-prompt__skip-icon"
          onClick={handleSkip}
          aria-label="Ignorer"
          type="button"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
      <p className="weekly-weight-prompt__sub muted">
        Renseignez votre poids pour suivre votre évolution.
      </p>
      <form className="weekly-weight-prompt__form" onSubmit={handleSave}>
        <input
          type="number"
          step="0.1"
          min="1"
          max="500"
          placeholder="Poids (kg)"
          value={weightInput}
          onChange={(e) => setWeightInput(e.target.value)}
          aria-label="Poids en kg"
          className="weekly-weight-prompt__input"
          autoFocus
        />
        <div className="weekly-weight-prompt__actions">
          <button type="submit" disabled={saving || !weightInput} className="primary-btn weekly-weight-prompt__btn-save">
            Enregistrer
          </button>
          <button type="button" onClick={handleSkip} className="ghost-btn weekly-weight-prompt__btn-skip">
            Pas maintenant
          </button>
        </div>
      </form>
    </section>
  );
}
