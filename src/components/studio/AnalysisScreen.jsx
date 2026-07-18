// Écran Analyse : l'exploration en profondeur, dessinée nativement.
// Grandes lignes :
// - tout vient de /api/analysis (des chiffres, pas des images) : les
//   distributions, la heatmap de corrélation, les manquants et les outliers
//   sont rendus avec nos propres composants ;
// - le rapport HTML complet de trainedml reste disponible en téléchargement,
//   c'est sa juste place : un export, pas un écran. Les tests de normalité
//   n'apparaissent que là : ils relèvent de la statistique, pas du ML.
"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { apiHtml, sourcePayload } from "@/lib/api";
import { CorrelationHeatmap, Histogram } from "./charts";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ScreenHeader from "@/components/ui/ScreenHeader";
import Table from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorLine } from "@/components/ui/Feedback";

export default function AnalysisScreen({ source, sourceLabel, analysis, analysisLoading }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  // Télécharge le rapport HTML complet généré par trainedml.
  async function downloadReport() {
    setDownloading(true); setError(null);
    try {
      const html = await apiHtml("/api/report", {
        ...sourcePayload(source),
        title: `Rapport exploratoire : ${sourceLabel}`,
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
      link.download = `rapport_${sourceLabel.replace(/\W+/g, "_")}.html`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) { setError(e.message); }
    finally { setDownloading(false); }
  }

  const missing = analysis?.missing.filter(m => m.count > 0) ?? [];
  const outliers = analysis?.outliers.filter(o => o.count > 0) ?? [];

  return (
    <>
      <ScreenHeader
        title="Analyse"
        description="Distributions, corrélations et diagnostics de vos variables, calculés par trainedml et dessinés ici même.">
        <Button ghost busy={downloading} onClick={downloadReport}>
          <Download className="size-4" /> Rapport complet (HTML)
        </Button>
      </ScreenHeader>
      {error && <div className="mb-4"><ErrorLine message={error} /></div>}
      {analysisLoading && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-64" /><Skeleton className="h-64" />
        </div>
      )}

      {analysis && (
        <div className="flex flex-col gap-5">
          {/* Corrélations */}
          <Card title="Corrélations entre variables"
                subtitle="Bleu : corrélation positive. Rouge : négative. Plus la couleur est soutenue, plus la relation est forte.">
            <CorrelationHeatmap columns={analysis.correlation.columns}
                                values={analysis.correlation.values} />
          </Card>

          {/* Distributions */}
          <Card title="Distributions"
                subtitle="La forme de chaque variable numérique (12 intervalles).">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
              {analysis.histograms.map(h => (
                <div key={h.column}>
                  <p className="mb-1 text-[0.83rem] font-medium text-(--ink-2)">{h.column}</p>
                  <Histogram edges={h.edges} counts={h.counts} />
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Manquants */}
            <Card title="Valeurs manquantes">
              {missing.length
                ? <Table rows={missing.map(m => ({
                    colonne: m.column, manquantes: m.count, "%": m.pct }))} />
                : <p className="text-sm text-(--good)">Aucune valeur manquante.</p>}
            </Card>
            {/* Outliers */}
            <Card title="Outliers (méthode IQR)">
              {outliers.length
                ? <Table rows={outliers.map(o => ({
                    colonne: o.column, outliers: o.count }))} />
                : <p className="text-sm text-(--good)">Aucun outlier détecté.</p>}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
