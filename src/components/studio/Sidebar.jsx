// Barre latérale de l'atelier : toute la configuration au même endroit.
// Grandes lignes :
// - trois modes de chargement des données : dataset intégré, CSV par URL,
//   fichier uploadé (parsé dans le navigateur) ;
// - la configuration d'entraînement (modèle, taille du test, seed) ;
// - l'état de l'API (réveil, mode dégradé) affiché discrètement.
"use client";
import { useState } from "react";
import { Database, FlaskConical } from "lucide-react";
import { parseCsvFile } from "@/lib/data";
import Button from "@/components/ui/Button";
import { Field, inputCls } from "@/components/ui/Field";
import { ErrorLine } from "@/components/ui/Feedback";

// Titre de groupe de la sidebar, avec son icône.
function Group({ icon: Icon, children }) {
  return (
    <h3 className="mt-6 mb-1 flex items-center gap-1.5 text-xs font-semibold
                   uppercase tracking-wider text-(--muted)">
      <Icon className="size-3.5" /> {children}
    </h3>
  );
}

export default function Sidebar({
  models, apiStatus,
  onLoadBuiltin, onLoadUrl, onLoadUpload,
  loadingData, dataError,
  trainConfig, setTrainConfig, onTrain, training, trained, trainError,
}) {
  // État local du formulaire de source (le choix ne devient la source active
  // qu'au clic sur "Charger les données").
  const [mode, setMode] = useState("builtin");
  const [builtin, setBuiltin] = useState("iris");
  const [url, setUrl] = useState("");
  const [urlTarget, setUrlTarget] = useState("");
  const [sep, setSep] = useState(",");
  const [file, setFile] = useState(null);
  const [uploadTarget, setUploadTarget] = useState("");
  const [uploadError, setUploadError] = useState(null);

  // Résout le mode choisi et remonte la source au parent (Studio).
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
    <aside className="flex flex-col gap-2 border-r border-(--hairline) bg-(--surface)
                      px-5 py-6">
      {/* Marque + rappel du statut de l'API */}
      <a href="/" className="text-[1.4rem] font-extrabold tracking-tight">
        Mode<span className="text-(--accent)">LmL</span>
      </a>
      <p className="-mt-1 text-[0.8rem] text-(--muted)">Atelier de modèles ML</p>
      {apiStatus === "loading" && (
        <p className="text-[0.78rem] text-(--muted)">
          Réveil du serveur (jusqu'à une minute)...
        </p>
      )}
      {apiStatus === "fallback" && (
        <p className="text-[0.78rem] text-(--critical)">API injoignable pour le moment.</p>
      )}

      <Group icon={Database}>Source de données</Group>
      {/* Sélecteur segmenté : Intégré / URL / Fichier */}
      <div className="flex overflow-hidden rounded-lg border border-(--grid)">
        {[["builtin", "Intégré"], ["url", "URL"], ["upload", "Fichier"]].map(([k, lbl]) => (
          <button key={k} onClick={() => setMode(k)}
            className={
              "flex-1 cursor-pointer border-r border-(--grid) py-1.5 text-[0.8rem] last:border-r-0 " +
              (mode === k
                ? "bg-(--accent) font-semibold text-(--accent-ink)"
                : "bg-(--surface) text-(--ink-2) hover:bg-(--accent-tint)")
            }>
            {lbl}
          </button>
        ))}
      </div>

      {mode === "builtin" && (
        <Field label="Dataset">
          <select className={inputCls} value={builtin}
                  onChange={e => setBuiltin(e.target.value)}>
            <option value="iris">iris</option>
            <option value="wine">wine</option>
          </select>
        </Field>
      )}
      {mode === "url" && (
        <>
          <Field label="URL du CSV">
            <input className={inputCls} value={url} placeholder="https://.../data.csv"
                   onChange={e => setUrl(e.target.value)} />
          </Field>
          <Field label="Colonne cible">
            <input className={inputCls} value={urlTarget} placeholder="ex : quality"
                   onChange={e => setUrlTarget(e.target.value)} />
          </Field>
        </>
      )}
      {mode === "upload" && (
        <>
          <Field label="Fichier CSV">
            <input type="file" accept=".csv" className={`${inputCls} p-1 text-xs`}
                   onChange={e => setFile(e.target.files[0])} />
          </Field>
          <Field label="Séparateur">
            <select className={inputCls} value={sep} onChange={e => setSep(e.target.value)}>
              <option value=",">virgule (,)</option>
              <option value=";">point-virgule (;)</option>
              <option value={"\t"}>tabulation</option>
            </select>
          </Field>
          <Field label="Colonne cible (défaut : dernière)">
            <input className={inputCls} value={uploadTarget} placeholder="ex : classe"
                   onChange={e => setUploadTarget(e.target.value)} />
          </Field>
        </>
      )}
      <Button busy={loadingData} onClick={load}>Charger les données</Button>
      {(dataError || uploadError) && <ErrorLine message={dataError || uploadError} />}

      <Group icon={FlaskConical}>Entraînement</Group>
      <Field label="Modèle">
        <select className={inputCls} value={trainConfig.model}
                disabled={!models.length}
                onChange={e => setTrainConfig({ ...trainConfig, model: e.target.value })}>
          {models.length
            ? models.map(m => <option key={m}>{m}</option>)
            : <option value="">chargement...</option>}
        </select>
      </Field>
      <Field label={`Taille du test : ${Math.round(trainConfig.testSize * 100)} %`}>
        <input type="range" min="0.1" max="0.5" step="0.05"
               className="accent-(--accent)"
               value={trainConfig.testSize}
               onChange={e => setTrainConfig({ ...trainConfig, testSize: +e.target.value })} />
      </Field>
      <Field label="Seed">
        <input type="number" className={inputCls} value={trainConfig.seed}
               onChange={e => setTrainConfig({ ...trainConfig, seed: +e.target.value })} />
      </Field>
      <Button busy={training} onClick={onTrain}>Entraîner</Button>
      {trainError && <ErrorLine message={trainError} />}
      {trained && !trainError && (
        <p className="text-[0.8rem] text-(--good)">
          {trained.model} entraîné ({trained.task}).
        </p>
      )}

      {/* Pied de la sidebar : liens vers l'écosystème */}
      <div className="mt-auto flex gap-4 pt-6 text-[0.82rem]">
        <a className="text-(--accent) hover:underline"
           href="https://github.com/diamankayero/ModeLmL">GitHub</a>
        <a className="text-(--accent) hover:underline"
           href="https://github.com/diamankayero/trainedml">trainedml</a>
      </div>
    </aside>
  );
}
