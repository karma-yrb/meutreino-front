import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../features/auth/useAuth";

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("user@local");
  const [password, setPassword] = useState("user123");
  const [error, setError] = useState("");

  const redirectTo = location.state?.from?.pathname || "/";

  async function handleSubmit(event) {
    event.preventDefault();
    const user = await login(email.trim(), password);
    if (!user) {
      setError(t("login.error"));
      return;
    }
    navigate(redirectTo, { replace: true });
  }

  return (
    <div className="page page-center">
      <section className="card auth-card">
        <h1>{t("login.title")}</h1>
        <p className="muted">{t("login.hint")}</p>
        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            <span>{t("login.email")}</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>
            <span>{t("login.password")}</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit" className="primary-btn">
            {t("login.submit")}
          </button>
        </form>
      </section>
    </div>
  );
}
