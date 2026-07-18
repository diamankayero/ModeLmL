// Tableau de données générique.
// Grandes lignes :
// - les colonnes sont déduites du premier objet (ou passées explicitement) ;
// - chiffres alignés à droite avec des largeurs de chiffres fixes
//   (tabular-nums) pour que les colonnes se lisent verticalement ;
// - nombre de lignes plafonné, avec une note du type "80 lignes sur 150".
"use client";

export default function Table({ rows, columns, maxRows = 100, renderCell }) {
  if (!rows?.length) return null;
  const cols = columns ?? Object.keys(rows[0]);
  const shown = rows.slice(0, maxRows);
  return (
    <div className="mt-2 overflow-x-auto rounded-xl border border-(--hairline) bg-(--surface)">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c}
                  className="sticky top-0 border-b border-(--grid) bg-(--surface) px-3 py-2
                             text-right text-xs font-medium text-(--muted) first:text-left
                             whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((row, i) => (
            <tr key={i} className="hover:bg-(--accent-tint)">
              {cols.map(c => (
                <td key={c}
                    className="border-b border-(--grid) px-3 py-1.5 text-right tabular-nums
                               first:text-left whitespace-nowrap
                               [tr:last-child_&]:border-b-0">
                  {renderCell
                    ? renderCell(row, c)
                    : typeof row[c] === "number" ? +row[c].toFixed(4) : String(row[c] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > maxRows && (
        <p className="px-3 py-2 text-xs text-(--muted)">
          {maxRows} lignes affichées sur {rows.length}.
        </p>
      )}
    </div>
  );
}
