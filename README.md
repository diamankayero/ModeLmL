# ModeLmL

L'atelier de machine learning sans code : une vitrine et une application
**Next.js + Tailwind CSS + React**, propulsées par l'API du package
[trainedml](https://github.com/diamankayero/trainedml).

**En ligne : https://modelml.vercel.app**

- **/** : la vitrine (style éditorial clair), rendue côté serveur, indexable
- **/app** : l'atelier (Aperçu, Données, Analyse, Comparaison, Prédiction)

## L'écosystème

| Projet | Rôle |
|---|---|
| [trainedml](https://github.com/diamankayero/trainedml) | Le package Python (PyPI) : Trainer, compare(), rapport EDA |
| [trainedml-webapp](https://github.com/diamankayero/trainedml-webapp) | L'API FastAPI (Render) + une page HTML minimaliste pour apprendre |
| **ModeLmL** (ce repo) | La vitrine et l'atelier, en Next.js (Vercel) |

## Lancement local

```bash
npm install
npm run dev            # http://localhost:3000, branché sur l'API en ligne
```

Contre une API locale (repo trainedml-webapp sur le port 8000) :

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

## Architecture

Le principe Next.js : le dossier `src/app/` EST le routing (un dossier = une
URL). Le reste se lit par responsabilité :

```
src/
├── app/                       # ROUTING
│   ├── layout.jsx             # commun à tout : police Inter, métadonnées
│   ├── globals.css            # Tailwind + jetons de design (clair + sombre)
│   ├── page.jsx               # URL /    : la vitrine
│   └── app/page.jsx           # URL /app : l'atelier
├── components/
│   ├── landing/               # sections de la vitrine : Navbar, Hero,
│   │                          #   Features, HowItWorks, OpenSource, Footer
│   ├── studio/                # l'atelier : Studio (état global), Nav,
│   │                          #   SourceBar, OverviewScreen, DataTab,
│   │                          #   AnalysisScreen, CompareTab, PredictScreen, charts
│   └── ui/                    # kit réutilisable : Button, Field, Table, Feedback
├── lib/                       # logique non visuelle : api.js, data.js
└── hooks/                     # état réutilisable : useModels (réessais API)
```

Règle de lecture : `app/` dit où on va, `components/` dit à quoi ça
ressemble, `lib/` et `hooks/` disent comment ça marche. Les grandes lignes de
chaque fichier sont commentées en tête de fichier.

## Fonctionnalités de l'atelier

- **Aperçu** : tableau de bord du dataset : tuiles, distribution de la cible,
  corrélations les plus fortes, points d'attention (manquants, outliers).
- **Données** : datasets intégrés, CSV par URL ou fichier uploadé (parsé dans
  le navigateur), filtres, résumé statistique, export CSV.
- **Analyse** : exploration native (heatmap de corrélation, histogrammes,
  diagnostics) dessinée avec les composants de l'app à partir de
  /api/analysis ; le rapport HTML complet (avec les tests de normalité)
  reste téléchargeable.
- **Comparaison** : choix des modèles, validation croisée, tableau trié et
  graphiques en barres SVG (score ± écart-type, temps d'entraînement).
- **Prédiction** : configuration d'entraînement contextuelle, importance des
  variables du modèle entraîné, et un champ par variable pré-rempli avec sa
  moyenne.
- Robuste au réveil du serveur gratuit (réessais, liste de secours, états
  visibles) ; mode sombre automatique dans l'atelier.

## Vérification visuelle

`scripts/visual-check.mjs` pilote Edge headless et exerce la vitrine puis les
cinq écrans de l'atelier contre l'API locale, captures d'écran à l'appui :

```bash
# terminal 1 : API locale (repo trainedml-webapp)
uvicorn api:app --port 8000
# terminal 2 : build branché dessus + serveur
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run build && npm run start
# terminal 3
node scripts/visual-check.mjs
```

## Le GIF du hero

`scripts/capture-hero-gif.mjs` génère `public/screenshots/hero-demo.gif` :
une vraie boucle de l'atelier (pas un mockup), obtenue en pilotant un
navigateur réel à travers les cinq écrans, frappe clavier comprise. Pas de
ffmpeg requis : les frames sont capturées par puppeteer, redimensionnées par
sharp et encodées en GIF par gifenc, entièrement en JavaScript.

```bash
# mêmes deux premiers terminaux que ci-dessus, puis :
node scripts/capture-hero-gif.mjs
```

À relancer après toute modification visuelle notable de l'atelier, pour que
le hero reste fidèle au produit.

## Déploiement (Vercel)

1. Créer un compte sur https://vercel.com (connexion GitHub).
2. "Add New" > "Project" > importer le repo `diamankayero/ModeLmL`.
3. Vercel détecte Next.js tout seul : aucun réglage, "Deploy".
4. Chaque push sur main redéploie automatiquement.

## Licence

MIT.
