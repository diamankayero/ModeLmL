// Squelettes de chargement : des blocs gris qui pulsent, à la place du
// contenu en cours de calcul. Bien plus agréable qu'un simple spinner.
"use client";

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-(--grid) ${className}`} />;
}

// Grille de tuiles fantômes (pour l'Aperçu pendant le chargement).
export function SkeletonTiles({ count = 4 }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-[74px]" />
      ))}
    </div>
  );
}
