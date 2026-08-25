#!/usr/bin/env node

import { spawn } from 'node:child_process';
import {
  access,
  copyFile,
  mkdir,
  readFile,
  rename,
  writeFile
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultWorkflowPath = path.join(projectRoot, 'workflows/product-feature.json');
const defaultRunsRoot = path.join(projectRoot, 'runs');

export async function loadWorkflow(workflowPath) {
  return JSON.parse(await readFile(workflowPath, 'utf8'));
}

export function validateWorkflow(workflow) {
  const errors = [];
  if (!workflow || typeof workflow !== 'object') return ['workflow must be an object'];
  if (!/^[a-z0-9-]+$/.test(workflow.id || '')) errors.push('workflow.id is invalid');
  if (!Array.isArray(workflow.steps) || workflow.steps.length === 0) {
    errors.push('workflow.steps must be a non-empty array');
    return errors;
  }

  const seen = new Set();
  for (const step of workflow.steps) {
    if (!/^[a-z0-9-]+$/.test(step.id || '')) errors.push(`invalid step id: ${step.id}`);
    if (seen.has(step.id)) errors.push(`duplicate step id: ${step.id}`);
    if (!/^[a-z0-9-]+$/.test(step.agent || '')) errors.push(`invalid agent for step: ${step.id}`);
    if (!isSafeRelativePath(step.output)) errors.push(`unsafe output path for step: ${step.id}`);
    if (!Array.isArray(step.requires)) errors.push(`requires must be an array for step: ${step.id}`);
    for (const dependency of step.requires || []) {
      if (!seen.has(dependency)) errors.push(`step "${step.id}" requires unavailable earlier step "${dependency}"`);
    }
    seen.add(step.id);
  }
  return errors;
}

export function resolveSelectedSteps(workflow, selectedIds) {
  if (!selectedIds?.length) return workflow.steps;
  const selected = new Set(selectedIds);
  const known = new Set(workflow.steps.map(step => step.id));
  for (const id of selected) {
    if (!known.has(id)) throw new Error(`Unknown agent step "${id}"`);
  }
  const steps = workflow.steps.filter(step => selected.has(step.id));
  for (const step of steps) {
    for (const dependency of step.requires) {
      if (!selected.has(dependency)) throw new Error(`Step "${step.id}" requires missing step "${dependency}"`);
    }
  }
  return steps;
}

function isSafeRelativePath(value) {
  if (typeof value !== 'string' || !value || path.isAbsolute(value)) return false;
  const normalized = path.normalize(value);
  return normalized !== '..' && !normalized.startsWith(`..${path.sep}`);
}

function safeSlug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'task';
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function writeJsonAtomic(filePath, value) {
  const tempPath = `${filePath}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(tempPath, filePath);
}

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', chunk => { stdout += chunk; });
    child.stderr?.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout, stderr }));
  });
}

async function ensureArtifact(runDir, output) {
  const outputPath = path.resolve(runDir, output);
  const relative = path.relative(runDir, outputPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Unsafe artifact path: ${output}`);
  await access(outputPath);
  return outputPath;
}

async function snapshotProtectedFiles(runDir, completedSteps) {
  const relativePaths = ['input.md', ...completedSteps.map(step => step.output)];
  const snapshots = new Map();
  for (const relativePath of relativePaths) {
    snapshots.set(relativePath, await readFile(path.join(runDir, relativePath)));
  }
  return snapshots;
}

async function verifyAndRestoreProtectedFiles(runDir, snapshots) {
  const changed = [];
  for (const [relativePath, original] of snapshots) {
    const absolutePath = path.join(runDir, relativePath);
    let current;
    try {
      current = await readFile(absolutePath);
    } catch {
      current = null;
    }
    if (!current?.equals(original)) {
      await mkdir(path.dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, original);
      changed.push(relativePath);
    }
  }
  if (changed.length) {
    throw new Error(`Agent modified protected upstream files; restored: ${changed.join(', ')}`);
  }
}

function buildPrompt({ step, agentDefinition, runDir }) {
  return `You are executing one step of Product Team Agent Manager v0.1.\n\n${agentDefinition}\n\nExecution boundaries:\n- Working directory: ${runDir}\n- Read input.md and any prerequisite artifacts in this directory.\n- Write the required artifact exactly at: ${step.output}\n- Do not modify any file outside this run directory.\n- Do not modify input.md, run.json, logs, or upstream artifacts.\n- Treat every output as a draft.\n- Complete the artifact in this turn, then report a concise summary.`;
}

