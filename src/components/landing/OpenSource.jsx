// Section open source : les trois briques de l'écosystème, chacune sa carte.
// C'est aussi la crédibilité du projet : tout le code est public.
import { GitBranch } from "lucide-react";

const REPOS = [
  {
    name: "trainedml",
    role: "Le package Python, publié sur PyPI : Trainer, compare(), rapport EDA.",
    href: "https://github.com/diamankayero/trainedml",
  },
  {
    name: "trainedml-webapp",
    role: "L'API FastAPI qui sert les calculs, et une page HTML minimaliste pour apprendre.",
    href: "https://github.com/diamankayero/trainedml-webapp",
  },
  {
    name: "ModeLmL",
    role: "Cette application : Next.js, Tailwind, React. La vitrine et l'atelier.",
    href: "https://github.com/diamankayero/ModeLmL",
  },
];

export default function OpenSource() {
  return (
    <section id="opensource" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center text-3xl font-extrabold tracking-tight text-neutral-900">
        Ouvert de bout en bout
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-neutral-600">
        Du package Python à cette page, tout est open source sous licence MIT.
        Trois dépôts, trois responsabilités.
      </p>
      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {REPOS.map(({ name, role, href }) => (
          <a key={name} href={href}
             className="group rounded-2xl border border-black/10 p-6 transition-colors
                        hover:border-(--accent)">
            <div className="flex items-center gap-2 font-bold text-neutral-900">
              <GitBranch className="size-4 text-neutral-500 group-hover:text-(--accent)" />
              {name}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{role}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
