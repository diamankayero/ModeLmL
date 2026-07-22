// Briques communes aux scripts de capture (hero + GIF par fonctionnalité).
// Grandes lignes :
// - launchPage() ouvre un Edge headless sur un viewport donné ;
// - clickByText / waitText / typeIntoField pilotent l'app comme un vrai
//   utilisateur (mêmes helpers que scripts/visual-check.mjs) ;
// - encodeGif() transforme une liste de captures PNG en GIF optimisé,
//   sans ffmpeg : sharp redimensionne, gifenc encode.
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import gifenc from "gifenc";

const { GIFEncoder, quantize, applyPalette } = gifenc;

// Chemin du navigateur : Edge en local (Windows), Chrome installé par
// @puppeteer/browsers en CI (voir .github/workflows/ci.yml et
// scripts/ci/install-browser.mjs qui pose PUPPETEER_EXECUTABLE_PATH).
const DEFAULT_BROWSER_PATH =
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

export async function launchPage(viewport) {
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH ?? DEFAULT_BROWSER_PATH,
    headless: "new",
    args: ["--no-sandbox"],   // requis dans le conteneur CI (root, pas de sandbox)
    defaultViewport: viewport,
  });
  const page = await browser.newPage();
  return { browser, page };
}

export const clickByText = async (page, selector, text) => {
  await page.evaluate((sel, txt) => {
    const el = [...document.querySelectorAll(sel)]
      .find(e => e.textContent.trim().includes(txt));
    if (!el) throw new Error(`introuvable : ${sel} "${txt}"`);
    el.click();
  }, selector, text);
};

export const waitText = (page, text, timeout = 60000) =>
  page.waitForFunction(
    t => document.body.innerText.includes(t), { timeout }, text);

// Tape dans le champ associé à un libellé (les écrans avec formulaire).
// Passe par le clavier (Ctrl+A) : le triple-clic ne sélectionne pas
// fiablement un <input type="number"> dans Chromium.
export async function typeIntoField(page, label, text, { perChar } = {}) {
  const handle = await page.evaluateHandle((lbl) => {
    const span = [...document.querySelectorAll("label span")]
      .find(s => s.textContent.trim() === lbl);
    return span?.closest("label")?.querySelector("input") ?? null;
  }, label);
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

// Encode une liste de { buffer: <PNG>, delay: <ms> } en GIF, largeur fixée.
export async function encodeGif(frames, outPath, { width = 900 } = {}) {
  const gif = GIFEncoder();
  for (const frame of frames) {
    const { data, info } = await sharp(frame.buffer)
      .resize({ width })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const palette = quantize(data, 128);
    const index = applyPalette(data, palette);
    gif.writeFrame(index, info.width, info.height, { palette, delay: frame.delay });
  }
  gif.finish();
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, gif.bytes());
  return fs.statSync(outPath).size;
}
