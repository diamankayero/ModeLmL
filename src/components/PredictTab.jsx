import { useEffect, useState } from "react";
import { api } from "../api";
import { ActionButton, ErrorLine } from "./ui";

// Onglet Prédire : un champ par variable (pré-rempli avec la moyenne),
// prédiction avec le dernier modèle entraîné.
export default function PredictTab({ dataset, trained }) {
  const [values, setValues] = useState({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Réinitialise le formulaire quand le dataset change.
  useEffect(() => {
    if (!dataset) return;
    const init = {};
    for (const f of dataset.feature_names) {
      init[f] = dataset.means[f] !== undefined ? dataset.means[f] : "";
    }
    setValues(init);
    setResult(null);
  }, [dataset]);

  if (!dataset) {
    return <p className="placeholder">Chargez des données depuis le panneau de gauche.</p>;
  }
  if (!trained) {
    return (
      <p className="placeholder">
        Entraînez d'abord un modèle depuis le panneau de gauche, puis revenez
        prédire ici.
      </p>
    );
  }

  async function predict() {
    setBusy(true); setError(null); setResult(null);
    try {
      const row = trained.feature_names.map(f => {
        const v = values[f];
        return typeof v === "string" && v !== "" && !isNaN(Number(v)) ? Number(v) : v;
      });
      const d = await api("/api/predict", { features: [row] });
      setResult(d.predictions[0]);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return (
    <>
      <div className="stat-row">
        <div className="tile"><div className="label">modèle actif</div>
          <div className="value small">{trained.model}</div></div>
        <div className="tile"><div className="label">tâche</div>
          <div className="value small">{trained.task}</div></div>
        {Object.entries(trained.scores).slice(0, 2).map(([name, v]) => (
          <div className="tile" key={name}>
            <div className="label">{name}</div>
            <div className="value">{v.toFixed(3)}</div>
          </div>
        ))}
      </div>

      <h3>Votre observation</h3>
      <p className="meta">
        Chaque champ est pré-rempli avec la moyenne de la variable : partez de
        là et faites varier ce qui vous intéresse.
      </p>
      <div className="predict-grid">
        {trained.feature_names.map(f => (
          <label className="field" key={f}>
            <span>{f}</span>
            {typeof dataset.means[f] === "number" ? (
              <input type="number" step="any" value={values[f] ?? ""}
                     onChange={e => setValues({ ...values, [f]: e.target.value })} />
            ) : (
              <input value={values[f] ?? ""}
                     onChange={e => setValues({ ...values, [f]: e.target.value })} />
            )}
          </label>
        ))}
      </div>
      <div className="controls" style={{ marginLeft: 0 }}>
        <ActionButton busy={busy} onClick={predict}>Prédire</ActionButton>
      </div>
      {error && <div className="out"><ErrorLine message={error} /></div>}
      {result !== null && (
        <div className="predict-result">
          <span className="label">Prédiction du modèle {trained.model}</span>
          <span className="value">{result}</span>
        </div>
      )}
    </>
  );
}
