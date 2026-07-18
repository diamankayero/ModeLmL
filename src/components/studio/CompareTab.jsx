// Onglet Comparer : mettre les modèles en compétition.
// Grandes lignes :
// - choix des modèles par puces (par défaut : tous) ;
// - validation croisée à N plis lancée côté serveur ;
// - résultats en tableau trié + deux graphiques en barres :
//   le score (violet) et le temps d'entraînement (bleu).
"use client";
import { useState } from "react";
import { api, sourcePayload } from "@/lib/api";
import HBarChart from "./charts";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import { inputCls, Field } from "@/components/ui/Field";
import { Chip, ErrorLine, SectionTitle } from "@/components/ui/Feedback";

export default function CompareTab({ source, models }) {
  const [chosen, setChosen] = useState(null);   // modèles cochés (null = tous)
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

  // Lance la comparaison côté serveur (les données suivent la source active).
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
    return <p className="mt-8 italic text-(--muted)">
      Chargez des données depuis le panneau de gauche.
    </p>;
  }

  const rows = result?.results ?? [];
  const primary = rows.length && "accuracy" in rows[0] ? "accuracy" : "r2";
  const tableCols = rows.length
    ? Object.keys(rows[0]).filter(c => !c.endsWith("_std"))
    : [];

  return (
    <>
      <SectionTitle>Modèles à comparer</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {models.map(m => (
          <Chip key={m} on={active.includes(m)} onClick={() => toggle(m)}>{m}</Chip>
        ))}
      </div>
      <p className="mt-2 text-[0.83rem] text-(--muted)">
        Seuls les modèles adaptés à la tâche détectée (classification ou
        régression) sont réellement comparés.
      </p>
      <div className="my-4 flex flex-wrap items-end gap-4">
        <Field label="Plis de validation croisée">
          <input type="number" min="2" max="20" value={cv}
                 className={`${inputCls} w-20`} onChange={e => setCv(e.target.value)} />
        </Field>
        <Button busy={busy} onClick={run}>Lancer la comparaison</Button>
      </div>
      {busy && (
        <p className="text-[0.83rem] text-(--muted)">
          Chaque modèle est entraîné {cv} fois ; sur le serveur gratuit cela
          peut prendre quelques dizaines de secondes.
        </p>
      )}
      {error && <div className="mt-2"><ErrorLine message={error} /></div>}
      {result && (
        <>
          <p className="text-sm text-(--ink-2)">
            Validation croisée à {result.cv} plis ; le tableau est trié par {primary},
            du meilleur au moins bon.
          </p>
          <Table rows={rows} columns={tableCols} />
          {/* Deux graphiques : une mesure chacun, une teinte chacun */}
          <div className="mt-6 flex flex-wrap gap-8">
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
