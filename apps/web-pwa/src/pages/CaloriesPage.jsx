import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faArrowLeft, faFire } from "@fortawesome/free-solid-svg-icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useAuth } from "../features/auth/useAuth";
import { listSessionsForUser } from "../services/storage/repositories/sessionsRepository";
import {
  computeTotalCalories,
  computeWeeklyCalories,
} from "../data/progressStats";
import { estimateSessionCaloriesFromElapsed } from "../data/calorieEstimation";

export function CaloriesPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const weightKg = currentUser?.profile?.weightKg || 0;

  useEffect(() => {
    if (!currentUser?.id) return;
    listSessionsForUser(currentUser.id).then((data) => {
      setSessions(data);
      setLoading(false);
    });
  }, [currentUser?.id]);

  const totalCalories = useMemo(
    () => computeTotalCalories(sessions, weightKg),
    [sessions, weightKg],
  );

  const weeks = useMemo(
    () => computeWeeklyCalories(sessions, weightKg),
    [sessions, weightKg],
  );

  const sessionBreakdown = useMemo(() => {
    if (!weightKg || weightKg <= 0) return [];
    return sessions
      .filter((s) => s.status === "completed")
      .map((s) => {
        const elapsed = s.elapsedMs || 0;
        const exercises = (s.exercises || []).filter((e) => e.phase === "main");
        const cal = estimateSessionCaloriesFromElapsed(exercises, weightKg, elapsed);
        return {
          id: s.id,
          dayId: s.dayId,
          date: s.startedAt || s.endedAt,
          calories: cal,
          durationMin: Math.round(elapsed / 60000),
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [sessions, weightKg]);

  const chartData = useMemo(
    () => weeks.map((w) => ({ semaine: w.week.replace(/^\d{4}-W/, "S"), kcal: w.calories })),
    [weeks],
  );

  if (loading) {
    return <div className="page"><p>Chargement…</p></div>;
  }

  return (
    <div className="page calories-page">
      <h1>
        <button className="btn-back" onClick={() => navigate("/progres")} aria-label="Retour">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <FontAwesomeIcon icon={faBolt} /> Calories
      </h1>

      <div className="calories-total">
        <span className="calories-total-value">{totalCalories}</span>
        <span className="calories-total-unit">kcal brûlées au total</span>
      </div>

      {/* Weekly bar chart */}
      {chartData.length >= 1 && (
        <section className="calories-section">
          <h2><FontAwesomeIcon icon={faFire} /> Par semaine</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="semaine" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} kcal`, "Calories"]} />
                <Bar dataKey="kcal" fill="var(--brand)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Per-session breakdown */}
      <section className="calories-section">
        <h2>Détail par séance</h2>
        {sessionBreakdown.length === 0 ? (
          <p className="empty-state">Aucune séance complétée pour le moment.</p>
        ) : (
          <ul className="calories-session-list">
            {sessionBreakdown.map((s) => (
              <li key={s.id} className="calories-session-item">
                <span className="calories-session-day">{s.dayId}</span>
                <span className="calories-session-date">
                  {s.date
                    ? new Date(s.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                    : "-"}
                </span>
                <span className="calories-session-duration">{s.durationMin} min</span>
                <span className="calories-session-value">{s.calories} kcal</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
