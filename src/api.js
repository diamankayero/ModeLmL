// Client de l'API trainedml.
// L'URL est surchargeable en dev : VITE_API_URL=http://localhost:8000 npm run dev
export const API_URL =
  import.meta.env.VITE_API_URL ?? "https://trainedml.onrender.com";

export async function api(path, body) {
  const res = await fetch(API_URL + path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || res.statusText);
  return data;
}

// Variante pour les réponses HTML (rapport EDA)
export async function apiHtml(path, body) {
  const res = await fetch(API_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail || detail; } catch { /* html */ }
    throw new Error(detail);
  }
  return res.text();
}

// Traduit la source de données active en champs de requête API.
// source : {kind:'builtin', name} | {kind:'url', url, target} | {kind:'upload', records, target}
export function sourcePayload(source) {
  if (source.kind === "builtin") return { dataset: source.name };
  if (source.kind === "url") return { url: source.url, target: source.target };
  return { data: source.records, target: source.target };
}
