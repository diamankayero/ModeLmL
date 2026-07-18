// Outils de manipulation de données côté client : parsing CSV,
// statistiques descriptives et export, pour les datasets uploadés.
import Papa from "papaparse";

// Parse un fichier CSV (File du navigateur) en lignes d'objets.
export function parseCsvFile(file, separator) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      delimiter: separator,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: r => {
        if (!r.data.length) reject(new Error("Fichier vide ou illisible."));
        else resolve(r.data);
      },
      error: e => reject(new Error(e.message)),
    });
  });
}

export function isNumericColumn(rows, col) {
  return rows.some(r => typeof r[col] === "number");
}

// Construit, pour un dataset uploadé, la même structure que /api/dataset.
export function datasetFromRows(rows, target) {
  const columns = Object.keys(rows[0] ?? {});
  const featureNames = columns.filter(c => c !== target);
  const numeric = featureNames.filter(c => isNumericColumn(rows, c));

  const means = {};
  const describe = [];
  const agg = {};
  for (const col of numeric) {
    const values = rows.map(r => r[col]).filter(v => typeof v === "number");
    const n = values.length;
    const mean = values.reduce((s, v) => s + v, 0) / (n || 1);
    const std = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / (n > 1 ? n - 1 : 1));
    agg[col] = {
      count: n,
      mean: +mean.toFixed(3),
      std: +std.toFixed(3),
      min: Math.min(...values),
      max: Math.max(...values),
    };
    means[col] = +mean.toFixed(4);
  }
  for (const stat of ["count", "mean", "std", "min", "max"]) {
    const row = { statistique: stat };
    for (const col of numeric) row[col] = agg[col][stat];
    describe.push(row);
  }

  const targetValues = [...new Set(rows.map(r => String(r[target])))].sort();
  return {
    columns,
    feature_names: featureNames,
    target,
    n_rows: rows.length,
    rows,
    describe,
    means,
    classes: targetValues.length <= 20 ? targetValues : null,
  };
}

// Valeurs uniques d'une colonne (pour les filtres), plafonnées.
export function uniqueValues(rows, col, cap = 30) {
  const values = [...new Set(rows.map(r => r[col]))];
  return values.length <= cap ? values : null;
}

// Export CSV côté client (déclenche un téléchargement).
export function downloadCsv(rows, columns, filename) {
  const head = columns.join(",");
  const body = rows.map(r => columns.map(c => r[c]).join(",")).join("\n");
  const blob = new Blob([head + "\n" + body], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
