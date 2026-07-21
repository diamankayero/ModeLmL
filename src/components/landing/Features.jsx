// Les quatre fonctionnalités, en cartes façon Notion : un aperçu animé de
// l'écran réel en haut (vraie capture, pas un mockup), icône + titre + phrase
// en dessous.
import Image from "next/image";
import { Table2, BarChart3, Target, FileSearch } from "lucide-react";

// Contenu séparé du rendu : facile à relire et à modifier.
const FEATURES = [
  {
    icon: Table2, tint: "bg-violet-100 text-violet-700",
    title: "Explorez vos données",
    text: "Datasets intégrés, CSV par URL ou fichier uploadé. Filtres, résumé statistique et export en un clic.",
    gif: "feature-data.gif",
  },
  {
    icon: BarChart3, tint: "bg-blue-100 text-blue-700",
    title: "Comparez les modèles",
    text: "Validation croisée sur huit modèles classiques, tableau trié et graphiques : le meilleur saute aux yeux.",
    gif: "feature-compare.gif",
  },
  {
    icon: Target, tint: "bg-emerald-100 text-emerald-700",
    title: "Prédisez en direct",
    text: "Un formulaire pré-rempli avec des valeurs typiques : faites varier une variable et observez la prédiction changer.",
    gif: "feature-predict.gif",
  },
  {
    icon: FileSearch, tint: "bg-amber-100 text-amber-700",
    title: "Analysez en profondeur",
    text: "Corrélations, distributions et diagnostics dessinés en direct ; le rapport complet reste téléchargeable.",
    gif: "feature-analyze.gif",
  },
];

export default function Features() {
  return (
    <section id="fonctionnalites" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center text-3xl font-extrabold tracking-tight text-neutral-900">
        Tout le workflow, au même endroit
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-neutral-600">
        Cinq écrans, zéro configuration : l'atelier suit le chemin naturel
        d'un projet de machine learning.
      </p>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, tint, title, text, gif }) => (
          <div key={title}
               className="overflow-hidden rounded-2xl border border-black/10 bg-[#f7f6f3]
                          transition-transform hover:-translate-y-0.5">
            {/* Vraie capture animée de l'écran, pas un mockup */}
            <Image
              src={`/screenshots/${gif}`}
              alt={`${title} : capture animée de l'écran correspondant dans ModeLmL`}
              width={760} height={580} unoptimized
              className="w-full border-b border-black/10"
            />
            <div className="p-7">
              <span className={`inline-flex size-10 items-center justify-center rounded-lg ${tint}`}>
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-neutral-900">{title}</h3>
              <p className="mt-1.5 text-[0.95rem] leading-relaxed text-neutral-600">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
