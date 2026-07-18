// Petits composants de retour utilisateur : erreurs, tuiles de statistiques,
// puces sélectionnables, titres de section. Regroupés ici parce qu'ils font
// tous la même chose : donner de l'information d'un coup d'œil.
"use client";

// Ligne d'erreur : rouge, précédée d'une croix.
export function ErrorLine({ message }) {
  return (
    <span className="text-sm font-medium text-(--critical)">
      {"✕"} {message}
    </span>
  );
}

// Tuile de statistique : un libellé discret, une grande valeur.
export function Tile({ label, value, small }) {
  return (
    <div className="rounded-xl border border-(--hairline) bg-(--surface) px-4 py-3">
      <div className="text-xs text-(--muted)">{label}</div>
      <div className={small
        ? "mt-1 text-[0.95rem] font-semibold"
        : "text-[1.4rem] font-semibold tracking-tight"}>
        {value}
      </div>
    </div>
  );
}

// Puce cliquable (sélection de colonnes ou de modèles).
export function Chip({ on, onClick, children }) {
  return (
    <button onClick={onClick}
      className={
        "cursor-pointer rounded-full border px-3 py-1 text-[0.83rem] transition-colors " +
        (on
          ? "border-(--accent) bg-(--accent-tint) font-semibold text-(--accent)"
          : "border-(--grid) bg-(--surface) text-(--ink-2) hover:border-(--accent)")
      }>
      {children}
    </button>
  );
}

// Titre de section de l'atelier : petites capitales discrètes.
export function SectionTitle({ children }) {
  return (
    <h3 className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wider text-(--muted)">
      {children}
    </h3>
  );
}
