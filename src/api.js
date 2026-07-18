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
