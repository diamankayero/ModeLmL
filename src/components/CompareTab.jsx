import { useState } from "react";
import { api, sourcePayload } from "../api";
import HBarChart from "./charts";
import { ActionButton, DataTable, ErrorLine, Field } from "./ui";

// Onglet Comparer : choix des modèles, validation croisée, tableau + graphiques.
export default function CompareTab({ source, models }) {
  const [chosen, setChosen] = useState(null);
  const [cv, setCv] = useState(5);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const active = chosen ?? models;

  function toggle(model) {
    const next = active.includes(model)
      ? active.filter(m => m !== model)
      : [...active, model];
    setChosen(next.length ? next : models);
  }

  async function run() {
    setBusy(true); setError(null); setResult(null);
    try {
      const body = { ...sourcePayload(source), cv: Number(cv) };
      if (chosen && chosen.length < models.length) body.models = chosen;
      setResult(await api("/api/compare", body));
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  if (!source) {
    return <p className="placeholder">Chargez des données depuis le panneau de gauche.</p>;
  }

  const rows = result?.results ?? [];
  const primary = rows.length && "accuracy" in rows[0] ? "accuracy" : "r2";
  const tableCols = rows.length
    ? Object.keys(rows[0]).filter(c => !c.endsWith("_std"))
    : [];

  return (
    <>
      <h3>Modèles à comparer</h3>
      <div className="chips">
        {models.map(m => (
          <button key={m} className={active.includes(m) ? "chip on" : "chip"}
                  onClick={() => toggle(m)}>{m}</button>
        ))}
      </div>
      <p className="hint-inline" style={{ marginTop: "0.4rem" }}>
        Seuls les modèles adaptés à la tâche détectée (classification ou
        régression) sont réellement comparés.
      </p>
      <div className="controls">
        <Field label="Plis de validation croisée">
          <input type="number" min="2" max="20" value={cv}
                 style={{ width: "5rem" }} onChange={e => setCv(e.target.value)} />
        </Field>
        <ActionButton busy={busy} onClick={run}>Lancer la comparaison</ActionButton>
      </div>
      {busy && (
        <p className="hint-inline">
          Chaque modèle est entraîné {cv} fois ; sur le serveur gratuit cela
          peut prendre quelques dizaines de secondes.
        </p>
      )}
      {error && <div className="out"><ErrorLine message={error} /></div>}
      {result && (
        <>
          <p className="meta">
            Validation croisée à {result.cv} plis ; le tableau est trié par {primary},
            du meilleur au moins bon.
          </p>
          <DataTable rows={rows} columns={tableCols} />
          <div className="chart-row">
            <HBarChart
              title={`${primary} moyenne (écart-type en ±)`}
              items={rows.map(r => ({ label: r.model, value: r[primary],
                                      std: r[`${primary}_std`] }))}
              max={primary === "accuracy" ? 1 : undefined}
            />
            <HBarChart
              title="Temps d'entraînement moyen (secondes)"
              items={rows.map(r => ({ label: r.model, value: r.fit_time }))}
              format={v => v.toFixed(3)}
              barVar="--bar-alt"
            />
          </div>
        </>
      )}
    </>
  );
}
