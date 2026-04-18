import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumbbell, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../features/auth/useAuth";
import { listSessionsForUser } from "../services/storage/repositories/sessionsRepository";

const STATUS_LABELS = {
  completed: "Terminée",
  running: "En cours",
  paused: "En pause",
  stopped: "Arrêtée",
};

const FILTER_OPTIONS = [
  { value: "all", label: "Toutes" },
  { value: "completed", label: "Terminées" },
  { value: "stopped", label: "Arrêtées" },
  { value: "running", label: "En cours" },
];

export function SessionsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!currentUser?.id) return;
    listSessionsForUser(currentUser.id).then((data) => {
      setSessions(data);
      setLoading(false);
    });
  }, [currentUser?.id]);

  const filtered = useMemo(() => {
    const list = filter === "all" ? sessions : sessions.filter((s) => s.status === filter);
    return [...list].sort((a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0));
  }, [sessions, filter]);

  if (loading) {
    return <div className="page"><p>Chargement…</p></div>;
  }

  return (
    <div className="page sessions-page">
      <h1>
        <button className="btn-back" onClick={() => navigate("/progres")} aria-label="Retour">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <FontAwesomeIcon icon={faDumbbell} /> Séances
      </h1>

      <div className="sessions-filter">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`filter-btn${filter === opt.value ? " filter-btn--active" : ""}`}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="sessions-count">{filtered.length} séance{filtered.length !== 1 ? "s" : ""}</p>

      {filtered.length === 0 ? (
        <p className="empty-state">Aucune séance trouvée.</p>
      ) : (
        <ul className="sessions-list">
          {filtered.map((s) => {
            const durationMin = s.elapsedMs ? Math.round(s.elapsedMs / 60000) : null;
            return (
              <li key={s.id} className={`sessions-item session-status-${s.status}`}>
                <div className="sessions-item-header">
                  <span className="sessions-item-day">{s.dayId}</span>
                  <span className={`sessions-item-badge sessions-badge-${s.status}`}>
                    {STATUS_LABELS[s.status] || s.status}
                  </span>
                </div>
                <div className="sessions-item-meta">
                  <span className="sessions-item-date">
                    {s.startedAt
                      ? new Date(s.startedAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                  {durationMin !== null && (
                    <span className="sessions-item-duration">{durationMin} min</span>
                  )}
                  {s.completedExercisesCount > 0 && (
                    <span className="sessions-item-exercises">
                      {s.completedExercisesCount} exercice{s.completedExercisesCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
