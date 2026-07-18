// Banc de test visuel de ModeLmL.
// Grandes lignes :
// - pilote Edge en mode headless (sans fenêtre) avec puppeteer-core ;
// - exerce la vitrine puis chaque onglet de l'atelier contre l'API locale ;
// - capture un écran à chaque étape (dossier SHOT_DIR, ou le dossier courant).
// Prérequis : API locale sur :8000, app Next sur :3000 (voir README).
import puppeteer from "puppeteer-core";

const OUT = process.env.SHOT_DIR ?? ".";
const BASE = process.env.APP_URL ?? "http://localhost:3000";

// Clique le premier élément dont le texte contient `text`.
const clickByText = async (page, selector, text) => {
  await page.evaluate((sel, txt) => {
    const el = [...document.querySelectorAll(sel)]
      .find(e => e.textContent.trim().includes(txt));
    if (!el) throw new Error(`introuvable : ${sel} "${txt}"`);
    el.click();
  }, selector, text);
};

// Attend qu'un texte apparaisse quelque part dans la page.
const waitText = (page, text, timeout = 60000) =>
  page.waitForFunction(
    t => document.body.innerText.includes(t), { timeout }, text);

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: "new",
  args: ["--window-size=1280,900"],
  defaultViewport: { width: 1280, height: 900 },
});
const page = await browser.newPage();

// --- La vitrine ---
await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
await waitText(page, "Ouvrir l'atelier");
await page.screenshot({ path: `${OUT}/check_vitrine.png`, fullPage: true });
console.log("OK vitrine");

// --- L'atelier : onglet Données (iris chargé par défaut) ---
await page.goto(`${BASE}/app`, { waitUntil: "networkidle2" });
await waitText(page, "observations");
await waitText(page, "sepal_length");
await page.screenshot({ path: `${OUT}/check_donnees.png` });
console.log("OK donnees");

// --- Comparer : cv = 3 puis lancement ---
await clickByText(page, "nav button", "Comparer");
await page.evaluate(() => {
  const input = document.querySelector('input[type="number"][min="2"]');
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, "value").set;
  setter.call(input, "3");
  input.dispatchEvent(new Event("input", { bubbles: true }));
});
await clickByText(page, "main button", "Lancer la comparaison");
await waitText(page, "Validation croisée à 3 plis", 120000);
await page.screenshot({ path: `${OUT}/check_comparer.png` });
console.log("OK comparer");

// --- Entraîner (sidebar) puis Prédire ---
await clickByText(page, "aside button", "Entraîner");
await waitText(page, "modèle actif", 120000);
await clickByText(page, "main button", "Prédire");
await waitText(page, "Prédiction du modèle", 60000);
await page.screenshot({ path: `${OUT}/check_predire.png` });
console.log("OK predire");

// --- Analyse : génération du rapport EDA ---
await clickByText(page, "nav button", "Analyse");
await clickByText(page, "main button", "Générer le rapport");
await page.waitForSelector("iframe", { timeout: 120000 });
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: `${OUT}/check_analyse.png` });
console.log("OK analyse");

await browser.close();
console.log("TERMINE");
