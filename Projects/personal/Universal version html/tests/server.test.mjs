import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import AdmZip from "adm-zip";
import { createServerInstance, importZipFile, isAllowedPublicRelativePath } from "../server.js";

test("public static allowlist blocks server source, package files, tests, and dotfiles", () => {
  assert.equal(isAllowedPublicRelativePath("index.html"), true);
  assert.equal(isAllowedPublicRelativePath("app.js"), true);
  assert.equal(isAllowedPublicRelativePath("runtime/prototypes/demo.html"), true);

  for (const blocked of [
    "server.js",
    "package.json",
    "package-lock.json",
    "tests/smoke.mjs",
    ".gitignore",
    "runtime/.gitkeep",
    "../server.js"
  ]) {
    assert.equal(isAllowedPublicRelativePath(blocked), false, `expected blocked: ${blocked}`);
  }
});

test("HTTP server rejects server.js, malformed URLs, and serves index.html", async () => {
  const server = createServerInstance();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const blocked = await fetch(`${baseUrl}/server.js`);
    assert.equal(blocked.status, 404);

    const malformed = await fetch(`${baseUrl}/%ZZ`);
    assert.equal(malformed.status, 400);

    const index = await fetch(`${baseUrl}/`);
    assert.equal(index.status, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("importZipFile enforces max entry count limit", async () => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "uhtml-zip-test-"));
  const zipPath = path.join(tmpDir, "too-many.zip");
  const extractDir = path.join(tmpDir, "out");

  try {
    const zip = new AdmZip();
    for (let i = 0; i < 501; i += 1) {
      zip.addFile(`file-${i}.txt`, Buffer.from("x"));
    }
    zip.writeZip(zipPath);

    await assert.rejects(
      () => importZipFile(zipPath, extractDir),
      /ZIP contains too many files/
    );
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
});
