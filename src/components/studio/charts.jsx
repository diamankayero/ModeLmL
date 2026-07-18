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

export default function HBarChart({ title, items, max, format, barVar = "--accent", labelW = LABEL_W }) {
  if (!items?.length) return null;
  const domainMax = max ?? Math.max(...items.map(i => i.value)) * 1.05;
  const L = labelW;
  const chartW = 320;
  const height = items.length * ROW_H + 6;
  const scale = v => (domainMax > 0 ? (v / domainMax) * chartW : 0);
  const fmt = format ?? (v => v.toFixed(3));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => t * domainMax);

  return (
    <figure className="m-0 min-w-0 flex-1 basis-[340px]">
      <figcaption className="mb-2 text-sm font-semibold text-(--ink-2)">{title}</figcaption>
      <svg
        viewBox={`0 0 ${L + chartW + VALUE_W} ${height}`}
        role="img" aria-label={title}
        className="h-auto w-full max-w-[620px]"
      >
        {/* Grille verticale discrète + axe de base */}
        {ticks.map(t => (
          <line key={t}
            x1={L + scale(t)} y1={0}
            x2={L + scale(t)} y2={height - 4}
            stroke="var(--grid)" strokeWidth="1" />
        ))}
        <line x1={L} y1={0} x2={L} y2={height - 4}
              stroke="var(--baseline)" strokeWidth="1" />
        {/* Une ligne par élément : libellé, barre, valeur directe */}
        {items.map((item, i) => {
          const y = i * ROW_H + (ROW_H - BAR_H) / 2;
          const w = Math.max(scale(item.value), 2);
          return (
            <g key={item.label}>
              <title>{`${item.label} : ${fmt(item.value)}${
                item.std !== undefined ? ` ± ${fmt(item.std)}` : ""}`}</title>
              <text x={L - 10} y={y + BAR_H - 2} textAnchor="end"
                    fontSize="12" fill="var(--ink-2)">
                {item.label}
              </text>
              <path d={barPath(L, y, w, BAR_H)}
                    fill={`var(${item.bar ?? barVar})`} />
              <text x={L + w + 8} y={y + BAR_H - 2}
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

// ---------------------------------------------------------------------------
// Histogramme en colonnes : distribution d'une variable numérique.
// Une seule teinte (c'est une magnitude), colonnes fines avec un léger
// espace, bornes min/max affichées sous l'axe.
export function Histogram({ edges, counts, barVar = "--accent", height = 90 }) {
  if (!counts?.length) return null;
  const maxCount = Math.max(...counts);
  const w = 220;
  const gap = 2;
  const colW = (w - gap * (counts.length - 1)) / counts.length;
  return (
    <svg viewBox={`0 0 ${w} ${height + 16}`} className="h-auto w-full"
         role="img" aria-label="histogramme">
      {counts.map((c, i) => {
        const h = maxCount ? (c / maxCount) * height : 0;
        return (
          <rect key={i}
            x={i * (colW + gap)} y={height - h}
            width={colW} height={Math.max(h, 1)}
            rx="1.5" fill={`var(${barVar})`}>
            <title>{`[${edges[i]} ; ${edges[i + 1]}] : ${c}`}</title>
          </rect>
        );
      })}
      <line x1="0" y1={height} x2={w} y2={height}
            stroke="var(--baseline)" strokeWidth="1" />
      <text x="0" y={height + 12} fontSize="9" fill="var(--muted)">{edges[0]}</text>
      <text x={w} y={height + 12} fontSize="9" fill="var(--muted)"
            textAnchor="end">{edges[edges.length - 1]}</text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Heatmap de corrélation : matrice carrée, échelle divergente
// (bleu = positif, rouge = négatif, neutre à zéro) obtenue par color-mix,
// donc correcte dans les deux thèmes. Valeurs affichées dans les cellules.
export function CorrelationHeatmap({ columns, values }) {
  if (!columns?.length) return null;
  const n = columns.length;
  const cell = 44;
  const labelW = 110;
  const size = labelW + n * cell;

  // Couleur d'une cellule : mélange entre le neutre et le pôle du signe.
  const fillFor = r => {
    if (r === null) return "var(--corr-neutral)";
    const pole = r >= 0 ? "var(--bar-alt)" : "var(--corr-neg)";
    return `color-mix(in oklab, ${pole} ${Math.round(Math.abs(r) * 100)}%, var(--corr-neutral))`;
  };

  return (
    <svg viewBox={`0 0 ${size + 60} ${size}`} className="h-auto w-full max-w-[600px]"
         role="img" aria-label="matrice de corrélation">
      {columns.map((col, j) => (
        <text key={`c${j}`} x={labelW + j * cell + cell / 2} y={labelW - 10}
              fontSize="10" fill="var(--ink-2)" textAnchor="start"
              transform={`rotate(-45 ${labelW + j * cell + cell / 2} ${labelW - 10})`}>
          {col}
        </text>
      ))}
      {columns.map((row, i) => (
        <g key={`r${i}`}>
          <text x={labelW - 8} y={labelW + i * cell + cell / 2 + 3}
                fontSize="10" fill="var(--ink-2)" textAnchor="end">{row}</text>
          {columns.map((col, j) => {
            const r = values[i][j];
            return (
              <g key={j}>
                <rect x={labelW + j * cell + 1} y={labelW + i * cell + 1}
                      width={cell - 2} height={cell - 2} rx="4"
                      style={{ fill: fillFor(r) }}>
                  <title>{`${row} / ${col} : ${r ?? "?"}`}</title>
                </rect>
                <text x={labelW + j * cell + cell / 2} y={labelW + i * cell + cell / 2 + 3}
                      fontSize="9.5" textAnchor="middle"
                      fill={r !== null && Math.abs(r) > 0.55 ? "#ffffff" : "var(--ink-2)"}>
                  {r === null ? "" : r.toFixed(2)}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
