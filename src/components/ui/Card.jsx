// Carte de contenu : le conteneur standard des écrans de l'atelier.
// Un titre optionnel, un sous-titre optionnel, et le contenu.
"use client";

export default function Card({ title, subtitle, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-(--hairline) bg-(--surface) p-5 ${className}`}>
      {title && <h2 className="text-[0.95rem] font-semibold">{title}</h2>}
      {subtitle && <p className="mt-0.5 mb-3 text-[0.83rem] text-(--muted)">{subtitle}</p>}
      {!subtitle && title && <div className="mb-3" />}
      {children}
    </section>
  );
}
