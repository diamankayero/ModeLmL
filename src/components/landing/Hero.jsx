// Le hero : la promesse du produit en une phrase, et la preuve en image.
// Style Notion : fond blanc, très grand titre noir, ton simple et direct,
// la capture réelle de l'atelier posée dans un cadre doux.
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center">
      {/* La promesse */}
      <p className="mb-4 text-sm font-semibold text-(--accent)">
        Atelier de machine learning open source
      </p>
      <h1 className="mx-auto max-w-3xl text-5xl font-extrabold leading-[1.08]
                     tracking-tight text-neutral-900 sm:text-6xl">
        Vos données ont des choses à dire.
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-600">
        Chargez un CSV, comparez des modèles de machine learning, prédisez et
        générez un rapport d'analyse complet. Sans écrire une ligne de code.
      </p>

      {/* Les deux appels à l'action */}
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/app"
          className="rounded-lg bg-(--accent) px-6 py-3 font-semibold text-white
                     transition-colors hover:bg-(--accent-strong)">
          Ouvrir l'atelier
        </Link>
        <a href="https://github.com/diamankayero/ModeLmL"
          className="rounded-lg border border-neutral-300 px-6 py-3 font-semibold
                     text-neutral-700 transition-colors hover:bg-neutral-50">
          Voir sur GitHub
        </a>
      </div>
      <p className="mt-3 text-xs text-neutral-400">
        Gratuit, sans inscription. Le serveur de démo se réveille en ~30 s.
      </p>

      {/* La preuve : une vraie boucle de l'atelier en action (pas un mockup).
          GIF non optimisable par Next (l'optimiseur casserait l'animation),
          servi tel quel via `unoptimized`. */}
      <div className="mx-auto mt-14 max-w-5xl rounded-2xl border border-black/10 bg-white
                      p-2 shadow-[0_24px_60px_-24px_rgba(74,58,167,0.25)]">
        <Image
          src="/screenshots/hero-demo.gif"
          alt="L'atelier ModeLmL en action : aperçu du dataset, exploration, comparaison de modèles par validation croisée et prédiction"
          width={900} height={580} unoptimized priority
          className="w-full rounded-xl border border-black/5"
        />
      </div>
    </section>
  );
}
