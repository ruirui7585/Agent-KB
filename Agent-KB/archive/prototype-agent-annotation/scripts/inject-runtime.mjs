#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function parseArgs(argv) {
  const args = { annotations: "annotations.json", runtimeDir: ".prototype-annotations" };
  for (let i = 2; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--html") args.html = argv[++i];
    else if (item === "--annotations") args.annotations = argv[++i];
    else if (item === "--runtime-dir") args.runtimeDir = argv[++i];
    else if (item === "--help" || item === "-h") args.help = true;
    else throw new Error(`Unknown argument: ${item}`);
  }
  return args;
}

function usage() {
  return [
    "Usage:",
    "  node inject-runtime.mjs --html <prototype.html> --annotations annotations.json",
    "",
    "Copies the runtime beside the prototype and injects CSS/JS tags once.",
  ].join("\n");
}

function relativeForHtml(fromHtml, targetFile) {
  const fromDir = path.dirname(fromHtml);
  let rel = path.relative(fromDir, targetFile).replaceAll(path.sep, "/");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

function injectOnce(html, marker, snippet, beforePattern, appendFallback) {
  if (html.includes(marker)) return html;
  if (beforePattern.test(html)) return html.replace(beforePattern, `${snippet}\n$&`);
  return `${html}${appendFallback ? `\n${snippet}\n` : ""}`;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.html) {
    console.log(usage());
    process.exit(args.help ? 0 : 2);
  }

  const htmlPath = path.resolve(args.html);
  const htmlDir = path.dirname(htmlPath);
  const runtimeDir = path.resolve(htmlDir, args.runtimeDir);
  const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const assetDir = path.join(skillRoot, "assets", "annotation-runtime");
  const runtimeJs = path.join(runtimeDir, "annotation-runtime.js");
  const runtimeCss = path.join(runtimeDir, "annotation-runtime.css");
  const annotationsPath = path.resolve(htmlDir, args.annotations);

  fs.mkdirSync(runtimeDir, { recursive: true });
  fs.copyFileSync(path.join(assetDir, "annotation-runtime.js"), runtimeJs);
  fs.copyFileSync(path.join(assetDir, "annotation-runtime.css"), runtimeCss);

  if (!fs.existsSync(annotationsPath)) {
    fs.writeFileSync(annotationsPath, JSON.stringify({ version: "1.0", updatedAt: new Date().toISOString(), annotations: [] }, null, 2) + "\n");
  }

  const cssHref = relativeForHtml(htmlPath, runtimeCss);
  const jsSrc = relativeForHtml(htmlPath, runtimeJs);
  const annotationsUrl = relativeForHtml(htmlPath, annotationsPath);

  const marker = "prototype-agent-annotation runtime";
  const snippet = [
    `<!-- ${marker} -->`,
    `<link rel="stylesheet" href="${cssHref}">`,
    `<script>window.PrototypeAnnotationConfig = Object.assign({}, window.PrototypeAnnotationConfig || {}, { annotationsUrl: "${annotationsUrl}", saveUrl: "/__prototype_annotations/save" });</script>`,
    `<script src="${jsSrc}" defer></script>`,
    `<!-- /${marker} -->`,
  ].join("\n");

  let html = fs.readFileSync(htmlPath, "utf8");
  html = injectOnce(html, marker, snippet, /<\/head>/i, false);
  if (!html.includes(marker)) html = injectOnce(html, marker, snippet, /<\/body>/i, true);
  fs.writeFileSync(htmlPath, html);

  console.log(JSON.stringify({
    ok: true,
    html: htmlPath,
    runtimeDir,
    annotations: annotationsPath,
    cssHref,
    jsSrc,
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
