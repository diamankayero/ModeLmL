// Le grand appel final + le pied de page.
// Dernière chance de convaincre, puis les liens utiles, sobrement.
import Link from "next/link";

export default function Footer() {
  return (
    <>
      {/* Appel final sur bandeau violet très doux */}
      <section className="bg-[#f7f6f3]">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            Prêt à faire parler vos données ?
          </h2>
          <Link href="/app"
            className="mt-6 inline-block rounded-lg bg-(--accent) px-8 py-3.5 font-semibold
                       text-white transition-colors hover:bg-(--accent-strong)">
            Ouvrir l'atelier
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2
                        px-6 py-8 text-sm text-neutral-500">
          <span className="font-bold text-neutral-800">
            Mode<span className="text-(--accent)">LmL</span>
          </span>
          <a className="hover:text-neutral-900"
             href="https://github.com/diamankayero/ModeLmL">GitHub</a>
          <a className="hover:text-neutral-900"
             href="https://pypi.org/project/trainedml/">trainedml sur PyPI</a>
          <span className="ml-auto">Licence MIT. Fait par diamankayero.</span>
        </div>
      </footer>
    </>
  );
}
