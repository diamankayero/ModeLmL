import { useMemo, useState } from "react";
import { downloadCsv, uniqueValues } from "../lib/data";
import { ActionButton, DataTable } from "./ui";

// Onglet Données : aperçu, sélection de colonnes, filtre, describe, export.
export default function DataTab({ dataset }) {
  const [selected, setSelected] = useState(null);
  const [filterCol, setFilterCol] = useState("");
  const [filterVal, setFilterVal] = useState("");

  const columns = dataset?.columns ?? [];
  const shownColumns = selected ?? columns;

  const filterChoices = useMemo(
    () => (filterCol ? uniqueValues(dataset.rows, filterCol) : null),
    [dataset, filterCol],
  );

  const rows = useMemo(() => {
    if (!dataset) return [];
    if (!filterCol || filterVal === "") return dataset.rows;
    return dataset.rows.filter(r => String(r[filterCol]) === filterVal);
  }, [dataset, filterCol, filterVal]);

  if (!dataset) {
    return <p className="placeholder">Chargez des données depuis le panneau de gauche.</p>;
  }

  function toggleColumn(col) {
    const base = selected ?? columns;
    const next = base.includes(col) ? base.filter(c => c !== col) : [...base, col];
    setSelected(next.length ? next : columns);
  }

  return (
    <>
      <div className="stat-row">
        <div className="tile"><div className="label">observations</div>
          <div className="value">{dataset.n_rows}</div></div>
        <div className="tile"><div className="label">variables</div>
          <div className="value">{dataset.feature_names.length}</div></div>
        <div className="tile"><div className="label">cible</div>
          <div className="value small">{dataset.target}</div></div>
        {dataset.classes && (
          <div className="tile"><div className="label">classes</div>
            <div className="value small">{dataset.classes.join(", ")}</div></div>
        )}
      </div>

      <h3>Colonnes affichées</h3>
      <div className="chips">
        {columns.map(col => (
          <button key={col}
                  className={shownColumns.includes(col) ? "chip on" : "chip"}
                  onClick={() => toggleColumn(col)}>
            {col}
          </button>
        ))}
      </div>

      <div className="controls">
        <label className="field"><span>Filtrer par colonne</span>
          <select value={filterCol}
                  onChange={e => { setFilterCol(e.target.value); setFilterVal(""); }}>
            <option value="">aucun filtre</option>
            {columns.map(c => <option key={c}>{c}</option>)}
          </select>
        </label>
        {filterCol && filterChoices && (
          <label className="field"><span>Valeur</span>
            <select value={filterVal} onChange={e => setFilterVal(e.target.value)}>
              <option value="">toutes</option>
              {filterChoices.map(v => <option key={String(v)}>{String(v)}</option>)}
            </select>
          </label>
        )}
        {filterCol && !filterChoices && (
          <p className="hint-inline">Trop de valeurs distinctes pour filtrer cette colonne.</p>
        )}
        <ActionButton ghost onClick={() =>
          downloadCsv(rows, shownColumns, "donnees_modelml.csv")}>
          Exporter en CSV ({rows.length} lignes)
        </ActionButton>
      </div>

      <DataTable rows={rows} columns={shownColumns} maxRows={80} />

      <h3>Résumé statistique</h3>
      <DataTable rows={dataset.describe} />
    </>
  );
}
