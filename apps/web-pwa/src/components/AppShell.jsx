import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

export function AppShell() {
  const { currentUser, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          MeuTreino
        </Link>
        <div className="topbar-right">
          <span className="role-pill">{currentUser?.role}</span>
          <button className="ghost-btn" onClick={logout} type="button">
            Deconnexion
          </button>
        </div>
      </header>

      <main className="content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <NavLink to="/" end>
          Accueil
        </NavLink>
        <NavLink to="/profil">Profil</NavLink>
        {currentUser?.role === "admin" ? <NavLink to="/admin/templates">Admin</NavLink> : null}
        {currentUser?.role === "coach" ? <NavLink to="/coach/users">Coach</NavLink> : null}
      </nav>
    </div>
  );
}
