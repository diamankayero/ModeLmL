// Capture le GIF du hero de la vitrine : de vraies interactions dans
// l'atelier, pas un mockup. Enchaîne les cinq écrans (Aperçu → Données →
// Analyse → Comparaison → Prédiction), frappe clavier comprise.
//
// Usage : API locale sur :8000, app Next sur :3000 (voir README), puis
//   node scripts/capture-hero-gif.mjs
import { launchPage, clickByText, waitText, typeIntoField, encodeGif } from "./lib/capture.mjs";

const BASE = process.env.APP_URL ?? "http://localhost:3000";
const OUT = process.env.OUT_PATH ?? "public/screenshots/hero-demo.gif";
const VIEWPORT = { width: 1180, height: 760 };

const frames = [];
async function capture(page, delay) {
  frames.push({ buffer: await page.screenshot({ type: "png" }), delay });
}

const { browser, page } = await launchPage(VIEWPORT);

// 1. Aperçu : l'écran d'accueil, données et analyse déjà prêtes
await page.goto(`${BASE}/app`, { waitUntil: "networkidle2" });
await waitText(page, "Points d'attention", 90000);
await capture(page, 1900);

// 2. Données
await clickByText(page, "nav button", "Données");
await waitText(page, "sepal_length");
await capture(page, 1500);

// 3. Analyse (déjà en cache, quasi instantané)
await clickByText(page, "nav button", "Analyse");
await waitText(page, "Corrélations entre variables");
await new Promise(r => setTimeout(r, 300));
await capture(page, 1900);

// 4. Comparaison : le clic, puis le résultat (un peu de mouvement réel)
await clickByText(page, "nav button", "Comparaison");
await waitText(page, "Lancer la comparaison");
await clickByText(page, "main button", "Lancer la comparaison");
await new Promise(r => setTimeout(r, 250));
await capture(page, 450);   // l'état "en cours"
await waitText(page, "Validation croisée à 5 plis", 120000);
await capture(page, 2200);

// 5. Prédiction : entraîner, puis modifier une valeur en direct
await clickByText(page, "nav button", "Prédiction");
await page.waitForSelector("main select");
await page.select("main select", "random_forest");
await clickByText(page, "main button", "Entraîner");
await waitText(page, "Importance des variables", 120000);
await capture(page, 900);

await typeIntoField(page, "petal_length", "5.8", {
  perChar: () => capture(page, 130),
});
await clickByText(page, "main button", "Prédire");
await waitText(page, "Prédiction du modèle", 60000);
await page.evaluate(() => {
  const el = [...document.querySelectorAll("span")]
    .find(e => e.textContent.includes("Prédiction du modèle"));
  el?.closest("div")?.scrollIntoView({ block: "center" });
});
await new Promise(r => setTimeout(r, 200));
await capture(page, 2600);   // le plus long : c'est la fin de la boucle

await browser.close();
console.log(`${frames.length} frames capturées`);

const bytes = await encodeGif(frames, OUT);
console.log(`GIF écrit : ${OUT} (${Math.round(bytes / 1024)} Ko)`);
