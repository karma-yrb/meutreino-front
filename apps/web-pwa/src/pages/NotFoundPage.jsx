import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="page page-center">
      <section className="card">
        <h2>Page introuvable</h2>
        <Link className="primary-btn" to="/">
          Retour accueil
        </Link>
      </section>
    </div>
  );
}

