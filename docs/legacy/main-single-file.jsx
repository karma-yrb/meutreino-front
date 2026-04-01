import { useState } from "react";

const days = [
  {
    id: "lundi",
    label: "LUN",
    fullLabel: "Lundi",
    training: "Treino A",
    title: "Membres Inférieurs A",
    warmup: [
      { name: "Étirement du fessier (piriforme)", detail: "30 sec chaque côté" },
      { name: "Étirement dynamique des ischio-jambiers", detail: "30 sec chaque côté" },
      { name: "Mobilité de hanche 90/90", detail: "12 rép. chaque côté" },
      { name: "Étirement du mollet", detail: "30 sec chaque côté" },
      { name: "Mobilité de cheville", detail: "15 rép. chaque côté" },
    ],
    main: [
      {
        name: "Leg Extension",
        tag: "Activation",
        tagColor: "#f5a623",
        series: [
          { reps: "15", load: "70 kg", rest: "—", tempo: "2020" },
          { reps: "15", load: "70 kg", rest: "—", tempo: "2020" },
        ],
        note: null,
      },
      {
        name: "Leg Extension",
        tag: "Principal",
        tagColor: "#e53935",
        series: [
          { reps: "12", load: "70 kg", rest: "—", tempo: "3020" },
          { reps: "12", load: "70 kg", rest: "—", tempo: "3020" },
          { reps: "12 + drop set", load: "70 kg → -30%", rest: "—", tempo: "3020" },
        ],
        note: "💡 Dernière série uniquement — Drop set : atteindre l'échec en 12 reps, réduire la charge de 30 % et enchaîner 12 reps supplémentaires.",
      },
      {
        name: "Squat barre libre",
        tag: null,
        series: [
          { reps: "10", load: "40 kg", rest: "—", tempo: "3020" },
          { reps: "10", load: "40 kg", rest: "—", tempo: "3020" },
          { reps: "10", load: "40 kg", rest: "—", tempo: "3020" },
        ],
        note: null,
      },
      {
        name: "Soulevé de terre jambes tendues (barre)",
        tag: null,
        series: [
          { reps: "12", load: "30 kg", rest: "—", tempo: "3020" },
          { reps: "12", load: "30 kg", rest: "—", tempo: "3020" },
          { reps: "12", load: "30 kg", rest: "—", tempo: "3020" },
        ],
        note: null,
      },
      {
        name: "Mollets verticaux",
        tag: "Pyramide",
        tagColor: "#8e44ad",
        series: [
          { reps: "20", load: "Charge légère", rest: "60 s", tempo: "3020" },
          { reps: "15", load: "Charge moyenne", rest: "60 s", tempo: "3020" },
          { reps: "12", load: "Charge lourde", rest: "60 s", tempo: "3020" },
        ],
        note: "📈 Méthode Pyramide — À chaque série, augmenter la charge afin d'atteindre l'échec musculaire au nombre de répétitions indiqué.",
      },
      {
        name: "Abdos ciseaux • superset • Abdos en V (canif)",
        tag: "Superset",
        tagColor: "#1abc9c",
        series: [
          { reps: "10 + 30\"", load: "Poids du corps", rest: "Après 2ᵉ exo", tempo: "3020" },
          { reps: "10 + 30\"", load: "Poids du corps", rest: "Après 2ᵉ exo", tempo: "3020" },
          { reps: "10 + 30\"", load: "Poids du corps", rest: "Après 2ᵉ exo", tempo: "3020" },
        ],
        note: "🔗 Enchaîner les deux exercices sans repos entre eux. Le repos se prend uniquement après avoir terminé le second.",
      },
    ],
  },
  {
    id: "mardi",
    label: "MAR",
    fullLabel: "Mardi",
    training: "Treino B",
    title: "Dorsaux + Biceps",
    warmup: [
      { name: "Étirement pectoraux bilatéral", detail: "1 série" },
      { name: "Mobilité colonne thoracique au sol", detail: "1 série" },
      { name: "Étirement unilatéral latéral du tronc", detail: "1 série" },
      { name: "Grand étirement du monde", detail: "1 série" },
    ],
    main: [
      { name: "Tirage frontal", tag: "Activation", tagColor: "#f5a623", series: [{ reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }], note: null },
      { name: "Tirage frontal", tag: "Principal", tagColor: "#e53935", series: [{ reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }], note: null },
      { name: "Rowing assis poulie basse", tag: null, series: [{ reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }], note: null },
      { name: "Rowing penché en pronation (barre)", tag: null, series: [{ reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }], note: null },
      { name: "Extension du tronc (hyperextension)", tag: null, series: [{ reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }], note: null },
      { name: "Cardio post-entraînement", tag: null, series: [{ reps: "1 série", load: "—", rest: "—", tempo: "—" }], note: null },
    ],
  },
  {
    id: "mercredi",
    label: "MER",
    fullLabel: "Mercredi",
    training: "Treino C",
    title: "Triceps + Biceps",
    warmup: [
      { name: "Étirement pectoraux unilatéral", detail: "1 série" },
      { name: "Étirement unilatéral latéral du tronc", detail: "1 série" },
      { name: "Mobilité YTW", detail: "1 série" },
      { name: "Mobilité colonne thoracique au sol", detail: "1 série" },
    ],
    main: [
      { name: "Triceps corde poulie haute", tag: "Activation", tagColor: "#f5a623", series: [{ reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }], note: null },
      { name: "Triceps corde • superset • Curl 21", tag: "Superset", tagColor: "#1abc9c", series: [{ reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }], note: null },
      { name: "Triceps français poulie • superset • Curl direct poulie", tag: "Superset", tagColor: "#1abc9c", series: [{ reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }], note: null },
      { name: "Cardio post-entraînement", tag: null, series: [{ reps: "1 série", load: "—", rest: "—", tempo: "—" }], note: null },
    ],
  },
  {
    id: "jeudi",
    label: "JEU",
    fullLabel: "Jeudi",
    training: "Treino D",
    title: "Membres Inférieurs D",
    warmup: [
      { name: "Étirement quadriceps unilatéral", detail: "1 série" },
      { name: "Étirement dynamique des ischio-jambiers", detail: "1 série" },
      { name: "Mobilité de hanche 90/90", detail: "1 série" },
      { name: "Étirement du mollet", detail: "1 série" },
      { name: "Mobilité de cheville", detail: "1 série" },
    ],
    main: [
      { name: "Leg Curl assis", tag: "Activation", tagColor: "#f5a623", series: [{ reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }], note: null },
      { name: "Leg Curl assis", tag: "Principal", tagColor: "#e53935", series: [{ reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }], note: null },
      { name: "Abducteur tronc penché en avant", tag: null, series: [{ reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }], note: null },
      { name: "Leg Press 45° pieds écartés", tag: null, series: [{ reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }], note: null },
      { name: "Mollets au Leg Press 45°", tag: null, series: [{ reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }], note: null },
      { name: "Abdos inférieurs • superset • Abdos couteau", tag: "Superset", tagColor: "#1abc9c", series: [{ reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }], note: null },
    ],
  },
  {
    id: "vendredi",
    label: "VEN",
    fullLabel: "Vendredi",
    training: "Treino E",
    title: "Pectoraux + Épaules",
    warmup: [
      { name: "Étirement pectoraux bilatéral", detail: "1 série" },
      { name: "Étirement rotateurs internes (avec bâton)", detail: "1 série" },
      { name: "Mobilité YTW", detail: "1 série" },
      { name: "Grand étirement du monde", detail: "1 série" },
    ],
    main: [
      { name: "Développé couché incliné", tag: "Activation", tagColor: "#f5a623", series: [{ reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }], note: null },
      { name: "Développé couché incliné", tag: "Principal", tagColor: "#e53935", series: [{ reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }], note: null },
      { name: "Pec deck / Butterfly machine", tag: null, series: [{ reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }], note: null },
      { name: "Développé frontal haltères • superset • Élévation latérale assis", tag: "Superset", tagColor: "#1abc9c", series: [{ reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }, { reps: "—", load: "—", rest: "—", tempo: "—" }], note: null },
      { name: "Cardio post-entraînement", tag: null, series: [{ reps: "1 série", load: "—", rest: "—", tempo: "—" }], note: null },
    ],
  },
  {
    id: "samedi",
    label: "SAM",
    fullLabel: "Samedi",
    rest: true,
  },
  {
    id: "dimanche",
    label: "DIM",
    fullLabel: "Dimanche",
    training: "Cardio",
    title: "Cardio 40 Minutes",
    cardioOnly: true,
  },
];

