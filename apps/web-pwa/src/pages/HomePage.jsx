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
  faPlay,
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

function formatSessionDuration(ms) {
  const total = Math.max(0, Math.floor((ms ?? 0) / 1000));
  if (total === 0) return "< 1 s";
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h} h ${m} min`;
  if (m > 0) return s > 0 ? `${m} min ${s} s` : `${m} min`;
  return `${s} s`;
}

function formatSessionMeta(session) {
  const duration = formatSessionDuration(session.elapsedMs);
  // Cardio-only sessions have 1 synthetic exercise — show duration only
  if (session.completedExercisesCount <= 1 && session.dayId === "dimanche") {
    return duration;
  }
  return `${duration} \u2014 ${session.completedExercisesCount} exos`;
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
        {todayPlan ? (
          <>
            <Link to="/semaine" className="ghost-btn with-icon home-week-btn">
              <FontAwesomeIcon icon={faCalendarWeek} />
              <span>Voir la semaine</span>
            </Link>
            <div className="home-day-card">
              <div className="home-day-info">
                <p className="home-day-day">{todayPlan.fullLabel}</p>
                <p className="home-day-meta">
                  <span className="home-day-label">Séance du jour</span>
                  {!todayPlan.rest && <>{" · "}<span className="home-day-subtitle">{todayPlan.title}</span></>}
                  {todayPlan.rest && <>{" · "}<span className="home-day-subtitle">Jour de repos</span></>}
                </p>
              </div>
              {!todayPlan.rest && (
                <div className="btn-row">
                  <Link to={`/jour/${todayPlan.id}`} className="primary-btn with-icon">
                    <FontAwesomeIcon icon={faEye} />
                    <span>Visualiser</span>
                  </Link>
                  {!todayPlan.cardioOnly ? (
                    <Link to={`/session/${todayPlan.id}`} className="ghost-btn with-icon">
                      <FontAwesomeIcon icon={faPlay} />
                      <span>Démarrer</span>
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="muted">Pas de séance configurée pour aujourd&apos;hui.</p>
            <div className="btn-row">
              <Link to="/semaine" className="ghost-btn with-icon">
                <FontAwesomeIcon icon={faCalendarWeek} />
                <span>Voir la semaine</span>
              </Link>
            </div>
          </>
        )}
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
                    {formatSessionStatusLabel(session.status)} - {formatSessionMeta(session)}
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
