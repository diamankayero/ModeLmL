// Écran Aperçu : le tableau de bord qui accueille après le chargement.
// Grandes lignes :
// - tuiles de synthèse (observations, variables, cible...) ;
// - distribution de la cible (barres pour des classes, histogramme sinon) ;
// - les corrélations les plus fortes entre variables (bleu : positive,
//   rouge : négative) ;
// - les points d'attention : manquants, outliers, variables non normales.
"use client";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import HBarChart, { Histogram } from "./charts";
import Card from "@/components/ui/Card";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { SkeletonTiles, Skeleton } from "@/components/ui/Skeleton";
import { Tile } from "@/components/ui/Feedback";

// Extrait les paires de corrélation les plus fortes de la matrice.
function topCorrelations(correlation, k = 5) {
  const { columns, values } = correlation;
  const pairs = [];
  for (let i = 0; i < columns.length; i++) {
    for (let j = i + 1; j < columns.length; j++) {
      const r = values[i][j];
      if (r !== null) pairs.push({ a: columns[i], b: columns[j], r });
    }
  }
  return pairs.sort((x, y) => Math.abs(y.r) - Math.abs(x.r)).slice(0, k);
}

export default function OverviewScreen({ dataset, analysis, analysisLoading }) {
  if (!dataset) return null;

  const missingTotal = analysis?.missing.reduce((s, m) => s + m.count, 0);
  const outlierCols = analysis?.outliers.filter(o => o.count > 0) ?? [];
  const nonNormal = analysis?.normality.filter(n => !n.normal) ?? [];

  return (
    <>
      <ScreenHeader
        title="Aperçu"
        description="L'essentiel de votre dataset en un coup d'œil : composition, cible, relations entre variables et points d'attention."
      />

      {/* Tuiles de synthèse */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        <Tile label="observations" value={dataset.n_rows} />
        <Tile label="variables" value={dataset.feature_names.length} />
        <Tile label="cible" value={dataset.target} small />
        {dataset.classes
          ? <Tile label="classes" value={dataset.classes.length} />
          : <Tile label="type de cible" value="continue" small />}
        {analysis && <Tile label="valeurs manquantes" value={missingTotal} />}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Distribution de la cible */}
        <Card title="Distribution de la cible"
              subtitle={`Comment se répartit ${dataset.target}.`}>
          {analysisLoading && <Skeleton className="h-40" />}
          {analysis?.target.kind === "classes" && (
            <HBarChart
              items={analysis.target.items.map(i => ({ label: i.label, value: i.count }))}
              format={v => String(v)}
            />
          )}
          {analysis?.target.kind === "histogram" && (
            <Histogram edges={analysis.target.edges} counts={analysis.target.counts}
                       height={140} />
          )}
        </Card>

        {/* Corrélations les plus fortes */}
        <Card title="Corrélations les plus fortes"
              subtitle="Bleu : corrélation positive. Rouge : négative. Détail dans l'écran Analyse.">
          {analysisLoading && <Skeleton className="h-40" />}
          {analysis && analysis.correlation.columns.length >= 2 && (
            <HBarChart
              labelW={210}
              items={topCorrelations(analysis.correlation).map(p => ({
                label: `${p.a} × ${p.b}`,
                value: Math.abs(p.r),
                bar: p.r >= 0 ? "--bar-alt" : "--corr-neg",
              }))}
              max={1}
              format={v => v.toFixed(2)}
            />
          )}
        </Card>
      </div>

      {/* Points d'attention */}
      <Card className="mt-5" title="Points d'attention"
            subtitle="Ce que l'analyse automatique a repéré dans vos données.">
        {analysisLoading && <Skeleton className="h-16" />}
        {analysis && (
          <ul className="flex flex-col gap-2 text-sm">
            <li className="flex items-center gap-2">
              {missingTotal > 0
                ? <AlertTriangle className="size-4 text-(--critical)" />
                : <CheckCircle2 className="size-4 text-(--good)" />}
              {missingTotal > 0
                ? `${missingTotal} valeur(s) manquante(s) ; le prétraitement les imputera automatiquement.`
                : "Aucune valeur manquante."}
            </li>
            <li className="flex items-center gap-2">
              {outlierCols.length > 0
                ? <AlertTriangle className="size-4 text-(--critical)" />
                : <CheckCircle2 className="size-4 text-(--good)" />}
              {outlierCols.length > 0
                ? `Outliers détectés sur ${outlierCols.length} variable(s) : ${outlierCols.map(o => o.column).join(", ")}.`
                : "Aucun outlier détecté (méthode IQR)."}
            </li>
            <li className="flex items-center gap-2">
              {nonNormal.length > 0
                ? <AlertTriangle className="size-4 text-(--critical)" />
                : <CheckCircle2 className="size-4 text-(--good)" />}
              {nonNormal.length > 0
                ? `${nonNormal.length} variable(s) non normale(s) au test de Shapiro-Wilk.`
                : "Toutes les variables passent le test de normalité."}
            </li>
          </ul>
        )}
      </Card>
    </>
  );
}
