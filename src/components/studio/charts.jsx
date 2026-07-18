// Graphique en barres horizontales, en SVG pur.
// Règles de lecture (héritées du système de visualisation du projet) :
// - une mesure = une teinte ; la couleur ne code jamais l'identité des
//   lignes, ce sont les libellés qui s'en chargent ;
// - barres fines, extrémité arrondie côté donnée, base carrée sur l'axe ;
// - valeurs affichées directement au bout des barres (pas de survol requis).
"use client";

const BAR_H = 12;
const ROW_H = 30;
const LABEL_W = 150;
const VALUE_W = 92;

// Rectangle arrondi uniquement à droite (extrémité de la donnée).
function barPath(x, y, w, h) {
  const r = Math.min(4, w);
  return `M${x},${y} h${w - r} a${r},${r} 0 0 1 ${r},${r} v${h - 2 * r}
          a${r},${r} 0 0 1 -${r},${r} h-${w - r} z`;
}

export default function HBarChart({ title, items, max, format, barVar = "--accent" }) {
  if (!items?.length) return null;
  const domainMax = max ?? Math.max(...items.map(i => i.value)) * 1.05;
  const chartW = 320;
  const height = items.length * ROW_H + 6;
  const scale = v => (domainMax > 0 ? (v / domainMax) * chartW : 0);
  const fmt = format ?? (v => v.toFixed(3));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => t * domainMax);

  return (
    <figure className="m-0 min-w-0 flex-1 basis-[340px]">
      <figcaption className="mb-2 text-sm font-semibold text-(--ink-2)">{title}</figcaption>
      <svg
        viewBox={`0 0 ${LABEL_W + chartW + VALUE_W} ${height}`}
        role="img" aria-label={title}
        className="h-auto w-full max-w-[620px]"
      >
        {/* Grille verticale discrète + axe de base */}
        {ticks.map(t => (
          <line key={t}
            x1={LABEL_W + scale(t)} y1={0}
            x2={LABEL_W + scale(t)} y2={height - 4}
            stroke="var(--grid)" strokeWidth="1" />
        ))}
        <line x1={LABEL_W} y1={0} x2={LABEL_W} y2={height - 4}
              stroke="var(--baseline)" strokeWidth="1" />
        {/* Une ligne par élément : libellé, barre, valeur directe */}
        {items.map((item, i) => {
          const y = i * ROW_H + (ROW_H - BAR_H) / 2;
          const w = Math.max(scale(item.value), 2);
          return (
            <g key={item.label}>
              <title>{`${item.label} : ${fmt(item.value)}${
                item.std !== undefined ? ` ± ${fmt(item.std)}` : ""}`}</title>
              <text x={LABEL_W - 10} y={y + BAR_H - 2} textAnchor="end"
                    fontSize="12" fill="var(--ink-2)">
                {item.label}
              </text>
              <path d={barPath(LABEL_W, y, w, BAR_H)} fill={`var(${barVar})`} />
              <text x={LABEL_W + w + 8} y={y + BAR_H - 2}
                    fontSize="12" fill="var(--ink)" fontWeight="600">
                {fmt(item.value)}
                {item.std !== undefined && (
                  <tspan fill="var(--muted)" fontWeight="400"> ± {fmt(item.std)}</tspan>
                )}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
