// Hook : charge la liste des modèles disponibles, en résistant au réveil
// du serveur gratuit.
// Grandes lignes :
// - on tente /api/models ; si ça échoue (serveur endormi), on réessaie
//   jusqu'à 6 fois toutes les 5 secondes ;
// - si l'API reste muette, on bascule sur la liste connue des modèles
//   trainedml pour que l'interface reste utilisable ;
// - le statut ('loading' | 'ok' | 'fallback') permet d'informer l'utilisateur.
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const FALLBACK_MODELS = [
  "knn", "logistic", "random_forest",
  "knn_regressor", "linear", "ridge", "lasso", "random_forest_regressor",
];

export default function useModels() {
  const [models, setModels] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    async function load(attempt) {
      try {
        const m = await api("/api/models");
        if (cancelled) return;
        setModels([...m.classifiers, ...m.regressors]);
        setStatus("ok");
      } catch {
        if (cancelled) return;
        if (attempt < 6) setTimeout(() => load(attempt + 1), 5000);
        else { setModels(FALLBACK_MODELS); setStatus("fallback"); }
      }
    }
    load(0);
    return () => { cancelled = true; };
  }, []);

  return { models, status };
}