export default function App() {
  const [selected, setSelected] = useState("lundi");
  const [expandedEx, setExpandedEx] = useState(null);
  const day = days.find((d) => d.id === selected);

  const handleDayChange = (id) => { setSelected(id); setExpandedEx(null); };
  const toggleEx = (i) => setExpandedEx(expandedEx === i ? null : i);
  const hasRealData = (ex) => ex.series && ex.series[0].reps !== "—";

  return (
    <div style={{ background: "#111", minHeight: "100vh", fontFamily: "system-ui, sans-serif", color: "#fff", maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: "#1a1a1a", padding: "18px 16px 10px", borderBottom: "1px solid #222" }}>
        <div style={{ textAlign: "center", marginBottom: 2 }}>
          <span style={{ color: "#e53935", fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Prof. Adrian</span>
        </div>
        <h1 style={{ textAlign: "center", fontSize: 17, fontWeight: 800, margin: 0 }}>Programme Mois 2</h1>
      </div>

      {/* Day tabs */}
      <div style={{ display: "flex", justifyContent: "space-around", padding: "10px 6px", background: "#1a1a1a", borderBottom: "1px solid #222", gap: 3 }}>
        {days.map((d) => (
          <button key={d.id} onClick={() => handleDayChange(d.id)}
            style={{
              background: selected === d.id ? "#e53935" : "transparent",
              border: selected === d.id ? "none" : "1px solid #2a2a2a",
              borderRadius: 8, padding: "6px 7px",
              color: d.rest && selected !== d.id ? "#444" : "#fff",
              fontWeight: 700, fontSize: 10, cursor: "pointer", transition: "all 0.15s",
            }}>
            {d.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "14px 14px 60px" }}>
        {/* Title */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ color: "#555", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{day.fullLabel}</div>
          <h2 style={{ margin: "3px 0 5px", fontSize: 18, fontWeight: 800 }}>
            {day.rest ? "Repos & Récupération" : day.title}
          </h2>
          {day.training && !day.rest && (
            <span style={{ background: "#2a0000", color: "#e53935", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20, border: "1px solid #3a0000" }}>
              {day.training}
            </span>
          )}
        </div>

        {day.rest && (
          <div style={{ background: "#1a1a1a", borderRadius: 16, padding: "40px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>😴</div>
            <div style={{ color: "#888", fontSize: 15, fontWeight: 600 }}>Journée de récupération</div>
            <div style={{ color: "#444", fontSize: 12, marginTop: 8 }}>Étirements légers recommandés</div>
          </div>
        )}

        {day.cardioOnly && (
          <div style={{ background: "#1a1a1a", borderRadius: 16, padding: "40px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🏃</div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>Cardio 40 Minutes</div>
            <div style={{ color: "#888", fontSize: 13, marginTop: 8 }}>Elliptique · Tapis · Vélo · Marche rapide</div>
          </div>
        )}

        {!day.rest && !day.cardioOnly && (
          <>
            {/* Coach note */}
            <div style={{ background: "#1a1a1a", borderRadius: 12, padding: "11px 14px", marginBottom: 12, borderLeft: "3px solid #e53935" }}>
              <div style={{ color: "#e53935", fontSize: 10, fontWeight: 700, marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>Message du professeur</div>
              <div style={{ color: "#aaa", fontSize: 12, lineHeight: 1.6 }}>
                Réaliser l'entraînement dans l'ordre. Les premiers exercices = <strong style={{ color: "#ddd" }}>phase préparatoire</strong>. Ensuite, commencer la <strong style={{ color: "#ddd" }}>partie principale</strong>.
              </div>
            </div>

            {/* Warmup */}
            <div style={{ background: "#1a1a1a", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ color: "#f5a623", fontSize: 10, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>🔥 Phase préparatoire</div>
              {day.warmup.map((ex, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < day.warmup.length - 1 ? "1px solid #222" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 22, height: 22, background: "#2a2400", border: "1px solid #f5a62344", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#f5a623", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ fontSize: 13, color: "#ccc" }}>{ex.name}</div>
                  </div>
                  <div style={{ color: "#555", fontSize: 11, marginLeft: 8, flexShrink: 0, textAlign: "right" }}>{ex.detail}</div>
                </div>
              ))}
            </div>

            {/* Main */}
            <div style={{ background: "#1a1a1a", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ color: "#e53935", fontSize: 10, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>💪 Partie principale</div>
              {day.main.map((ex, i) => {
                const expanded = expandedEx === i;
                const hasData = hasRealData(ex);
                return (
                  <div key={i} style={{ borderBottom: i < day.main.length - 1 ? "1px solid #1e1e1e" : "none" }}>
                    <div onClick={() => hasData && toggleEx(i)}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "11px 0", cursor: hasData ? "pointer" : "default" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ width: 22, height: 22, background: "#2a0000", border: "1px solid #e5393544", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#e53935", fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                        <div>
                          <div style={{ fontSize: 13, color: "#fff", fontWeight: 600, lineHeight: 1.3 }}>{ex.name}</div>
                          <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
                            {ex.tag && (
                              <span style={{ background: (ex.tagColor || "#e53935") + "20", color: ex.tagColor || "#e53935", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, border: `1px solid ${(ex.tagColor || "#e53935")}40` }}>
                                {ex.tag}
                              </span>
                            )}
                            <span style={{ background: "#222", color: "#555", fontSize: 9, padding: "2px 7px", borderRadius: 20 }}>
                              {ex.series.length} série{ex.series.length > 1 ? "s" : ""}
                            </span>
                            {hasData && <span style={{ color: "#444", fontSize: 9 }}>{expanded ? "▲ masquer" : "▼ détail"}</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {expanded && hasData && (
                      <div style={{ marginBottom: 10, background: "#161616", borderRadius: 10, overflow: "hidden" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "20px 1fr 1fr 1fr 1fr", gap: 6, padding: "7px 10px", background: "#1e1e1e" }}>
                          {["#", "Reps", "Charge", "Repos", "Tempo"].map(h => (
                            <div key={h} style={{ color: "#444", fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>{h}</div>
                          ))}
                        </div>
                        {ex.series.map((s, si) => (
                          <div key={si} style={{ display: "grid", gridTemplateColumns: "20px 1fr 1fr 1fr 1fr", gap: 6, padding: "8px 10px", borderTop: "1px solid #1e1e1e" }}>
                            <div style={{ color: "#e53935", fontSize: 11, fontWeight: 700 }}>{si + 1}</div>
                            <div style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{s.reps}</div>
                            <div style={{ color: "#ddd", fontSize: 11 }}>{s.load}</div>
                            <div style={{ color: "#888", fontSize: 11 }}>{s.rest}</div>
                            <div style={{ color: "#888", fontSize: 11 }}>{s.tempo}</div>
                          </div>
                        ))}
                        {ex.note && (
                          <div style={{ margin: "8px 10px 10px", background: "#1a1700", border: "1px solid #f5a62325", borderRadius: 8, padding: "8px 10px" }}>
                            <div style={{ color: "#f5a623", fontSize: 11, lineHeight: 1.6 }}>{ex.note}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tempo legend — shown on lundi */}
            {day.id === "lundi" && (
              <div style={{ background: "#1a1a1a", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ color: "#444", fontSize: 10, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>📖 Lire un tempo (ex: 3020)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[["3", "Descente (excentrique)"], ["0", "Pause en bas"], ["2", "Montée (concentrique)"], ["0", "Pause en haut"]].map(([n, label], idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 22, height: 22, background: "#2a0000", border: "1px solid #e5393544", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", color: "#e53935", fontSize: 11, fontWeight: 700 }}>{n}</div>
                      <div style={{ color: "#666", fontSize: 11 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
