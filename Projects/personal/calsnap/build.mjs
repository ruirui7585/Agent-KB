import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_ROOT = path.join(ROOT, 'web');
const ENTRY_FILE = path.join(OUTPUT_ROOT, 'index.html');
const MANIFEST_FILE = path.join(OUTPUT_ROOT, 'build-manifest.json');

function walk(directory) {
  return readdirSync(directory)
    .flatMap((name) => {
      const filePath = path.join(directory, name);
      if (filePath === MANIFEST_FILE) return [];
      return statSync(filePath).isDirectory() ? walk(filePath) : [filePath];
    });
}

function sha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function fail(message) {
  console.error(`FOODMIND_BUILD_FAILED ${message}`);
  process.exit(1);
}

if (!existsSync(ENTRY_FILE)) fail(`missing entry: ${ENTRY_FILE}`);
if (existsSync(path.join(ROOT, 'app', 'public', 'index.html'))) {
  fail('duplicate active index found at app/public/index.html');
}

const html = readFileSync(ENTRY_FILE, 'utf8');
const references = [...html.matchAll(/(?:src|href)=["']([^"'#]+)["']/g)]
  .map((match) => match[1])
  .filter((reference) => !/^(?:https?:|data:|mailto:)/.test(reference))
  .map((reference) => reference.split('?')[0]);

for (const reference of references) {
  const assetPath = path.resolve(OUTPUT_ROOT, reference);
  if (!assetPath.startsWith(`${OUTPUT_ROOT}${path.sep}`) || !existsSync(assetPath)) {
    fail(`missing or invalid asset reference: ${reference}`);
  }
}

const files = walk(OUTPUT_ROOT);
for (const filePath of files.filter((item) => path.extname(item) === '.js')) {
  const check = spawnSync(process.execPath, ['--check', filePath], { encoding: 'utf8' });
  if (check.status !== 0) fail(`syntax error in ${path.relative(ROOT, filePath)}\n${check.stderr}`);
}

const versionMatch = html.match(/camera\.js\?v=([0-9-]+)/);
const manifest = {
  product: 'FoodMind',
  buildVersion: versionMatch?.[1] || 'unversioned',
  builtAt: new Date().toISOString(),
  projectRoot: ROOT,
  previewRoot: OUTPUT_ROOT,
  formalOutputRoot: OUTPUT_ROOT,
  entryFile: ENTRY_FILE,
  files: Object.fromEntries(
    files
      .map((filePath) => [path.relative(OUTPUT_ROOT, filePath), sha256(filePath)])
      .sort(([a], [b]) => a.localeCompare(b))
  ),
};

writeFileSync(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`FOODMIND_BUILD_OK version=${manifest.buildVersion}`);
console.log(`output=${OUTPUT_ROOT}`);
console.log(`manifest=${MANIFEST_FILE}`);
