import { useState } from "react";
import { parseCsvFile } from "../lib/data";
import { ActionButton, ErrorLine, Field } from "./ui";

// Panneau de configuration : source de données, modèle, entraînement.
export default function Sidebar({
  models, apiStatus,
  onLoadBuiltin, onLoadUrl, onLoadUpload,
  loadingData, dataError,
  trainConfig, setTrainConfig, onTrain, training, trained, trainError,
}) {
  const [mode, setMode] = useState("builtin");
  const [builtin, setBuiltin] = useState("iris");
  const [url, setUrl] = useState("");
  const [urlTarget, setUrlTarget] = useState("");
  const [sep, setSep] = useState(",");
  const [file, setFile] = useState(null);
  const [uploadTarget, setUploadTarget] = useState("");
  const [uploadError, setUploadError] = useState(null);

  async function load() {
    setUploadError(null);
    if (mode === "builtin") return onLoadBuiltin(builtin);
    if (mode === "url") return onLoadUrl(url.trim(), urlTarget.trim());
    if (!file) { setUploadError("Choisissez un fichier CSV."); return; }
    try {
      const records = await parseCsvFile(file, sep);
      const columns = Object.keys(records[0]);
      const target = uploadTarget.trim() || columns[columns.length - 1];
      if (!columns.includes(target)) {
        setUploadError(`Colonne cible ${target} introuvable.`);
        return;
      }
      onLoadUpload(records, target, file.name);
    } catch (e) { setUploadError(e.message); }
  }

  return (
    <aside className="sidebar">
      <div className="brand">Mode<span className="accent">LmL</span></div>
      <p className="brand-sub">Atelier de modèles ML</p>

      {apiStatus === "loading" && (
        <p className="side-status">Réveil du serveur (jusqu'à une minute)...</p>
      )}
      {apiStatus === "fallback" && (
        <p className="side-status warn">API injoignable pour le moment.</p>
      )}

      <h3>Source de données</h3>
      <div className="seg">
        {[["builtin", "Intégré"], ["url", "URL"], ["upload", "Fichier"]].map(([k, lbl]) => (
          <button key={k} className={mode === k ? "seg-btn active" : "seg-btn"}
                  onClick={() => setMode(k)}>{lbl}</button>
        ))}
      </div>

      {mode === "builtin" && (
        <Field label="Dataset">
          <select value={builtin} onChange={e => setBuiltin(e.target.value)}>
            <option value="iris">iris</option>
            <option value="wine">wine</option>
          </select>
        </Field>
      )}
      {mode === "url" && (
        <>
          <Field label="URL du CSV">
            <input value={url} placeholder="https://.../data.csv"
                   onChange={e => setUrl(e.target.value)} />
          </Field>
          <Field label="Colonne cible">
            <input value={urlTarget} placeholder="ex : quality"
                   onChange={e => setUrlTarget(e.target.value)} />
          </Field>
        </>
      )}
      {mode === "upload" && (
        <>
          <Field label="Fichier CSV">
            <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} />
          </Field>
          <Field label="Séparateur">
            <select value={sep} onChange={e => setSep(e.target.value)}>
              <option value=",">virgule (,)</option>
              <option value=";">point-virgule (;)</option>
              <option value={"\t"}>tabulation</option>
            </select>
          </Field>
          <Field label="Colonne cible (défaut : dernière)">
            <input value={uploadTarget} placeholder="ex : classe"
                   onChange={e => setUploadTarget(e.target.value)} />
          </Field>
        </>
      )}
      <ActionButton busy={loadingData} onClick={load}>Charger les données</ActionButton>
      {(dataError || uploadError) && <ErrorLine message={dataError || uploadError} />}

      <h3>Entraînement</h3>
      <Field label="Modèle">
        <select value={trainConfig.model}
                disabled={!models.length}
                onChange={e => setTrainConfig({ ...trainConfig, model: e.target.value })}>
          {models.length
            ? models.map(m => <option key={m}>{m}</option>)
            : <option value="">chargement...</option>}
        </select>
      </Field>
      <Field label={`Taille du test : ${Math.round(trainConfig.testSize * 100)} %`}>
        <input type="range" min="0.1" max="0.5" step="0.05"
               value={trainConfig.testSize}
               onChange={e => setTrainConfig({ ...trainConfig, testSize: +e.target.value })} />
      </Field>
      <Field label="Seed">
        <input type="number" value={trainConfig.seed}
               onChange={e => setTrainConfig({ ...trainConfig, seed: +e.target.value })} />
      </Field>
      <ActionButton busy={training} onClick={onTrain}>Entraîner</ActionButton>
      {trainError && <ErrorLine message={trainError} />}
      {trained && !trainError && (
        <p className="side-ok">
          {trained.model} entraîné ({trained.task}),
          accuracy et détails dans l'onglet Prédire.
        </p>
      )}

      <div className="side-foot">
        <a href="https://github.com/diamankayero/ModeLmL">GitHub</a>
        <a href="https://github.com/diamankayero/trainedml">trainedml</a>
      </div>
    </aside>
  );
}
