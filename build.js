/**
 * Assembles the Power Platform Toolbox distribution into ./dist, and mirrors the same
 * single-file app into the XrmToolBox plugin's app/ folder so all hosts run identical UI.
 *
 * PPTB loads `main` (index.html) and `icon` relative to the dist root. The actual tool UI is
 * the single-file ./field-service-settings-updater.html — it is host-aware:
 *   - PPTB           → window.dataverseAPI (auth + instance handled by the host)
 *   - XrmToolBox     → window.XTB_CONFIG { baseUrl, token }, fetch the Web API with the bearer
 *   - D365 web res.  → same-origin fetch authenticated by the session
 *
 * Run:  node build.js
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const dist = path.join(root, "dist");
const srcHtml = path.join(root, "field-service-settings-updater.html");
const srcIcon = path.join(root, "icon.svg");

fs.mkdirSync(dist, { recursive: true });

// 1) PPTB dist — main + icon relative to the dist root.
fs.copyFileSync(srcHtml, path.join(dist, "index.html"));
fs.copyFileSync(srcIcon, path.join(dist, "icon.svg"));

// 2) XrmToolBox plugin — ship the same HTML next to the dll under app/.
//    A unique filename avoids clashing with other WebView2-hosted tools in the Plugins folder.
const xtbApp = path.join(root, "xrmtoolbox", "FieldServiceSettingsUpdater", "app");
if (fs.existsSync(path.dirname(xtbApp))) {
  fs.mkdirSync(xtbApp, { recursive: true });
  fs.copyFileSync(srcHtml, path.join(xtbApp, "field-service-settings-updater.html"));
}

console.log("Built dist/ →", dist);
console.log("  index.html, icon.svg");
console.log("Mirrored app → xrmtoolbox/FieldServiceSettingsUpdater/app/field-service-settings-updater.html");
