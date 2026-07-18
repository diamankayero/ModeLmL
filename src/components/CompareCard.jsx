import { useState } from "react";
import { api } from "../api";
import { ActionButton, ErrorLine } from "./ui";

function ScoreBar({ value, std }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <span className="scorebar">
      <span className="track"><span className="fill" style={{ width: `${pct}%` }} /></span>
      {value.toFixed(3)}{std !== undefined ? ` ± ${std.toFixed(3)}` : ""}
    </span>
  );
}

export default function CompareCard() {
  const [dataset, setDataset] = useState("wine");
  const [cv, setCv] = useState(5);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function compare() {
    setBusy(true); setError(null); setResult(null);
    try {
      setResult(await api("/api/compare", { dataset, cv: Number(cv) }));
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  const rows = result?.results ?? [];
  const primary = rows.length && "accuracy" in rows[0] ? "accuracy" : "r2";
  const cols = rows.length
    ? Object.keys(rows[0]).filter(c => !c.endsWith("_std"))
    : [];

  return (
    <section>
      <div className="step"><span className="num">3</span><h2>Comparer tous les modèles</h2></div>
      <p className="hint">
        Validation croisée : chaque modèle est entraîné et évalué sur plusieurs
        découpages, le tableau est trié du meilleur au moins bon.
      </p>
      <div className="controls">
        <label className="field"><span>Dataset</span>
          <select value={dataset} onChange={e => setDataset(e.target.value)}>
            <option value="wine">wine</option>
            <option value="iris">iris</option>
          </select>
        </label>
        <label className="field"><span>Plis</span>
          <input type="number" min="2" max="20" value={cv} style={{ width: "4.5rem" }}
                 onChange={e => setCv(e.target.value)} />
        </label>
        <ActionButton busy={busy} onClick={compare}>Comparer</ActionButton>
      </div>
      <div className="out">
        {error && <ErrorLine message={error} />}
        {result && (
          <>
            <p className="meta">
              Validation croisée à {result.cv} plis, métrique principale : {primary}.
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>{cols.map(c => <th key={c}>{c === primary ? `${c} (barre)` : c}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row.model} className={i === 0 ? "best" : undefined}>
                      {cols.map(c => (
                        <td key={c}>
                          {c === primary
                            ? <ScoreBar value={row[c]} std={row[`${c}_std`]} />
                            : typeof row[c] === "number" ? row[c].toFixed(3) : row[c]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
