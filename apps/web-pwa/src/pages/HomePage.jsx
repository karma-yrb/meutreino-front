import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCalendarWeek,
  faCircleCheck,
  faClockRotateLeft,
  faDumbbell,
  faEye,
  faHourglassHalf,
} from "@fortawesome/free-solid-svg-icons";
import { getCurrentDayId } from "@meutreino/core-domain";
import { useAuth } from "../features/auth/useAuth";
import { getDayPlanForUser, getActivePlanForUser } from "../services/storage/repositories/plansRepository";
import { listSessionsForUser } from "../services/storage/repositories/sessionsRepository";

const SESSION_STATUS_LABELS = {
  running: "En cours",
  paused: "En pause",
  completed: "Terminée",
  stopped: "Arrêtée",
};

const SESSION_STATUS_ICONS = {
  running: faDumbbell,
  paused: faHourglassHalf,
  completed: faCircleCheck,
  stopped: faBan,
};

function formatSessionStatusLabel(status) {
  return SESSION_STATUS_LABELS[status] ?? status ?? "-";
}

function formatPlanLabel(version) {
  if (!version) return "Programme en cours : aucun programme actif";

  const match = /^(\d{4})-(\d{2})-v(\d+)$/.exec(version);
  if (!match) return `Programme en cours : ${version}`;

  const [, year, month, iteration] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  const monthYear = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
  const normalizedMonthYear = `${monthYear.charAt(0).toUpperCase()}${monthYear.slice(1)}`;

  return `Programme en cours : ${normalizedMonthYear} (version ${iteration})`;
}

export function HomePage() {
  const { currentUser } = useAuth();
  const [todayPlan, setTodayPlan] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const dayId = getCurrentDayId();

  useEffect(() => {
    async function load() {
      if (!currentUser) return;
      const [day, plan] = await Promise.all([
        getDayPlanForUser(currentUser.id, dayId),
        getActivePlanForUser(currentUser.id),
      ]);
      const sessions = await listSessionsForUser(currentUser.id);
      setTodayPlan(day);
      setActivePlan(plan);
      setRecentSessions(sessions.slice(0, 5));
    }
    load();
  }, [currentUser, dayId]);

  return (
    <div className="page">
      <section className="card">
        <h2>Bienvenue {currentUser?.firstName ?? "à vous"}</h2>
        <p className="muted">{formatPlanLabel(activePlan?.version)}</p>
      </section>

      <section className="card">
        <h3>Séance du jour</h3>
        {todayPlan ? (
          <>
            <p className="title-main">{todayPlan.fullLabel}</p>
            <p>{todayPlan.rest ? "Jour de repos" : todayPlan.title}</p>
            <div className="btn-row">
              <Link to={`/jour/${todayPlan.id}`} className="primary-btn with-icon">
                <FontAwesomeIcon icon={faEye} />
                <span>Visualiser</span>
              </Link>
              {!todayPlan.rest && !todayPlan.cardioOnly ? (
                <Link to={`/session/${todayPlan.id}`} className="ghost-btn">
                  Lancer la séance
                </Link>
              ) : null}
            </div>
          </>
        ) : (
          <p className="muted">Pas de séance configurée pour aujourd&apos;hui.</p>
        )}
        <div className="btn-row">
          <Link to="/semaine" className="ghost-btn with-icon">
            <FontAwesomeIcon icon={faCalendarWeek} />
            <span>Voir la semaine</span>
          </Link>
        </div>
      </section>

      <section className="card">
        <h3 className="section-title-with-icon">
          <FontAwesomeIcon icon={faClockRotateLeft} />
          <span>Historique récent</span>
        </h3>
        {recentSessions.length === 0 ? (
          <p className="muted history-empty">
            <FontAwesomeIcon icon={faClockRotateLeft} />
            <span>Aucune séance enregistrée.</span>
          </p>
        ) : (
          <ul className="simple-list history-list">
            {recentSessions.map((session) => (
              <li key={session.id} className="history-item">
                <span className="history-day">
                  <FontAwesomeIcon icon={faDumbbell} />
                  <strong>{session.dayId}</strong>
                </span>
                <span className="muted history-meta">
                  <FontAwesomeIcon icon={SESSION_STATUS_ICONS[session.status] ?? faClockRotateLeft} />
                  <span>
                    {formatSessionStatusLabel(session.status)} - {Math.floor((session.elapsedMs ?? 0) / 60000)} min - {session.completedExercisesCount} exos
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
