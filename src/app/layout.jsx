// Layout racine : tout ce qui est commun à TOUTES les pages du site.
// Grandes lignes :
// - charge la police Inter (celle des grands SaaS), optimisée par Next ;
// - déclare les métadonnées (titre, description) : c'est ce que Google
//   et les réseaux sociaux affichent ;
// - enveloppe chaque page dans <html>/<body>.
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ModeLmL : l'atelier de machine learning sans code",
  description:
    "Chargez un CSV, comparez des modèles de machine learning, prédisez et " +
    "générez un rapport d'analyse complet. Sans écrire une ligne de code.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
