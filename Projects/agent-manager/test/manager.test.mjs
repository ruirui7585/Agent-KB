import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  loadWorkflow,
  resolveSelectedSteps,
  runWorkflow,
  validateWorkflow
} from '../bin/agent-manager.mjs';

const root = path.resolve(import.meta.dirname, '..');

test('default workflow is valid', async () => {
  const workflow = await loadWorkflow(path.join(root, 'workflows/product-feature.json'));
  assert.deepEqual(validateWorkflow(workflow), []);
});

test('selected agents preserve order and enforce dependencies', async () => {
  const workflow = await loadWorkflow(path.join(root, 'workflows/product-feature.json'));
  assert.deepEqual(resolveSelectedSteps(workflow, ['pm', 'prd']).map(step => step.id), ['pm', 'prd']);
  assert.throws(() => resolveSelectedSteps(workflow, ['prd']), /requires missing step "pm"/);
});

test('mock workflow creates isolated artifacts and completed status', async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'agent-manager-'));
  const result = await runWorkflow({
    inputPath: path.join(root, 'test/fixtures/sample-input.md'),
    workflowPath: path.join(root, 'workflows/product-feature.json'),
    runsRoot: tempRoot,
    mock: true,
    slug: 'sample'
  });

  const status = JSON.parse(await readFile(path.join(result.runDir, 'run.json'), 'utf8'));
  assert.equal(status.status, 'completed');
  assert.equal(status.steps.length, 4);
  assert.equal(
    await readFile(path.join(result.runDir, 'input.md'), 'utf8'),
    await readFile(path.join(root, 'test/fixtures/sample-input.md'), 'utf8')
  );
  for (const artifact of ['pm-analysis.md', 'PRD.md', 'prototype/index.html', 'review.md']) {
    assert.match(await readFile(path.join(result.runDir, artifact), 'utf8'), /Mock artifact/);
  }
});