async function mockStep(runDir, step) {
  const outputPath = path.join(runDir, step.output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  const content = step.output.endsWith('.html')
    ? '<!doctype html><html lang="en"><meta charset="utf-8"><title>Mock artifact</title><body><h1>Mock artifact</h1></body></html>\n'
    : `# Mock artifact: ${step.id}\n\nGenerated by the deterministic test executor.\n`;
  await writeFile(outputPath, content, 'utf8');
  return { code: 0, stdout: 'mock execution completed\n', stderr: '' };
}

export async function runWorkflow({
  inputPath,
  workflowPath = defaultWorkflowPath,
  runsRoot = defaultRunsRoot,
  selectedIds,
  mock = false,
  slug
}) {
  await access(inputPath);
  const workflow = await loadWorkflow(workflowPath);
  const errors = validateWorkflow(workflow);
  if (errors.length) throw new Error(`Invalid workflow:\n- ${errors.join('\n- ')}`);
  const steps = resolveSelectedSteps(workflow, selectedIds);
  const runId = `${timestamp()}-${safeSlug(slug || path.basename(inputPath, path.extname(inputPath)))}`;
  const runDir = path.join(runsRoot, runId);
  const logsDir = path.join(runDir, 'logs');
  await mkdir(logsDir, { recursive: true });
  await copyFile(inputPath, path.join(runDir, 'input.md'));

  const status = {
    version: '0.1.0',
    runId,
    workflow: workflow.id,
    mode: selectedIds?.length ? 'select' : 'workflow',
    executor: mock ? 'mock' : 'codex',
    status: 'running',
    createdAt: new Date().toISOString(),
    completedAt: null,
    steps: steps.map(step => ({ id: step.id, agent: step.agent, output: step.output, status: 'pending' }))
  };
  await writeJsonAtomic(path.join(runDir, 'run.json'), status);

  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];
    const protectedFiles = await snapshotProtectedFiles(runDir, steps.slice(0, index));
    status.steps[index].status = 'running';
    status.steps[index].startedAt = new Date().toISOString();
    await writeJsonAtomic(path.join(runDir, 'run.json'), status);

    try {
      let result;
      if (mock) {
        result = await mockStep(runDir, step);
      } else {
        const agentPath = path.join(projectRoot, 'agents', step.agent, 'AGENT.md');
        const agentDefinition = await readFile(agentPath, 'utf8');
        const prompt = buildPrompt({ step, agentDefinition, runDir });
        result = await runCommand('codex', [
          'exec',
          '--ephemeral',
          '--ignore-user-config',
          '--color', 'never',
          '--sandbox', 'workspace-write',
          '--cd', runDir,
          prompt
        ], { cwd: runDir, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
      }

      await writeFile(path.join(logsDir, `${step.id}.stdout.log`), result.stdout, 'utf8');
      await writeFile(path.join(logsDir, `${step.id}.stderr.log`), result.stderr, 'utf8');
      if (result.code !== 0) throw new Error(`Codex exited with code ${result.code}`);
      await verifyAndRestoreProtectedFiles(runDir, protectedFiles);
      await ensureArtifact(runDir, step.output);
      status.steps[index].status = 'completed';
      status.steps[index].completedAt = new Date().toISOString();
    } catch (error) {
      status.steps[index].status = 'failed';
      status.steps[index].error = error.message;
      status.status = 'failed';
      status.completedAt = new Date().toISOString();
      await writeJsonAtomic(path.join(runDir, 'run.json'), status);
      throw new Error(`Step "${step.id}" failed: ${error.message}`);
    }
    await writeJsonAtomic(path.join(runDir, 'run.json'), status);
  }

  status.status = 'completed';
  status.completedAt = new Date().toISOString();
  await writeJsonAtomic(path.join(runDir, 'run.json'), status);
  return { runDir, status };
}

function parseArgs(argv) {
  const [command = 'help', ...rest] = argv;
  const options = { command };
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (token === '--mock') options.mock = true;
    else if (token === '--input') options.inputPath = rest[++index];
    else if (token === '--workflow') options.workflowPath = rest[++index];
    else if (token === '--agents') options.selectedIds = rest[++index].split(',').map(value => value.trim()).filter(Boolean);
    else if (token === '--slug') options.slug = rest[++index];
    else throw new Error(`Unknown argument: ${token}`);
  }
  return options;
}

function usage() {
  return `Product Team Agent Manager v0.1\n\nCommands:\n  direct\n  plan --input <file> [--agents pm,prd]\n  run --input <file> [--agents pm,prd] [--mock] [--slug name]\n`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.command === 'help' || options.command === '--help') {
    console.log(usage());
    return;
  }
  if (options.command === 'direct') {
    console.log('Direct mode selected. No agents were invoked and no files were written. Continue with the existing manual Codex workflow.');
    return;
  }
  if (!['plan', 'run'].includes(options.command)) throw new Error(`Unknown command: ${options.command}`);
  if (!options.inputPath) throw new Error('--input is required');

  const inputPath = path.resolve(process.cwd(), options.inputPath);
  const workflowPath = path.resolve(process.cwd(), options.workflowPath || defaultWorkflowPath);
  const workflow = await loadWorkflow(workflowPath);
  const errors = validateWorkflow(workflow);
  if (errors.length) throw new Error(`Invalid workflow:\n- ${errors.join('\n- ')}`);
  const steps = resolveSelectedSteps(workflow, options.selectedIds);

  if (options.command === 'plan') {
    console.log(JSON.stringify({
      mode: options.selectedIds?.length ? 'select' : 'workflow',
      workflow: workflow.id,
      input: inputPath,
      writesOnlyTo: defaultRunsRoot,
      steps: steps.map(step => ({ id: step.id, agent: step.agent, output: step.output }))
    }, null, 2));
    return;
  }

  const result = await runWorkflow({
    inputPath,
    workflowPath,
    selectedIds: options.selectedIds,
    mock: options.mock,
    slug: options.slug
  });
  console.log(`Run completed: ${result.runDir}`);
}

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntrypoint) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
