import { useEffect, useState } from "react";
import { api, API_URL } from "./api";
import TrainCard from "./components/TrainCard";
import PredictCard from "./components/PredictCard";
import CompareCard from "./components/CompareCard";

// Liste de secours si l'API reste injoignable : les modèles de trainedml
// sont stables, l'API refera autorité dès qu'elle répond.
const FALLBACK_MODELS = [
  "knn", "logistic", "random_forest",
  "knn_regressor", "linear", "ridge", "lasso", "random_forest_regressor",
];

const MAX_RETRIES = 6;
const RETRY_DELAY_MS = 5000;

export default function App() {
  const [models, setModels] = useState([]);
  // 'loading' pendant les essais, 'ok' si l'API a répondu, 'fallback' sinon
  const [apiStatus, setApiStatus] = useState("loading");

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
        if (attempt < MAX_RETRIES) {
          setTimeout(() => load(attempt + 1), RETRY_DELAY_MS);
        } else {
          setModels(FALLBACK_MODELS);
          setApiStatus("fallback");
        }
      }
    }

    load(0);
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <header>
        <div className="head-inner">
          <div className="brand">Mode<span className="accent">LmL</span></div>
          <div className="tagline">
            Explorer, entraîner et comparer des modèles de machine learning.
          </div>
          <nav>
            <a href={`${API_URL}/docs`}>API /docs</a>
            <a href="https://github.com/diamankayero/ModeLmL">GitHub</a>
          </nav>
        </div>
      </header>
      {apiStatus === "loading" && (
        <p className="api-status">
          Réveil du serveur en cours (plan gratuit, jusqu'à une minute)...
        </p>
      )}
      {apiStatus === "fallback" && (
        <p className="api-status warn">
          L'API ne répond pas pour le moment ; l'interface reste utilisable,
          réessayez dans quelques instants.
        </p>
      )}
      <main>
        <TrainCard models={models} />
        <PredictCard />
        <CompareCard />
      </main>
      <footer>
        ModeLmL, interface React propulsée par l'API{" "}
        <a href="https://github.com/diamankayero/trainedml">trainedml</a>{" "}
        ({API_URL}). La première requête peut prendre ~30 s si le serveur se réveille.
      </footer>
    </>
  );
}
