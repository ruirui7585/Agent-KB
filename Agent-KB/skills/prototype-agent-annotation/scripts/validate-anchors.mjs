#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--html") args.html = argv[++i];
    else if (item === "--annotations") args.annotations = argv[++i];
    else if (item === "--help" || item === "-h") args.help = true;
    else throw new Error(`Unknown argument: ${item}`);
  }
  return args;
}

function usage() {
  return [
    "Usage:",
    "  node validate-anchors.mjs --html <prototype.html> --annotations <annotations.json>",
    "",
    "Checks duplicate data-annotation-id values and whether annotation targets exist.",
  ].join("\n");
}

function readFile(filePath) {
  return fs.readFileSync(path.resolve(filePath), "utf8");
}

function collectAnnotationIds(html) {
  const ids = new Map();
  const pattern = /\bdata-annotation-id\s*=\s*(["'])(.*?)\1/g;
  let match;
  while ((match = pattern.exec(html))) {
    const id = match[2].trim();
    if (!ids.has(id)) ids.set(id, []);
    ids.get(id).push(match.index);
  }
  return ids;
}

function extractDataAnnotationSelector(selector) {
  if (!selector) return null;
  const match = selector.match(/\[\s*data-annotation-id\s*=\s*(["'])(.*?)\1\s*\]/);
  return match ? match[2] : null;
}

function validateAnnotationShape(data) {
  const errors = [];
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["annotations file must contain a JSON object"];
  }
  if (!Array.isArray(data.annotations)) {
    errors.push("annotations must be an array");
    return errors;
  }

  const seen = new Set();
  for (const [index, annotation] of data.annotations.entries()) {
    const prefix = `annotations[${index}]`;
    if (!annotation || typeof annotation !== "object") {
      errors.push(`${prefix} must be an object`);
      continue;
    }
    for (const field of ["id", "page", "title", "target"]) {
      if (!annotation[field]) errors.push(`${prefix}.${field} is required`);
    }
    if (annotation.id) {
      if (seen.has(annotation.id)) errors.push(`duplicate annotation id: ${annotation.id}`);
      seen.add(annotation.id);
    }
    if (!annotation.target.annotationId && !annotation.target.selector) {
      errors.push(`${prefix}.target must include annotationId or selector`);
    }
  }
  return errors;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.html || !args.annotations) {
    console.log(usage());
    process.exit(args.help ? 0 : 2);
  }

  const html = readFile(args.html);
  const annotations = JSON.parse(readFile(args.annotations));
  const anchorMap = collectAnnotationIds(html);
  const errors = validateAnnotationShape(annotations);
  const warnings = [];

  for (const [id, positions] of anchorMap.entries()) {
    if (positions.length > 1) errors.push(`duplicate data-annotation-id in html: ${id}`);
  }

  for (const annotation of annotations.annotations || []) {
    const target = annotation.target || {};
    const annotationId = target.annotationId || extractDataAnnotationSelector(target.selector);
    if (annotationId) {
      const matches = anchorMap.get(annotationId) || [];
      if (matches.length === 0) errors.push(`${annotation.id}: target not found: ${annotationId}`);
      if (matches.length > 1) errors.push(`${annotation.id}: target is not unique: ${annotationId}`);
    } else if (target.selector) {
      warnings.push(`${annotation.id}: cannot statically verify selector: ${target.selector}`);
    }
  }

  const result = {
    ok: errors.length === 0,
    html: path.resolve(args.html),
    annotations: path.resolve(args.annotations),
    anchorCount: anchorMap.size,
    annotationCount: Array.isArray(annotations.annotations) ? annotations.annotations.length : 0,
    errors,
    warnings,
  };

  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
