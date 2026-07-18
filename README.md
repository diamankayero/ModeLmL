# ModeLmL

Interface **React** pour explorer, entraîner et comparer des modèles de
machine learning. Propulsée par l'API du package
[trainedml](https://github.com/diamankayero/trainedml) ; frontend 100 %
statique, déployé sur GitHub Pages.

**En ligne : https://diamankayero.github.io/ModeLmL/**

## L'écosystème

| Projet | Rôle |
|---|---|
| [trainedml](https://github.com/diamankayero/trainedml) | Le package Python (PyPI) : Trainer, compare(), rapport EDA |
| [trainedml-webapp](https://github.com/diamankayero/trainedml-webapp) | L'API FastAPI + une page HTML/JS sans framework, la version la plus lisible pour apprendre |
| **ModeLmL** (ce repo) | La même interface en React : composants, état, build, la version industrielle |

Les deux frontends consomment exactement la même API : c'est la
démonstration du pattern « le backend ne bouge pas, le frontend est
interchangeable ».

## Lancement local

```bash
npm install
npm run dev          # http://localhost:5173, branché sur l'API en ligne
```

Pour travailler contre une API locale (repo trainedml-webapp lancé sur le
port 8000) :

```bash
VITE_API_URL=http://localhost:8000 npm run dev
```

## Fonctionnalités

- **Données** : datasets intégrés, CSV par URL ou fichier uploadé (séparateur
  au choix), sélection de colonnes, filtre par valeur, résumé statistique,
  export CSV.
- **Comparer** : choix des modèles, validation croisée, tableau trié et
  graphiques en barres (score ± écart-type, temps d'entraînement).
- **Prédire** : un champ par variable pré-rempli avec sa moyenne, prédiction
  avec le dernier modèle entraîné.
- **Analyse** : rapport exploratoire complet de trainedml (corrélations,
  distributions, outliers, normalité, VIF) intégré dans la page.
- Robuste au réveil du serveur gratuit : réessais, liste de secours, états
  visibles. Mode sombre automatique.

## Structure

```
src/
├── api.js                  # client HTTP (URL surchargeable via VITE_API_URL)
├── App.jsx                 # état global : source de données, entraînement, onglets
├── lib/data.js             # parsing CSV, statistiques client, export
├── components/
│   ├── Sidebar.jsx         # source de données (intégré/URL/fichier) + entraînement
│   ├── DataTab.jsx         # exploration : table, filtres, describe, export
│   ├── CompareTab.jsx      # comparaison multi-modèles + graphiques
│   ├── PredictTab.jsx      # formulaire de prédiction par variable
│   ├── ReportTab.jsx       # rapport EDA intégré
│   ├── charts.jsx          # barres horizontales SVG (une mesure, une teinte)
│   └── ui.jsx              # bouton, erreur, champ, tableau générique
└── index.css               # jetons de design (violet, clair + sombre)
```

## Vérification visuelle

`scripts/visual-check.mjs` pilote Edge headless et exerce les quatre onglets
contre une API locale (captures d'écran à l'appui) :

```bash
# terminal 1 : API locale (repo trainedml-webapp)
uvicorn api:app --port 8000
# terminal 2 : build local branché dessus + preview
VITE_API_URL=http://localhost:8000 npm run build && npm run preview -- --port 4173
# terminal 3
node scripts/visual-check.mjs
```

## Build et déploiement

```bash
npm run build        # produit dist/
npm run preview      # sert dist/ en local
```

Chaque push sur main déclenche le workflow GitHub Actions qui build et
déploie sur GitHub Pages (`.github/workflows/deploy.yml`). Le chemin de
base `/ModeLmL/` est configuré dans `vite.config.js`.

## Notes

- L'API en ligne (plan gratuit Render) s'endort après 15 min d'inactivité :
  la première requête peut prendre ~30 s.
- Mode sombre automatique selon le réglage du système.

## Licence

MIT.
