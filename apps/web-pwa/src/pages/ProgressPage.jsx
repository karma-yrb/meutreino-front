import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faFire,
  faTrophy,
  faDumbbell,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../features/auth/useAuth";
import { listSessionsForUser } from "../services/storage/repositories/sessionsRepository";

function computeStats(sessions) {
  const completed = sessions.filter((s) => s.status === "completed");
  const total = sessions.length;
  const completedCount = completed.length;
  const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  let currentStreak = 0;
  const uniqueDays = [...new Set(completed.map((s) => s.dayId))].sort().reverse();
  for (let i = 0; i < uniqueDays.length; i++) {
    if (i === 0 || uniqueDays[i - 1] !== uniqueDays[i]) {
      currentStreak++;
    }
  }

  const totalDurationMs = completed.reduce((sum, s) => {
    if (!s.startedAt || !s.finishedAt) return sum;
    return sum + (new Date(s.finishedAt).getTime() - new Date(s.startedAt).getTime());
  }, 0);
  const avgDurationMin = completedCount > 0 ? Math.round(totalDurationMs / completedCount / 60000) : 0;

  return { total, completedCount, completionRate, currentStreak: Math.min(currentStreak, uniqueDays.length), avgDurationMin };
}

function StatCard({ icon, label, value, unit }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="stat-card-value">
        {value}
        {unit ? <span className="stat-card-unit">{unit}</span> : null}
      </div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

export function ProgressPage() {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) return;
    listSessionsForUser(currentUser.id).then((data) => {
      setSessions(data);
      setLoading(false);
    });
  }, [currentUser?.id]);

  if (loading) {
    return <div className="progress-page"><p>Chargement…</p></div>;
  }

  const stats = computeStats(sessions);

  return (
    <div className="progress-page">
      <h1>
        <FontAwesomeIcon icon={faChartLine} /> Progrès
      </h1>

      <div className="stats-grid">
        <StatCard icon={faDumbbell} label="Séances totales" value={stats.total} />
        <StatCard icon={faCalendarCheck} label="Séances terminées" value={stats.completedCount} />
        <StatCard icon={faFire} label="Taux de complétion" value={stats.completionRate} unit="%" />
        <StatCard icon={faTrophy} label="Jours actifs" value={stats.currentStreak} />
        <StatCard icon={faChartLine} label="Durée moyenne" value={stats.avgDurationMin} unit="min" />
      </div>

      <section className="progress-section">
        <h2>Historique des séances</h2>
        {sessions.length === 0 ? (
          <p className="empty-state">Aucune séance enregistrée pour le moment.</p>
        ) : (
          <ul className="session-history">
            {sessions.slice(0, 20).map((s) => (
              <li key={s.id} className={`session-history-item session-status-${s.status}`}>
                <span className="session-history-day">{s.dayId}</span>
                <span className="session-history-status">{s.status === "completed" ? "Terminée" : s.status === "running" ? "En cours" : s.status === "paused" ? "En pause" : "Arrêtée"}</span>
                <span className="session-history-date">
                  {s.startedAt ? new Date(s.startedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "-"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
