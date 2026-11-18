#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILL_ROOT = path.resolve(__dirname, "..");
const ASSET_DIR = path.join(SKILL_ROOT, "assets");

function parseArgs(argv) {
  const args = { runtimeDir: ".visual-editor", remove: false };
  for (let i = 2; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--html") args.html = argv[++i];
    else if (item === "--runtime-dir") args.runtimeDir = argv[++i];
    else if (item === "--remove") args.remove = true;
    else if (item === "--help" || item === "-h") args.help = true;
    else throw new Error(`Unknown argument: ${item}`);
  }
  return args;
}

function relativeForHtml(fromHtml, targetFile) {
  const fromDir = path.dirname(fromHtml);
  let rel = path.relative(fromDir, targetFile).replaceAll(path.sep, "/");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.html) {
    console.log("Usage: node inject-visual-editor.mjs --html <path/to/index.html> [--remove]");
    process.exit(args.help ? 0 : 2);
  }

  const htmlPath = path.resolve(args.html);
  const htmlDir = path.dirname(htmlPath);
  const runtimeDir = path.resolve(htmlDir, args.runtimeDir);
  const markerStart = "<!-- html-visual-editor runtime -->";
  const markerEnd = "<!-- /html-visual-editor runtime -->";

  let html = fs.readFileSync(htmlPath, "utf8");
  const blockRegex = new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}\\s*`, "gi");

  if (args.remove) {
    html = html.replace(blockRegex, "");
    fs.writeFileSync(htmlPath, html, "utf8");
    console.log(JSON.stringify({ ok: true, removed: true, html: htmlPath }, null, 2));
    return;
  }

  fs.mkdirSync(runtimeDir, { recursive: true });
  const targetCss = path.join(runtimeDir, "visual-editor.css");
  const targetJs = path.join(runtimeDir, "visual-editor.js");
  fs.copyFileSync(path.join(ASSET_DIR, "visual-editor.css"), targetCss);
  fs.copyFileSync(path.join(ASSET_DIR, "visual-editor.js"), targetJs);

  const cssHref = relativeForHtml(htmlPath, targetCss);
  const jsSrc = relativeForHtml(htmlPath, targetJs);

  const snippet = [
    markerStart,
    `<link rel="stylesheet" href="${cssHref}">`,
    `<script src="${jsSrc}" defer></script>`,
    markerEnd,
  ].join("\n");

  html = html.replace(blockRegex, "");
  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${snippet}\n$&`);
  } else if (/<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, `${snippet}\n$&`);
  } else {
    html = `${html}\n${snippet}\n`;
  }

  fs.writeFileSync(htmlPath, html, "utf8");
  console.log(JSON.stringify({ ok: true, html: htmlPath, runtimeDir, cssHref, jsSrc }, null, 2));
}

main();
