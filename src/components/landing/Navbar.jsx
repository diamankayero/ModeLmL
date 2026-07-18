// Barre de navigation de la vitrine.
// Collée en haut (sticky) avec un léger flou de fond, comme les SaaS modernes.
// Pas de "use client" : aucun état, Next peut la rendre côté serveur.
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-3.5">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          Mode<span className="text-(--accent)">LmL</span>
        </Link>
        <nav className="hidden gap-6 text-sm text-neutral-600 sm:flex">
          <a href="#fonctionnalites" className="hover:text-neutral-900">Fonctionnalités</a>
          <a href="#comment" className="hover:text-neutral-900">Comment ça marche</a>
          <a href="#opensource" className="hover:text-neutral-900">Open source</a>
        </nav>
        <Link href="/app"
          className="ml-auto rounded-lg bg-(--accent) px-4 py-2 text-sm font-semibold
                     text-white transition-colors hover:bg-(--accent-strong)">
          Ouvrir l'atelier
        </Link>
      </div>
    </header>
  );
}
