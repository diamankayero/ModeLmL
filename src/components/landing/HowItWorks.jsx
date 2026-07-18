// "Comment ça marche" : le parcours en trois étapes numérotées.
// Sur fond beige pour rythmer la page (alternance blanc / beige, façon Notion).
const STEPS = [
  {
    num: "1", title: "Chargez vos données",
    text: "Un dataset d'exemple, l'URL d'un CSV en ligne ou un fichier de votre machine : l'atelier détecte tout seul s'il s'agit de classification ou de régression.",
  },
  {
    num: "2", title: "Comparez les modèles",
    text: "La validation croisée entraîne chaque modèle plusieurs fois et classe les résultats. Le prétraitement (normalisation, encodage) est automatique.",
  },
  {
    num: "3", title: "Prédisez et analysez",
    text: "Testez le modèle champion sur vos propres valeurs, puis générez le rapport d'analyse exploratoire complet de vos données.",
  },
];

export default function HowItWorks() {
  return (
    <section id="comment" className="bg-[#f7f6f3]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-neutral-900">
          Trois étapes, cinq minutes
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {STEPS.map(({ num, title, text }) => (
            <div key={num}>
              <span className="inline-flex size-9 items-center justify-center rounded-full
                               bg-(--accent) text-sm font-bold text-white">
                {num}
              </span>
              <h3 className="mt-3 text-lg font-bold text-neutral-900">{title}</h3>
              <p className="mt-1.5 text-[0.95rem] leading-relaxed text-neutral-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
