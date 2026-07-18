// Banc de test visuel de ModeLmL.
// Grandes lignes :
// - pilote Edge en mode headless avec puppeteer-core ;
// - exerce la vitrine puis chaque écran de l'atelier contre l'API locale ;
// - capture un écran à chaque étape (dossier SHOT_DIR, ou le dossier courant).
// Prérequis : API locale sur :8000, app Next sur :3000 (voir README).
import puppeteer from "puppeteer-core";

const OUT = process.env.SHOT_DIR ?? ".";
const BASE = process.env.APP_URL ?? "http://localhost:3000";

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

// --- Aperçu (écran d'accueil, iris chargé et analysé automatiquement) ---
await page.goto(`${BASE}/app`, { waitUntil: "networkidle2" });
await waitText(page, "Points d'attention", 90000);
await waitText(page, "Corrélations les plus fortes");
await page.screenshot({ path: `${OUT}/check_apercu.png` });
console.log("OK apercu");

// --- Données ---
await clickByText(page, "nav button", "Données");
await waitText(page, "sepal_length");
await page.screenshot({ path: `${OUT}/check_donnees.png` });
console.log("OK donnees");

// --- Analyse (native, pré-chargée) ---
await clickByText(page, "nav button", "Analyse");
await waitText(page, "Corrélations entre variables", 90000);
await page.screenshot({ path: `${OUT}/check_analyse.png` });
console.log("OK analyse");

// --- Comparaison : cv = 3 puis lancement ---
await clickByText(page, "nav button", "Comparaison");
await page.evaluate(() => {
  const input = document.querySelector('input[type="number"][min="2"]');
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, "value").set;
  setter.call(input, "3");
  input.dispatchEvent(new Event("input", { bubbles: true }));
});
await clickByText(page, "main button", "Lancer la comparaison");
await waitText(page, "Validation croisée à 3 plis", 120000);
await page.screenshot({ path: `${OUT}/check_comparaison.png` });
console.log("OK comparaison");

// --- Prédiction : entraîner puis prédire ---
await clickByText(page, "nav button", "Prédiction");
await clickByText(page, "main button", "Entraîner");
await waitText(page, "tâche", 120000);
await clickByText(page, "main button", "Prédire");
await waitText(page, "Prédiction du modèle", 60000);
await page.screenshot({ path: `${OUT}/check_prediction.png` });
console.log("OK prediction");

await browser.close();
console.log("TERMINE");
