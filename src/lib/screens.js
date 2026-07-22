// Les cinq écrans de l'atelier : clé d'écran, libellé, icône.
// Séparé de Nav.jsx pour que ce fichier n'exporte qu'un composant
// (le rafraîchissement à chaud de Next l'exige).
import {
  LayoutDashboard, Table2, ScanSearch, BarChart3, Target,
} from "lucide-react";

export const SCREENS = [
  ["apercu", "Aperçu", LayoutDashboard],
  ["donnees", "Données", Table2],
  ["analyse", "Analyse", ScanSearch],
  ["comparaison", "Comparaison", BarChart3],
  ["prediction", "Prédiction", Target],
];
