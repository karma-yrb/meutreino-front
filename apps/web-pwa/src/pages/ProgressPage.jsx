import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faFire,
  faTrophy,
  faDumbbell,
  faCalendarCheck,
  faBolt,
  faMedal,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useAuth } from "../features/auth/useAuth";
import { listSessionsForUser } from "../services/storage/repositories/sessionsRepository";
import {
  computeStats,
  computeTotalCalories,
  extractPersonalRecords,
  computeWeeklyCalories,
  buildActivityHeatmap,
  buildExerciseProgression,
  getExerciseNames,
} from "../data/progressStats";

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

function PersonalRecords({ records }) {
  if (records.length === 0) return null;
  return (
    <section className="progress-section">
      <h2><FontAwesomeIcon icon={faMedal} /> Records personnels</h2>
      <ul className="records-list">
        {records.map((r) => (
          <li key={r.exercise} className="record-item">
            <span className="record-exercise">{r.exercise}</span>
            <span className="record-value">{r.load} kg × {r.reps}</span>
            {r.date && (
              <span className="record-date">
                {new Date(r.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function WeeklyCalories({ weeks }) {
  if (weeks.length === 0) return null;
  const maxCal = Math.max(...weeks.map((w) => w.calories));
  return (
    <section className="progress-section">
      <h2><FontAwesomeIcon icon={faBolt} /> Calories par semaine</h2>
      <div className="weekly-chart">
        {weeks.map((w) => (
          <div key={w.week} className="weekly-bar-row">
            <span className="weekly-label">{w.week}</span>
            <div className="weekly-bar-track">
              <div
                className="weekly-bar-fill"
                style={{ width: `${maxCal > 0 ? (w.calories / maxCal) * 100 : 0}%` }}
              />
            </div>
            <span className="weekly-value">{w.calories} kcal</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActivityHeatmap({ heatmap }) {
  const days = Object.keys(heatmap);
  if (days.length === 0) return null;

  const today = new Date();
  const cells = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = heatmap[key] || 0;
    const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3;
    cells.push({ key, level, count });
  }

  return (
    <section className="progress-section">
      <h2><FontAwesomeIcon icon={faCalendarDays} /> Activité (90 jours)</h2>
      <div className="heatmap-grid" data-testid="heatmap-grid">
        {cells.map((c) => (
          <div
            key={c.key}
            className={`heatmap-cell heatmap-level-${c.level}`}
            title={`${c.key}: ${c.count} séance${c.count > 1 ? "s" : ""}`}
          />
        ))}
      </div>
      <div className="heatmap-legend">
        <span>Moins</span>
        <div className="heatmap-cell heatmap-level-0" />
        <div className="heatmap-cell heatmap-level-1" />
        <div className="heatmap-cell heatmap-level-2" />
        <div className="heatmap-cell heatmap-level-3" />
        <span>Plus</span>
      </div>
    </section>
  );
}

function ProgressionChart({ sessions }) {
  const exerciseNames = useMemo(() => getExerciseNames(sessions), [sessions]);
  const [selectedExercise, setSelectedExercise] = useState("");

  const currentExercise = selectedExercise || exerciseNames[0] || "";
  const data = useMemo(
    () => buildExerciseProgression(sessions, currentExercise),
    [sessions, currentExercise],
  );

  if (exerciseNames.length === 0) return null;

  return (
    <section className="progress-section" data-testid="progression-chart">
      <h2><FontAwesomeIcon icon={faChartLine} /> Progression</h2>
      <select
        className="progression-select"
        value={currentExercise}
        onChange={(e) => setSelectedExercise(e.target.value)}
        aria-label="Exercice"
      >
        {exerciseNames.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
      {data.length < 2 ? (
        <p className="empty-state">Pas assez de données pour afficher une courbe.</p>
      ) : (
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="maxLoad" name="Charge max (kg)" stroke="var(--brand)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="totalVolume" name="Volume (kg)" stroke="var(--brand-2)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
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

  const weightKg = currentUser?.profile?.weightKg || 0;

  const stats = useMemo(() => computeStats(sessions), [sessions]);
  const totalCalories = useMemo(
    () => computeTotalCalories(sessions, weightKg),
    [sessions, weightKg],
  );
  const records = useMemo(() => extractPersonalRecords(sessions), [sessions]);
  const weeks = useMemo(
    () => computeWeeklyCalories(sessions, weightKg),
    [sessions, weightKg],
  );
  const heatmap = useMemo(() => buildActivityHeatmap(sessions), [sessions]);

  if (loading) {
    return <div className="progress-page"><p>Chargement…</p></div>;
  }

  return (
    <div className="progress-page">
      <h1>
        <FontAwesomeIcon icon={faChartLine} /> Progrès
      </h1>

      <div className="stats-grid">
        <StatCard icon={faDumbbell} label="Séances totales" value={stats.total} />
        <StatCard icon={faCalendarCheck} label="Séances terminées" value={stats.completedCount} />
        <StatCard icon={faFire} label="Taux de complétion" value={stats.completionRate} unit="%" />
        <StatCard icon={faTrophy} label="Jours actifs" value={stats.activeDays} />
        <StatCard icon={faChartLine} label="Durée moyenne" value={stats.avgDurationMin} unit="min" />
        <StatCard icon={faBolt} label="Calories brûlées" value={totalCalories} unit="kcal" />
      </div>

      <ProgressionChart sessions={sessions} />
      <PersonalRecords records={records} />
      <WeeklyCalories weeks={weeks} />
      <ActivityHeatmap heatmap={heatmap} />

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
