#!/usr/bin/env node

import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node validate-workflow-state.mjs <workflow-state.json>");
  process.exit(2);
}

let state;
try {
  state = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (error) {
  console.error(`Invalid JSON: ${error.message}`);
  process.exit(1);
}

const errors = [];
const sizes = new Set(["S", "M", "L", "XL"]);
const versions = new Set(["0.1", "0.2"]);
const riskLevels = new Set(["low", "medium", "high", "critical"]);
const impactScopes = new Set(["local", "cross-page", "cross-module", "cross-system"]);
const sourceStatuses = new Set(["confirmed", "ambiguous", "stale", "conflicting"]);
const readModes = new Set(["full", "targeted", "index", "runtime"]);
const readStatuses = new Set(["read", "deferred", "forbidden"]);
const counterexampleStatuses = new Set(["pass", "fail", "not-run"]);
const evidenceGateValues = new Set([
  "static",
  "build",
  "runtime",
  "visual",
  "interaction",
  "data",
]);
const budgetStatuses = new Set(["within", "warning", "exceeded"]);
const stages = new Set([
  "discover",
  "align",
  "spec",
  "tickets",
  "execute",
  "review",
  "map-unknowns",
]);
const gateStatuses = new Set(["clear", "needs-user", "blocked"]);
const classifications = new Set([
  "resolved",
  "draft-safe",
  "implementation-blocking",
]);
const reviewStatuses = new Set([
  "pass",
  "fail",
  "not-run",
  "blocked",
  "not-applicable",
]);
const axes = ["requirement", "product-ui", "engineering", "evidence"];

if (!versions.has(state?.version)) errors.push("version must be 0.1 or 0.2");
if (!state?.task?.summary) errors.push("task.summary is required");
if (!sizes.has(state?.task?.size)) errors.push("task.size must be S, M, L, or XL");
if (state?.version === "0.2") {
  if (!riskLevels.has(state?.task?.riskLevel)) {
    errors.push("task.riskLevel must be low, medium, high, or critical");
  }
  if (!impactScopes.has(state?.task?.impactScope)) {
    errors.push("task.impactScope must be local, cross-page, cross-module, or cross-system");
  }
}
if (!Array.isArray(state?.route) || state.route.length === 0) {
  errors.push("route must be a non-empty array");
} else {
  if (state.route[0] !== "discover") errors.push("route must start with discover");
  for (const stage of state.route) {
    if (!stages.has(stage)) errors.push(`unknown route stage: ${stage}`);
  }
}

const route = Array.isArray(state?.route) ? state.route : [];
const index = (stage) => route.indexOf(stage);
const requireOrdered = (required) => {
  let previous = -1;
  for (const stage of required) {
    const current = index(stage);
    if (current === -1) {
      errors.push(`${state.task.size} route requires ${stage}`);
    } else if (current < previous) {
      errors.push(`${required.join(" -> ")} must keep this order`);
      return;
    }
    previous = current;
  }
};

if (state?.task?.size === "S" && (route.includes("spec") || route.includes("tickets"))) {
  errors.push("S route must not require spec or tickets");
}
if (state?.task?.size === "L") {
  requireOrdered(["discover", "align", "spec", "tickets", "review"]);
}
if (state?.task?.size === "XL") {
  requireOrdered(["discover", "map-unknowns"]);
  for (const stage of ["spec", "tickets", "execute"]) {
    if (index(stage) !== -1 && index("map-unknowns") > index(stage)) {
      errors.push(`XL route requires map-unknowns before ${stage}`);
    }
  }
}
if (route.includes("execute") && route.at(-1) !== "review") {
  errors.push("a route containing execute must end with review");
}

if (state?.version === "0.2") {
  const isExecuting = route.includes("execute");
  const riskLevel = state?.task?.riskLevel;
  const impactScope = state?.task?.impactScope;
  const activeSource = state?.activeSource;
  const reading = state?.reading;
  const readSetFields = ["required", "triggered", "deferred", "forbidden", "sensitive"];

  if (!sourceStatuses.has(activeSource?.status)) {
    errors.push("activeSource.status must be confirmed, ambiguous, stale, or conflicting");
  }
  if (!Array.isArray(activeSource?.sources) || activeSource.sources.length === 0) {
    errors.push("activeSource.sources must be a non-empty array");
  }

  for (const field of readSetFields) {
    if (!Array.isArray(reading?.[field])) {
      errors.push(`reading.${field} must be an array`);
    }
  }
  if (!Array.isArray(reading?.receipts)) {
    errors.push("reading.receipts must be an array");
  }

  const receipts = Array.isArray(reading?.receipts) ? reading.receipts : [];
  const readReceiptSources = new Set();
  for (const receipt of receipts) {
    if (!receipt?.source) errors.push("each reading receipt requires source");
    if (!receipt?.tier) errors.push(`reading receipt requires tier: ${receipt?.source ?? "unknown"}`);
    if (!receipt?.reason) errors.push(`reading receipt requires reason: ${receipt?.source ?? "unknown"}`);
    if (!readModes.has(receipt?.mode)) {
      errors.push(`invalid reading receipt mode: ${receipt?.source ?? "unknown"}`);
    }
    if (!readStatuses.has(receipt?.status)) {
      errors.push(`invalid reading receipt status: ${receipt?.source ?? "unknown"}`);
    }
    if (receipt?.status === "read") {
      readReceiptSources.add(receipt.source);
      if (!receipt?.fingerprint) {
        errors.push(`read receipt requires fingerprint: ${receipt?.source ?? "unknown"}`);
      }
    }
  }

  for (const field of ["required", "triggered"]) {
    for (const source of Array.isArray(reading?.[field]) ? reading[field] : []) {
      if (!readReceiptSources.has(source)) {
        errors.push(`reading.${field} source lacks a read receipt: ${source}`);
      }
    }
  }

  const requiredOrTriggered = new Set([
    ...(Array.isArray(reading?.required) ? reading.required : []),
    ...(Array.isArray(reading?.triggered) ? reading.triggered : []),
  ]);
  for (const source of Array.isArray(reading?.forbidden) ? reading.forbidden : []) {
    if (requiredOrTriggered.has(source)) {
      errors.push(`source cannot be both required/triggered and forbidden: ${source}`);
    }
  }
  for (const source of Array.isArray(reading?.deferred) ? reading.deferred : []) {
    if (requiredOrTriggered.has(source)) {
      errors.push(`source cannot be both required/triggered and deferred: ${source}`);
    }
  }

  const counterexampleCheck = reading?.counterexampleCheck;
  if (!counterexampleStatuses.has(counterexampleCheck?.status)) {
    errors.push("reading.counterexampleCheck.status must be pass, fail, or not-run");
  }
  if (!Array.isArray(counterexampleCheck?.candidates)) {
    errors.push("reading.counterexampleCheck.candidates must be an array");
  }
  if (!Array.isArray(counterexampleCheck?.resolution)) {
    errors.push("reading.counterexampleCheck.resolution must be an array");
  }

  if (!Array.isArray(state?.evidenceGate)) {
    errors.push("evidenceGate must be an array");
  } else {
    for (const item of state.evidenceGate) {
      if (!evidenceGateValues.has(item)) errors.push(`invalid evidenceGate item: ${item}`);
    }
  }
  if (!budgetStatuses.has(state?.budget?.status)) {
    errors.push("budget.status must be within, warning, or exceeded");
  }
  if (!Array.isArray(state?.unresolvedHighRiskItems)) {
    errors.push("unresolvedHighRiskItems must be an array");
  }

  const sensitive = new Set(Array.isArray(reading?.sensitive) ? reading.sensitive : []);
  for (const receipt of receipts) {
    if (receipt?.status === "read" && sensitive.has(receipt.source) && !receipt.authorization) {
      errors.push(`sensitive read requires explicit authorization: ${receipt.source}`);
    }
  }

  if (isExecuting) {
    if (activeSource?.status !== "confirmed") {
      errors.push("execute requires activeSource.status to be confirmed");
    }
    if (counterexampleCheck?.status !== "pass") {
      errors.push("execute requires a passing counterexample check");
    }
    if (!Array.isArray(state?.evidenceGate) || state.evidenceGate.length === 0) {
      errors.push("execute requires at least one evidenceGate item");
    }
    if (["high", "critical"].includes(riskLevel) && !route.includes("align")) {
      errors.push("high or critical risk execution requires align");
    }
    if (
      ["cross-module", "cross-system"].includes(impactScope) &&
      (!Array.isArray(reading?.triggered) || reading.triggered.length === 0)
    ) {
      errors.push("cross-module or cross-system execution requires triggered reading");
    }
    if (
      ["high", "critical"].includes(riskLevel) &&
      Array.isArray(state?.unresolvedHighRiskItems) &&
      state.unresolvedHighRiskItems.length > 0
    ) {
      errors.push("high or critical risk execution cannot keep unresolvedHighRiskItems");
    }
  }
}

if (!gateStatuses.has(state?.gate?.status)) {
  errors.push("gate.status must be clear, needs-user, or blocked");
}
const gateItems = Array.isArray(state?.gate?.items) ? state.gate.items : [];
for (const item of gateItems) {
  if (!item?.decision) errors.push("each gate item requires decision");
  if (!classifications.has(item?.classification)) {
    errors.push(`invalid gate classification for: ${item?.decision ?? "unknown"}`);
  }
  if (!item?.handling) errors.push(`gate item requires handling: ${item?.decision ?? "unknown"}`);
}
if (route.includes("execute") && state?.gate?.status !== "clear") {
  errors.push("execute requires gate.status to be clear");
}
if (
  route.includes("execute") &&
  gateItems.some((item) => item.classification === "implementation-blocking")
) {
  errors.push("execute is not allowed while an implementation-blocking decision is unresolved");
}

const tickets = Array.isArray(state?.tickets) ? state.tickets : [];
if (state?.task?.size === "L" && tickets.length === 0) {
  errors.push("L workflow state requires at least one ticket");
}
const ticketIds = new Set();
for (const ticket of tickets) {
  if (!ticket?.id) errors.push("each ticket requires id");
  else if (ticketIds.has(ticket.id)) errors.push(`duplicate ticket id: ${ticket.id}`);
  else ticketIds.add(ticket.id);
  for (const field of ["outcome", "acceptance", "evidence", "blockedBy"]) {
    if (
      (field === "outcome" && !ticket?.[field]) ||
      (field !== "outcome" && !Array.isArray(ticket?.[field]))
    ) {
      errors.push(`ticket ${ticket?.id ?? "unknown"} requires ${field}`);
    }
  }
}
for (const ticket of tickets) {
  for (const dependency of ticket.blockedBy ?? []) {
    if (!ticketIds.has(dependency)) {
      errors.push(`ticket ${ticket.id} has unknown dependency: ${dependency}`);
    }
  }
}

const graph = new Map(tickets.map((ticket) => [ticket.id, ticket.blockedBy ?? []]));
const visiting = new Set();
const visited = new Set();
const visit = (id) => {
  if (visiting.has(id)) return true;
  if (visited.has(id)) return false;
  visiting.add(id);
  for (const dependency of graph.get(id) ?? []) {
    if (visit(dependency)) return true;
  }
  visiting.delete(id);
  visited.add(id);
  return false;
};
for (const id of graph.keys()) {
  if (visit(id)) {
    errors.push("ticket dependency graph contains a cycle");
    break;
  }
}

for (const axis of axes) {
  const review = state?.review?.[axis];
  if (!reviewStatuses.has(review?.status)) {
    errors.push(`review.${axis}.status is invalid`);
  }
  if (!Array.isArray(review?.evidence)) {
    errors.push(`review.${axis}.evidence must be an array`);
  }
  if (review?.status === "pass" && review.evidence.length === 0) {
    errors.push(`review.${axis} cannot pass without evidence`);
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("Workflow state is valid.");
