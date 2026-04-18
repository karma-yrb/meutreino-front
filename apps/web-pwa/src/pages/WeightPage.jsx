import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWeight, faPlus, faTrash, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import {
  upsertWeightForToday,
  deleteWeightRecord,
  listWeightHistory,
} from "../services/storage/repositories/weightRepository";

function computeBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

function bmiCategory(bmi) {
  if (bmi < 18.5) return "Insuffisance pondérale";
  if (bmi < 25) return "Poids normal";
  if (bmi < 30) return "Surpoids";
  return "Obésité";
}

export function WeightPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weightInput, setWeightInput] = useState("");
  const [saving, setSaving] = useState(false);

  const heightCm = currentUser?.profile?.heightCm || 0;

  useEffect(() => {
    if (!currentUser?.id) return;
    listWeightHistory(currentUser.id).then((data) => {
      setRecords(data);
      setLoading(false);
    });
  }, [currentUser?.id]);

  async function handleAddWeight(e) {
    e.preventDefault();
    const value = parseFloat(weightInput.replace(",", "."));
    if (!value || value <= 0 || value > 500) return;
    setSaving(true);
    await upsertWeightForToday(currentUser.id, value);
    const fresh = await listWeightHistory(currentUser.id);
    setRecords(fresh);
    setWeightInput("");
    setSaving(false);
  }

  async function handleDelete(id) {
    await deleteWeightRecord(id);
    const fresh = await listWeightHistory(currentUser.id);
    setRecords(fresh);
  }

  const latest = records.length > 0 ? records[records.length - 1].weightKg : null;
  const first = records.length > 0 ? records[0].weightKg : null;
  const diff = latest !== null && first !== null ? Math.round((latest - first) * 10) / 10 : null;
  const bmi = useMemo(() => computeBMI(latest, heightCm), [latest, heightCm]);

  const chartData = useMemo(
    () =>
      records.map((r) => ({
        date: new Date(r.recordedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
        poids: r.weightKg,
      })),
    [records],
  );

  if (loading) {
    return <div className="page"><p>Chargement…</p></div>;
  }

  return (
    <div className="page weight-page">
      <h1>
        <button className="btn-back" onClick={() => navigate("/progres")} aria-label="Retour">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <FontAwesomeIcon icon={faWeight} /> Suivi du poids
      </h1>

      {/* Summary */}
      {latest !== null && (
        <div className="weight-summary-block">
          <span className="weight-current">{latest} kg</span>
          {diff !== null && records.length > 1 && (
            <span className={`weight-diff ${diff > 0 ? "weight-up" : diff < 0 ? "weight-down" : ""}`}>
              {diff > 0 ? `+${diff}` : `${diff}`} kg
            </span>
          )}
          {bmi !== null && (
            <span className="weight-bmi">
              IMC {bmi} — {bmiCategory(bmi)}
            </span>
          )}
        </div>
      )}

      {/* Add form */}
      <form className="weight-add-form" onSubmit={handleAddWeight}>
        <label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="500"
            placeholder="Poids (kg)"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            aria-label="Poids en kg"
            required
          />
        </label>
        <button type="submit" disabled={saving} className="btn-add-weight">
          <FontAwesomeIcon icon={faPlus} /> Ajouter
        </button>
      </form>

      {/* Chart */}
      {chartData.length >= 2 && (
        <section className="weight-chart-section">
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="poids" name="Poids (kg)" stroke="var(--brand-2)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* History list */}
      <section className="weight-history-section">
        <h2>Historique</h2>
        {records.length === 0 ? (
          <p className="empty-state">Aucune pesée enregistrée.</p>
        ) : (
          <ul className="weight-history-list">
            {[...records].reverse().map((r) => (
              <li key={r.id} className="weight-history-item">
                <span className="weight-history-date">
                  {new Date(r.recordedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="weight-history-value">{r.weightKg} kg</span>
                <button
                  className="btn-delete-weight"
                  onClick={() => handleDelete(r.id)}
                  aria-label={`Supprimer pesée du ${new Date(r.recordedAt).toLocaleDateString("fr-FR")}`}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
