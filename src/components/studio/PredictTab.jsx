// Onglet Prédire : tester le modèle entraîné sur une observation.
// Grandes lignes :
// - un champ par variable, pré-rempli avec la moyenne du dataset :
//   l'utilisateur part d'une observation "typique" et fait varier ;
// - la prédiction est faite par le dernier modèle entraîné (sidebar) ;
// - le résultat s'affiche en grande carte violette.
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Button from "@/components/ui/Button";
import { inputCls } from "@/components/ui/Field";
import { ErrorLine, SectionTitle, Tile } from "@/components/ui/Feedback";

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
    return <p className="mt-8 italic text-(--muted)">
      Chargez des données depuis le panneau de gauche.
    </p>;
  }
  if (!trained) {
    return <p className="mt-8 italic text-(--muted)">
      Entraînez d'abord un modèle depuis le panneau de gauche, puis revenez
      prédire ici.
    </p>;
  }

  // Envoie l'observation au serveur, dans l'ordre des variables d'entraînement.
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
      {/* Rappel du modèle actif et de ses scores principaux */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3">
        <Tile label="modèle actif" value={trained.model} small />
        <Tile label="tâche" value={trained.task} small />
        {Object.entries(trained.scores).slice(0, 2).map(([name, v]) => (
          <Tile key={name} label={name} value={v.toFixed(3)} />
        ))}
      </div>

      <SectionTitle>Votre observation</SectionTitle>
      <p className="text-sm text-(--ink-2)">
        Chaque champ est pré-rempli avec la moyenne de la variable : partez de
        là et faites varier ce qui vous intéresse.
      </p>
      <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
        {trained.feature_names.map(f => (
          <label className="flex flex-col gap-1" key={f}>
            <span className="text-xs text-(--muted)">{f}</span>
            <input
              className={inputCls}
              type={typeof dataset.means[f] === "number" ? "number" : "text"}
              step="any"
              value={values[f] ?? ""}
              onChange={e => setValues({ ...values, [f]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <div className="my-4">
        <Button busy={busy} onClick={predict}>Prédire</Button>
      </div>
      {error && <ErrorLine message={error} />}
      {result !== null && (
        <div className="inline-flex flex-col gap-0.5 rounded-xl border border-(--accent)
                        bg-(--accent-tint) px-6 py-3">
          <span className="text-xs text-(--ink-2)">
            Prédiction du modèle {trained.model}
          </span>
          <span className="text-[1.7rem] font-bold text-(--accent)">{result}</span>
        </div>
      )}
    </>
  );
}
