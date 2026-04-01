import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

  function setValue(field, value) {
    setSession((prev) => {
      if (!prev) return prev;
      return updateCurrentSetValues(prev, { [field]: value });
    });
  }

  function onValidateSet() {
    setSession((prev) => {
      if (!prev) return prev;
      return validateCurrentSet(prev, { nowMs: Date.now(), restSeconds: 60 });
    });
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
      <section className="card">
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
        <div className="btn-row">
          {session.status === "running" || session.status === "paused" ? (
            <button className="ghost-btn" type="button" onClick={onPauseResume}>
              {session.status === "running" ? "Pause" : "Reprendre"}
            </button>
          ) : null}
          {session.status === "running" || session.status === "paused" ? (
            <button className="ghost-btn" type="button" onClick={onStop}>
              Arreter la session
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
          <p className="title-main">{currentExercise?.name ?? "-"}</p>
          <p className="muted" data-testid="current-series-label">
            Serie {session.currentSetIndex + 1}/{currentExercise?.sets.length ?? 0}
          </p>

          <div className="set-edit-grid">
            <label>
              <span>Repetitions</span>
              <input
                value={currentSet?.actualReps ?? ""}
                onChange={(e) => setValue("actualReps", e.target.value)}
                disabled={session.rest.active || session.status !== "running"}
              />
            </label>
            <label>
              <span>Charge</span>
              <input
                value={currentSet?.actualLoad ?? ""}
                onChange={(e) => setValue("actualLoad", e.target.value)}
                disabled={session.rest.active || session.status !== "running"}
              />
            </label>
          </div>

          {session.rest.active ? (
            <div className="rest-box" data-testid="rest-box">
              <strong>Recuperation en cours: {session.rest.remainingSeconds}s</strong>
              <button className="ghost-btn" type="button" onClick={() => setSession((prev) => skipRestTimer(prev))}>
                Passer le timer
              </button>
            </div>
          ) : (
            <button className="primary-btn" type="button" onClick={onValidateSet} disabled={session.status !== "running"}>
              Valider la serie
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
