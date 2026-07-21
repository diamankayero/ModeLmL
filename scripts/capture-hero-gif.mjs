// Capture le GIF du hero de la vitrine : de vraies interactions dans
// l'atelier, pas un mockup. Pas de ffmpeg sur la machine de build : tout
// le pipeline est en JS pur (puppeteer pour les frames, sharp pour le
// redimensionnement, gifenc pour l'encodage).
//
// Usage : API locale sur :8000, app Next sur :3000 (voir README), puis
//   node scripts/capture-hero-gif.mjs
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import gifenc from "gifenc";
const { GIFEncoder, quantize, applyPalette } = gifenc;

const BASE = process.env.APP_URL ?? "http://localhost:3000";
const OUT = process.env.OUT_PATH ?? "public/screenshots/hero-demo.gif";
const WIDTH = 900;              // largeur finale du GIF (poids maîtrisé)
const VIEWPORT = { width: 1180, height: 760 };

const frames = [];  // { buffer: PNG, delay: ms }

async function capture(page, delay) {
  const buffer = await page.screenshot({ type: "png" });
  frames.push({ buffer, delay });
}

const clickByText = async (page, selector, text) => {
  await page.evaluate((sel, txt) => {
    const el = [...document.querySelectorAll(sel)]
      .find(e => e.textContent.trim().includes(txt));
    if (!el) throw new Error(`introuvable : ${sel} "${txt}"`);
    el.click();
  }, selector, text);
};

const waitText = (page, text, timeout = 60000) =>
  page.waitForFunction(
    t => document.body.innerText.includes(t), { timeout }, text);

// Tape dans le champ associé à un libellé (les cartes de l'écran Prédiction).
async function typeIntoField(page, label, text, { perChar } = {}) {
  const handle = await page.evaluateHandle((lbl) => {
    const span = [...document.querySelectorAll("label span")]
      .find(s => s.textContent.trim() === lbl);
    return span?.closest("label")?.querySelector("input") ?? null;
  }, label);
  // Le triple-clic ne sélectionne pas fiablement un <input type="number">
  // dans Chromium : on passe par le clavier (Ctrl+A) pour tout effacer.
  await handle.click();
  await page.keyboard.down("Control");
  await page.keyboard.press("KeyA");
  await page.keyboard.up("Control");
  await page.keyboard.press("Backspace");
  for (const ch of text) {
    await page.keyboard.type(ch, { delay: 90 });
    if (perChar) await perChar();
  }
}

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: "new",
  defaultViewport: VIEWPORT,
});
const page = await browser.newPage();

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
// Le résultat apparaît sous la ligne de flottaison du cadre de capture.
await page.evaluate(() => {
  const el = [...document.querySelectorAll("span")]
    .find(e => e.textContent.includes("Prédiction du modèle"));
  el?.closest("div")?.scrollIntoView({ block: "center" });
});
await new Promise(r => setTimeout(r, 200));
await capture(page, 2600);   // le plus long : c'est la fin de la boucle

await browser.close();
console.log(`${frames.length} frames capturées`);

// --- Encodage GIF : redimensionner puis quantifier chaque frame ---
const gif = GIFEncoder();
for (const frame of frames) {
  const { data, info } = await sharp(frame.buffer)
    .resize({ width: WIDTH })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const palette = quantize(data, 128);
  const index = applyPalette(data, palette);
  gif.writeFrame(index, info.width, info.height, { palette, delay: frame.delay });
}
gif.finish();

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, gif.bytes());
const sizeKb = Math.round(fs.statSync(OUT).size / 1024);
console.log(`GIF écrit : ${OUT} (${sizeKb} Ko)`);
