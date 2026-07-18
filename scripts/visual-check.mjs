// Banc de test visuel de ModeLmL : pilote Edge headless, exerce chaque
// onglet contre l'API locale et capture des écrans.
import puppeteer from "puppeteer-core";

const OUT = process.env.SHOT_DIR ?? ".";
const URL = "http://localhost:4173/ModeLmL/";

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
await page.goto(URL, { waitUntil: "networkidle2" });

// Onglet Données : iris chargé par défaut
await waitText(page, "observations");
await waitText(page, "sepal_length");
await page.screenshot({ path: `${OUT}/v2_donnees.png`, fullPage: false });
console.log("OK donnees");

// Onglet Comparer : cv=3, lancer
await clickByText(page, ".tab", "Comparer");
await page.evaluate(() => {
  const input = document.querySelector('input[type="number"][min="2"]');
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, "value").set;
  setter.call(input, "3");
  input.dispatchEvent(new Event("input", { bubbles: true }));
});
await clickByText(page, "button.action", "Lancer la comparaison");
await waitText(page, "Validation croisée à 3 plis", 120000);
await page.screenshot({ path: `${OUT}/v2_comparer.png` });
console.log("OK comparer");

// Entraîner depuis la sidebar puis onglet Prédire
await clickByText(page, "button.action", "Entraîner");
await waitText(page, "modèle actif", 120000);
await clickByText(page, "button.action", "Prédire");
await waitText(page, "Prédiction du modèle", 60000);
await page.screenshot({ path: `${OUT}/v2_predire.png` });
console.log("OK predire");

// Onglet Analyse : générer le rapport
await clickByText(page, ".tab", "Analyse");
await clickByText(page, "button.action", "Générer le rapport");
await page.waitForSelector("iframe.report-frame", { timeout: 120000 });
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: `${OUT}/v2_analyse.png` });
console.log("OK analyse");

await browser.close();
console.log("TERMINE");
