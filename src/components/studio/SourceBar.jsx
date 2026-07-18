// Barre du haut : la source de données active, et le panneau pour en changer.
// Grandes lignes :
// - à gauche, la source active (nom + nombre de lignes) ;
// - à droite, un bouton qui déplie le panneau de changement de source ;
// - le panneau propose les trois modes : dataset intégré, CSV par URL,
//   fichier uploadé (parsé dans le navigateur).
"use client";
import { useState } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import { parseCsvFile } from "@/lib/data";
import Button from "@/components/ui/Button";
import { Field, inputCls } from "@/components/ui/Field";
import { ErrorLine } from "@/components/ui/Feedback";

export default function SourceBar({
  sourceLabel, dataset, open, setOpen,
  onLoadBuiltin, onLoadUrl, onLoadUpload, loadingData, dataError,
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
    <div className="border-b border-(--hairline) bg-(--surface)">
      <div className="flex items-center gap-3 px-6 py-2.5">
        <span className="text-sm text-(--ink-2)">
          Source :{" "}
          <b className="text-(--ink)">{sourceLabel || "aucune"}</b>
          {dataset && (
            <span className="text-(--muted)"> · {dataset.n_rows} lignes</span>
          )}
        </span>
        <button onClick={() => setOpen(!open)}
          className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-lg border
                     border-(--grid) px-3 py-1.5 text-[0.83rem] text-(--ink-2)
                     transition-colors hover:border-(--accent) hover:text-(--accent)">
          <RefreshCw className="size-3.5" />
          Changer de source
          <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Le panneau déplié : les trois modes de chargement */}
      {open && (
        <div className="border-t border-(--hairline) px-6 py-4">
          <div className="flex max-w-md overflow-hidden rounded-lg border border-(--grid)">
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
          <div className="mt-3 flex flex-wrap items-end gap-4">
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
                  <input className={`${inputCls} w-72`} value={url}
                         placeholder="https://.../data.csv"
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
                  <select className={inputCls} value={sep}
                          onChange={e => setSep(e.target.value)}>
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
            <Button busy={loadingData} onClick={load}>Charger</Button>
            {(dataError || uploadError) && <ErrorLine message={dataError || uploadError} />}
          </div>
        </div>
      )}
    </div>
  );
}
