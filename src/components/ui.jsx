export function ActionButton({ busy, onClick, children, ghost }) {
  return (
    <button className={ghost ? "action ghost" : "action"} disabled={busy} onClick={onClick}>
      {busy && <span className="spinner" />}
      {children}
    </button>
  );
}

export function ErrorLine({ message }) {
  return <span className="error">{message}</span>;
}

export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

// Tableau générique : colonnes = clés du premier objet, chiffres alignés.
export function DataTable({ rows, columns, maxRows = 100, renderCell }) {
  if (!rows?.length) return null;
  const cols = columns ?? Object.keys(rows[0]);
  const shown = rows.slice(0, maxRows);
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{cols.map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {shown.map((row, i) => (
            <tr key={i}>
              {cols.map(c => (
                <td key={c}>
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
        <p className="table-note">{maxRows} lignes affichées sur {rows.length}.</p>
      )}
    </div>
  );
}
