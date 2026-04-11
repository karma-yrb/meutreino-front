import { Link, NavLink, Outlet } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faHouse, faUser, faShield, faUserTie, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../features/auth/useAuth";
import { useTheme } from "../features/theme/useTheme";

const ROLE_LABELS = {
  admin: "Administrateur",
  coach: "Coach",
  user: "Utilisateur",
};

export function AppShell() {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const roleLabel = ROLE_LABELS[currentUser?.role] ?? currentUser?.role ?? "-";

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          MeuTreino
        </Link>
        <div className="topbar-right">
          <span className="role-pill">{roleLabel}</span>
          <button className="theme-toggle" onClick={toggleTheme} type="button" title="Changer le thème">
            <FontAwesomeIcon icon={theme === "dark" ? faSun : faMoon} />
          </button>
          <button aria-label="Déconnexion" className="ghost-btn" onClick={logout} type="button" title="Déconnexion">
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        </div>
      </header>

      <main className="content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <NavLink to="/" end>
          <FontAwesomeIcon icon={faHouse} />
          Accueil
        </NavLink>
        <NavLink to="/profil">
          <FontAwesomeIcon icon={faUser} />
          Profil
        </NavLink>
        {currentUser?.role === "admin" ? (
          <NavLink to="/admin/templates">
            <FontAwesomeIcon icon={faShield} />
            Administration
          </NavLink>
        ) : null}
        {currentUser?.role === "coach" ? (
          <NavLink to="/coach/users">
            <FontAwesomeIcon icon={faUserTie} />
            Coach
          </NavLink>
        ) : null}
      </nav>
    </div>
  );
}
