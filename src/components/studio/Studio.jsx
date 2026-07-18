// L'atelier complet : c'est ici que vit tout l'état partagé.
// Grandes lignes :
// - source   : d'où viennent les données (intégré, URL, upload) ;
// - dataset  : les données et leurs statistiques ;
// - analysis : l'analyse exploratoire en chiffres (/api/analysis),
//   chargée dès qu'un dataset arrive, consommée par Aperçu et Analyse ;
// - trained  : le dernier modèle entraîné (écran Prédiction) ;
// - screen   : l'écran actif de la navigation latérale.
"use client";
import { useEffect, useState } from "react";
import { api, sourcePayload } from "@/lib/api";
import { datasetFromRows } from "@/lib/data";
import useModels from "@/hooks/useModels";
import Nav from "./Nav";
import SourceBar from "./SourceBar";
import OverviewScreen from "./OverviewScreen";
import DataTab from "./DataTab";
import AnalysisScreen from "./AnalysisScreen";
import CompareTab from "./CompareTab";
import PredictScreen from "./PredictScreen";
import ScreenHeader from "@/components/ui/ScreenHeader";

export default function Studio() {
  const { models, status: apiStatus } = useModels();

  const [screen, setScreen] = useState("apercu");
  const [sourceOpen, setSourceOpen] = useState(false);

  const [source, setSource] = useState(null);
  const [sourceLabel, setSourceLabel] = useState("");
  const [dataset, setDataset] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState(null);

  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const [trainConfig, setTrainConfig] = useState({ model: "", testSize: 0.2, seed: 42 });
  const [trained, setTrained] = useState(null);
  const [training, setTraining] = useState(false);
  const [trainError, setTrainError] = useState(null);

  // Iris chargé par défaut : l'atelier n'est jamais vide.
  useEffect(() => { loadBuiltin("iris"); }, []);  // eslint-disable-line

  // Dès qu'une source est active, on lance l'analyse exploratoire en fond :
  // l'Aperçu et l'Analyse seront prêts (ou presque) quand on y arrive.
  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    setAnalysis(null); setAnalysisLoading(true);
    api("/api/analysis", sourcePayload(source))
      .then(d => { if (!cancelled) setAnalysis(d); })
      .catch(() => { /* l'analyse est un confort, pas un bloquant */ })
      .finally(() => { if (!cancelled) setAnalysisLoading(false); });
    return () => { cancelled = true; };
  }, [source]);

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
      setSourceOpen(false);
      setScreen("apercu");
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
      setSourceOpen(false);
      setScreen("apercu");
    } catch (e) { setDataError(e.message); }
    finally { setLoadingData(false); }
  }

  // Un fichier uploadé reste dans le navigateur : ses statistiques sont
  // calculées côté client, il ne part au serveur qu'au moment d'entraîner,
  // comparer ou analyser.
  function loadUpload(records, target, fileName) {
    resetForNewData();
    try {
      setDataset(datasetFromRows(records, target));
      setSource({ kind: "upload", records, target });
      setSourceLabel(fileName);
      setSourceOpen(false);
      setScreen("apercu");
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
    } catch (e) { setTrainError(e.message); }
    finally { setTraining(false); }
  }

  return (
    <div className="grid min-h-screen grid-cols-[56px_1fr] sm:grid-cols-[210px_1fr]">
      <Nav screen={screen} onNavigate={setScreen} apiStatus={apiStatus} />
      <div className="flex min-w-0 flex-col">
        <SourceBar
          sourceLabel={sourceLabel} dataset={dataset}
          open={sourceOpen} setOpen={setSourceOpen}
          onLoadBuiltin={loadBuiltin} onLoadUrl={loadUrl} onLoadUpload={loadUpload}
          loadingData={loadingData} dataError={dataError}
        />
        <main className="w-full max-w-[1150px] px-8 py-6">
          {screen === "apercu" && (
            <OverviewScreen dataset={dataset} analysis={analysis}
                            analysisLoading={analysisLoading} />
          )}
          {screen === "donnees" && (
            <>
              <ScreenHeader
                title="Données"
                description="Les lignes de votre dataset : sélectionnez, filtrez, exportez."
              />
              <DataTab dataset={dataset} />
            </>
          )}
          {screen === "analyse" && (
            <AnalysisScreen source={source} sourceLabel={sourceLabel}
                            analysis={analysis} analysisLoading={analysisLoading} />
          )}
          {screen === "comparaison" && (
            <>
              <ScreenHeader
                title="Comparaison"
                description="Mettez les modèles en compétition par validation croisée : le meilleur en tête."
              />
              <CompareTab source={source} models={models} />
            </>
          )}
          {screen === "prediction" && (
            <PredictScreen
              dataset={dataset} models={models}
              trainConfig={trainConfig} setTrainConfig={setTrainConfig}
              onTrain={train} training={training} trained={trained}
              trainError={trainError}
            />
          )}
        </main>
        <footer className="mt-auto px-8 pb-5 text-[0.78rem] text-(--muted)">
          ModeLmL, propulsé par{" "}
          <a className="text-(--accent) hover:underline"
             href="https://github.com/diamankayero/trainedml">trainedml</a>.
          Serveur gratuit : la première requête peut prendre ~30 s.
        </footer>
      </div>
    </div>
  );
}
