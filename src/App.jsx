import { useEffect, useState } from "react";
import { api, API_URL, sourcePayload } from "./api";
import { datasetFromRows } from "./lib/data";
import Sidebar from "./components/Sidebar";
import DataTab from "./components/DataTab";
import CompareTab from "./components/CompareTab";
import PredictTab from "./components/PredictTab";
import ReportTab from "./components/ReportTab";

const FALLBACK_MODELS = [
  "knn", "logistic", "random_forest",
  "knn_regressor", "linear", "ridge", "lasso", "random_forest_regressor",
];

const TABS = [
  ["donnees", "Données"],
  ["comparer", "Comparer"],
  ["predire", "Prédire"],
  ["analyse", "Analyse"],
];

export default function App() {
  const [models, setModels] = useState([]);
  const [apiStatus, setApiStatus] = useState("loading");

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

  // Liste des modèles, avec réessais pendant le réveil du serveur.
  useEffect(() => {
    let cancelled = false;
    async function load(attempt) {
      try {
        const m = await api("/api/models");
        if (cancelled) return;
        setModels([...m.classifiers, ...m.regressors]);
        setApiStatus("ok");
      } catch {
        if (cancelled) return;
        if (attempt < 6) setTimeout(() => load(attempt + 1), 5000);
        else { setModels(FALLBACK_MODELS); setApiStatus("fallback"); }
      }
    }
    load(0);
    return () => { cancelled = true; };
  }, []);

  // Iris chargé par défaut : l'app n'est jamais vide.
  useEffect(() => { loadBuiltin("iris"); }, []);  // eslint-disable-line

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
      setTab("predire");
    } catch (e) { setTrainError(e.message); }
    finally { setTraining(false); }
  }

  return (
    <div className="shell">
      <Sidebar
        models={models} apiStatus={apiStatus}
        onLoadBuiltin={loadBuiltin} onLoadUrl={loadUrl} onLoadUpload={loadUpload}
        loadingData={loadingData} dataError={dataError}
        trainConfig={trainConfig} setTrainConfig={setTrainConfig}
        onTrain={train} training={training} trained={trained} trainError={trainError}
      />
      <div className="content">
        <div className="topbar">
          <nav className="tabs">
            {TABS.map(([key, label]) => (
              <button key={key} className={tab === key ? "tab active" : "tab"}
                      onClick={() => setTab(key)}>{label}</button>
            ))}
          </nav>
          {sourceLabel && <span className="source-badge">{sourceLabel}</span>}
        </div>
        <main>
          {tab === "donnees" && <DataTab dataset={dataset} />}
          {tab === "comparer" && <CompareTab source={source} models={models} />}
          {tab === "predire" && <PredictTab dataset={dataset} trained={trained} />}
          {tab === "analyse" && <ReportTab source={source} sourceLabel={sourceLabel} />}
        </main>
        <footer>
          ModeLmL, propulsé par l'API{" "}
          <a href="https://github.com/diamankayero/trainedml">trainedml</a> ({API_URL}).
          Serveur gratuit : la première requête peut prendre ~30 s.
        </footer>
      </div>
    </div>
  );
}
