// Bouton standard de l'app, en trois variantes :
// - primaire (violet plein) : l'action principale d'un écran ;
// - ghost (contour) : les actions secondaires ;
// - un état occupé avec spinner intégré, qui désactive le clic.
"use client";

export default function Button({ busy, ghost, onClick, children, className = "" }) {
  const base =
    "inline-flex w-fit items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold " +
    "transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-progress " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)";
  const look = ghost
    ? "border border-(--accent) text-(--accent) bg-transparent hover:bg-(--accent-tint)"
    : "bg-(--accent) text-(--accent-ink) hover:bg-(--accent-strong)";
  return (
    <button className={`${base} ${look} ${className}`} disabled={busy} onClick={onClick}>
      {busy && (
        <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
