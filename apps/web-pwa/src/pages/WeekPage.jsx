import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faCalendarWeek, faCircleCheck, faEye, faHourglassHalf, faPlay } from "@fortawesome/free-solid-svg-icons";
import { DAY_IDS } from "@meutreino/core-domain";
import { useAuth } from "../features/auth/useAuth";
import { getActivePlanForUser } from "../services/storage/repositories/plansRepository";
import { getWeekSessionStatusMap } from "../services/storage/repositories/sessionsRepository";

/** Monday 00:00:00 of the current calendar week */
function getWeekStartMs() {
  const now = new Date();
  const daysFromMonday = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

const SESSION_BADGE = {
  completed: { icon: faCircleCheck, label: "Terminée",  className: "day-badge day-badge--done" },
  stopped:   { icon: faBan,         label: "Arrêtée",   className: "day-badge day-badge--stopped" },
  running:   { icon: faPlay,        label: "En cours",  className: "day-badge day-badge--active" },
  paused:    { icon: faHourglassHalf, label: "En pause", className: "day-badge day-badge--active" },
};

function hasVisibleContent(day) {
  if (!day || day.rest) return false;
  if (day.cardioOnly) return true;
  if ((day.main?.length ?? 0) > 0) return true;
  if ((day.warmup?.length ?? 0) > 0) return true;
  return Boolean(day.title || day.training);
}

function canLaunchSession(day) {
  if (!day || day.rest) return false;
  if (day.cardioOnly) return true;
  return (day.main?.length ?? 0) > 0;
}

function describeDay(day) {
  if (day.rest) return "Jour de repos";
  if (day.cardioOnly) return day.title ?? "Cardio";
  return day.title ?? day.training ?? "Séance";
}

export function WeekPage() {
  const { currentUser } = useAuth();
  const [days, setDays] = useState([]);
  const [sessionStatusMap, setSessionStatusMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!currentUser) return;
      const [activePlan, weekMap] = await Promise.all([
        getActivePlanForUser(currentUser.id),
        getWeekSessionStatusMap(currentUser.id, getWeekStartMs()),
      ]);
      const dayById = new Map((activePlan?.days ?? []).map((day) => [day.id, day]));
      const orderedDays = DAY_IDS.map((dayId) => dayById.get(dayId)).filter(hasVisibleContent);
      setDays(orderedDays);
      setSessionStatusMap(weekMap);
      setIsLoading(false);
    }
    load();
  }, [currentUser]);

  if (isLoading) {
    return <div className="page">Chargement de la semaine...</div>;
  }

  return (
    <div className="page">
      <section className="card">
        <h2 className="section-title-with-icon">
          <FontAwesomeIcon icon={faCalendarWeek} />
          <span>Séances de la semaine</span>
        </h2>
        <p className="muted">5 séances d&apos;entrainement lançables.</p>
      </section>

      {days.length === 0 ? (
        <section className="card">
          <p className="muted">Aucun jour trouvé dans le plan actif.</p>
        </section>
      ) : (
        <section className="week-grid">
          {days.map((day) => {
            const sessionStatus = sessionStatusMap[day.id];
            const badge = sessionStatus ? SESSION_BADGE[sessionStatus.status] : null;
            return (
            <article key={day.id} className="card week-day-card" data-testid={`week-day-${day.id}`}>
              <div className="week-day-header">
                <h3>{day.fullLabel}</h3>
                {badge ? (
                  <span className={badge.className} aria-label={badge.label}>
                    <FontAwesomeIcon icon={badge.icon} />
                    <span>{badge.label}</span>
                  </span>
                ) : null}
              </div>
              <p className="muted">{describeDay(day)}</p>
              <div className="btn-row">
                <Link to={`/jour/${day.id}`} className="primary-btn with-icon">
                  <FontAwesomeIcon icon={faEye} />
                  <span>Visualiser</span>
                </Link>
                {canLaunchSession(day) ? (
                  <Link to={`/session/${day.id}`} className="ghost-btn with-icon">
                    <FontAwesomeIcon icon={faPlay} />
                    <span>Lancer</span>
                  </Link>
                ) : null}
              </div>
            </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
