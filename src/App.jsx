import { useEffect, useState } from "react";
import { api, API_URL } from "./api";
import TrainCard from "./components/TrainCard";
import PredictCard from "./components/PredictCard";
import CompareCard from "./components/CompareCard";

export default function App() {
  const [models, setModels] = useState([]);

  useEffect(() => {
    api("/api/models")
      .then(m => setModels([...m.classifiers, ...m.regressors]))
      .catch(() => setModels([]));
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
