import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { getDayPlanForUser, updateUserPlanDay } from "../services/storage/repositories/plansRepository";

export function DayPage() {
  const { dayId } = useParams();
  const { currentUser } = useAuth();
  const [day, setDay] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!currentUser || !dayId) return;
      const response = await getDayPlanForUser(currentUser.id, dayId);
      setDay(response);
    }
    load();
  }, [currentUser, dayId]);

  const totalSets = useMemo(() => {
    if (!day?.main) return 0;
    return day.main.reduce((acc, exercise) => acc + (exercise.series?.length ?? 0), 0);
  }, [day]);

  async function handleFieldChange(exIndex, setIndex, field, value) {
    if (!currentUser || !dayId) return;
    setIsSaving(true);
    const updatedPlan = await updateUserPlanDay(currentUser.id, dayId, (draftDay) => {
      const nextMain = draftDay.main.map((exercise, i) => {
        if (i !== exIndex) return exercise;
        const nextSeries = exercise.series.map((serie, si) =>
          si === setIndex ? { ...serie, [field]: value } : serie,
        );
        return { ...exercise, series: nextSeries };
      });
      return { ...draftDay, main: nextMain };
    });
    const nextDay = updatedPlan?.days.find((entry) => entry.id === dayId);
    setDay(nextDay ?? null);
    setIsSaving(false);
  }

  async function handleSeriesCountChange(exIndex, delta) {
    if (!currentUser || !dayId) return;
    setIsSaving(true);
    const updatedPlan = await updateUserPlanDay(currentUser.id, dayId, (draftDay) => {
      const nextMain = draftDay.main.map((exercise, i) => {
        if (i !== exIndex) return exercise;

        const currentSeries = exercise.series ?? [];
        if (delta > 0) {
          const base = currentSeries[currentSeries.length - 1] ?? { reps: "-", load: "-", rest: "-", tempo: "-" };
          return {
            ...exercise,
            series: [...currentSeries, { ...base }],
          };
        }

        if (delta < 0 && currentSeries.length > 1) {
          return {
            ...exercise,
            series: currentSeries.slice(0, -1),
          };
        }

        return exercise;
      });
      return { ...draftDay, main: nextMain };
    });
    const nextDay = updatedPlan?.days.find((entry) => entry.id === dayId);
    setDay(nextDay ?? null);
    setIsSaving(false);
  }

  if (!day) {
    return <div className="page">Jour introuvable.</div>;
  }

  return (
    <div className="page">
      <section className="card">
        <h2>{day.fullLabel}</h2>
        <p>{day.rest ? "Repos" : day.title}</p>
        <p className="muted">Mode visualisation: edition reps/charge active.</p>
        <p className="muted">Total series: {totalSets}</p>
        {!day.rest && !day.cardioOnly ? (
          <div className="btn-row">
            <Link className="ghost-btn" to={`/session/${day.id}`}>
              Lancer session
            </Link>
          </div>
        ) : null}
        {isSaving ? <p className="muted">Sauvegarde...</p> : null}
      </section>

      {!day.rest && !day.cardioOnly ? (
        <section className="card">
          <h3>Exercices</h3>
          <div className="exercise-list">
            {day.main.map((exercise, exIndex) => (
              <article
                data-testid={`exercise-${exIndex}`}
                key={exercise.id ?? `${exercise.name}-${exIndex}`}
                className="exercise-item"
              >
                <h4>{exercise.name}</h4>
                <p className="muted" data-testid={`exercise-${exIndex}-series-count`}>
                  {exercise.tag ? `${exercise.tag} - ` : ""}
                  {exercise.series.length} series
                </p>
                <div className="btn-row">
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => handleSeriesCountChange(exIndex, 1)}
                  >
                    + Serie
                  </button>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => handleSeriesCountChange(exIndex, -1)}
                    disabled={exercise.series.length <= 1}
                  >
                    - Serie
                  </button>
                </div>
                {exercise.series.map((serie, setIndex) => (
                  <div key={setIndex} className="set-row">
                    <span>S{setIndex + 1}</span>
                    <input
                      value={serie.reps}
                      onChange={(e) => handleFieldChange(exIndex, setIndex, "reps", e.target.value)}
                    />
                    <input
                      value={serie.load}
                      onChange={(e) => handleFieldChange(exIndex, setIndex, "load", e.target.value)}
                    />
                  </div>
                ))}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
