import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/useAuth";
import { listUsersByCoach } from "../services/storage/repositories/usersRepository";
import { getActivePlanForUser } from "../services/storage/repositories/plansRepository";

export function CoachUsersPage() {
  const { currentUser } = useAuth();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function load() {
      if (!currentUser) return;
      const users = await listUsersByCoach(currentUser.id);
      const withPlans = await Promise.all(
        users.map(async (user) => ({
          user,
          plan: await getActivePlanForUser(user.id),
        })),
      );
      setRows(withPlans);
    }
    load();
  }, [currentUser]);

  return (
    <div className="page">
      <section className="card">
        <h2>Coach - Utilisateurs assignes</h2>
        <p className="muted">La modification detaillee des plans arrive en phase suivante.</p>
      </section>
      <section className="card">
        <ul className="simple-list">
          {rows.map(({ user, plan }) => (
            <li key={user.id}>
              <strong>
                {user.firstName} {user.lastName}
              </strong>
              <span className="muted"> - plan actif: {plan?.version ?? "aucun"}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
