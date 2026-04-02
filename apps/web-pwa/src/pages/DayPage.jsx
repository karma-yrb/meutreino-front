import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumbbell, faRepeat, faPlay, faPlus, faMinus, faChevronLeft, faChevronUp, faChevronDown, faFire } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../features/auth/useAuth";
import { getDayPlanForUser, updateUserPlanDay } from "../services/storage/repositories/plansRepository";
import { getExerciseMedia } from "../data/exerciseMedia";

const WEEK_DAYS = [
  { short: "L", id: "lundi" },
  { short: "M", id: "mardi" },
  { short: "M", id: "mercredi" },
  { short: "J", id: "jeudi" },
  { short: "V", id: "vendredi" },
  { short: "S", id: "samedi" },
  { short: "D", id: "dimanche" },
];

export function DayPage() {
  const { dayId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [day, setDay] = useState(null);
  const [openSections, setOpenSections] = useState({ warmup: false, exercises: true });

  useEffect(() => {
    async function load() {
      if (!currentUser || !dayId) return;
      const response = await getDayPlanForUser(currentUser.id, dayId);
      setDay(response);
    }
    load();
  }, [currentUser, dayId]);

  function applyFieldChange(prevDay, exIndex, setIndex, field, value) {
    const nextMain = prevDay.main.map((exercise, i) => {
      if (i !== exIndex) return exercise;
      const nextSeries = exercise.series.map((serie, si) =>
        si === setIndex ? { ...serie, [field]: value } : serie,
      );
      return { ...exercise, series: nextSeries };
    });
    return { ...prevDay, main: nextMain };
  }

  function handleFieldChange(exIndex, setIndex, field, value) {
    if (!currentUser || !dayId) return;
    // Optimistic update — no flicker
    setDay((prev) => (prev ? applyFieldChange(prev, exIndex, setIndex, field, value) : prev));
    updateUserPlanDay(currentUser.id, dayId, (draftDay) =>
      applyFieldChange(draftDay, exIndex, setIndex, field, value)
    );
  }

  function handleSeriesCountChange(exIndex, delta) {
    if (!currentUser || !dayId) return;

    function applyDelta(prevDay) {
      const nextMain = prevDay.main.map((exercise, i) => {
        if (i !== exIndex) return exercise;
        const currentSeries = exercise.series ?? [];
        if (delta > 0) {
          const base = currentSeries[currentSeries.length - 1] ?? { reps: "12", load: "-", rest: "-", tempo: "-" };
          return { ...exercise, series: [...currentSeries, { ...base }] };
        }
        if (delta < 0 && currentSeries.length > 1) {
          return { ...exercise, series: currentSeries.slice(0, -1) };
        }
        return exercise;
      });
      return { ...prevDay, main: nextMain };
    }

    // Optimistic update
    setDay((prev) => (prev ? applyDelta(prev) : prev));
    updateUserPlanDay(currentUser.id, dayId, applyDelta);
  }

  function handleStep(exIndex, setIndex, field, delta) {
    const serie = day.main[exIndex].series[setIndex];
    const current = parseFloat(serie[field]);
    const base = isNaN(current) ? 0 : current;
    const next = Math.max(field === "reps" ? 1 : 0, base + delta);
    const formatted = Number.isInteger(next) ? String(next) : next.toFixed(1);
    handleFieldChange(exIndex, setIndex, field, formatted);
  }

  function toggleSection(key) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  if (!day) {
    return <div className="page">Jour introuvable.</div>;
  }

  const isRest = day.rest;
  const hasExercises = !isRest && !day.cardioOnly && day.main?.length > 0;
  const hasWarmup = (day.warmup?.length ?? 0) > 0;
  const totalSeries = hasExercises
    ? day.main.reduce((acc, ex) => acc + (ex.series?.length ?? 0), 0)
    : 0;

  return (
    <div className="day-page">
      {/* ── Hero ───────────────────────────────────────── */}
      <div className="day-hero">
        <div className="day-hero-placeholder" aria-hidden="true">
          <FontAwesomeIcon icon={faDumbbell} />
        </div>
        <button className="back-btn" type="button" onClick={() => navigate(-1)} aria-label="Retour">
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
      </div>

      {/* ── Title sheet ────────────────────────────────── */}
      <div className="day-sheet">
        <div className="day-sheet-inner">
          <h2 className="day-sheet-title">
            {day.training ? `${day.training} – ` : ""}{day.title ?? day.fullLabel}
          </h2>
          <p className="day-sheet-subtitle">{day.fullLabel}</p>

          <div className="day-meta-row">
            {/* Week dots */}
            <div className="week-dots-block">
              {WEEK_DAYS.map((wd, i) => (
                <div key={i} className={`week-dot-col${wd.id === dayId ? " week-dot-active" : ""}`}>
                  <span className="week-dot-label">{wd.short}</span>
                  <span className="week-dot-circle" />
                </div>
              ))}
            </div>

            <div className="day-meta-divider" />

            <div className="day-meta-item">
              <span className="day-meta-label">Catégorie</span>
              <strong className="day-meta-value">{day.tag ?? "Sans Catégorie"}</strong>
            </div>

            <div className="day-meta-divider" />

            <div className="day-meta-item">
              <span className="day-meta-label">Dernière exécution</span>
              <strong className="day-meta-value">Pas de données</strong>
            </div>
          </div>
        </div>

        {/* ── Warmup accordion ─────────────────────────── */}
        {hasWarmup && (
          <div className="day-accordion">
            <button
              type="button"
              className="day-accordion-header"
              onClick={() => toggleSection("warmup")}
            >
              <span>Échauffement</span>
              <span className="day-accordion-chevron">
                <FontAwesomeIcon icon={openSections.warmup ? faChevronUp : faChevronDown} />
              </span>
            </button>
            {openSections.warmup && (
              <div className="day-accordion-body">
                {day.warmup.map((item, i) => (
                  <div key={i} className="warmup-item">
                    <span>{item.name}</span>
                    <span className="warmup-detail">{item.detail}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Exercises accordion ──────────────────────── */}
        {hasExercises && (
          <div className="day-accordion">
            <h3 className="day-accordion-heading">
              <button
                type="button"
                className="day-accordion-header"
                onClick={() => toggleSection("exercises")}
              >
                <span>Exercices</span>
                <span className="day-accordion-chevron">
                  <FontAwesomeIcon icon={openSections.exercises ? faChevronUp : faChevronDown} />
                </span>
              </button>
            </h3>
            {openSections.exercises && (
              <div className="day-accordion-body">
                <div className="exercise-list">
                  {day.main.map((exercise, exIndex) => {
                    const media = getExerciseMedia(exercise.name);
                    return (
                      <article
                        data-testid={`exercise-${exIndex}`}
                        key={exercise.id ?? `${exercise.name}-${exIndex}`}
                        className="exercise-item"
                      >
                        <div className="exercise-item-header">
                          {media.imageUrl ? (
                            <img src={media.imageUrl} alt={exercise.name} className="exercise-thumb" />
                          ) : (
                            <div className="exercise-thumb-placeholder" aria-hidden="true">
                              <FontAwesomeIcon icon={faDumbbell} />
                            </div>
                          )}
                          <div className="exercise-item-info">
                            <h4>{exercise.name}</h4>
                            {exercise.tag && (
                              <span className="exercise-tag" style={{ color: exercise.tagColor ?? "var(--muted)" }}>
                                {exercise.tag}
                              </span>
                            )}
                            <p className="muted" style={{ margin: "2px 0 0", fontSize: 13 }} data-testid={`exercise-${exIndex}-series-count`}>
                              {exercise.series.length} serie{exercise.series.length > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        <div className="exercise-item-body">
                          <div className="series-grid">
                            {exercise.series.map((serie, setIndex) => (
                              <div key={setIndex} className="series-grid-row">
                                <span className="set-pill-num">{setIndex + 1}</span>
                                <span className="set-pill">
                                  <FontAwesomeIcon icon={faRepeat} size="xs" />
                                  <button type="button" className="stepper-btn" onClick={() => handleStep(exIndex, setIndex, "reps", -1)}>−</button>
                                  <input
                                    className="set-pill-input reps-input"
                                    value={serie.reps}
                                    onChange={(e) => handleFieldChange(exIndex, setIndex, "reps", e.target.value)}
                                    aria-label="Répétitions"
                                  />
                                  <button type="button" className="stepper-btn" onClick={() => handleStep(exIndex, setIndex, "reps", 1)}>+</button>
                                </span>
                                <span className="set-pill">
                                  <FontAwesomeIcon icon={faDumbbell} size="xs" />
                                  <button type="button" className="stepper-btn" onClick={() => handleStep(exIndex, setIndex, "load", -1)}>−</button>
                                  <input
                                    className="set-pill-input load-input"
                                    value={serie.load}
                                    onChange={(e) => handleFieldChange(exIndex, setIndex, "load", e.target.value)}
                                    aria-label="Charge"
                                  />
                                  <button type="button" className="stepper-btn" onClick={() => handleStep(exIndex, setIndex, "load", 1)}>+</button>
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="exercise-actions">
                            <button type="button" className="icon-btn" aria-label="+ Serie" onClick={() => handleSeriesCountChange(exIndex, 1)} title="Ajouter une série">
                              <FontAwesomeIcon icon={faPlus} />
                            </button>
                            <button type="button" className="icon-btn" aria-label="- Serie" onClick={() => handleSeriesCountChange(exIndex, -1)} disabled={exercise.series.length <= 1} title="Retirer une série">
                              <FontAwesomeIcon icon={faMinus} />
                            </button>
                            {media.videoUrl ? (
                              <a href={media.videoUrl} target="_blank" rel="noopener noreferrer" className="video-slot">
                                <FontAwesomeIcon icon={faPlay} size="xs" /> Vidéo
                              </a>
                            ) : (
                              <span className="video-slot-placeholder">
                                <FontAwesomeIcon icon={faPlay} size="xs" /> Vidéo à venir
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rest day message */}
        {isRest && (
          <div className="day-accordion">
            <div className="day-accordion-body">
              <p style={{ textAlign: "center", padding: "12px 0", color: "var(--muted)" }}>Journée de repos — récupération active conseillée.</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky CTA ─────────────────────────────────── */}
      {hasExercises && (
        <div className="day-cta-bar">
          <Link className="day-cta-btn" to={`/session/${day.id}`}>
            <FontAwesomeIcon icon={faFire} />
            Commencer l&apos;entraînement
          </Link>
          {totalSeries > 0 && (
            <span className="day-cta-badge">
              <FontAwesomeIcon icon={faRepeat} size="xs" /> {totalSeries} séries
            </span>
          )}
        </div>
      )}
    </div>
  );
}
