// Onglet Données : explorer le dataset chargé.
// Grandes lignes :
// - tuiles de synthèse (observations, variables, cible, classes) ;
// - sélection des colonnes affichées par puces cliquables ;
// - filtre par valeur d'une colonne (si peu de valeurs distinctes) ;
// - table des lignes, résumé statistique, export CSV du sous-ensemble.
"use client";
import { useMemo, useState } from "react";
import { downloadCsv, uniqueValues } from "@/lib/data";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import { inputCls, Field } from "@/components/ui/Field";
import { Chip, SectionTitle, Tile } from "@/components/ui/Feedback";

export default function DataTab({ dataset }) {
  const [selected, setSelected] = useState(null);   // colonnes cochées (null = toutes)
  const [filterCol, setFilterCol] = useState("");
  const [filterVal, setFilterVal] = useState("");

  const columns = dataset?.columns ?? [];
  const shownColumns = selected ?? columns;

  // Valeurs proposées par le filtre (null si la colonne en a trop).
  const filterChoices = useMemo(
    () => (filterCol ? uniqueValues(dataset.rows, filterCol) : null),
    [dataset, filterCol],
  );

  // Lignes après application du filtre.
  const rows = useMemo(() => {
    if (!dataset) return [];
    if (!filterCol || filterVal === "") return dataset.rows;
    return dataset.rows.filter(r => String(r[filterCol]) === filterVal);
  }, [dataset, filterCol, filterVal]);

  if (!dataset) {
    return <p className="mt-8 italic text-(--muted)">
      Chargez des données depuis le panneau de gauche.
    </p>;
  }

  function toggleColumn(col) {
    const base = selected ?? columns;
    const next = base.includes(col) ? base.filter(c => c !== col) : [...base, col];
    setSelected(next.length ? next : columns);
  }

  return (
    <>
      {/* Synthèse du dataset en tuiles */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3">
        <Tile label="observations" value={dataset.n_rows} />
        <Tile label="variables" value={dataset.feature_names.length} />
        <Tile label="cible" value={dataset.target} small />
        {dataset.classes && (
          <Tile label="classes" value={dataset.classes.join(", ")} small />
        )}
      </div>

      <SectionTitle>Colonnes affichées</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {columns.map(col => (
          <Chip key={col} on={shownColumns.includes(col)}
                onClick={() => toggleColumn(col)}>
            {col}
          </Chip>
        ))}
      </div>

      {/* Filtre + export */}
      <div className="my-4 flex flex-wrap items-end gap-4">
        <Field label="Filtrer par colonne">
          <select className={inputCls} value={filterCol}
                  onChange={e => { setFilterCol(e.target.value); setFilterVal(""); }}>
            <option value="">aucun filtre</option>
            {columns.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        {filterCol && filterChoices && (
          <Field label="Valeur">
            <select className={inputCls} value={filterVal}
                    onChange={e => setFilterVal(e.target.value)}>
              <option value="">toutes</option>
              {filterChoices.map(v => <option key={String(v)}>{String(v)}</option>)}
            </select>
          </Field>
        )}
        {filterCol && !filterChoices && (
          <p className="self-center text-[0.83rem] text-(--muted)">
            Trop de valeurs distinctes pour filtrer cette colonne.
          </p>
        )}
        <Button ghost onClick={() => downloadCsv(rows, shownColumns, "donnees_modelml.csv")}>
          Exporter en CSV ({rows.length} lignes)
        </Button>
      </div>

      <Table rows={rows} columns={shownColumns} maxRows={80} />

      <SectionTitle>Résumé statistique</SectionTitle>
      <Table rows={dataset.describe} />
    </>
  );
}
