import { useState } from "react";
import { api } from "../api";
import { ActionButton, ErrorLine } from "./ui";

export default function TrainCard({ models }) {
  const [dataset, setDataset] = useState("iris");
  const [model, setModel] = useState("");
  const [seed, setSeed] = useState(42);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function train() {
    setBusy(true); setError(null); setResult(null);
    try {
      setResult(await api("/api/train", {
        dataset,
        model: model || models[0] || "random_forest",
        seed: Number(seed),
      }));
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return (
    <section>
      <div className="step"><span className="num">1</span><h2>Entraîner un modèle</h2></div>
      <p className="hint">
        Choisissez un dataset et un modèle ; le prétraitement (standardisation, encodage) est automatique.
      </p>
      <div className="controls">
        <label className="field"><span>Dataset</span>
          <select value={dataset} onChange={e => setDataset(e.target.value)}>
            <option value="iris">iris</option>
            <option value="wine">wine</option>
          </select>
        </label>
        <label className="field"><span>Modèle</span>
          <select value={model} onChange={e => setModel(e.target.value)}>
            {models.map(name => <option key={name}>{name}</option>)}
          </select>
        </label>
        <label className="field"><span>Seed</span>
          <input type="number" value={seed} style={{ width: "5.5rem" }}
                 onChange={e => setSeed(e.target.value)} />
        </label>
        <ActionButton busy={busy} onClick={train}>Entraîner</ActionButton>
      </div>
      <div className="out">
        {error && <ErrorLine message={error} />}
        {result && (
          <>
            <p className="meta">
              <span className="okline">Modèle entraîné.</span>{" "}
              {result.model} ({result.task}), {result.n_train} observations
              d'entraînement, {result.n_test} de test.
            </p>
            <div className="tiles">
              {Object.entries(result.scores).map(([name, value]) => (
                <div className="tile" key={name}>
                  <div className="label">{name}</div>
                  <div className="value">{value.toFixed(3)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
