// Section pédagogique : pourquoi ces analyses et pas d'autres.
// Le principe du produit, expliqué au visiteur : chaque graphique de
// l'atelier répond à une question qui change une décision ; pas d'analyse
// pour l'analyse.
import { Scale, CircleOff, Grid3x3, TriangleAlert, Award } from "lucide-react";

const ANALYSES = [
  {
    icon: Scale, tint: "bg-violet-100 text-violet-700",
    title: "Distribution de la cible",
    text: "Si 90 % de vos données sont d'une seule classe, une accuracy de 90 % ne prouve rien. Connaître la distribution, c'est savoir lire ses scores.",
  },
  {
    icon: CircleOff, tint: "bg-amber-100 text-amber-700",
    title: "Valeurs manquantes",
    text: "Repérées avant l'entraînement, imputées automatiquement par le prétraitement : vous savez ce qui est comblé, et où.",
  },
  {
    icon: Grid3x3, tint: "bg-blue-100 text-blue-700",
    title: "Corrélations",
    text: "Deux variables corrélées à 0,96 racontent la même histoire : la heatmap révèle l'information en double qui fragilise les modèles linéaires.",
  },
  {
    icon: TriangleAlert, tint: "bg-rose-100 text-rose-700",
    title: "Outliers",
    text: "Les valeurs extrêmes perturbent KNN et les modèles linéaires, beaucoup moins les forêts : les connaître oriente le choix du modèle.",
  },
  {
    icon: Award, tint: "bg-emerald-100 text-emerald-700",
    title: "Importance des variables",
    text: "Après l'entraînement, le modèle révèle ce qui décide vraiment : souvent, deux ou trois variables font l'essentiel de la prédiction.",
  },
];

export default function Analyses() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center text-3xl font-extrabold tracking-tight text-neutral-900">
        Des analyses qui servent à décider
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
        Pas d'analyse pour l'analyse : chaque graphique de l'atelier répond à
        une question qui change quelque chose : quel modèle choisir, quoi
        prétraiter, comment lire les scores.
      </p>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ANALYSES.map(({ icon: Icon, tint, title, text }) => (
          <div key={title} className="rounded-2xl border border-black/10 p-6">
            <span className={`inline-flex size-9 items-center justify-center rounded-lg ${tint}`}>
              <Icon className="size-4.5" />
            </span>
            <h3 className="mt-3 font-bold text-neutral-900">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{text}</p>
          </div>
        ))}
        {/* La sixième case porte la philosophie, pour équilibrer la grille */}
        <div className="rounded-2xl bg-[#f7f6f3] p-6">
          <h3 className="font-bold text-neutral-900">Et le reste ?</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
            Les diagnostics plus statistiques (tests de normalité, VIF...) vivent
            dans le rapport HTML téléchargeable : disponibles pour les curieux,
            sans encombrer l'atelier.
          </p>
        </div>
      </div>
    </section>
  );
}
