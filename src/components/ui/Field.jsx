// Champ de formulaire : un libellé discret au-dessus d'un contrôle.
// Les <select>, <input> et <textarea> passés en enfant héritent du style
// via la classe .field-input à appliquer par l'appelant.
"use client";

export function Field({ label, children }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-xs text-(--muted)">{label}</span>
      {children}
    </label>
  );
}

// Classes partagées par tous les contrôles de saisie de l'app.
export const inputCls =
  "rounded-lg border border-(--grid) bg-(--plane) px-2.5 py-1.5 text-sm text-(--ink) " +
  "max-w-full focus:outline-2 focus:outline-offset-1 focus:outline-(--accent)";
