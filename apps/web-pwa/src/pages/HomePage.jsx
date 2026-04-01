import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentDayId } from "@meutreino/core-domain";
import { useAuth } from "../features/auth/useAuth";
import { getDayPlanForUser, getActivePlanForUser } from "../services/storage/repositories/plansRepository";
import { listSessionsForUser } from "../services/storage/repositories/sessionsRepository";

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
        <h2>Bienvenue {currentUser?.firstName}</h2>
        <p className="muted">Role: {currentUser?.role}</p>
        <p className="muted">Plan actif: {activePlan?.version ?? "Aucun plan actif"}</p>
      </section>

      <section className="card">
        <h3>Seance du jour</h3>
        {todayPlan ? (
          <>
            <p className="title-main">{todayPlan.fullLabel}</p>
            <p>{todayPlan.rest ? "Jour de repos" : todayPlan.title}</p>
            <div className="btn-row">
              <Link to={`/jour/${todayPlan.id}`} className="primary-btn">
                Visualiser
              </Link>
              {!todayPlan.rest && !todayPlan.cardioOnly ? (
                <Link to={`/session/${todayPlan.id}`} className="ghost-btn">
                  Lancer session
                </Link>
              ) : null}
            </div>
          </>
        ) : (
          <p className="muted">Pas de seance configuree pour aujourd hui.</p>
        )}
        <div className="btn-row">
          <Link to="/semaine" className="ghost-btn">
            Voir la semaine
          </Link>
        </div>
      </section>

      <section className="card">
        <h3>Historique recent</h3>
        {recentSessions.length === 0 ? (
          <p className="muted">Aucune session enregistree.</p>
        ) : (
          <ul className="simple-list">
            {recentSessions.map((session) => (
              <li key={session.id}>
                <strong>{session.dayId}</strong>
                <span className="muted">
                  {" "}
                  - {session.status} - {Math.floor((session.elapsedMs ?? 0) / 60000)} min - {session.completedExercisesCount} exos
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
