// Client de l'API trainedml : le seul endroit du code qui parle au serveur.
// Grandes lignes :
// - API_URL pointe vers le serveur en ligne, surchargeable en dev
//   (NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev) ;
// - api()      : appels JSON classiques ;
// - apiHtml()  : pour le rapport EDA, qui revient en HTML ;
// - sourcePayload() : traduit la source de données choisie par l'utilisateur
//   (dataset intégré, URL ou fichier uploadé) en champs de requête.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://trainedml.onrender.com";

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

export async function apiHtml(path, body) {
  const res = await fetch(API_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail || detail; } catch { /* réponse html */ }
    throw new Error(detail);
  }
  return res.text();
}

export function sourcePayload(source) {
  if (source.kind === "builtin") return { dataset: source.name };
  if (source.kind === "url") return { url: source.url, target: source.target };
  return { data: source.records, target: source.target };
}
