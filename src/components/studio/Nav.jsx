// Navigation latérale de l'atelier : fine, par écrans, façon data-app.
// Grandes lignes :
// - la marque en haut (lien vers la vitrine) ;
// - un bouton par écran (icône + libellé), l'écran actif surligné ;
// - en bas, la pastille d'état de l'API (verte : ok, grise : réveil,
//   rouge : injoignable).
"use client";
import { SCREENS } from "@/lib/screens";

const STATUS = {
  ok: ["bg-(--good)", "API en ligne"],
  loading: ["bg-(--muted)", "Réveil du serveur..."],
  fallback: ["bg-(--critical)", "API injoignable"],
};

export default function Nav({ screen, onNavigate, apiStatus }) {
  const [dot, label] = STATUS[apiStatus] ?? STATUS.loading;
  return (
    <nav className="flex h-full flex-col border-r border-(--hairline) bg-(--surface) px-3 py-5">
      <a href="/" className="px-2 text-lg font-extrabold tracking-tight">
        Mode<span className="text-(--accent)">LmL</span>
      </a>
      <div className="mt-6 flex flex-col gap-1">
        {SCREENS.map(([key, label, Icon]) => (
          <button key={key} onClick={() => onNavigate(key)}
            className={
              "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm " +
              "transition-colors " +
              (screen === key
                ? "bg-(--accent-tint) font-semibold text-(--accent)"
                : "text-(--ink-2) hover:bg-(--accent-tint) hover:text-(--ink)")
            }>
            <Icon className="size-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-2 px-3 text-xs text-(--muted)">
        <span className={`size-2 rounded-full ${dot}`} />
        <span className="hidden sm:inline">{label}</span>
      </div>
    </nav>
  );
}
