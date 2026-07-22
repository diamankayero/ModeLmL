// Installe un Chrome stable pour la CI (les runners GitHub Actions n'ont
// pas Edge) et écrit son chemin dans $GITHUB_ENV pour que les étapes
// suivantes du workflow puissent le passer à puppeteer-core via
// PUPPETEER_EXECUTABLE_PATH (voir scripts/lib/capture.mjs).
import fs from "node:fs";
import { install, resolveBuildId, detectBrowserPlatform, Browser } from "@puppeteer/browsers";

const cacheDir = process.env.PUPPETEER_CACHE_DIR ?? "./.cache/puppeteer";
const platform = detectBrowserPlatform();
const buildId = await resolveBuildId(Browser.CHROME, platform, "stable");
const { executablePath } = await install({
  browser: Browser.CHROME,
  buildId,
  cacheDir,
  platform,
});

console.log(`Chrome installé : ${executablePath}`);

if (process.env.GITHUB_ENV) {
  fs.appendFileSync(process.env.GITHUB_ENV, `PUPPETEER_EXECUTABLE_PATH=${executablePath}\n`);
}
