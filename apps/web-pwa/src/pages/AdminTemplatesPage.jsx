import { useEffect, useState } from "react";
import { listTemplates, saveTemplate } from "../services/storage/repositories/plansRepository";
import { buildDefaultTemplate } from "../data/defaultTemplate";

export function AdminTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [status, setStatus] = useState("");

  async function refresh() {
    const response = await listTemplates();
    setTemplates(response);
  }

  useEffect(() => {
    let isActive = true;
    listTemplates().then((response) => {
      if (isActive) {
        setTemplates(response);
      }
    });
    return () => {
      isActive = false;
    };
  }, []);

  async function duplicateDefaultTemplate() {
    const now = Date.now();
    const template = buildDefaultTemplate();
    template.id = `${template.id}-${now}`;
    template.name = `${template.name} copie ${new Date(now).toLocaleDateString("fr-FR")}`;
    template.monthLabel = new Date(now).toISOString().slice(0, 7);
    template.createdByAdminId = "admin-1";
    await saveTemplate(template);
    setStatus("Template cree");
    refresh();
  }

  return (
    <div className="page">
      <section className="card">
        <h2>Admin - Templates</h2>
        <p className="muted">Creation et gestion des templates de plan.</p>
        <button className="primary-btn" onClick={duplicateDefaultTemplate} type="button">
          Creer une copie du template de base
        </button>
        {status ? <p className="muted">{status}</p> : null}
      </section>

      <section className="card">
        <h3>Templates existants</h3>
        <ul className="simple-list">
          {templates.map((template) => (
            <li key={template.id}>
              <strong>{template.name}</strong>
              <span className="muted"> - {template.monthLabel}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
