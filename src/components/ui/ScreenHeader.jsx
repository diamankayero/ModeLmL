// En-tête d'écran : chaque écran de l'atelier commence par lui.
// Un titre, une phrase qui explique à quoi sert l'écran, et un emplacement
// pour les actions (boutons) alignées à droite.
"use client";

export default function ScreenHeader({ title, description, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 max-w-xl text-sm text-(--ink-2)">{description}</p>
        )}
      </div>
      {children && <div className="flex shrink-0 gap-3">{children}</div>}
    </div>
  );
}
