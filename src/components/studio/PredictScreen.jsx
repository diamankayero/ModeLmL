// Écran Prédiction : entraîner un modèle puis le tester, au même endroit.
// Grandes lignes :
// - carte 1 : la configuration d'entraînement (modèle, taille du test,
//   seed) et les scores obtenus ; elle vit ici, pas dans une sidebar
//   globale, car c'est cet écran qui en a besoin ;
// - carte 2 : le formulaire d'observation, un champ par variable pré-rempli
//   avec sa moyenne, et la prédiction en grande carte violette.
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import HBarChart from "./charts";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { Field, inputCls } from "@/components/ui/Field";
import { ErrorLine, Tile } from "@/components/ui/Feedback";

export default function PredictScreen({
  dataset, models,
  trainConfig, setTrainConfig, onTrain, training, trained, trainError,
}) {
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

  if (!dataset) return null;

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
      <ScreenHeader
        title="Prédiction"
        description="Entraînez un modèle sur vos données, puis testez-le sur l'observation de votre choix."
      />

      {/* Carte 1 : entraînement */}
      <Card title="1. Entraîner un modèle"
            subtitle="Le prétraitement (standardisation, encodage) est automatique.">
        <div className="flex flex-wrap items-end gap-4">
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
            <input type="number" className={`${inputCls} w-24`} value={trainConfig.seed}
                   onChange={e => setTrainConfig({ ...trainConfig, seed: +e.target.value })} />
          </Field>
          <Button busy={training} onClick={onTrain}>Entraîner</Button>
        </div>
        {trainError && <div className="mt-3"><ErrorLine message={trainError} /></div>}
        {trained && (
          <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
            <Tile label="modèle" value={trained.model} small />
            <Tile label="tâche" value={trained.task} small />
            {Object.entries(trained.scores).map(([name, v]) => (
              <Tile key={name} label={name} value={v.toFixed(3)} />
            ))}
          </div>
        )}
        {/* Ce qui décide vraiment : l'importance des variables, quand le
            modèle sait la donner (forêts, modèles linéaires ; pas KNN). */}
        {trained?.importances && (
          <div className="mt-5">
            <HBarChart
              title="Importance des variables : ce qui pèse dans la prédiction"
              labelW={190}
              items={trained.importances.map(i => ({
                label: i.feature, value: i.importance }))}
            />
          </div>
        )}
      </Card>

      {/* Carte 2 : l'observation à prédire */}
      <Card className="mt-5" title="2. Votre observation"
            subtitle="Chaque champ est pré-rempli avec la moyenne de la variable : faites varier ce qui vous intéresse.">
        {!trained && (
          <p className="text-sm italic text-(--muted)">
            Entraînez d'abord un modèle ci-dessus.
          </p>
        )}
        {trained && (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
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
        )}
      </Card>
    </>
  );
}
