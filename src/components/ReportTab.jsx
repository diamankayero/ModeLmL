import { useState } from "react";
import { apiHtml, sourcePayload } from "../api";
import { ActionButton, ErrorLine } from "./ui";

// Onglet Analyse : rapport exploratoire complet généré par trainedml
// (statistiques, corrélations, distributions, outliers, normalité, VIF),
// affiché dans un cadre isolé.
export default function ReportTab({ source, sourceLabel }) {
  const [busy, setBusy] = useState(false);
  const [html, setHtml] = useState(null);
  const [error, setError] = useState(null);

  if (!source) {
    return <p className="placeholder">Chargez des données depuis le panneau de gauche.</p>;
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

  function openInTab() {
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    window.open(url, "_blank");
  }

  return (
    <>
      <p className="meta">
        Le rapport rassemble toute l'analyse exploratoire de trainedml :
        statistiques descriptives, valeurs manquantes, corrélations avec
        heatmap, distributions, outliers, tests de normalité et VIF. Les
        figures sont calculées côté serveur : comptez quelques secondes.
      </p>
      <div className="controls" style={{ marginLeft: 0 }}>
        <ActionButton busy={busy} onClick={generate}>
          {html ? "Régénérer le rapport" : "Générer le rapport"}
        </ActionButton>
        {html && (
          <ActionButton ghost onClick={openInTab}>Ouvrir dans un onglet</ActionButton>
        )}
      </div>
      {error && <div className="out"><ErrorLine message={error} /></div>}
      {html && (
        <iframe className="report-frame" title="Rapport exploratoire"
                sandbox="" srcDoc={html} />
      )}
    </>
  );
}
