import { useState } from "react";
import { api } from "../api";
import { ActionButton, ErrorLine } from "./ui";

export default function PredictCard() {
  const [features, setFeatures] = useState("[[5.1, 3.5, 1.4, 0.2], [6.2, 2.8, 4.8, 1.8]]");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function predict() {
    setBusy(true); setError(null); setResult(null);
    try {
      setResult(await api("/api/predict", { features: JSON.parse(features) }));
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return (
    <section>
      <div className="step"><span className="num">2</span><h2>Prédire</h2></div>
      <p className="hint">
        Une ligne par observation, au format JSON, avec les mêmes colonnes que l'entraînement.
      </p>
      <div className="full">
        <textarea value={features} onChange={e => setFeatures(e.target.value)} />
      </div>
      <div className="controls">
        <ActionButton busy={busy} onClick={predict}>Prédire</ActionButton>
      </div>
      <div className="out">
        {error && <ErrorLine message={error} />}
        {result && (
          <>
            <p className="meta">Prédictions du modèle {result.model} :</p>
            <div className="chips">
              {result.predictions.map((p, i) => (
                <span className="chip" key={i}>obs. {i + 1} : <b>{p}</b></span>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
