import { useMemo, useState } from "react";
import { useAuth } from "../features/auth/useAuth";
import { updateUserIdentity, updateUserProfile } from "../services/storage/repositories/usersRepository";
import { addWeightRecord } from "../services/storage/repositories/weightRepository";

const GENDER_OPTIONS = [
  { value: "femme", label: "Femme" },
  { value: "homme", label: "Homme" },
  { value: "non_defini", label: "Non défini" },
];

const BMI_SCALE_MIN = 16;
const BMI_SCALE_MAX = 40;
const BMI_TICKS = [16, 18.5, 25, 30, 35, 40];
const WAIST_GUIDE_IMAGE_URL = "https://cuirartem.ca/wp-content/uploads/2023/01/mesurer-votre-tour-de-taille-min-e1674250324923-1024x865.png";

function normalizeGender(value) {
  if (value === "femme" || value === "f") return "femme";
  if (value === "homme" || value === "m") return "homme";
  return "non_defini";
}

function parseNumber(value) {
  if (value === "" || value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sanitizeNumericInput(value, { allowDecimal = false } = {}) {
  const raw = String(value ?? "");
  if (!allowDecimal) return raw.replace(/\D+/g, "");

  const withDot = raw.replace(/,/g, ".");
  const cleaned = withDot.replace(/[^0-9.]/g, "");
  const firstDotIndex = cleaned.indexOf(".");
  if (firstDotIndex === -1) return cleaned;

  const integerPart = cleaned.slice(0, firstDotIndex);
  const decimalPart = cleaned.slice(firstDotIndex + 1).replace(/\./g, "");
  return `${integerPart || "0"}.${decimalPart}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getImcData(weightKg, heightCm) {
  if (weightKg <= 0 || heightCm <= 0) {
    return {
      value: null,
      valueText: "--",
      label: "À compléter",
      toneClass: "imc-neutral",
      markerPercent: 0,
    };
  }

  const heightM = heightCm / 100;
  const value = weightKg / (heightM * heightM);
  const markerPercent = ((clamp(value, BMI_SCALE_MIN, BMI_SCALE_MAX) - BMI_SCALE_MIN) / (BMI_SCALE_MAX - BMI_SCALE_MIN)) * 100;

  if (value < 18.5) {
    return {
      value,
      valueText: value.toFixed(1),
      label: "Insuffisant",
      toneClass: "imc-under",
      markerPercent,
    };
  }
  if (value < 25) {
    return {
      value,
      valueText: value.toFixed(1),
      label: "Normal",
      toneClass: "imc-normal",
      markerPercent,
    };
  }
  if (value < 30) {
    return {
      value,
      valueText: value.toFixed(1),
      label: "Surpoids",
      toneClass: "imc-over",
      markerPercent,
    };
  }
  return {
    value,
    valueText: value.toFixed(1),
    label: "Élevé",
    toneClass: "imc-obese",
    markerPercent,
  };
}

function getAgeFromBirthYear(birthYear) {
  const year = parseNumber(birthYear);
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) return null;
  return currentYear - year;
}

function getBodyFatEstimate({ imcValue, age, gender }) {
  if (!imcValue || age === null) {
    return {
      valueText: "--",
      normText: "renseignez année + IMC",
    };
  }

  const sexFactor = gender === "homme" ? 1 : gender === "femme" ? 0 : 0.5;
  const value = (1.2 * imcValue) + (0.23 * age) - (10.8 * sexFactor) - 5.4;
  const clamped = clamp(value, 3, 60);

  const norm = gender === "femme"
    ? "norme : 20-30 %"
    : gender === "homme"
      ? "norme : 10-20 %"
      : "norme : 15-25 %";

  return {
    valueText: `${clamped.toFixed(1)} %`,
    normText: norm,
  };
}

function getLorentzIdealWeight(heightCm, gender) {
  if (heightCm <= 0) {
    return {
      valueText: "--",
      deltaText: "écart : --",
    };
  }

  const male = heightCm - 100 - ((heightCm - 150) / 4);
  const female = heightCm - 100 - ((heightCm - 150) / 2.5);
  const ideal = gender === "homme" ? male : gender === "femme" ? female : (male + female) / 2;

  return {
    value: ideal,
    valueText: `${ideal.toFixed(1)} kg`,
  };
}

function getLorentzDeltaText(weightKg, idealWeight) {
  if (!weightKg || !idealWeight) return "écart : --";
  const delta = weightKg - idealWeight;
  const sign = delta > 0 ? "+" : "";
  return `écart : ${sign}${delta.toFixed(1)} kg`;
}

function getWaistRisk(waistCm, gender) {
  if (waistCm <= 0) {
    return {
      level: "Non renseigné",
      toneClass: "risk-neutral",
      detail: "Ajoutez votre tour de taille pour estimer le risque.",
    };
  }

  const thresholds = gender === "femme"
    ? { low: 80, high: 88 }
    : gender === "homme"
      ? { low: 94, high: 102 }
      : { low: 88, high: 98 };

  if (waistCm < thresholds.low) {
    return {
      level: "Faible",
      toneClass: "risk-low",
      detail: `< ${thresholds.low} cm : aucun risque ajouté`,
    };
  }

  if (waistCm <= thresholds.high) {
    return {
      level: "Modéré",
      toneClass: "risk-mid",
      detail: `${thresholds.low}-${thresholds.high} cm : risque augmenté`,
    };
  }

  return {
    level: "Élevé",
    toneClass: "risk-high",
    detail: `> ${thresholds.high} cm : risque élevé`,
  };
}

function stepAndClamp(rawValue, { delta, min = 0, max = Number.POSITIVE_INFINITY, step = 1, allowDecimal = false }) {
  const parsed = Number.parseFloat(String(rawValue ?? "").replace(",", "."));
  const base = Number.isFinite(parsed) ? parsed : min;
  const stepped = base + delta * step;
  const clamped = Math.min(max, Math.max(min, stepped));
  if (!allowDecimal) return String(Math.round(clamped));
  return Number.isInteger(clamped) ? String(clamped) : clamped.toFixed(1);
}

export function ProfilePage() {
  const { currentUser, refreshCurrentUser } = useAuth();
  const [firstName, setFirstName] = useState(currentUser?.firstName ?? "");
  const [lastName, setLastName] = useState(currentUser?.lastName ?? "");
  const [profile, setProfile] = useState({
    ...(currentUser?.profile ?? {}),
    sex: normalizeGender(currentUser?.profile?.sex),
  });
  const [status, setStatus] = useState("");
  const [showWaistGuide, setShowWaistGuide] = useState(false);

  const gender = normalizeGender(profile.sex);
  const weightKg = parseNumber(profile.weightKg);
  const heightCm = parseNumber(profile.heightCm);
  const waistCm = parseNumber(profile.waistCm);
  const age = getAgeFromBirthYear(profile.birthYear);

  const imc = useMemo(() => getImcData(weightKg, heightCm), [weightKg, heightCm]);
  const bodyFat = useMemo(() => getBodyFatEstimate({ imcValue: imc.value, age, gender }), [imc.value, age, gender]);
  const idealWeight = useMemo(() => getLorentzIdealWeight(heightCm, gender), [heightCm, gender]);
  const waistRisk = useMemo(() => getWaistRisk(waistCm, gender), [waistCm, gender]);

  function stepField(field, options) {
    return (delta) => {
      setProfile((prev) => ({
        ...prev,
        [field]: stepAndClamp(prev[field], { ...options, delta }),
      }));
    };
  }

  const stepBirthYear = stepField("birthYear", { min: 1900, max: 2100, step: 1 });
  const stepWeight = stepField("weightKg", { min: 0, max: 500, step: 1, allowDecimal: true });
  const stepHeight = stepField("heightCm", { min: 50, max: 260, step: 1 });
  const stepWaist = stepField("waistCm", { min: 0, max: 250, step: 1 });

  async function onSave(event) {
    event.preventDefault();
    if (!currentUser) return;

    const cleanedProfile = {
      ...profile,
      sex: normalizeGender(profile.sex),
      birthYear: parseNumber(profile.birthYear),
      weightKg: parseNumber(profile.weightKg),
      heightCm: parseNumber(profile.heightCm),
      waistCm: parseNumber(profile.waistCm),
    };

    await Promise.all([
      updateUserIdentity(currentUser.id, {
        firstName: firstName.trim() || currentUser.firstName,
        lastName: lastName.trim(),
      }),
      updateUserProfile(currentUser.id, cleanedProfile),
    ]);

    if (cleanedProfile.weightKg > 0) {
      await addWeightRecord(currentUser.id, cleanedProfile.weightKg);
    }

    await refreshCurrentUser?.();
    setStatus("Profil sauvegardé");
  }

  return (
    <div className="page">
      <section className="card profile-card">
        <h2>Profil utilisateur</h2>

        <form onSubmit={onSave} className="form-stack profile-form">
          <div className="profile-inline-grid profile-inline-grid--2">
            <label>
              <span>Prénom</span>
              <input autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </label>
            <label>
              <span>Nom</span>
              <input autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </label>
          </div>

          <div className="profile-inline-grid profile-inline-grid--2">
            <label>
              <span>Genre</span>
              <select
                value={gender}
                onChange={(e) => setProfile((prev) => ({ ...prev, sex: e.target.value }))}
              >
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Année de naissance</span>
              <div className="profile-stepper-row">
                <button type="button" className="stepper-btn" onClick={() => stepBirthYear(-1)} aria-label="Diminuer année">−</button>
                <input
                  className="profile-stepper-input"
                  value={profile.birthYear ?? ""}
                  onChange={(e) => setProfile((prev) => ({ ...prev, birthYear: sanitizeNumericInput(e.target.value).slice(0, 4) }))}
                  inputMode="numeric"
                  aria-label="Année de naissance"
                />
                <button type="button" className="stepper-btn" onClick={() => stepBirthYear(1)} aria-label="Augmenter année">+</button>
              </div>
            </label>
          </div>

          <div className="profile-inline-grid profile-inline-grid--2">
            <label>
              <span>Poids</span>
              <div className="profile-stepper-row">
                <button type="button" className="stepper-btn" onClick={() => stepWeight(-1)} aria-label="Diminuer poids">−</button>
                <input
                  className="profile-stepper-input"
                  value={profile.weightKg ?? ""}
                  onChange={(e) => setProfile((prev) => ({ ...prev, weightKg: sanitizeNumericInput(e.target.value, { allowDecimal: true }) }))}
                  inputMode="decimal"
                  aria-label="Poids"
                />
                <span className="profile-stepper-unit">kg</span>
                <button type="button" className="stepper-btn" onClick={() => stepWeight(1)} aria-label="Augmenter poids">+</button>
              </div>
            </label>
            <label>
              <span>Taille</span>
              <div className="profile-stepper-row">
                <button type="button" className="stepper-btn" onClick={() => stepHeight(-1)} aria-label="Diminuer taille">−</button>
                <input
                  className="profile-stepper-input"
                  value={profile.heightCm ?? ""}
                  onChange={(e) => setProfile((prev) => ({ ...prev, heightCm: sanitizeNumericInput(e.target.value) }))}
                  inputMode="numeric"
                  aria-label="Taille"
                />
                <span className="profile-stepper-unit">cm</span>
                <button type="button" className="stepper-btn" onClick={() => stepHeight(1)} aria-label="Augmenter taille">+</button>
              </div>
            </label>
          </div>

          <label>
            <span className="profile-label-row">
              <span>Tour de taille (optionnel)</span>
              <button
                type="button"
                className="profile-help-icon-btn"
                aria-label="Aide pour mesurer le tour de taille"
                aria-expanded={showWaistGuide}
                aria-controls="waist-helper-content"
                onClick={() => setShowWaistGuide((prev) => !prev)}
              >
                ?
              </button>
            </span>
            <div className="profile-stepper-row profile-stepper-row--waist">
              <button type="button" className="stepper-btn" onClick={() => stepWaist(-1)} aria-label="Diminuer tour de taille">−</button>
              <input
                className="profile-stepper-input"
                value={profile.waistCm ?? ""}
                onChange={(e) => setProfile((prev) => ({ ...prev, waistCm: sanitizeNumericInput(e.target.value) }))}
                inputMode="numeric"
                aria-label="Tour de taille"
              />
              <span className="profile-stepper-unit">cm</span>
              <button type="button" className="stepper-btn" onClick={() => stepWaist(1)} aria-label="Augmenter tour de taille">+</button>
            </div>
          </label>
          {showWaistGuide ? (
            <div className="profile-help-block" id="waist-helper-content">
              <p className="profile-help-text">
                Pour mesurer se placer entre le bas de la dernière côte et le haut de l&apos;os iliaque (la crête du bassin). C&apos;est à peu près au niveau du nombril, légèrement au-dessus pour la plupart des gens.
              </p>
              <figure className="profile-help-figure">
                <img
                  className="profile-help-image"
                  src={WAIST_GUIDE_IMAGE_URL}
                  alt="Schéma de mesure du tour de taille"
                  loading="lazy"
                />
                <figcaption>
                  <a href={WAIST_GUIDE_IMAGE_URL} target="_blank" rel="noreferrer">
                    Ouvrir l&apos;image en grand
                  </a>
                </figcaption>
              </figure>
            </div>
          ) : null}

          <section className="profile-metrics" aria-label="Indicateurs santé">
            <div className="profile-bmi-main">
              <p className="profile-bmi-value">{imc.valueText}</p>
              <p className={`profile-bmi-label ${imc.toneClass}`}>{imc.label}</p>
            </div>

            <div className="bmi-gauge-wrap">
              <div className="bmi-gauge" aria-hidden="true">
                <span className="bmi-gauge-marker" style={{ left: `${imc.markerPercent}%` }} />
              </div>
              <div className="bmi-ticks" aria-hidden="true">
                {BMI_TICKS.map((tick) => (
                  <span key={tick}>{tick}</span>
                ))}
              </div>
            </div>

            <div className="profile-kpi-grid">
              <article className="profile-kpi-card">
                <p className="profile-kpi-title">Masse grasse estimée</p>
                <p className="profile-kpi-value">{bodyFat.valueText}</p>
                <p className="profile-kpi-sub">{bodyFat.normText}</p>
              </article>
              <article className="profile-kpi-card">
                <p className="profile-kpi-title">Poids idéal (Lorentz)</p>
                <p className="profile-kpi-value">{idealWeight.valueText}</p>
                <p className="profile-kpi-sub">{getLorentzDeltaText(weightKg, idealWeight.value)}</p>
              </article>
            </div>

            <article className={`profile-risk-card ${waistRisk.toneClass}`}>
              <p className="profile-kpi-title">Risque cardiovasculaire (tour de taille)</p>
              <p className="profile-risk-value">{waistRisk.level}</p>
              <p className="profile-kpi-sub">{waistRisk.detail}</p>
            </article>
          </section>

          <button className="primary-btn" type="submit">
            Sauvegarder
          </button>
        </form>

        {status ? <p className="muted">{status}</p> : null}
      </section>
    </div>
  );
}
