// Onglet Analyse : le rapport exploratoire complet, généré par trainedml.
// Grandes lignes :
// - un clic envoie la source de données au serveur, qui renvoie un rapport
//   HTML auto-contenu (statistiques, corrélations, distributions, outliers,
//   normalité, VIF, figures embarquées) ;
// - le rapport s'affiche dans une iframe isolée (sandbox), avec possibilité
//   de l'ouvrir en plein onglet.
"use client";
import { useState } from "react";
import { apiHtml, sourcePayload } from "@/lib/api";
import Button from "@/components/ui/Button";
import { ErrorLine } from "@/components/ui/Feedback";

export default function ReportTab({ source, sourceLabel }) {
  const [busy, setBusy] = useState(false);
  const [html, setHtml] = useState(null);
  const [error, setError] = useState(null);

  if (!source) {
    return <p className="mt-8 italic text-(--muted)">
      Chargez des données depuis le panneau de gauche.
    </p>;
  }

  async function generate() {
    setBusy(true); setError(null);
    try {
      setHtml(await apiHtml("/api/report", {
        ...sourcePayload(source),
        title: `Rapport exploratoire : ${sourceLabel}`,
      }));
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  // Ouvre le rapport dans un nouvel onglet du navigateur (via un blob local).
  function openInTab() {
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    window.open(url, "_blank");
  }

  return (
    <>
      <p className="text-sm text-(--ink-2)">
        Le rapport rassemble toute l'analyse exploratoire de trainedml :
        statistiques descriptives, valeurs manquantes, corrélations avec
        heatmap, distributions, outliers, tests de normalité et VIF. Les
        figures sont calculées côté serveur : comptez quelques secondes.
      </p>
      <div className="my-4 flex flex-wrap gap-3">
        <Button busy={busy} onClick={generate}>
          {html ? "Régénérer le rapport" : "Générer le rapport"}
        </Button>
        {html && <Button ghost onClick={openInTab}>Ouvrir dans un onglet</Button>}
      </div>
      {error && <ErrorLine message={error} />}
      {html && (
        <iframe
          className="mt-2 h-[75vh] w-full rounded-xl border border-(--hairline) bg-white"
          title="Rapport exploratoire" sandbox="" srcDoc={html}
        />
      )}
    </>
  );
}
