import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faMinus, faPlus, faWeight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { upsertWeightForToday } from "../services/storage/repositories/weightRepository";
import { dismissThisWeek } from "./weeklyWeightPromptUtils";

export function WeeklyWeightPrompt({ userId, onDone }) {
  const [weightInput, setWeightInput] = useState("");
  const [saving, setSaving] = useState(false);
  const parsedWeight = useMemo(() => parseFloat(String(weightInput).replace(",", ".")), [weightInput]);
  const isValidWeight = Number.isFinite(parsedWeight) && parsedWeight > 0 && parsedWeight <= 500;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event) {
      if (event.key === "Escape") {
        dismissThisWeek();
        onDone();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onDone]);

  function adjustWeight(delta) {
    const current = Number.isFinite(parsedWeight) ? parsedWeight : 0;
    const next = Math.round((current + delta) * 10) / 10;
    if (next <= 0 || next > 500) return;
    setWeightInput(String(next));
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!isValidWeight) return;
    setSaving(true);
    await upsertWeightForToday(userId, parsedWeight);
    setSaving(false);
    dismissThisWeek();
    onDone();
  }

  function handleSkip() {
    dismissThisWeek();
    onDone();
  }

  return (
    <div
      className="weekly-weight-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Pesée hebdomadaire"
      onClick={handleSkip}
    >
      <section className="card weekly-weight-prompt" onClick={(event) => event.stopPropagation()}>
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
          <div className="weight-stepper-row weekly-weight-prompt__stepper-row">
            <button
              type="button"
              className="weight-stepper-btn"
              onClick={() => adjustWeight(-1)}
              aria-label="Diminuer de 1 kg"
            >
              <FontAwesomeIcon icon={faMinus} />
            </button>

            <div className="weight-input-wrap">
              <input
                type="number"
                step="0.1"
                min="1"
                max="500"
                placeholder="0.0"
                value={weightInput}
                onChange={(event) => setWeightInput(event.target.value)}
                aria-label="Poids en kg"
                className="weight-input"
                required
                autoFocus
              />
              <span className="weight-input-unit">kg</span>
            </div>

            <button
              type="button"
              className="weight-stepper-btn"
              onClick={() => adjustWeight(1)}
              aria-label="Augmenter de 1 kg"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>

          <div className="weekly-weight-prompt__actions">
            <button type="submit" disabled={saving || !isValidWeight} className="primary-btn with-icon weekly-weight-prompt__btn-save">
              <FontAwesomeIcon icon={faCheck} />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button type="button" onClick={handleSkip} className="ghost-btn weekly-weight-prompt__btn-skip">
              Pas maintenant
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
