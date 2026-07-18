// L'atelier complet : c'est ici que vit tout l'état partagé.
// Grandes lignes :
// - source  : d'où viennent les données (intégré, URL, upload) ;
// - dataset : les données et leurs statistiques (pour Données et Prédire) ;
// - trained : le dernier modèle entraîné (pour Prédire) ;
// - tab     : l'onglet actif.
// La sidebar modifie cet état ; les onglets le consomment.
"use client";
import { useEffect, useState } from "react";
import { api, API_URL, sourcePayload } from "@/lib/api";
import { datasetFromRows } from "@/lib/data";
import useModels from "@/hooks/useModels";
import Sidebar from "./Sidebar";
import DataTab from "./DataTab";
import CompareTab from "./CompareTab";
import PredictTab from "./PredictTab";
import ReportTab from "./ReportTab";

const TABS = [
  ["donnees", "Données"],
  ["comparer", "Comparer"],
  ["predire", "Prédire"],
  ["analyse", "Analyse"],
];

export default function Studio() {
  const { models, status: apiStatus } = useModels();

  const [source, setSource] = useState(null);
  const [sourceLabel, setSourceLabel] = useState("");
  const [dataset, setDataset] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState(null);

  const [trainConfig, setTrainConfig] = useState({ model: "", testSize: 0.2, seed: 42 });
  const [trained, setTrained] = useState(null);
  const [training, setTraining] = useState(false);
  const [trainError, setTrainError] = useState(null);

  const [tab, setTab] = useState("donnees");

  // Iris chargé par défaut : l'atelier n'est jamais vide.
  useEffect(() => { loadBuiltin("iris"); }, []);  // eslint-disable-line

  // Changer de données invalide le modèle entraîné sur les anciennes.
  function resetForNewData() {
    setDataset(null); setDataError(null);
    setTrained(null); setTrainError(null);
  }

  async function loadBuiltin(name) {
    resetForNewData(); setLoadingData(true);
    try {
      const d = await api(`/api/dataset?name=${encodeURIComponent(name)}&limit=300`);
      setDataset(d);
      setSource({ kind: "builtin", name });
      setSourceLabel(name);
    } catch (e) { setDataError(e.message); }
    finally { setLoadingData(false); }
  }

  async function loadUrl(url, target) {
    if (!url || !target) { setDataError("Renseignez l'URL et la colonne cible."); return; }
    resetForNewData(); setLoadingData(true);
    try {
      const d = await api(
        `/api/dataset?url=${encodeURIComponent(url)}&target=${encodeURIComponent(target)}&limit=300`);
      setDataset(d);
      setSource({ kind: "url", url, target });
      setSourceLabel(url.split("/").pop());
    } catch (e) { setDataError(e.message); }
    finally { setLoadingData(false); }
  }

  // Un fichier uploadé reste dans le navigateur : ses statistiques sont
  // calculées côté client (lib/data.js), il ne part au serveur qu'au moment
  // d'entraîner, comparer ou analyser.
  function loadUpload(records, target, fileName) {
    resetForNewData();
    try {
      setDataset(datasetFromRows(records, target));
      setSource({ kind: "upload", records, target });
      setSourceLabel(fileName);
    } catch (e) { setDataError(e.message); }
  }

  async function train() {
    if (!source) { setTrainError("Chargez d'abord des données."); return; }
    setTraining(true); setTrainError(null); setTrained(null);
    try {
      const d = await api("/api/train", {
        ...sourcePayload(source),
        model: trainConfig.model || models[0] || "random_forest",
        test_size: trainConfig.testSize,
        seed: trainConfig.seed,
      });
      setTrained(d);
      setTab("predire");  // on emmène l'utilisateur vers la suite logique
    } catch (e) { setTrainError(e.message); }
    finally { setTraining(false); }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[290px_1fr]">
      <Sidebar
        models={models} apiStatus={apiStatus}
        onLoadBuiltin={loadBuiltin} onLoadUrl={loadUrl} onLoadUpload={loadUpload}
        loadingData={loadingData} dataError={dataError}
        trainConfig={trainConfig} setTrainConfig={setTrainConfig}
        onTrain={train} training={training} trained={trained} trainError={trainError}
      />
      <div className="flex min-w-0 flex-col">
        {/* Barre du haut : onglets + badge de la source active */}
        <div className="flex items-center gap-4 border-b border-(--hairline)
                        bg-(--surface) px-8 pt-3">
          <nav className="flex gap-1">
            {TABS.map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={
                  "cursor-pointer border-b-[2.5px] px-4 pb-2.5 pt-2 text-[0.92rem] " +
                  (tab === key
                    ? "border-(--accent) font-semibold text-(--accent)"
                    : "border-transparent text-(--ink-2) hover:text-(--ink)")
                }>
                {label}
              </button>
            ))}
          </nav>
          {sourceLabel && (
            <span className="ml-auto mb-1.5 max-w-[40%] truncate rounded-full border
                             border-(--hairline) bg-(--accent-tint) px-3 py-0.5
                             text-xs text-(--ink-2)">
              {sourceLabel}
            </span>
          )}
        </div>
        <main className="w-full max-w-[1080px] px-8 py-6">
          {tab === "donnees" && <DataTab dataset={dataset} />}
          {tab === "comparer" && <CompareTab source={source} models={models} />}
          {tab === "predire" && <PredictTab dataset={dataset} trained={trained} />}
          {tab === "analyse" && <ReportTab source={source} sourceLabel={sourceLabel} />}
        </main>
        <footer className="mt-auto px-8 pb-6 text-[0.8rem] text-(--muted)">
          ModeLmL, propulsé par l'API{" "}
          <a className="text-(--accent) hover:underline"
             href="https://github.com/diamankayero/trainedml">trainedml</a> ({API_URL}).
          Serveur gratuit : la première requête peut prendre ~30 s.
        </footer>
      </div>
    </div>
  );
}
