// Capture quatre GIF courts, un par carte de fonctionnalités de la vitrine :
// chacun montre une vraie interaction ciblée dans l'atelier (pas un mockup),
// avec le même pipeline sans ffmpeg que le hero (voir scripts/lib/capture.mjs).
//
// Usage : API locale sur :8000, app Next sur :3000 (voir README), puis
//   node scripts/capture-feature-gifs.mjs
import { launchPage, clickByText, waitText, typeIntoField, encodeGif } from "./lib/capture.mjs";

const BASE = process.env.APP_URL ?? "http://localhost:3000";
const VIEWPORT = { width: 1180, height: 900 };
const WIDTH = 760;   // plus petit que le hero : ces GIF vivent dans des cartes

async function scrollToHeading(page, text) {
  await page.evaluate((t) => {
    const el = [...document.querySelectorAll("h2")].find(h => h.textContent.trim() === t);
    el?.scrollIntoView({ block: "start" });
  }, text);
  await new Promise(r => setTimeout(r, 200));
}

async function scrollToText(page, text) {
  await page.evaluate((t) => {
    const el = [...document.querySelectorAll("span")].find(e => e.textContent.includes(t));
    el?.closest("div")?.scrollIntoView({ block: "center" });
  }, text);
  await new Promise(r => setTimeout(r, 200));
}

// --- Données : filtrer la table en direct ---------------------------------
async function captureData(page) {
  const frames = [];
  const capture = async (delay) => frames.push({ buffer: await page.screenshot({ type: "png" }), delay });

  await page.goto(`${BASE}/app`, { waitUntil: "networkidle2" });
  await waitText(page, "Points d'attention", 90000);
  await clickByText(page, "nav button", "Données");
  await waitText(page, "sepal_length");
  await capture(1300);

  await page.select("main select", "species");
  await new Promise(r => setTimeout(r, 200));
  await capture(1000);

  const valueSelect = (await page.$$("main select"))[1];
  await valueSelect.select("setosa");
  await new Promise(r => setTimeout(r, 200));
  await capture(2400);

  return frames;
}

// --- Comparaison : ajuster les plis et relancer ----------------------------
async function captureCompare(page) {
  const frames = [];
  const capture = async (delay) => frames.push({ buffer: await page.screenshot({ type: "png" }), delay });

  await page.goto(`${BASE}/app`, { waitUntil: "networkidle2" });
  await waitText(page, "Points d'attention", 90000);
  await clickByText(page, "nav button", "Comparaison");
  // Pas "Modèles à comparer" : ce titre est en CSS uppercase, or innerText
  // (contrairement à textContent) reflète la casse rendue, pas la source.
  await waitText(page, "Lancer la comparaison");
  await capture(900);

  await typeIntoField(page, "Plis de validation croisée", "10", {
    perChar: () => capture(160),
  });
  await clickByText(page, "main button", "Lancer la comparaison");
  await new Promise(r => setTimeout(r, 250));
  await capture(450);
  await waitText(page, "Validation croisée à 10 plis", 120000);
  await capture(2400);

  return frames;
}

// --- Prédiction : la prédiction change en direct avec les valeurs ---------
async function capturePredict(page) {
  const frames = [];
  const capture = async (delay) => frames.push({ buffer: await page.screenshot({ type: "png" }), delay });

  await page.goto(`${BASE}/app`, { waitUntil: "networkidle2" });
  await waitText(page, "Points d'attention", 90000);
  await clickByText(page, "nav button", "Prédiction");
  await page.waitForSelector("main select");
  await page.select("main select", "random_forest");
  await clickByText(page, "main button", "Entraîner");
  await waitText(page, "Importance des variables", 120000);
  await capture(900);

  // On n'attend pas une espèce précise : petal_width reste à sa moyenne
  // (atypique pour un vrai setosa), le modèle peut trancher autrement.
  // Un court délai suffit : la prédiction est locale, quasi instantanée.
  await typeIntoField(page, "petal_length", "1.4");
  await clickByText(page, "main button", "Prédire");
  await waitText(page, "Prédiction du modèle", 60000);
  await new Promise(r => setTimeout(r, 500));
  await scrollToText(page, "Prédiction du modèle");
  await capture(1600);

  await typeIntoField(page, "petal_length", "6.5");
  await clickByText(page, "main button", "Prédire");
  await new Promise(r => setTimeout(r, 700));
  await scrollToText(page, "Prédiction du modèle");
  await capture(2600);

  return frames;
}

// --- Analyse : parcourir corrélations, distributions, diagnostics ---------
async function captureAnalyze(page) {
  const frames = [];
  const capture = async (delay) => frames.push({ buffer: await page.screenshot({ type: "png" }), delay });

  await page.goto(`${BASE}/app`, { waitUntil: "networkidle2" });
  await waitText(page, "Points d'attention", 90000);
  await clickByText(page, "nav button", "Analyse");
  await waitText(page, "Corrélations entre variables");
  await new Promise(r => setTimeout(r, 300));
  await capture(1700);

  await scrollToHeading(page, "Distributions");
  await capture(1600);

  await scrollToHeading(page, "Valeurs manquantes");
  await capture(2200);

  return frames;
}

const TARGETS = [
  ["data", captureData],
  ["compare", captureCompare],
  ["predict", capturePredict],
  ["analyze", captureAnalyze],
];

const { browser, page } = await launchPage(VIEWPORT);
for (const [name, run] of TARGETS) {
  const frames = await run(page);
  const outPath = `public/screenshots/feature-${name}.gif`;
  const bytes = await encodeGif(frames, outPath, { width: WIDTH });
  console.log(`${name} : ${frames.length} frames -> ${outPath} (${Math.round(bytes / 1024)} Ko)`);
}
await browser.close();
