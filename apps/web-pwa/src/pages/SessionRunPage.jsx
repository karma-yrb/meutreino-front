import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumbbell, faRepeat, faPlay, faPause, faStop, faCheck, faForward } from "@fortawesome/free-solid-svg-icons";
import {
  buildSessionRun,
  getElapsedMs,
  pauseSession,
  resumeSession,
  skipRestTimer,
  stopSession,
  tickSession,
  updateCurrentSetValues,
  validateCurrentSet,
} from "@meutreino/core-domain";
import { useAuth } from "../features/auth/useAuth";
import { getActivePlanForUser, getDayPlanForUser } from "../services/storage/repositories/plansRepository";
import { saveSessionRun } from "../services/storage/repositories/sessionsRepository";
import { getExerciseMedia } from "../data/exerciseMedia";

function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function SessionRunPage() {
  const { dayId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [day, setDay] = useState(null);
  const [planVersion, setPlanVersion] = useState("");
  const [session, setSession] = useState(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [justValidated, setJustValidated] = useState(false);
  const persistedRef = useRef(false);

  useEffect(() => {
    async function load() {
      if (!currentUser || !dayId) return;
      const [dayData, activePlan] = await Promise.all([
        getDayPlanForUser(currentUser.id, dayId),
        getActivePlanForUser(currentUser.id),
      ]);

      setDay(dayData);
      setPlanVersion(activePlan?.version ?? "unknown");

      if (!dayData?.rest && !dayData?.cardioOnly && (dayData?.main?.length ?? 0) > 0) {
        const run = buildSessionRun({
          userId: currentUser.id,
          dayId,
          day: dayData,
          planVersion: activePlan?.version ?? "unknown",
          restSeconds: 60,
          nowMs: Date.now(),
        });
        setSession(run);
      }
    }
    load();
  }, [currentUser, dayId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = Date.now();
      setNowMs(t);
      setSession((prev) => (prev ? tickSession(prev, t) : prev));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function persistIfFinalized() {
      if (!session || persistedRef.current) return;
      if (session.status !== "completed" && session.status !== "stopped") return;

      const payload = {
        ...session,
        elapsedMs: getElapsedMs(session, Date.now()),
      };
      await saveSessionRun(payload);
      persistedRef.current = true;
    }
    persistIfFinalized();
  }, [session]);

  const currentExercise = session?.exercises?.[session.currentExerciseIndex] ?? null;
  const currentSet = currentExercise?.sets?.[session.currentSetIndex] ?? null;
  const elapsedLabel = formatDuration(session ? getElapsedMs(session, nowMs) : 0);
  const progressLabel = useMemo(() => {
    if (!session) return "0/0";
    return `${session.completedExercisesCount}/${session.exercises.length}`;
  }, [session]);

  const { totalSets, completedSets } = useMemo(() => {
    if (!session) return { totalSets: 0, completedSets: 0 };
    let total = 0;
    let done = 0;
    for (const ex of session.exercises) {
      for (const s of ex.sets) {
        total++;
        if (s.validated) done++;
      }
    }
    return { totalSets: total, completedSets: done };
  }, [session]);

  function setValue(field, value) {
    setSession((prev) => {
      if (!prev) return prev;
      return updateCurrentSetValues(prev, { [field]: value });
    });
  }

  function stepValue(field, delta) {
    const raw = field === "actualReps" ? (currentSet?.actualReps ?? "") : (currentSet?.actualLoad ?? "");
    const current = parseFloat(raw);
    const base = isNaN(current) ? 0 : current;
    const next = Math.max(field === "actualReps" ? 1 : 0, base + delta);
    const formatted = Number.isInteger(next) ? String(next) : next.toFixed(1);
    setValue(field, formatted);
  }

  function onValidateSet() {
    setSession((prev) => {
      if (!prev) return prev;
      return validateCurrentSet(prev, { nowMs: Date.now(), restSeconds: 60 });
    });
    setJustValidated(true);
    setTimeout(() => setJustValidated(false), 700);
  }

  function onPauseResume() {
    setSession((prev) => {
      if (!prev) return prev;
      if (prev.status === "running") return pauseSession(prev, Date.now());
      if (prev.status === "paused") return resumeSession(prev, Date.now());
      return prev;
    });
  }

  function onStop() {
    setSession((prev) => (prev ? stopSession(prev, Date.now()) : prev));
  }

  if (!day) {
    return <div className="page">Chargement de la session...</div>;
  }

  if (day.rest || day.cardioOnly || !session) {
    return (
      <div className="page">
        <section className="card">
          <h2>Session non disponible</h2>
          <p className="muted">Ce jour ne contient pas de sequence d exercices a valider.</p>
          <Link className="primary-btn" to={`/jour/${day.id}`}>
            Retour au jour
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="card session-header-card">
        <h2>Session en cours - {day.fullLabel}</h2>
        <p>{day.title}</p>
        <p className="muted">Plan: {planVersion}</p>
        <div className="stats-grid">
          <div>
            <strong>Temps global</strong>
            <p>{elapsedLabel}</p>
          </div>
          <div>
            <strong>Exercices finalises</strong>
            <p>{progressLabel}</p>
          </div>
          <div>
            <strong>Etat</strong>
            <p data-testid="session-status">{session.status}</p>
          </div>
        </div>
        {/* Barre de progression globale */}
        <div className="session-progress-bar-wrap">
          <div
            className="session-progress-bar-fill"
            style={{ width: totalSets > 0 ? `${Math.round((completedSets / totalSets) * 100)}%` : "0%" }}
          />
        </div>
        <p className="session-progress-label">{completedSets}/{totalSets} séries</p>

        <div className="btn-row">
          {session.status === "running" || session.status === "paused" ? (
            <button className="ghost-btn" type="button" onClick={onPauseResume} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FontAwesomeIcon icon={session.status === "running" ? faPause : faPlay} />
              {session.status === "running" ? "Pause" : "Reprendre"}
            </button>
          ) : null}
          {session.status === "running" || session.status === "paused" ? (
            <button className="ghost-btn" type="button" onClick={onStop} aria-label="Arreter la session" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FontAwesomeIcon icon={faStop} />
              Arrêter
            </button>
          ) : null}
          {(session.status === "completed" || session.status === "stopped") && (
            <button className="primary-btn" type="button" onClick={() => navigate("/")}>
              Retour accueil
            </button>
          )}
        </div>
      </section>

      {session.status === "running" || session.status === "paused" ? (
        <section className="card">
          <h3>Exercice actuel</h3>

          {/* Hero image de l'exercice */}
          {(() => {
            const media = getExerciseMedia(currentExercise?.name);
            return media.imageUrl ? (
              <img src={media.imageUrl} alt={currentExercise?.name} className="exercise-hero" />
            ) : (
              <div className="exercise-hero-placeholder" aria-hidden="true">
                <FontAwesomeIcon icon={faDumbbell} />
              </div>
            );
          })()}

          <p className="title-main">{currentExercise?.name ?? "-"}</p>
          {(() => {
            const desc = currentExercise?.description || getExerciseMedia(currentExercise?.name).description;
            return desc ? <p className="exercise-description">{desc}</p> : null;
          })()}
          {currentExercise?.note && (
            <p className="exercise-note-readonly">{currentExercise.note}</p>
          )}
          <div className="progress-badge">
            <span>Ex. {session.currentExerciseIndex + 1}/{session.exercises.length}</span>
            <span className="progress-sep">·</span>
            <span data-testid="current-series-label">Serie {session.currentSetIndex + 1}/{currentExercise?.sets.length ?? 0}</span>
          </div>

          {!session.rest.active && <div className="set-edit-grid">
            <div className="set-stepper-group">
              <span className="set-stepper-label">
                <FontAwesomeIcon icon={faRepeat} size="sm" /> Rép.
              </span>
              <div className="set-stepper-row">
                <button type="button" className="stepper-btn stepper-lg" onClick={() => stepValue("actualReps", -1)} disabled={session.rest.active || session.status !== "running"}>−</button>
                <input
                  className="stepper-value-input"
                  size={1}
                  value={currentSet?.actualReps ?? ""}
                  onChange={(e) => setValue("actualReps", e.target.value)}
                  disabled={session.rest.active || session.status !== "running"}
                />
                <button type="button" className="stepper-btn stepper-lg" onClick={() => stepValue("actualReps", 1)} disabled={session.rest.active || session.status !== "running"}>+</button>
              </div>
            </div>
            <div className="set-stepper-group">
              <span className="set-stepper-label">
                <FontAwesomeIcon icon={faDumbbell} size="sm" /> Charge
              </span>
              <div className="set-stepper-row">
                <button type="button" className="stepper-btn stepper-lg" onClick={() => stepValue("actualLoad", -1)} disabled={session.rest.active || session.status !== "running"}>−</button>
                <input
                  className="stepper-value-input"
                  size={1}
                  value={currentSet?.actualLoad ?? ""}
                  onChange={(e) => setValue("actualLoad", e.target.value)}
                  disabled={session.rest.active || session.status !== "running"}
                />
                <button type="button" className="stepper-btn stepper-lg" onClick={() => stepValue("actualLoad", 1)} disabled={session.rest.active || session.status !== "running"}>+</button>
              </div>
            </div>
          </div>}

          {/* Emplacement vidéo */}
          {(() => {
            const media = getExerciseMedia(currentExercise?.name);
            return media.videoUrl ? (
              <a
                href={media.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="video-slot"
                style={{ marginBottom: 12 }}
              >
                <FontAwesomeIcon icon={faPlay} size="xs" />
                Voir la vidéo
              </a>
            ) : (
              <span className="video-slot-placeholder" style={{ marginBottom: 12 }}>
                <FontAwesomeIcon icon={faPlay} size="xs" />
                Vidéo — à venir
              </span>
            );
          })()}

          {session.rest.active ? (
            <div className="rest-box" data-testid="rest-box">
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "center" }}>Récupération</p>
              <div className="rest-countdown">{session.rest.remainingSeconds}</div>
              <p className="rest-label">secondes</p>
              <button className="ghost-btn" type="button" aria-label="Passer le timer" onClick={() => setSession((prev) => skipRestTimer(prev))} style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 auto" }}>
                <FontAwesomeIcon icon={faForward} size="xs" /> Passer
              </button>
            </div>
          ) : (
            <button
              className={`primary-btn${justValidated ? " validate-flash" : ""}`}
              type="button"
              aria-label="Valider la serie"
              onClick={onValidateSet}
              disabled={session.status !== "running"}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" }}
            >
              <FontAwesomeIcon icon={faCheck} /> Valider la série
            </button>
          )}
        </section>
      ) : null}

      <section className="card">
        <h3>Progression exercices</h3>
        <ul className="simple-list">
          {session.exercises.map((exercise, idx) => (
            <li key={exercise.id}>
              <strong>{exercise.name}</strong>
              <span className="muted">
                {" "}
                - {exercise.status}
                {idx === session.currentExerciseIndex ? " (en focus)" : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
