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

## Structure

```
src/
├── api.js                  # client HTTP (URL surchargeable via VITE_API_URL)
├── App.jsx                 # mise en page : header, les 3 cartes, footer
├── components/
│   ├── TrainCard.jsx       # étape 1 : entraîner, scores en tuiles
│   ├── PredictCard.jsx     # étape 2 : prédire, résultats en pastilles
│   ├── CompareCard.jsx     # étape 3 : comparer, tableau + barres de score
│   └── ui.jsx              # bouton avec spinner, ligne d'erreur
└── index.css               # jetons de design (clair + sombre automatique)
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
