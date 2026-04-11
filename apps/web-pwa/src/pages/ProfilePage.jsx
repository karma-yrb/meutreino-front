import { useState } from "react";
import { useAuth } from "../features/auth/useAuth";
import { updateUserProfile } from "../services/storage/repositories/usersRepository";

export function ProfilePage() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(currentUser?.profile ?? {});
  const [status, setStatus] = useState("");

  async function onSave(event) {
    event.preventDefault();
    if (!currentUser) return;
    await updateUserProfile(currentUser.id, profile);
    setStatus("Profil sauvegardé");
  }

  return (
    <div className="page">
      <section className="card">
        <h2>Profil utilisateur</h2>
        <p className="muted">
          {currentUser?.firstName} {currentUser?.lastName}
        </p>
        <form onSubmit={onSave} className="form-stack">
          <label>
            <span>Sexe</span>
            <input
              value={profile.sex ?? ""}
              onChange={(e) => setProfile((prev) => ({ ...prev, sex: e.target.value }))}
            />
          </label>
          <label>
            <span>Année de naissance</span>
            <input
              value={profile.birthYear ?? ""}
              onChange={(e) => setProfile((prev) => ({ ...prev, birthYear: Number(e.target.value) || 0 }))}
              type="number"
            />
          </label>
          <label>
            <span>Poids (kg)</span>
            <input
              value={profile.weightKg ?? ""}
              onChange={(e) => setProfile((prev) => ({ ...prev, weightKg: Number(e.target.value) || 0 }))}
              type="number"
            />
          </label>
          <label>
            <span>Taille (cm)</span>
            <input
              value={profile.heightCm ?? ""}
              onChange={(e) => setProfile((prev) => ({ ...prev, heightCm: Number(e.target.value) || 0 }))}
              type="number"
            />
          </label>
          <button className="primary-btn" type="submit">
            Sauvegarder
          </button>
        </form>
        {status ? <p className="muted">{status}</p> : null}
      </section>
    </div>
  );
}
